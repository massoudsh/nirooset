// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ISettlementEngine.sol";
import "./interfaces/IEnergyToken.sol";
import "./interfaces/IEnergyMarket.sol";

/**
 * @title SettlementEngine
 * @notice Settles energy positions per time slot using market clearing price and order fills.
 * @dev paymentAmount in SettlementRecord = amount participant receives (0 if they are net payers).
 */
contract SettlementEngine is ISettlementEngine {
    IEnergyToken public immutable token;
    IEnergyMarket public immutable market;

    mapping(uint256 => TimeSlotSettlement) private _slotSettlement;
    mapping(uint256 => mapping(address => SettlementRecord)) private _records;
    mapping(uint256 => mapping(address => uint256)) private _amountOwed;
    mapping(uint256 => bool) private _slotSettled;
    mapping(uint256 => mapping(address => bool)) private _disputes;

    address public owner;
    mapping(address => bool) public penalizers;

    error Unauthorized();
    error SlotNotCleared();
    error SlotNotFinalized();
    error SlotAlreadySettled();
    error TransferFailed();
    error ZeroAddress();
    error AmountZero();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyPenalizer() {
        if (!penalizers[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(IEnergyToken _token, IEnergyMarket _market) {
        if (address(_token) == address(0) || address(_market) == address(0)) revert ZeroAddress();
        token = _token;
        market = _market;
        owner = msg.sender;
    }

    function setPenalizer(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        penalizers[account] = granted;
    }

    function finalizeTimeSlot(uint256 timeSlot) external override onlyOwner {
        IEnergyMarket.Auction memory a = market.getAuction(timeSlot);
        if (!a.isCleared) revert SlotNotCleared();
        TimeSlotSettlement storage slot = _slotSettlement[timeSlot];
        if (slot.isFinalized) return;

        uint256 totalEnergy = a.totalBidQuantity < a.totalAskQuantity ? a.totalBidQuantity : a.totalAskQuantity;
        uint256 totalPayment = totalEnergy * a.clearingPrice;

        slot.timeSlot = timeSlot;
        slot.clearingPrice = a.clearingPrice;
        slot.totalEnergy = totalEnergy;
        slot.totalPayment = totalPayment;
        slot.isFinalized = true;
    }

    function settleTimeSlot(uint256 timeSlot) external override onlyOwner {
        TimeSlotSettlement storage slot = _slotSettlement[timeSlot];
        if (!slot.isFinalized || slot.timeSlot == 0) revert SlotNotFinalized();
        if (_slotSettled[timeSlot]) revert SlotAlreadySettled();

        (IEnergyMarket.Order[] memory bids, IEnergyMarket.Order[] memory asks) = market.getOrderBook(timeSlot);
        uint256 clearingPrice = slot.clearingPrice;

        address[] memory participants = _aggregateAndStore(timeSlot, bids, asks, clearingPrice);
        for (uint256 i = 0; i < participants.length; i++) {
            address p = participants[i];
            uint256 owed = _amountOwed[timeSlot][p];
            if (owed > 0) {
                if (!token.transferFrom(p, address(this), owed)) revert TransferFailed();
            }
        }
        for (uint256 i = 0; i < participants.length; i++) {
            address p = participants[i];
            SettlementRecord storage rec = _records[timeSlot][p];
            rec.isSettled = true;
            if (rec.paymentAmount > 0) {
                if (!token.transfer(p, rec.paymentAmount)) revert TransferFailed();
            }
            emit SettlementExecuted(timeSlot, p, rec.netEnergy, rec.paymentAmount);
        }

        _slotSettled[timeSlot] = true;
        emit SettlementBatchCompleted(timeSlot, participants.length, slot.totalEnergy, slot.totalPayment);
    }

    function _aggregateAndStore(uint256 timeSlot, IEnergyMarket.Order[] memory bids, IEnergyMarket.Order[] memory asks, uint256 clearingPrice) internal returns (address[] memory participants) {
        address[] memory tmp = new address[](bids.length + asks.length);
        uint256 n = 0;
        for (uint256 i = 0; i < bids.length; i++) {
            IEnergyMarket.Order memory o = bids[i];
            if (o.filledQuantity == 0) continue;
            address t = o.trader;
            _records[timeSlot][t].timeSlot = timeSlot;
            _records[timeSlot][t].participant = t;
            _records[timeSlot][t].energyConsumed += o.filledQuantity;
            bool found = false;
            for (uint256 j = 0; j < n; j++) if (tmp[j] == t) { found = true; break; }
            if (!found) tmp[n++] = t;
        }
        for (uint256 i = 0; i < asks.length; i++) {
            IEnergyMarket.Order memory o = asks[i];
            if (o.filledQuantity == 0) continue;
            address t = o.trader;
            _records[timeSlot][t].timeSlot = timeSlot;
            _records[timeSlot][t].participant = t;
            _records[timeSlot][t].energyProduced += o.filledQuantity;
            bool found = false;
            for (uint256 j = 0; j < n; j++) if (tmp[j] == t) { found = true; break; }
            if (!found) tmp[n++] = t;
        }
        participants = new address[](n);
        for (uint256 i = 0; i < n; i++) participants[i] = tmp[i];

        for (uint256 i = 0; i < n; i++) {
            address p = participants[i];
            SettlementRecord storage rec = _records[timeSlot][p];
            if (rec.energyProduced >= rec.energyConsumed) {
                rec.netEnergy = rec.energyProduced - rec.energyConsumed;
                rec.paymentAmount = rec.netEnergy * clearingPrice;
            } else {
                rec.netEnergy = 0;
                rec.paymentAmount = 0;
                _amountOwed[timeSlot][p] = (rec.energyConsumed - rec.energyProduced) * clearingPrice;
            }
        }
    }

    function settleParticipant(uint256 timeSlot, address participant) external override onlyOwner returns (SettlementRecord memory) {
        SettlementRecord storage rec = _records[timeSlot][participant];
        if (rec.participant == address(0)) return rec;
        if (rec.isSettled) return rec;

        uint256 owed = _amountOwed[timeSlot][participant];
        if (owed > 0) {
            if (!token.transferFrom(participant, address(this), owed)) revert TransferFailed();
        }
        rec.isSettled = true;
        if (rec.paymentAmount > 0) {
            if (!token.transfer(participant, rec.paymentAmount)) revert TransferFailed();
        }
        emit SettlementExecuted(timeSlot, participant, rec.netEnergy, rec.paymentAmount);
        return rec;
    }

    function assessPenalty(address participant, uint256 amount, string calldata reason) external override onlyPenalizer {
        if (amount == 0) revert AmountZero();
        if (!token.transferFrom(participant, owner, amount)) revert TransferFailed();
        emit PenaltyAssessed(participant, amount, reason);
    }

    function raiseDispute(uint256 timeSlot, address participant) external override {
        _disputes[timeSlot][participant] = true;
        emit DisputeRaised(timeSlot, participant);
    }

    function getSettlementRecord(uint256 timeSlot, address participant) external view override returns (SettlementRecord memory) {
        return _records[timeSlot][participant];
    }

    function getTimeSlotSettlement(uint256 timeSlot) external view override returns (TimeSlotSettlement memory) {
        return _slotSettlement[timeSlot];
    }

    function isTimeSlotSettled(uint256 timeSlot) external view override returns (bool) {
        return _slotSettled[timeSlot];
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IStakingVault.sol";
import "./interfaces/IEnergyToken.sol";

/**
 * @title StakingVault
 * @notice Holds EnergyToken stakes with lock, penalty, and slash support.
 */
contract StakingVault is IStakingVault {
    IEnergyToken public immutable token;

    mapping(address => uint256) private _stake;
    mapping(address => uint256) private _lockUntil;
    uint256 private _totalStaked;

    address public owner;
    mapping(address => bool) public penalizers;

    error Unauthorized();
    error ZeroAddress();
    error AmountZero();
    error InsufficientStake();
    error Locked();
    error TransferFailed();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyPenalizer() {
        if (!penalizers[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(IEnergyToken _token) {
        if (address(_token) == address(0)) revert ZeroAddress();
        token = _token;
        owner = msg.sender;
    }

    function setPenalizer(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        penalizers[account] = granted;
    }

    function depositStake(uint256 amount) external override {
        if (amount == 0) revert AmountZero();
        if (!token.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        _stake[msg.sender] += amount;
        _totalStaked += amount;
        emit StakeDeposited(msg.sender, amount, _stake[msg.sender]);
    }

    function withdrawStake(uint256 amount) external override {
        if (amount == 0) revert AmountZero();
        if (block.timestamp < _lockUntil[msg.sender]) revert Locked();
        if (amount > _stake[msg.sender]) revert InsufficientStake();
        unchecked {
            _stake[msg.sender] -= amount;
            _totalStaked -= amount;
        }
        if (!token.transfer(msg.sender, amount)) revert TransferFailed();
        emit StakeWithdrawn(msg.sender, amount, _stake[msg.sender]);
    }

    function applyPenalty(address staker, uint256 amount, string calldata reason) external override onlyPenalizer {
        if (amount == 0) revert AmountZero();
        if (amount > _stake[staker]) revert InsufficientStake();
        unchecked {
            _stake[staker] -= amount;
            _totalStaked -= amount;
        }
        if (!token.transfer(owner, amount)) revert TransferFailed();
        emit PenaltyApplied(staker, amount, reason);
    }

    function slash(address staker, uint256 amount, string calldata reason) external override onlyPenalizer {
        if (amount == 0) revert AmountZero();
        if (amount > _stake[staker]) revert InsufficientStake();
        unchecked {
            _stake[staker] -= amount;
            _totalStaked -= amount;
        }
        if (!token.transfer(owner, amount)) revert TransferFailed();
        emit SlashExecuted(staker, amount, reason);
    }

    function getStake(address staker) external view override returns (uint256) {
        return _stake[staker];
    }

    function getStakeInfo(address staker) external view override returns (StakeInfo memory) {
        uint256 amount = _stake[staker];
        uint256 lockUntil = _lockUntil[staker];
        return StakeInfo({
            staker: staker,
            amount: amount,
            lockUntil: lockUntil,
            isLocked: block.timestamp < lockUntil
        });
    }

    function getTotalStaked() external view override returns (uint256) {
        return _totalStaked;
    }

    function isStakeSufficient(address staker, uint256 requiredAmount) external view override returns (bool) {
        return _stake[staker] >= requiredAmount;
    }

    function lockStake(address staker, uint256 lockDuration) external override onlyOwner {
        uint256 newLock = block.timestamp + lockDuration;
        if (newLock > _lockUntil[staker]) _lockUntil[staker] = newLock;
    }
}

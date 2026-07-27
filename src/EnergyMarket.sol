// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IEnergyMarket.sol";
import "./interfaces/IEnergyToken.sol";

/**
 * @title EnergyMarket
 * @notice Batch auction for energy: collect bids/asks per time slot, clear at uniform price.
 * @dev On placeBid locks buyer's tokens (price * quantity); on placeAsk locks seller's tokens (quantity).
 * On clearAuction transfers locked amounts between matched parties. On cancelOrder unlocks remaining.
 */
contract EnergyMarket is IEnergyMarket {
    IEnergyToken public immutable energyToken;

    uint256 private _nextOrderId = 1;
    mapping(uint256 => Order) private _orders;
    mapping(uint256 => Auction) private _auctions;
    mapping(uint256 => uint256[]) private _bidOrderIds;
    mapping(uint256 => uint256[]) private _askOrderIds;

    address public owner;
    bool public paused;

    error Unauthorized();
    error InvalidTimeSlot();
    error AuctionNotOpen();
    error AuctionAlreadyCleared();
    error InvalidOrder();
    error OrderNotActive();
    error ZeroQuantity();
    error ZeroPrice();
    error MarketPaused();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert MarketPaused();
        _;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    constructor(IEnergyToken _energyToken) {
        owner = msg.sender;
        energyToken = _energyToken;
    }

    function startAuction(uint256 timeSlot, uint256 duration) external override onlyOwner whenNotPaused {
        if (duration == 0) revert InvalidTimeSlot();
        Auction storage a = _auctions[timeSlot];
        a.timeSlot = timeSlot;
        a.startTime = block.timestamp;
        a.endTime = block.timestamp + duration;
        a.isCleared = false;
        emit AuctionStarted(timeSlot, a.startTime, a.endTime);
    }

    function placeBid(uint256 timeSlot, uint256 price, uint256 quantity) external override whenNotPaused returns (uint256) {
        if (price == 0) revert ZeroPrice();
        if (quantity == 0) revert ZeroQuantity();
        Auction storage a = _auctions[timeSlot];
        if (a.endTime == 0 || block.timestamp >= a.endTime) revert AuctionNotOpen();
        if (a.isCleared) revert AuctionAlreadyCleared();

        uint256 cost;
        unchecked { cost = price * quantity; }
        energyToken.lock(msg.sender, cost);

        uint256 orderId;
        unchecked { orderId = _nextOrderId++; }
        _orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            isBid: true,
            price: price,
            quantity: quantity,
            filledQuantity: 0,
            timeSlot: timeSlot,
            isActive: true
        });
        _bidOrderIds[timeSlot].push(orderId);
        a.totalBidQuantity += quantity;
        emit OrderPlaced(orderId, msg.sender, true, price, quantity);
        return orderId;
    }

    function placeAsk(uint256 timeSlot, uint256 price, uint256 quantity) external override whenNotPaused returns (uint256) {
        if (price == 0) revert ZeroPrice();
        if (quantity == 0) revert ZeroQuantity();
        Auction storage a = _auctions[timeSlot];
        if (a.endTime == 0 || block.timestamp >= a.endTime) revert AuctionNotOpen();
        if (a.isCleared) revert AuctionAlreadyCleared();

        energyToken.lock(msg.sender, quantity);

        uint256 orderId;
        unchecked { orderId = _nextOrderId++; }
        _orders[orderId] = Order({
            orderId: orderId,
            trader: msg.sender,
            isBid: false,
            price: price,
            quantity: quantity,
            filledQuantity: 0,
            timeSlot: timeSlot,
            isActive: true
        });
        _askOrderIds[timeSlot].push(orderId);
        a.totalAskQuantity += quantity;
        emit OrderPlaced(orderId, msg.sender, false, price, quantity);
        return orderId;
    }

    function cancelOrder(uint256 orderId) external override {
        Order storage o = _orders[orderId];
        if (o.trader == address(0)) revert InvalidOrder();
        if (msg.sender != o.trader) revert Unauthorized();
        if (!o.isActive) revert OrderNotActive();
        Auction storage a = _auctions[o.timeSlot];
        if (a.isCleared) revert AuctionAlreadyCleared();

        uint256 remain = o.quantity - o.filledQuantity;
        if (o.isBid) {
            uint256 unlockAmount;
            unchecked { unlockAmount = remain * o.price; }
            energyToken.unlock(msg.sender, unlockAmount);
            a.totalBidQuantity -= remain;
        } else {
            energyToken.unlock(msg.sender, remain);
            a.totalAskQuantity -= remain;
        }
        o.isActive = false;
        emit OrderCancelled(orderId);
    }

    function clearAuction(uint256 timeSlot) external override onlyOwner returns (uint256 clearingPrice) {
        Auction storage a = _auctions[timeSlot];
        if (a.isCleared) revert AuctionAlreadyCleared();

        uint256[] memory bidIds = _sortedBidIds(timeSlot);
        uint256[] memory askIds = _sortedAskIds(timeSlot);

        if (bidIds.length == 0 || askIds.length == 0) {
            a.isCleared = true;
            a.clearingPrice = 0;
            emit AuctionCleared(timeSlot, 0, 0);
            return 0;
        }

        uint256 bidIdx = 0;
        uint256 askIdx = 0;
        uint256 totalMatched = 0;
        clearingPrice = 0;

        while (bidIdx < bidIds.length && askIdx < askIds.length) {
            Order storage bid = _orders[bidIds[bidIdx]];
            Order storage ask = _orders[askIds[askIdx]];
            if (!bid.isActive || bid.filledQuantity >= bid.quantity) { bidIdx++; continue; }
            if (!ask.isActive || ask.filledQuantity >= ask.quantity) { askIdx++; continue; }
            if (bid.price < ask.price) break;

            uint256 bidRemain = bid.quantity - bid.filledQuantity;
            uint256 askRemain = ask.quantity - ask.filledQuantity;
            uint256 fill = bidRemain <= askRemain ? bidRemain : askRemain;

            uint256 matchPrice = bid.price;
            uint256 payment;
            unchecked { payment = fill * matchPrice; }
            energyToken.transferLocked(bid.trader, ask.trader, payment);
            energyToken.transferLocked(ask.trader, bid.trader, fill);

            bid.filledQuantity += fill;
            ask.filledQuantity += fill;
            totalMatched += fill;
            clearingPrice = matchPrice;

            if (bid.filledQuantity >= bid.quantity) bidIdx++;
            if (ask.filledQuantity >= ask.quantity) askIdx++;
        }

        a.clearingPrice = clearingPrice;
        a.isCleared = true;
        emit AuctionCleared(timeSlot, clearingPrice, totalMatched);
        return clearingPrice;
    }

    function _sortedBidIds(uint256 timeSlot) internal view returns (uint256[] memory) {
        uint256[] storage ids = _bidOrderIds[timeSlot];
        uint256[] memory out = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) out[i] = ids[i];
        _sortOrderIdsByPrice(out, true);
        return out;
    }

    function _sortedAskIds(uint256 timeSlot) internal view returns (uint256[] memory) {
        uint256[] storage ids = _askOrderIds[timeSlot];
        uint256[] memory out = new uint256[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) out[i] = ids[i];
        _sortOrderIdsByPrice(out, false);
        return out;
    }

    function _sortOrderIdsByPrice(uint256[] memory ids, bool desc) internal view {
        for (uint256 i = 0; i < ids.length; i++) {
            for (uint256 j = i + 1; j < ids.length; j++) {
                uint256 pi = _orders[ids[i]].price;
                uint256 pj = _orders[ids[j]].price;
                if ((desc && pj > pi) || (!desc && pj < pi)) {
                    (ids[i], ids[j]) = (ids[j], ids[i]);
                }
            }
        }
    }

    function getOrder(uint256 orderId) external view override returns (Order memory) {
        return _orders[orderId];
    }

    function getAuction(uint256 timeSlot) external view override returns (Auction memory) {
        return _auctions[timeSlot];
    }

    function getBestBid(uint256 timeSlot) external view override returns (uint256 price, uint256 quantity) {
        uint256[] storage ids = _bidOrderIds[timeSlot];
        uint256 bestPrice = 0;
        for (uint256 i = 0; i < ids.length; i++) {
            Order storage o = _orders[ids[i]];
            if (o.isActive && o.filledQuantity < o.quantity && o.price > bestPrice) bestPrice = o.price;
        }
        for (uint256 i = 0; i < ids.length; i++) {
            Order storage o = _orders[ids[i]];
            if (o.isActive && o.filledQuantity < o.quantity && o.price == bestPrice)
                quantity += (o.quantity - o.filledQuantity);
        }
        price = bestPrice;
    }

    function getBestAsk(uint256 timeSlot) external view override returns (uint256 price, uint256 quantity) {
        uint256[] storage ids = _askOrderIds[timeSlot];
        uint256 bestPrice = type(uint256).max;
        for (uint256 i = 0; i < ids.length; i++) {
            Order storage o = _orders[ids[i]];
            if (o.isActive && o.filledQuantity < o.quantity && o.price < bestPrice) bestPrice = o.price;
        }
        for (uint256 i = 0; i < ids.length; i++) {
            Order storage o = _orders[ids[i]];
            if (o.isActive && o.filledQuantity < o.quantity && o.price == bestPrice)
                quantity += (o.quantity - o.filledQuantity);
        }
        price = bestPrice == type(uint256).max ? 0 : bestPrice;
    }

    function getOrderBook(uint256 timeSlot) external view override returns (Order[] memory bids, Order[] memory asks) {
        uint256[] storage bidIds = _bidOrderIds[timeSlot];
        uint256[] storage askIds = _askOrderIds[timeSlot];
        bids = new Order[](bidIds.length);
        asks = new Order[](askIds.length);
        for (uint256 i = 0; i < bidIds.length; i++) bids[i] = _orders[bidIds[i]];
        for (uint256 i = 0; i < askIds.length; i++) asks[i] = _orders[askIds[i]];
    }
}

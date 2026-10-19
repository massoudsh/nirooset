// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEnergyMarket {
    event OrderPlaced(uint256 indexed orderId, address indexed trader, bool isBid, uint256 price, uint256 quantity);
    event OrderCancelled(uint256 indexed orderId);
    event OrderFilled(uint256 indexed orderId, uint256 quantity, uint256 price);
    event AuctionStarted(uint256 indexed timeSlot, uint256 startTime, uint256 endTime);
    event AuctionCleared(uint256 indexed timeSlot, uint256 clearingPrice, uint256 totalQuantity);

    struct Order {
        uint256 orderId;
        address trader;
        bool isBid;
        uint256 price;
        uint256 quantity;
        uint256 filledQuantity;
        uint256 timeSlot;
        bool isActive;
    }

    struct Auction {
        uint256 timeSlot;
        uint256 startTime;
        uint256 endTime;
        uint256 clearingPrice;
        uint256 totalBidQuantity;
        uint256 totalAskQuantity;
        bool isCleared;
    }

    function placeBid(uint256 timeSlot, uint256 price, uint256 quantity) external returns (uint256);
    function placeAsk(uint256 timeSlot, uint256 price, uint256 quantity) external returns (uint256);
    function cancelOrder(uint256 orderId) external;
    function startAuction(uint256 timeSlot, uint256 duration) external;
    function clearAuction(uint256 timeSlot) external returns (uint256 clearingPrice);
    function getOrder(uint256 orderId) external view returns (Order memory);
    function getAuction(uint256 timeSlot) external view returns (Auction memory);
    function getBestBid(uint256 timeSlot) external view returns (uint256 price, uint256 quantity);
    function getBestAsk(uint256 timeSlot) external view returns (uint256 price, uint256 quantity);
    function getOrderBook(uint256 timeSlot) external view returns (Order[] memory bids, Order[] memory asks);
}

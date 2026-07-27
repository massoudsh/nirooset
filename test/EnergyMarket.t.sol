// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {EnergyMarket} from "../src/EnergyMarket.sol";
import {EnergyToken} from "../src/EnergyToken.sol";
import {IEnergyMarket} from "../src/interfaces/IEnergyMarket.sol";

contract EnergyMarketTest is Test {
    EnergyToken public token;
    EnergyMarket public market;

    address public owner;
    address public alice;
    address public bob;

    uint256 public constant SLOT = 1000;
    uint256 public constant DURATION = 3600;

    function setUp() public {
        token = new EnergyToken();
        market = new EnergyMarket(token);
        token.setLocker(address(market), true);
        token.setMinter(address(this), true);
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        token.mint(alice, 1_000_000);
        token.mint(bob, 1_000_000);
    }

    function test_startAuction_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.Unauthorized.selector);
        market.startAuction(SLOT, DURATION);
    }

    function test_startAuction_Success() public {
        market.startAuction(SLOT, DURATION);
        IEnergyMarket.Auction memory a = market.getAuction(SLOT);
        assertEq(a.timeSlot, SLOT);
        assertTrue(a.startTime > 0);
        assertEq(a.endTime, a.startTime + DURATION);
        assertFalse(a.isCleared);
    }

    function test_placeBid_Success() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        uint256 id = market.placeBid(SLOT, 100, 50);
        assertEq(id, 1);
        IEnergyMarket.Order memory o = market.getOrder(1);
        assertEq(o.trader, alice);
        assertTrue(o.isBid);
        assertEq(o.price, 100);
        assertEq(o.quantity, 50);
        assertTrue(o.isActive);
    }

    function test_placeAsk_Success() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(bob);
        uint256 id = market.placeAsk(SLOT, 110, 30);
        assertEq(id, 1);
        IEnergyMarket.Order memory o = market.getOrder(1);
        assertEq(o.trader, bob);
        assertFalse(o.isBid);
        assertEq(o.price, 110);
        assertEq(o.quantity, 30);
    }

    function test_getBestBid_getBestAsk() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        market.placeBid(SLOT, 100, 50);
        vm.prank(alice);
        market.placeBid(SLOT, 105, 20);
        vm.prank(bob);
        market.placeAsk(SLOT, 110, 30);
        (uint256 bidPrice, uint256 bidQty) = market.getBestBid(SLOT);
        assertEq(bidPrice, 105);
        assertEq(bidQty, 20);
        (uint256 askPrice, uint256 askQty) = market.getBestAsk(SLOT);
        assertEq(askPrice, 110);
        assertEq(askQty, 30);
    }

    function test_cancelOrder_Success() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        uint256 id = market.placeBid(SLOT, 100, 50);
        vm.prank(alice);
        market.cancelOrder(id);
        IEnergyMarket.Order memory o = market.getOrder(id);
        assertFalse(o.isActive);
    }

    function test_clearAuction_Success() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        market.placeBid(SLOT, 100, 50);
        vm.prank(bob);
        market.placeAsk(SLOT, 90, 40);
        uint256 clearing = market.clearAuction(SLOT);
        assertEq(clearing, 100);
        assertTrue(market.getAuction(SLOT).isCleared);
        assertEq(market.getOrder(1).filledQuantity, 40);
        assertEq(market.getOrder(2).filledQuantity, 40);
    }

    function test_clearAuction_OnlyOwner() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.Unauthorized.selector);
        market.clearAuction(SLOT);
    }

    function test_placeBid_RevertsAfterClear() public {
        market.startAuction(SLOT, DURATION);
        market.clearAuction(SLOT);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.AuctionAlreadyCleared.selector);
        market.placeBid(SLOT, 100, 50);
    }

    function test_startAuction_RevertsZeroDuration() public {
        vm.expectRevert(EnergyMarket.InvalidTimeSlot.selector);
        market.startAuction(SLOT, 0);
    }

    function test_placeBid_RevertsZeroPrice() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.ZeroPrice.selector);
        market.placeBid(SLOT, 0, 50);
    }

    function test_placeBid_RevertsZeroQuantity() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.ZeroQuantity.selector);
        market.placeBid(SLOT, 100, 0);
    }

    function test_placeBid_RevertsAuctionNotOpen() public {
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.AuctionNotOpen.selector);
        market.placeBid(SLOT, 100, 50);
    }

    function test_placeBid_RevertsAfterAuctionEnd() public {
        market.startAuction(SLOT, 1);
        vm.warp(block.timestamp + 2);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.AuctionNotOpen.selector);
        market.placeBid(SLOT, 100, 50);
    }

    function test_placeAsk_RevertsZeroPrice() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(bob);
        vm.expectRevert(EnergyMarket.ZeroPrice.selector);
        market.placeAsk(SLOT, 0, 30);
    }

    function test_placeAsk_RevertsZeroQuantity() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(bob);
        vm.expectRevert(EnergyMarket.ZeroQuantity.selector);
        market.placeAsk(SLOT, 110, 0);
    }

    function test_placeAsk_RevertsAuctionNotOpen() public {
        vm.prank(bob);
        vm.expectRevert(EnergyMarket.AuctionNotOpen.selector);
        market.placeAsk(SLOT, 110, 30);
    }

    function test_cancelOrder_RevertsInvalidOrder() public {
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.InvalidOrder.selector);
        market.cancelOrder(999);
    }

    function test_cancelOrder_RevertsUnauthorized() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        uint256 id = market.placeBid(SLOT, 100, 50);
        vm.prank(bob);
        vm.expectRevert(EnergyMarket.Unauthorized.selector);
        market.cancelOrder(id);
    }

    function test_cancelOrder_RevertsOrderNotActive() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        uint256 id = market.placeBid(SLOT, 100, 50);
        vm.prank(alice);
        market.cancelOrder(id);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.OrderNotActive.selector);
        market.cancelOrder(id);
    }

    function test_getOrder_ReturnsOrder() public {
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        uint256 id = market.placeBid(SLOT, 100, 50);
        IEnergyMarket.Order memory o = market.getOrder(id);
        assertEq(o.orderId, id);
        assertEq(o.trader, alice);
        assertTrue(o.isBid);
        assertEq(o.price, 100);
        assertEq(o.quantity, 50);
        assertEq(o.timeSlot, SLOT);
    }

    function test_setPaused_RevertsStartAuction() public {
        market.setPaused(true);
        vm.expectRevert(EnergyMarket.MarketPaused.selector);
        market.startAuction(SLOT, DURATION);
    }

    function test_setPaused_RevertsPlaceBid() public {
        market.startAuction(SLOT, DURATION);
        market.setPaused(true);
        vm.prank(alice);
        vm.expectRevert(EnergyMarket.MarketPaused.selector);
        market.placeBid(SLOT, 100, 50);
    }

    function test_setPaused_UnpausedWorks() public {
        market.setPaused(true);
        market.setPaused(false);
        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        market.placeBid(SLOT, 100, 50);
        assertEq(market.getOrder(1).trader, alice);
    }
}

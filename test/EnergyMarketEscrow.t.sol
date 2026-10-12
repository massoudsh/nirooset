// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EnergyMarket.sol";
import "../src/EnergyToken.sol";

/**
 * @title EnergyMarketEscrow.t.sol
 * @notice Tests for issue #15: EnergyMarket token escrow on place order.
 *
 *  Verifies:
 *   - placeBid  locks buyer tokens  (price × quantity)
 *   - placeAsk  locks seller tokens (quantity)
 *   - cancelOrder unlocks remaining locked tokens
 *   - clearAuction transfers locked tokens between matched parties
 */
contract EnergyMarketEscrowTest is Test {
    EnergyToken  token;
    EnergyMarket market;

    address owner  = address(this);
    address buyer  = address(0xB1);
    address seller = address(0x5E1);

    uint256 constant INITIAL = 10_000e18;
    uint256 timeSlot;

    function setUp() public {
        token  = new EnergyToken();
        market = new EnergyMarket(IEnergyToken(address(token)));

        token.setLocker(address(market), true);

        // Fund buyer and seller
        token.mint(buyer,  INITIAL);
        token.mint(seller, INITIAL);

        // Align time slot and open an auction
        timeSlot = (block.timestamp / 1 hours) * 1 hours;
        market.startAuction(timeSlot, 2 hours);
    }

    // -------------------------------------------------------------------------
    // placeBid: locks price * quantity from buyer
    // -------------------------------------------------------------------------

    function test_PlaceBid_LocksTokens() public {
        uint256 price    = 10e18;
        uint256 quantity = 5;
        uint256 expected = price * quantity; // 50e18 locked

        vm.prank(buyer);
        market.placeBid(timeSlot, price, quantity);

        (uint256 available, uint256 locked) = _balances(buyer);
        assertEq(locked,    expected,         "buyer locked mismatch");
        assertEq(available, INITIAL - expected, "buyer available mismatch");
    }

    function test_PlaceBid_ZeroPriceReverts() public {
        vm.prank(buyer);
        vm.expectRevert(EnergyMarket.ZeroPrice.selector);
        market.placeBid(timeSlot, 0, 5);
    }

    function test_PlaceBid_ZeroQuantityReverts() public {
        vm.prank(buyer);
        vm.expectRevert(EnergyMarket.ZeroQuantity.selector);
        market.placeBid(timeSlot, 10e18, 0);
    }

    // -------------------------------------------------------------------------
    // placeAsk: locks quantity (energy units) from seller
    // -------------------------------------------------------------------------

    function test_PlaceAsk_LocksTokens() public {
        uint256 quantity = 7;

        vm.prank(seller);
        market.placeAsk(timeSlot, 8e18, quantity);

        (, uint256 locked) = _balances(seller);
        assertEq(locked, quantity, "seller locked mismatch");
    }

    function test_PlaceAsk_ZeroPriceReverts() public {
        vm.prank(seller);
        vm.expectRevert(EnergyMarket.ZeroPrice.selector);
        market.placeAsk(timeSlot, 0, 7);
    }

    // -------------------------------------------------------------------------
    // cancelOrder: unlocks remaining tokens
    // -------------------------------------------------------------------------

    function test_CancelBid_UnlocksTokens() public {
        uint256 price    = 10e18;
        uint256 quantity = 5;

        vm.startPrank(buyer);
        uint256 orderId = market.placeBid(timeSlot, price, quantity);
        (, uint256 lockedBefore) = _balances(buyer);
        assertGt(lockedBefore, 0);

        market.cancelOrder(orderId);
        vm.stopPrank();

        (, uint256 lockedAfter) = _balances(buyer);
        assertEq(lockedAfter, 0, "buyer still has locked tokens after cancel");
    }

    function test_CancelAsk_UnlocksTokens() public {
        vm.startPrank(seller);
        uint256 orderId = market.placeAsk(timeSlot, 8e18, 7);
        market.cancelOrder(orderId);
        vm.stopPrank();

        (, uint256 locked) = _balances(seller);
        assertEq(locked, 0, "seller still has locked tokens after cancel");
    }

    function test_CancelOrder_RevertsIfNotTrader() public {
        vm.prank(buyer);
        uint256 orderId = market.placeBid(timeSlot, 10e18, 3);

        vm.prank(seller);
        vm.expectRevert(EnergyMarket.Unauthorized.selector);
        market.cancelOrder(orderId);
    }

    function test_CancelOrder_RevertsIfInactive() public {
        vm.startPrank(buyer);
        uint256 orderId = market.placeBid(timeSlot, 10e18, 3);
        market.cancelOrder(orderId);
        vm.expectRevert(EnergyMarket.OrderNotActive.selector);
        market.cancelOrder(orderId); // second cancel
        vm.stopPrank();
    }

    // -------------------------------------------------------------------------
    // clearAuction: transfers locked tokens between matched parties
    // -------------------------------------------------------------------------

    function test_ClearAuction_TransfersLockedTokens() public {
        uint256 bidPrice = 12e18;
        uint256 askPrice = 10e18;
        uint256 qty      = 3;

        vm.prank(buyer);
        market.placeBid(timeSlot, bidPrice, qty);

        vm.prank(seller);
        market.placeAsk(timeSlot, askPrice, qty);

        // Warp past auction end
        vm.warp(block.timestamp + 3 hours);

        uint256 buyerLockedBefore;
        (, buyerLockedBefore) = _balances(buyer);
        assertGt(buyerLockedBefore, 0);

        market.clearAuction(timeSlot);

        // After clearing: buyer's locked tokens should be reduced (payment sent to seller)
        (, uint256 buyerLockedAfter) = _balances(buyer);
        assertLt(buyerLockedAfter, buyerLockedBefore, "buyer locked not reduced");

        // Seller receives payment tokens (now available)
        (uint256 sellerAvailable,) = _balances(seller);
        assertGt(sellerAvailable, INITIAL - qty, "seller did not receive payment");
    }

    function test_ClearAuction_NoOrders_ClearingPriceZero() public {
        vm.warp(block.timestamp + 3 hours);
        uint256 clearingPrice = market.clearAuction(timeSlot);
        assertEq(clearingPrice, 0);
    }

    function test_ClearAuction_RevertsBeforeAuctionEnds() public {
        vm.expectRevert(EnergyMarket.AuctionNotOpen.selector);
        market.clearAuction(timeSlot);
    }

    function test_ClearAuction_RevertsIfAuctionWasNotStarted() public {
        vm.expectRevert(EnergyMarket.AuctionNotOpen.selector);
        market.clearAuction(timeSlot + 1 hours);
    }

    function test_StartAuction_RevertsForExistingTimeSlot() public {
        vm.expectRevert(EnergyMarket.AuctionAlreadyStarted.selector);
        market.startAuction(timeSlot, 1 hours);
    }

    function test_ClearAuction_RevertsIfAlreadyCleared() public {
        vm.warp(block.timestamp + 3 hours);
        market.clearAuction(timeSlot);
        vm.expectRevert(EnergyMarket.AuctionAlreadyCleared.selector);
        market.clearAuction(timeSlot);
    }

    // -------------------------------------------------------------------------
    // Circuit breaker (issue #30 — already on EnergyMarket)
    // -------------------------------------------------------------------------

    function test_PausePreventsPlaceBid() public {
        market.setPaused(true);
        vm.prank(buyer);
        vm.expectRevert(EnergyMarket.MarketPaused.selector);
        market.placeBid(timeSlot, 10e18, 3);
    }

    function test_PausePreventsPlaceAsk() public {
        market.setPaused(true);
        vm.prank(seller);
        vm.expectRevert(EnergyMarket.MarketPaused.selector);
        market.placeAsk(timeSlot, 8e18, 3);
    }

    function test_ResumeAfterPause() public {
        market.setPaused(true);
        market.setPaused(false);
        vm.prank(buyer);
        market.placeBid(timeSlot, 10e18, 2); // should succeed
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    function _balances(address account) internal view returns (uint256 available, uint256 locked) {
        IEnergyToken.EnergyBalance memory balance = token.getEnergyBalance(account);
        return (balance.available, balance.locked);
    }
}

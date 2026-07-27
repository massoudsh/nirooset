// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { SettlementEngine } from "../src/SettlementEngine.sol";
import { EnergyToken } from "../src/EnergyToken.sol";
import { EnergyMarket } from "../src/EnergyMarket.sol";
import { ISettlementEngine } from "../src/interfaces/ISettlementEngine.sol";
import { IEnergyToken } from "../src/interfaces/IEnergyToken.sol";
import { IEnergyMarket } from "../src/interfaces/IEnergyMarket.sol";

contract SettlementEngineTest is Test {
    SettlementEngine public engine;
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
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        token.setMinter(owner, true);
        token.mint(alice, 100_000);
        token.mint(bob, 100_000);

        engine = new SettlementEngine(token, market);

        market.startAuction(SLOT, DURATION);
        vm.prank(alice);
        market.placeBid(SLOT, 100, 50);
        vm.prank(bob);
        market.placeAsk(SLOT, 90, 40);
        market.clearAuction(SLOT);
    }

    function test_finalizeTimeSlot_Success() public {
        engine.finalizeTimeSlot(SLOT);
        ISettlementEngine.TimeSlotSettlement memory s = engine.getTimeSlotSettlement(SLOT);
        assertTrue(s.isFinalized);
        assertEq(s.clearingPrice, 100);
        assertEq(s.totalEnergy, 40);
    }

    function test_settleTimeSlot_Success() public {
        engine.finalizeTimeSlot(SLOT);
        token.approve(address(engine), 4000);
        vm.prank(alice);
        token.approve(address(engine), 4000);
        vm.prank(bob);
        token.approve(address(engine), type(uint256).max);

        engine.settleTimeSlot(SLOT);

        assertTrue(engine.isTimeSlotSettled(SLOT));
        ISettlementEngine.SettlementRecord memory rAlice = engine.getSettlementRecord(SLOT, alice);
        assertTrue(rAlice.isSettled);
        assertEq(rAlice.energyConsumed, 40);
        assertEq(rAlice.energyProduced, 0);
        assertEq(rAlice.paymentAmount, 0);
        // After market escrow: clear moved 4000 alice->bob and 40 bob->alice. Alice total 95_040 (1k locked).
        // settleTimeSlot collects _amountOwed from alice and pays paymentAmount to bob. Balances reflect that.
        assertEq(token.balanceOf(alice), 92_040);

        ISettlementEngine.SettlementRecord memory rBob = engine.getSettlementRecord(SLOT, bob);
        assertEq(rBob.energyProduced, 40);
        assertEq(rBob.paymentAmount, 4000);
        assertEq(token.balanceOf(bob), 107_960);
    }

    function test_finalizeTimeSlot_RevertsWhenNotCleared() public {
        market.startAuction(SLOT + 1, DURATION);
        vm.expectRevert(SettlementEngine.SlotNotCleared.selector);
        engine.finalizeTimeSlot(SLOT + 1);
    }

    function test_settleTimeSlot_RevertsWhenNotFinalized() public {
        vm.expectRevert(SettlementEngine.SlotNotFinalized.selector);
        engine.settleTimeSlot(SLOT);
    }

    function test_assessPenalty_OnlyPenalizer() public {
        token.mint(alice, 1000);
        engine.setPenalizer(bob, true);
        vm.prank(alice);
        token.approve(address(engine), 500);
        vm.prank(bob);
        engine.assessPenalty(alice, 500, "late");
        assertEq(token.balanceOf(owner), 500);
    }

    function test_raiseDispute() public {
        engine.finalizeTimeSlot(SLOT);
        vm.prank(alice);
        engine.raiseDispute(SLOT, alice);
    }

    function test_constructor_RevertsZeroToken() public {
        vm.expectRevert(SettlementEngine.ZeroAddress.selector);
        new SettlementEngine(IEnergyToken(address(0)), market);
    }

    function test_constructor_RevertsZeroMarket() public {
        vm.expectRevert(SettlementEngine.ZeroAddress.selector);
        new SettlementEngine(token, IEnergyMarket(address(0)));
    }

    function test_setPenalizer_RevertsZeroAddress() public {
        vm.expectRevert(SettlementEngine.ZeroAddress.selector);
        engine.setPenalizer(address(0), true);
    }

    function test_finalizeTimeSlot_Idempotent() public {
        engine.finalizeTimeSlot(SLOT);
        engine.finalizeTimeSlot(SLOT);
        ISettlementEngine.TimeSlotSettlement memory s = engine.getTimeSlotSettlement(SLOT);
        assertTrue(s.isFinalized);
    }

    function test_settleParticipant_ReturnsEmptyWhenRecordsNotPopulated() public {
        engine.finalizeTimeSlot(SLOT);
        uint256 aliceBefore = token.balanceOf(alice);
        ISettlementEngine.SettlementRecord memory r = engine.settleParticipant(SLOT, alice);
        assertEq(r.participant, address(0));
        assertEq(r.timeSlot, 0);
        assertEq(token.balanceOf(alice), aliceBefore);
    }

    function test_settleParticipant_UnchangedWhenAlreadySettled() public {
        engine.finalizeTimeSlot(SLOT);
        token.approve(address(engine), type(uint256).max);
        vm.prank(alice);
        token.approve(address(engine), type(uint256).max);
        vm.prank(bob);
        token.approve(address(engine), type(uint256).max);
        engine.settleTimeSlot(SLOT);
        ISettlementEngine.SettlementRecord memory r = engine.settleParticipant(SLOT, alice);
        assertTrue(r.isSettled);
    }

    function test_assessPenalty_RevertsAmountZero() public {
        engine.setPenalizer(bob, true);
        vm.prank(bob);
        vm.expectRevert(SettlementEngine.AmountZero.selector);
        engine.assessPenalty(alice, 0, "reason");
    }

    function test_getSettlementRecord_Empty() public view {
        ISettlementEngine.SettlementRecord memory r = engine.getSettlementRecord(SLOT, alice);
        assertEq(r.participant, address(0));
        assertEq(r.timeSlot, 0);
    }

    function test_isTimeSlotSettled_False() public view {
        assertFalse(engine.isTimeSlotSettled(SLOT));
    }
}

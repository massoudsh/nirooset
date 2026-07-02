// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EnergyOracle.sol";

/**
 * @title EnergyOracleConsensus.t.sol
 * @notice Tests for issue #21 (multi-oracle consensus) and issue #30 (rate limiting / circuit breaker).
 */
contract EnergyOracleConsensusTest is Test {
    EnergyOracle oracle;

    address owner   = address(this);
    address alice   = address(0xA11CE);
    address bob     = address(0xB0B);
    address carol   = address(0xCA901);
    address stranger = address(0x5749);

    uint256 slot0;

    function setUp() public {
        oracle = new EnergyOracle();
        // Align to hourly slot boundary
        slot0 = (block.timestamp / 1 hours) * 1 hours;
    }

    // =========================================================================
    // Issue #21 — Multi-oracle consensus
    // =========================================================================

    function test_SingleOracleDefaultConsensus() public {
        // Default: requiredConsensus == 1, owner is the only oracle.
        assertEq(oracle.requiredConsensus(), 1);
        assertEq(oracle.oracleCount(), 1);
    }

    function test_RegisterOracle() public {
        oracle.registerOracle(alice);
        assertTrue(oracle.oracles(alice));
        assertEq(oracle.oracleCount(), 2);
    }

    function test_RegisterOracleRevertsOnDuplicate() public {
        oracle.registerOracle(alice);
        vm.expectRevert(EnergyOracle.OracleAlreadyRegistered.selector);
        oracle.registerOracle(alice);
    }

    function test_RemoveOracle() public {
        oracle.registerOracle(alice);
        oracle.removeOracle(alice);
        assertFalse(oracle.oracles(alice));
        assertEq(oracle.oracleCount(), 1);
    }

    function test_RemoveOracleRevertsIfNotRegistered() public {
        vm.expectRevert(EnergyOracle.OracleNotRegistered.selector);
        oracle.removeOracle(stranger);
    }

    function test_SetRequiredConsensus() public {
        oracle.registerOracle(alice);
        oracle.setRequiredConsensus(2);
        assertEq(oracle.requiredConsensus(), 2);
    }

    function test_SetRequiredConsensusRevertsIfTooHigh() public {
        // oracleCount == 1, so n > 1 is invalid
        vm.expectRevert(EnergyOracle.InvalidConsensus.selector);
        oracle.setRequiredConsensus(2);
    }

    function test_SetRequiredConsensusRevertsOnZero() public {
        vm.expectRevert(EnergyOracle.InvalidConsensus.selector);
        oracle.setRequiredConsensus(0);
    }

    function test_AutoConfirmOnConsensusReached_OneOfOne() public {
        // Default 1-of-1: first oracle report auto-confirms the slot.
        oracle.reportProduction(1, slot0, 500);
        assertTrue(oracle.isTimeSlotConfirmed(slot0));
        assertEq(oracle.getSlotReportCount(slot0), 1);
    }

    function test_AutoConfirmOnConsensusReached_TwoOfTwo() public {
        oracle.registerOracle(alice);
        oracle.setRequiredConsensus(2);

        // First oracle reports — slot should NOT be confirmed yet.
        oracle.reportProduction(1, slot0, 500);
        assertFalse(oracle.isTimeSlotConfirmed(slot0));
        assertEq(oracle.getSlotReportCount(slot0), 1);

        // Second oracle (alice) reports — slot should now auto-confirm.
        vm.prank(alice);
        oracle.reportProduction(1, slot0, 500);
        assertTrue(oracle.isTimeSlotConfirmed(slot0));
        assertEq(oracle.getSlotReportCount(slot0), 2);
    }

    function test_AutoConfirmOnConsensusReached_TwoOfThree() public {
        oracle.registerOracle(alice);
        oracle.registerOracle(bob);
        oracle.setRequiredConsensus(2);

        oracle.reportProduction(1, slot0, 100);
        assertFalse(oracle.isTimeSlotConfirmed(slot0));

        vm.prank(alice);
        oracle.reportProduction(2, slot0 + 60, 200);
        assertTrue(oracle.isTimeSlotConfirmed(slot0));
    }

    function test_UnregisteredOracleCannotReport() public {
        vm.prank(stranger);
        vm.expectRevert(EnergyOracle.Unauthorized.selector);
        oracle.reportProduction(1, slot0, 100);
    }

    function test_EachOracleCountedOncePerSlot() public {
        oracle.registerOracle(alice);
        oracle.setRequiredConsensus(2);

        // Owner reports twice for different panels — should only count once per slot
        oracle.reportProduction(1, slot0, 100);
        oracle.reportProduction(2, slot0, 200); // same oracle, same slot → no extra count
        assertEq(oracle.getSlotReportCount(slot0), 1);

        // alice reports → consensus = 2, auto-confirm
        vm.prank(alice);
        oracle.reportProduction(3, slot0, 300);
        assertTrue(oracle.isTimeSlotConfirmed(slot0));
    }

    function test_HasOracleReportedSlot() public {
        assertFalse(oracle.hasOracleReportedSlot(slot0, owner));
        oracle.reportProduction(1, slot0, 100);
        assertTrue(oracle.hasOracleReportedSlot(slot0, owner));
    }

    // =========================================================================
    // Issue #30 — Rate limiting: one report per (oracle, panel, slot)
    // =========================================================================

    function test_RateLimit_BlocksDuplicatePanelSlotReport() public {
        oracle.reportProduction(1, slot0, 100);
        // Same oracle, same panelId, same slot → revert
        vm.expectRevert(EnergyOracle.AlreadyReported.selector);
        oracle.reportProduction(1, slot0, 200);
    }

    function test_RateLimit_AllowsDifferentPanelSameSlot() public {
        oracle.reportProduction(1, slot0, 100);
        oracle.reportProduction(2, slot0, 200); // different panel, same slot → OK
        assertEq(oracle.getTotalProductionInSlot(slot0), 300);
    }

    function test_RateLimit_AllowsSamePanelDifferentSlot() public {
        uint256 slot1 = slot0 + 1 hours;
        oracle.reportProduction(1, slot0, 100);
        oracle.reportProduction(1, slot1, 200); // same panel, next slot → OK
        assertEq(oracle.getTotalProductionInSlot(slot0), 100);
        assertEq(oracle.getTotalProductionInSlot(slot1), 200);
    }

    function test_RateLimit_DifferentOraclesSamePanelSlot() public {
        oracle.registerOracle(alice);
        // Owner reports panel 1, slot 0
        oracle.reportProduction(1, slot0, 100);
        // alice also reports panel 1, slot 0 — different oracle, so allowed
        vm.prank(alice);
        oracle.reportProduction(1, slot0, 100);
        assertEq(oracle.getTotalProductionInSlot(slot0), 200);
    }

    function test_HasPanelSlotBeenReported() public {
        assertFalse(oracle.hasPanelSlotBeenReported(1, slot0, owner));
        oracle.reportProduction(1, slot0, 100);
        assertTrue(oracle.hasPanelSlotBeenReported(1, slot0, owner));
    }

    // =========================================================================
    // Issue #30 — Circuit breaker
    // =========================================================================

    function test_PauseBlocksReportProduction() public {
        oracle.setPaused(true);
        vm.expectRevert(EnergyOracle.OraclePaused.selector);
        oracle.reportProduction(1, slot0, 100);
    }

    function test_PauseBlocksFinalizeTimeSlot() public {
        oracle.reportProduction(1, slot0, 100); // report before pause
        assertTrue(oracle.isTimeSlotConfirmed(slot0));
        oracle.setPaused(true);
        vm.expectRevert(EnergyOracle.OraclePaused.selector);
        oracle.finalizeTimeSlot(slot0);
    }

    function test_ResumeAfterPause() public {
        oracle.setPaused(true);
        oracle.setPaused(false);
        oracle.reportProduction(1, slot0, 100); // should succeed
        assertEq(oracle.getTotalProductionInSlot(slot0), 100);
    }

    function test_OnlyOwnerCanPause() public {
        vm.prank(stranger);
        vm.expectRevert(EnergyOracle.Unauthorized.selector);
        oracle.setPaused(true);
    }

    // =========================================================================
    // Finalisation with consensus
    // =========================================================================

    function test_FinalizeAfterAutoConfirm() public {
        // 1-of-1 default: reportProduction auto-confirms
        oracle.reportProduction(1, slot0, 500);
        assertTrue(oracle.isTimeSlotConfirmed(slot0));
        oracle.finalizeTimeSlot(slot0);
        assertTrue(oracle.isTimeSlotFinalized(slot0));
        assertEq(oracle.getTotalProductionInSlot(slot0), 500);
    }

    function test_FinalizeRevertsIfAlreadyFinalized() public {
        oracle.reportProduction(1, slot0, 100);
        oracle.finalizeTimeSlot(slot0);
        vm.expectRevert(EnergyOracle.SlotAlreadyFinalized.selector);
        oracle.finalizeTimeSlot(slot0);
    }

    function test_FinalizeRequiresConfirmationWhenConfirmerSet() public {
        // Set a confirmer; requiredConsensus is 1 so auto-confirm path runs,
        // but let's set consensus to 2 to prevent auto-confirm.
        oracle.registerOracle(alice);
        oracle.setRequiredConsensus(2);

        address conf = address(0xC0NF);
        oracle.setConfirmer(conf);

        // Only owner reported — not auto-confirmed, confirmer hasn't confirmed
        oracle.reportProduction(1, slot0, 100);
        assertFalse(oracle.isTimeSlotConfirmed(slot0));

        vm.expectRevert(EnergyOracle.SlotNotConfirmed.selector);
        oracle.finalizeTimeSlot(slot0);

        // Confirmer manually confirms
        vm.prank(conf);
        oracle.confirmTimeSlot(slot0);
        assertTrue(oracle.isTimeSlotConfirmed(slot0));

        // Now finalize succeeds
        oracle.finalizeTimeSlot(slot0);
        assertTrue(oracle.isTimeSlotFinalized(slot0));
    }
}

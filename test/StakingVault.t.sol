// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import { StakingVault } from "../src/StakingVault.sol";
import { EnergyToken } from "../src/EnergyToken.sol";
import { IStakingVault } from "../src/interfaces/IStakingVault.sol";
import { IEnergyToken } from "../src/interfaces/IEnergyToken.sol";

contract StakingVaultTest is Test {
    StakingVault public vault;
    EnergyToken public token;

    address public owner;
    address public alice;
    address public bob;

    function setUp() public {
        token = new EnergyToken();
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");

        token.setMinter(owner, true);
        token.mint(alice, 10_000);
        token.mint(bob, 10_000);

        vault = new StakingVault(token);
    }

    function test_depositStake_Success() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vm.stopPrank();
        assertEq(vault.getStake(alice), 1000);
        assertEq(vault.getTotalStaked(), 1000);
        assertEq(token.balanceOf(alice), 9_000);
        assertEq(token.balanceOf(address(vault)), 1000);
    }

    function test_withdrawStake_Success() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vault.withdrawStake(500);
        vm.stopPrank();
        assertEq(vault.getStake(alice), 500);
        assertEq(token.balanceOf(alice), 9_500);
    }

    function test_withdrawStake_RevertsWhenLocked() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vm.stopPrank();
        vault.lockStake(alice, 1 days);
        vm.prank(alice);
        vm.expectRevert(StakingVault.Locked.selector);
        vault.withdrawStake(500);
    }

    function test_applyPenalty_OnlyPenalizer() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vm.stopPrank();
        vault.setPenalizer(bob, true);
        vm.prank(bob);
        vault.applyPenalty(alice, 200, "late");
        assertEq(vault.getStake(alice), 800);
        assertEq(token.balanceOf(owner), 200);
    }

    function test_slash_OnlyPenalizer() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vm.stopPrank();
        vm.prank(owner);
        vault.slash(alice, 300, "violation");
        assertEq(vault.getStake(alice), 700);
    }

    function test_getStakeInfo() public view {
        IStakingVault.StakeInfo memory info = vault.getStakeInfo(alice);
        assertEq(info.staker, alice);
        assertEq(info.amount, 0);
        assertEq(info.lockUntil, 0);
        assertEq(info.isLocked, false);
    }

    function test_isStakeSufficient() public {
        vm.startPrank(alice);
        token.approve(address(vault), 500);
        vault.depositStake(500);
        vm.stopPrank();
        assertTrue(vault.isStakeSufficient(alice, 300));
        assertFalse(vault.isStakeSufficient(alice, 600));
    }

    function test_lockStake_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(StakingVault.Unauthorized.selector);
        vault.lockStake(alice, 1 days);
    }

    function test_constructor_RevertsZeroToken() public {
        vm.expectRevert(StakingVault.ZeroAddress.selector);
        new StakingVault(IEnergyToken(address(0)));
    }

    function test_setPenalizer_RevertsZeroAddress() public {
        vm.expectRevert(StakingVault.ZeroAddress.selector);
        vault.setPenalizer(address(0), true);
    }

    function test_depositStake_RevertsAmountZero() public {
        vm.prank(alice);
        vm.expectRevert(StakingVault.AmountZero.selector);
        vault.depositStake(0);
    }

    function test_withdrawStake_RevertsAmountZero() public {
        vm.prank(alice);
        vm.expectRevert(StakingVault.AmountZero.selector);
        vault.withdrawStake(0);
    }

    function test_withdrawStake_RevertsInsufficientStake() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(500);
        vm.expectRevert(StakingVault.InsufficientStake.selector);
        vault.withdrawStake(1000);
        vm.stopPrank();
    }

    function test_applyPenalty_RevertsAmountZero() public {
        vault.setPenalizer(bob, true);
        vm.prank(bob);
        vm.expectRevert(StakingVault.AmountZero.selector);
        vault.applyPenalty(alice, 0, "reason");
    }

    function test_applyPenalty_RevertsInsufficientStake() public {
        vm.startPrank(alice);
        token.approve(address(vault), 100);
        vault.depositStake(100);
        vm.stopPrank();
        vault.setPenalizer(bob, true);
        vm.prank(bob);
        vm.expectRevert(StakingVault.InsufficientStake.selector);
        vault.applyPenalty(alice, 200, "reason");
    }

    function test_slash_RevertsAmountZero() public {
        vm.prank(owner);
        vm.expectRevert(StakingVault.AmountZero.selector);
        vault.slash(alice, 0, "reason");
    }

    function test_slash_RevertsInsufficientStake() public {
        vm.startPrank(alice);
        token.approve(address(vault), 100);
        vault.depositStake(100);
        vm.stopPrank();
        vm.prank(owner);
        vm.expectRevert(StakingVault.InsufficientStake.selector);
        vault.slash(alice, 200, "reason");
    }

    function test_lockStake_ExtendLock() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vm.stopPrank();
        vault.lockStake(alice, 1 days);
        vault.lockStake(alice, 2 days);
        vm.warp(block.timestamp + 1 days + 1);
        vm.prank(alice);
        vm.expectRevert(StakingVault.Locked.selector);
        vault.withdrawStake(100);
        vm.warp(block.timestamp + 2 days);
        vm.prank(alice);
        vault.withdrawStake(100);
        assertEq(vault.getStake(alice), 900);
    }

    function test_getStakeInfo_WhenLocked() public {
        vm.startPrank(alice);
        token.approve(address(vault), 1000);
        vault.depositStake(1000);
        vm.stopPrank();
        vault.lockStake(alice, 1 days);
        IStakingVault.StakeInfo memory info = vault.getStakeInfo(alice);
        assertEq(info.amount, 1000);
        assertTrue(info.isLocked);
        assertGt(info.lockUntil, block.timestamp);
    }

    function test_getTotalStaked() public {
        assertEq(vault.getTotalStaked(), 0);
        vm.startPrank(alice);
        token.approve(address(vault), 500);
        vault.depositStake(500);
        vm.stopPrank();
        assertEq(vault.getTotalStaked(), 500);
        vm.startPrank(bob);
        token.approve(address(vault), 300);
        vault.depositStake(300);
        vm.stopPrank();
        assertEq(vault.getTotalStaked(), 800);
    }

    /// @dev Fuzz: after deposit, getStake and getTotalStaked are consistent
    function testFuzz_deposit_TotalStakedConsistent(uint256 amount) public {
        amount = bound(amount, 1, 10_000);
        vm.startPrank(alice);
        token.approve(address(vault), amount);
        vault.depositStake(amount);
        vm.stopPrank();
        assertEq(vault.getStake(alice), amount);
        assertEq(vault.getTotalStaked(), amount);
    }
}

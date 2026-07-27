// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {EnergyToken} from "../src/EnergyToken.sol";
import {IEnergyToken} from "../src/interfaces/IEnergyToken.sol";

contract EnergyTokenTest is Test {
    EnergyToken public token;

    address public owner;
    address public alice;
    address public bob;
    address public minter;
    address public locker;

    function setUp() public {
        token = new EnergyToken();
        owner = address(this);
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        minter = makeAddr("minter");
        locker = makeAddr("locker");

        token.setMinter(minter, true);
        token.setLocker(locker, true);
    }

    function test_totalSupply_InitialZero() public view {
        assertEq(token.totalSupply(), 0);
    }

    function test_balanceOf_InitialZero() public view {
        assertEq(token.balanceOf(alice), 0);
    }

    function test_getEnergyBalance_InitialZero() public view {
        IEnergyToken.EnergyBalance memory b = token.getEnergyBalance(alice);
        assertEq(b.total, 0);
        assertEq(b.locked, 0);
        assertEq(b.available, 0);
    }

    function test_mint_OnlyMinter() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        assertEq(token.totalSupply(), 1000);
        assertEq(token.balanceOf(alice), 1000);
        IEnergyToken.EnergyBalance memory b = token.getEnergyBalance(alice);
        assertEq(b.total, 1000);
        assertEq(b.locked, 0);
        assertEq(b.available, 1000);
    }

    function test_mint_OwnerCanMint() public {
        token.setMinter(owner, true);
        token.mint(alice, 500);
        assertEq(token.balanceOf(alice), 500);
    }

    function test_mint_RevertsWhenNotMinter() public {
        vm.prank(alice);
        vm.expectRevert(EnergyToken.Unauthorized.selector);
        token.mint(alice, 100);
    }

    function test_mint_RevertsZeroAmount() public {
        vm.prank(minter);
        vm.expectRevert(EnergyToken.AmountZero.selector);
        token.mint(alice, 0);
    }

    function test_mint_RevertsZeroAddress() public {
        vm.prank(minter);
        vm.expectRevert(EnergyToken.ZeroAddress.selector);
        token.mint(address(0), 100);
    }

    function test_transfer_Success() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(alice);
        token.transfer(bob, 300);
        assertEq(token.balanceOf(alice), 700);
        assertEq(token.balanceOf(bob), 300);
    }

    function test_transfer_RevertsInsufficientAvailable() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 800);
        vm.prank(alice);
        vm.expectRevert(EnergyToken.InsufficientBalance.selector);
        token.transfer(bob, 300);
    }

    function test_transfer_RespectsLocked() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 500);
        vm.prank(alice);
        token.transfer(bob, 500);
        assertEq(token.balanceOf(alice), 500);
        assertEq(token.balanceOf(bob), 500);
        assertEq(token.getEnergyBalance(alice).available, 0);
    }

    function test_transfer_RevertsZeroAddress() public {
        vm.prank(minter);
        token.mint(alice, 100);
        vm.prank(alice);
        vm.expectRevert(EnergyToken.ZeroAddress.selector);
        token.transfer(address(0), 50);
    }

    function test_approve_And_allowance() public {
        vm.prank(alice);
        token.approve(bob, 200);
        assertEq(token.allowance(alice, bob), 200);
    }

    function test_transferFrom_Success() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(alice);
        token.approve(bob, 400);
        vm.prank(bob);
        token.transferFrom(alice, bob, 400);
        assertEq(token.balanceOf(alice), 600);
        assertEq(token.balanceOf(bob), 400);
        assertEq(token.allowance(alice, bob), 0);
    }

    function test_transferFrom_RevertsInsufficientAllowance() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(alice);
        token.approve(bob, 100);
        vm.prank(bob);
        vm.expectRevert(EnergyToken.InsufficientAllowance.selector);
        token.transferFrom(alice, bob, 200);
    }

    function test_transferFrom_RespectsLocked() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 600);
        vm.prank(alice);
        token.approve(bob, type(uint256).max);
        vm.prank(bob);
        vm.expectRevert(EnergyToken.InsufficientBalance.selector);
        token.transferFrom(alice, bob, 500);
    }

    function test_burn_SelfBurn() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(alice);
        token.burn(alice, 300);
        assertEq(token.balanceOf(alice), 700);
        assertEq(token.totalSupply(), 700);
    }

    function test_burn_OwnerCanBurnAny() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        token.burn(alice, 400);
        assertEq(token.balanceOf(alice), 600);
        assertEq(token.totalSupply(), 600);
    }

    function test_burn_RevertsWhenNotOwnerOrSelf() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(bob);
        vm.expectRevert(EnergyToken.Unauthorized.selector);
        token.burn(alice, 100);
    }

    function test_burn_RevertsInsufficientAvailable() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 800);
        vm.prank(alice);
        vm.expectRevert(EnergyToken.InsufficientBalance.selector);
        token.burn(alice, 300);
    }

    function test_lock_OnlyLocker() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 400);
        IEnergyToken.EnergyBalance memory b = token.getEnergyBalance(alice);
        assertEq(b.total, 1000);
        assertEq(b.locked, 400);
        assertEq(b.available, 600);
    }

    function test_lock_RevertsWhenNotLocker() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(alice);
        vm.expectRevert(EnergyToken.Unauthorized.selector);
        token.lock(alice, 100);
    }

    function test_lock_RevertsLockExceedsBalance() public {
        vm.prank(minter);
        token.mint(alice, 100);
        vm.prank(locker);
        vm.expectRevert(EnergyToken.LockExceedsBalance.selector);
        token.lock(alice, 200);
    }

    function test_unlock_Success() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 300);
        vm.prank(locker);
        token.unlock(alice, 200);
        IEnergyToken.EnergyBalance memory b = token.getEnergyBalance(alice);
        assertEq(b.total, 1000);
        assertEq(b.locked, 100);
        assertEq(b.available, 900);
    }

    function test_unlock_RevertsInsufficientLocked() public {
        vm.prank(minter);
        token.mint(alice, 1000);
        vm.prank(locker);
        token.lock(alice, 100);
        vm.prank(locker);
        vm.expectRevert(EnergyToken.InsufficientLocked.selector);
        token.unlock(alice, 200);
    }

    function test_setMinter_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(EnergyToken.Unauthorized.selector);
        token.setMinter(alice, true);
    }

    function test_setLocker_OnlyOwner() public {
        vm.prank(alice);
        vm.expectRevert(EnergyToken.Unauthorized.selector);
        token.setLocker(alice, true);
    }

    /// @dev Fuzz: after mint, balance and totalSupply are consistent
    function testFuzz_mint_ConsistentSupply(uint256 amount) public {
        amount = bound(amount, 1, 1e30);
        token.mint(alice, amount);
        assertEq(token.balanceOf(alice), amount);
        assertEq(token.totalSupply(), amount);
        IEnergyToken.EnergyBalance memory b = token.getEnergyBalance(alice);
        assertEq(b.total, amount);
        assertEq(b.available, amount);
        assertEq(b.locked, 0);
    }
}

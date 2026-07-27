// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PanelNFT} from "../src/PanelNFT.sol";
import {IPanelNFT} from "../src/interfaces/IPanelNFT.sol";

contract PanelNFTTest is Test {
    PanelNFT public nft;

    address public owner;
    address public minter;
    address public alice;
    address public bob;

    function setUp() public {
        nft = new PanelNFT();
        owner = address(this);
        minter = makeAddr("minter");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        nft.setMinter(minter, true);
    }

    function test_mint_Success() public {
        vm.prank(minter);
        uint256 id = nft.mint(alice, "ipfs://meta/1", 5000);
        assertEq(id, 1);
        assertEq(nft.ownerOf(1), alice);
        assertEq(nft.balanceOf(alice), 1);
        assertEq(nft.totalSupply(), 1);
        IPanelNFT.PanelMetadata memory m = nft.getPanelMetadata(1);
        assertEq(m.tokenId, 1);
        assertEq(m.metadataUri, "ipfs://meta/1");
        assertEq(m.capacityWatt, 5000);
        assertTrue(m.isActive);
    }

    function test_transferFrom_Success() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 1000);
        vm.prank(alice);
        nft.transferFrom(alice, bob, 1);
        assertEq(nft.ownerOf(1), bob);
        assertEq(nft.balanceOf(alice), 0);
        assertEq(nft.balanceOf(bob), 1);
    }

    function test_approve_And_getApproved() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 1000);
        vm.prank(alice);
        nft.approve(bob, 1);
        assertEq(nft.getApproved(1), bob);
        vm.prank(bob);
        nft.transferFrom(alice, bob, 1);
        assertEq(nft.ownerOf(1), bob);
    }

    function test_retire() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 1000);
        vm.prank(alice);
        nft.retire(1);
        IPanelNFT.PanelMetadata memory m = nft.getPanelMetadata(1);
        assertFalse(m.isActive);
        vm.prank(alice);
        vm.expectRevert(PanelNFT.AlreadyRetired.selector);
        nft.transferFrom(alice, bob, 1);
    }

    function test_balanceOf_InitialZero() public view {
        assertEq(nft.balanceOf(alice), 0);
    }

    function test_ownerOf_RevertsInvalidToken() public {
        vm.expectRevert(PanelNFT.InvalidTokenId.selector);
        nft.ownerOf(999);
    }

    function test_mint_RevertsWhenNotMinter() public {
        vm.prank(alice);
        vm.expectRevert(PanelNFT.Unauthorized.selector);
        nft.mint(alice, "uri", 1000);
    }

    function test_balanceOf_RevertsZeroAddress() public {
        vm.expectRevert(PanelNFT.ZeroAddress.selector);
        nft.balanceOf(address(0));
    }

    function test_setMinter_RevertsZeroAddress() public {
        vm.expectRevert(PanelNFT.ZeroAddress.selector);
        nft.setMinter(address(0), true);
    }

    function test_setMinter_Success() public {
        nft.setMinter(alice, true);
        vm.prank(alice);
        nft.mint(bob, "uri", 100);
        assertEq(nft.balanceOf(bob), 1);
        nft.setMinter(alice, false);
        vm.prank(alice);
        vm.expectRevert(PanelNFT.Unauthorized.selector);
        nft.mint(bob, "uri2", 200);
    }

    function test_mint_OwnerCanMint() public {
        nft.mint(alice, "owner-uri", 300);
        assertEq(nft.ownerOf(1), alice);
        assertEq(nft.totalSupply(), 1);
    }

    function test_mint_RevertsZeroAddress() public {
        vm.prank(minter);
        vm.expectRevert(PanelNFT.ZeroAddress.selector);
        nft.mint(address(0), "uri", 100);
    }

    function test_getApproved_RevertsInvalidToken() public {
        vm.expectRevert(PanelNFT.InvalidTokenId.selector);
        nft.getApproved(999);
    }

    function test_isApprovedForAll() public {
        assertFalse(nft.isApprovedForAll(alice, bob));
        vm.prank(alice);
        nft.setApprovalForAll(bob, true);
        assertTrue(nft.isApprovedForAll(alice, bob));
        vm.prank(alice);
        nft.setApprovalForAll(bob, false);
        assertFalse(nft.isApprovedForAll(alice, bob));
    }

    function test_setApprovalForAll_RevertsZeroOperator() public {
        vm.prank(alice);
        vm.expectRevert(PanelNFT.ZeroAddress.selector);
        nft.setApprovalForAll(address(0), true);
    }

    function test_approve_RevertsWhenNotOwnerOrApproved() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(bob);
        vm.expectRevert(PanelNFT.NotApproved.selector);
        nft.approve(bob, 1);
    }

    function test_approve_ByOperator() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(alice);
        nft.setApprovalForAll(bob, true);
        vm.prank(bob);
        nft.approve(bob, 1);
        assertEq(nft.getApproved(1), bob);
    }

    function test_retire_ByOperator() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(alice);
        nft.setApprovalForAll(bob, true);
        vm.prank(bob);
        nft.retire(1);
        IPanelNFT.PanelMetadata memory m = nft.getPanelMetadata(1);
        assertFalse(m.isActive);
    }

    function test_retire_RevertsAlreadyRetired() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(alice);
        nft.retire(1);
        vm.prank(alice);
        vm.expectRevert(PanelNFT.AlreadyRetired.selector);
        nft.retire(1);
    }

    function test_getPanelMetadata_RevertsInvalidToken() public {
        vm.expectRevert(PanelNFT.InvalidTokenId.selector);
        nft.getPanelMetadata(999);
    }

    function test_safeTransferFrom_Success() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(alice);
        nft.safeTransferFrom(alice, bob, 1);
        assertEq(nft.ownerOf(1), bob);
    }

    function test_transferFrom_RevertsTransferToZero() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(alice);
        vm.expectRevert(PanelNFT.TransferToZero.selector);
        nft.transferFrom(alice, address(0), 1);
    }

    function test_transferFrom_RevertsWrongFrom() public {
        vm.prank(minter);
        nft.mint(alice, "uri", 100);
        vm.prank(alice);
        vm.expectRevert(PanelNFT.WrongFrom.selector);
        nft.transferFrom(bob, alice, 1);
    }
}

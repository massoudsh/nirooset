// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PanelRegistry.sol";
import "../src/PanelNFT.sol";

/**
 * @title PanelRegistryNFT.t.sol
 * @notice Tests for issue #20: PanelRegistry must validate PanelNFT ownership before registration.
 *
 *  Verifies:
 *   - registerPanel succeeds when caller passes a matching NFT owner.
 *   - registerPanel reverts with NotPanelNFTOwner when owner_ does not match ownerOf(tokenId).
 *   - When panelNFT is not set, any owner_ is accepted (backwards-compatible).
 *   - Only authorised registrars may call registerPanel.
 */
contract PanelRegistryNFTTest is Test {
    PanelRegistry registry;
    PanelNFT      nft;

    address admin    = address(this);
    address alice    = address(0xA11CE);
    address bob      = address(0xB0B);
    address stranger = address(0x5749);

    uint256 constant TOKEN_ID    = 1;
    uint256 constant CAPACITY_W  = 400;

    function setUp() public {
        registry = new PanelRegistry();
        nft      = new PanelNFT();

        // Grant admin the registrar role
        registry.setRegistrar(admin, true);

        // Mint token 1 to alice
        nft.mint(alice, TOKEN_ID, CAPACITY_W);
    }

    // -------------------------------------------------------------------------
    // Without NFT contract set (backwards-compatible behaviour)
    // -------------------------------------------------------------------------

    function test_RegisterPanel_NoNFTSet_AnyOwnerAllowed() public {
        // panelNFT not set → no ownership check
        registry.registerPanel(TOKEN_ID, bob, CAPACITY_W);
        PanelRegistry.PanelRecord memory rec = registry.getPanelRecord(TOKEN_ID);
        assertTrue(rec.isRegistered);
        assertEq(rec.owner, bob);
    }

    // -------------------------------------------------------------------------
    // With NFT contract set (ownership enforcement)
    // -------------------------------------------------------------------------

    function test_RegisterPanel_WithNFT_CorrectOwnerSucceeds() public {
        registry.setPanelNFT(address(nft));

        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);

        PanelRegistry.PanelRecord memory rec = registry.getPanelRecord(TOKEN_ID);
        assertTrue(rec.isRegistered);
        assertEq(rec.owner, alice);
        assertEq(rec.capacityWatt, CAPACITY_W);
    }

    function test_RegisterPanel_WithNFT_WrongOwnerReverts() public {
        registry.setPanelNFT(address(nft));

        // bob is NOT the NFT owner of TOKEN_ID (alice is)
        vm.expectRevert(PanelRegistry.NotPanelNFTOwner.selector);
        registry.registerPanel(TOKEN_ID, bob, CAPACITY_W);
    }

    function test_RegisterPanel_WithNFT_AfterTransfer() public {
        registry.setPanelNFT(address(nft));

        // Transfer NFT from alice → bob
        vm.prank(alice);
        nft.transferFrom(alice, bob, TOKEN_ID);

        // Now bob is the owner → should succeed
        registry.registerPanel(TOKEN_ID, bob, CAPACITY_W);
        PanelRegistry.PanelRecord memory rec = registry.getPanelRecord(TOKEN_ID);
        assertEq(rec.owner, bob);
    }

    function test_RegisterPanel_WithNFT_OriginalOwnerRevertsAfterTransfer() public {
        registry.setPanelNFT(address(nft));
        vm.prank(alice);
        nft.transferFrom(alice, bob, TOKEN_ID);

        // alice no longer owns it
        vm.expectRevert(PanelRegistry.NotPanelNFTOwner.selector);
        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);
    }

    // -------------------------------------------------------------------------
    // Access control
    // -------------------------------------------------------------------------

    function test_RegisterPanel_OnlyRegistrar() public {
        vm.prank(stranger);
        vm.expectRevert(PanelRegistry.Unauthorized.selector);
        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);
    }

    function test_SetPanelNFT_OnlyOwner() public {
        vm.prank(stranger);
        vm.expectRevert(PanelRegistry.Unauthorized.selector);
        registry.setPanelNFT(address(nft));
    }

    // -------------------------------------------------------------------------
    // Deregistration
    // -------------------------------------------------------------------------

    function test_DeregisterPanel() public {
        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);
        registry.deregisterPanel(TOKEN_ID);
        PanelRegistry.PanelRecord memory rec = registry.getPanelRecord(TOKEN_ID);
        assertFalse(rec.isRegistered);
    }

    function test_DeregisterUnregisteredReverts() public {
        vm.expectRevert(PanelRegistry.NotRegistered.selector);
        registry.deregisterPanel(TOKEN_ID);
    }

    // -------------------------------------------------------------------------
    // Double-registration guard
    // -------------------------------------------------------------------------

    function test_DoubleRegisterReverts() public {
        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);
        vm.expectRevert(PanelRegistry.AlreadyRegistered.selector);
        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);
    }

    // -------------------------------------------------------------------------
    // Production reporting still works after registration
    // -------------------------------------------------------------------------

    function test_ReportProduction_AfterRegistration() public {
        registry.setReporter(admin, true);
        registry.registerPanel(TOKEN_ID, alice, CAPACITY_W);
        registry.reportProduction(TOKEN_ID, block.timestamp, 1_000);
        assertEq(registry.getTotalProduction(TOKEN_ID), 1_000);
    }
}

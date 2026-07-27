// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {PanelRegistry} from "../src/PanelRegistry.sol";
import {PanelNFT} from "../src/PanelNFT.sol";
import {IPanelRegistry} from "../src/interfaces/IPanelRegistry.sol";

contract PanelRegistryTest is Test {
    PanelRegistry public registry;
    PanelNFT public panelNFT;

    address public owner;
    address public registrar;
    address public reporter;
    address public alice;
    address public bob;

    function setUp() public {
        registry = new PanelRegistry();
        panelNFT = new PanelNFT();
        owner = address(this);
        registrar = makeAddr("registrar");
        reporter = makeAddr("reporter");
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        panelNFT.setMinter(owner, true);
        registry.setRegistrar(registrar, true);
        registry.setReporter(reporter, true);
    }

    function test_registerPanel_Success() public {
        vm.prank(registrar);
        registry.registerPanel(1, address(0x1), 5000);
        assertTrue(registry.isRegistered(1));
        IPanelRegistry.PanelRecord memory r = registry.getPanelRecord(1);
        assertEq(r.tokenId, 1);
        assertEq(r.owner, address(0x1));
        assertEq(r.capacityWatt, 5000);
        assertEq(r.totalEnergyProduced, 0);
        assertTrue(r.isRegistered);
    }

    function test_registerPanel_WhenPanelNFTSet_RequiresNFTOwner() public {
        registry.setPanelNFT(address(panelNFT));
        panelNFT.mint(alice, "ipfs://meta/1", 5000);
        vm.prank(registrar);
        registry.registerPanel(1, alice, 5000);
        assertTrue(registry.isRegistered(1));
        assertEq(registry.getPanelRecord(1).owner, alice);
    }

    function test_registerPanel_WhenPanelNFTSet_RevertsWhenNotNFTOwner() public {
        registry.setPanelNFT(address(panelNFT));
        panelNFT.mint(alice, "ipfs://meta/1", 5000);
        vm.prank(registrar);
        vm.expectRevert(PanelRegistry.NotPanelNFTOwner.selector);
        registry.registerPanel(1, bob, 5000);
    }

    function test_registerPanel_WhenPanelNFTNotSet_AllowsAnyOwner() public {
        vm.prank(registrar);
        registry.registerPanel(1, address(0x1), 5000);
        assertEq(registry.getPanelRecord(1).owner, address(0x1));
    }

    function test_reportProduction_Success() public {
        vm.prank(registrar);
        registry.registerPanel(1, address(0x1), 5000);
        vm.prank(reporter);
        registry.reportProduction(1, block.timestamp, 100);
        assertEq(registry.getTotalProduction(1), 100);
        assertEq(registry.getProductionInTimeSlot(1, block.timestamp - 1, block.timestamp + 1), 100);
    }

    function test_deregisterPanel_Success() public {
        vm.prank(registrar);
        registry.registerPanel(1, address(0x1), 1000);
        vm.prank(registrar);
        registry.deregisterPanel(1);
        assertFalse(registry.isRegistered(1));
    }

    function test_getRegisteredPanels() public {
        vm.prank(registrar);
        registry.registerPanel(10, address(0x1), 1000);
        vm.prank(registrar);
        registry.registerPanel(20, address(0x2), 2000);
        uint256[] memory ids = registry.getRegisteredPanels();
        assertEq(ids.length, 2);
        assertEq(ids[0], 10);
        assertEq(ids[1], 20);
    }

    function test_registerPanel_RevertsWhenNotRegistrar() public {
        vm.prank(address(0x99));
        vm.expectRevert(PanelRegistry.Unauthorized.selector);
        registry.registerPanel(1, address(0x1), 1000);
    }

    function test_reportProduction_RevertsWhenNotRegistered() public {
        vm.prank(reporter);
        vm.expectRevert(PanelRegistry.NotRegistered.selector);
        registry.reportProduction(1, block.timestamp, 100);
    }
}

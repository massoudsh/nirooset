// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { GovernanceDAO } from "../src/GovernanceDAO.sol";
import { EnergyToken } from "../src/EnergyToken.sol";
import { IGovernanceDAO } from "../src/interfaces/IGovernanceDAO.sol";

contract GovernanceDAOTest is Test {
    GovernanceDAO public dao;
    EnergyToken public token;

    address public alice = address(0xa);
    address public bob = address(0xb);

    function setUp() public {
        token = new EnergyToken();
        token.setMinter(address(this), true);
        token.mint(alice, 1000 ether);
        token.mint(bob, 500 ether);
        dao = new GovernanceDAO(token);
    }

    function test_createProposal_Success() public {
        vm.prank(alice);
        uint256 id = dao.createProposal("Increase fee", 1 days);
        assertEq(id, 1);
        IGovernanceDAO.Proposal memory p = dao.getProposal(1);
        assertEq(p.proposalId, 1);
        assertEq(p.proposer, alice);
        assertEq(p.description, "Increase fee");
        assertEq(p.forVotes, 0);
        assertEq(p.againstVotes, 0);
        assertFalse(p.executed);
        assertFalse(p.cancelled);
    }

    function test_createProposal_RevertsZeroVotingPower() public {
        address noTokens = address(0xc);
        vm.prank(noTokens);
        vm.expectRevert(GovernanceDAO.ZeroVotingPower.selector);
        dao.createProposal("Bad", 1 days);
    }

    function test_castVote_Success() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.prank(alice);
        dao.castVote(1, true);
        vm.prank(bob);
        dao.castVote(1, false);
        IGovernanceDAO.Proposal memory p = dao.getProposal(1);
        assertEq(p.forVotes, 1000 ether);
        assertEq(p.againstVotes, 500 ether);
        assertTrue(dao.hasVoted(1, alice));
        assertTrue(dao.hasVoted(1, bob));
        IGovernanceDAO.Vote memory v = dao.getVote(1, alice);
        assertTrue(v.support);
        assertEq(v.weight, 1000 ether);
    }

    function test_castVote_RevertsAlreadyVoted() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.prank(alice);
        dao.castVote(1, true);
        vm.prank(alice);
        vm.expectRevert(GovernanceDAO.AlreadyVoted.selector);
        dao.castVote(1, false);
    }

    function test_castVote_RevertsVotingNotActive() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.warp(block.timestamp + 2 days);
        vm.prank(bob);
        vm.expectRevert(GovernanceDAO.VotingNotActive.selector);
        dao.castVote(1, true);
    }

    function test_getProposal_RevertsNotFound() public {
        vm.expectRevert(GovernanceDAO.ProposalNotFound.selector);
        dao.getProposal(999);
    }

    function test_getVotingPower() public view {
        assertEq(dao.getVotingPower(alice), 1000 ether);
        assertEq(dao.getVotingPower(bob), 500 ether);
        assertEq(dao.getVotingPower(address(0xc)), 0);
    }

    function test_isProposalExecutable_BeforeEnd() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        assertFalse(dao.isProposalExecutable(1));
        vm.warp(block.timestamp + 12 hours);
        assertFalse(dao.isProposalExecutable(1));
    }

    function test_isProposalExecutable_AfterEndForWins() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.prank(alice);
        dao.castVote(1, true);
        vm.prank(bob);
        dao.castVote(1, false);
        vm.warp(block.timestamp + 2 days);
        assertTrue(dao.isProposalExecutable(1));
    }

    function test_isProposalExecutable_AfterEndAgainstWins() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.prank(alice);
        dao.castVote(1, false);
        vm.prank(bob);
        dao.castVote(1, false);
        vm.warp(block.timestamp + 2 days);
        assertFalse(dao.isProposalExecutable(1));
    }

    function test_executeProposal_Success() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.prank(alice);
        dao.castVote(1, true);
        vm.prank(bob);
        dao.castVote(1, false);
        vm.warp(block.timestamp + 2 days);
        dao.executeProposal(1);
        IGovernanceDAO.Proposal memory p = dao.getProposal(1);
        assertTrue(p.executed);
    }

    function test_executeProposal_RevertsNotExecutable() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.expectRevert(GovernanceDAO.ProposalNotExecutable.selector);
        dao.executeProposal(1);
    }

    function test_cancelProposal_OnlyProposer() public {
        vm.prank(alice);
        dao.createProposal("Fee", 1 days);
        vm.prank(bob);
        vm.expectRevert(GovernanceDAO.NotProposer.selector);
        dao.cancelProposal(1);
        vm.prank(alice);
        dao.cancelProposal(1);
        IGovernanceDAO.Proposal memory p = dao.getProposal(1);
        assertTrue(p.cancelled);
        assertFalse(dao.isProposalExecutable(1));
    }
}

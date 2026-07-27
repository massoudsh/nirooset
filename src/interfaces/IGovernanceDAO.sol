// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGovernanceDAO {
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);

    struct Proposal {
        uint256 proposalId;
        address proposer;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 forVotes;
        uint256 againstVotes;
        bool executed;
        bool cancelled;
    }

    struct Vote {
        address voter;
        bool support;
        uint256 weight;
    }

    function createProposal(string calldata description, uint256 votingPeriod) external returns (uint256);
    function castVote(uint256 proposalId, bool support) external;
    function executeProposal(uint256 proposalId) external;
    function cancelProposal(uint256 proposalId) external;
    function getProposal(uint256 proposalId) external view returns (Proposal memory);
    function getVote(uint256 proposalId, address voter) external view returns (Vote memory);
    function hasVoted(uint256 proposalId, address voter) external view returns (bool);
    function getVotingPower(address voter) external view returns (uint256);
    function isProposalExecutable(uint256 proposalId) external view returns (bool);
}

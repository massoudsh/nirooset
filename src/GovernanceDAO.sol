// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IGovernanceDAO.sol";
import "./interfaces/IEnergyToken.sol";

/**
 * @title GovernanceDAO
 * @dev Token-weighted governance: create proposals, cast votes, execute when forVotes > againstVotes after voting period.
 */
contract GovernanceDAO is IGovernanceDAO {
    IEnergyToken public immutable votingToken;

    uint256 private _nextProposalId = 1;
    mapping(uint256 => Proposal) private _proposals;
    mapping(uint256 => mapping(address => Vote)) private _votes;

    error ProposalNotFound();
    error VotingNotActive();
    error AlreadyVoted();
    error ProposalNotExecutable();
    error NotProposer();
    error ZeroVotingPower();

    constructor(IEnergyToken _votingToken) {
        votingToken = _votingToken;
    }

    function createProposal(string calldata description, uint256 votingPeriod) external override returns (uint256) {
        uint256 power = votingToken.balanceOf(msg.sender);
        if (power == 0) revert ZeroVotingPower();
        uint256 id;
        unchecked { id = _nextProposalId++; }
        uint256 start = block.timestamp;
        _proposals[id] = Proposal({
            proposalId: id,
            proposer: msg.sender,
            description: description,
            startTime: start,
            endTime: start + votingPeriod,
            forVotes: 0,
            againstVotes: 0,
            executed: false,
            cancelled: false
        });
        emit ProposalCreated(id, msg.sender, description);
        return id;
    }

    function castVote(uint256 proposalId, bool support) external override {
        Proposal storage p = _proposals[proposalId];
        if (p.proposer == address(0)) revert ProposalNotFound();
        if (block.timestamp < p.startTime || block.timestamp > p.endTime) revert VotingNotActive();
        if (p.executed || p.cancelled) revert VotingNotActive();
        if (_votes[proposalId][msg.sender].voter != address(0)) revert AlreadyVoted();

        uint256 weight = votingToken.balanceOf(msg.sender);
        _votes[proposalId][msg.sender] = Vote({ voter: msg.sender, support: support, weight: weight });
        if (support) p.forVotes += weight;
        else p.againstVotes += weight;
        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external override {
        if (!isProposalExecutable(proposalId)) revert ProposalNotExecutable();
        _proposals[proposalId].executed = true;
        emit ProposalExecuted(proposalId);
    }

    function cancelProposal(uint256 proposalId) external override {
        Proposal storage p = _proposals[proposalId];
        if (p.proposer == address(0)) revert ProposalNotFound();
        if (msg.sender != p.proposer) revert NotProposer();
        if (p.executed) revert ProposalNotExecutable();
        p.cancelled = true;
        emit ProposalCancelled(proposalId);
    }

    function getProposal(uint256 proposalId) external view override returns (Proposal memory) {
        Proposal memory p = _proposals[proposalId];
        if (p.proposer == address(0)) revert ProposalNotFound();
        return p;
    }

    function getVote(uint256 proposalId, address voter) external view override returns (Vote memory) {
        return _votes[proposalId][voter];
    }

    function hasVoted(uint256 proposalId, address voter) external view override returns (bool) {
        return _votes[proposalId][voter].voter != address(0);
    }

    function getVotingPower(address voter) external view override returns (uint256) {
        return votingToken.balanceOf(voter);
    }

    function isProposalExecutable(uint256 proposalId) public view override returns (bool) {
        Proposal memory p = _proposals[proposalId];
        if (p.proposer == address(0) || p.cancelled || p.executed) return false;
        if (block.timestamp <= p.endTime) return false;
        return p.forVotes > p.againstVotes;
    }
}

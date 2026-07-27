// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStakingVault {
    event StakeDeposited(address indexed staker, uint256 amount, uint256 totalStake);
    event StakeWithdrawn(address indexed staker, uint256 amount, uint256 remainingStake);
    event PenaltyApplied(address indexed staker, uint256 amount, string reason);
    event SlashExecuted(address indexed staker, uint256 amount, string reason);

    struct StakeInfo {
        address staker;
        uint256 amount;
        uint256 lockUntil;
        bool isLocked;
    }

    function depositStake(uint256 amount) external;
    function withdrawStake(uint256 amount) external;
    function applyPenalty(address staker, uint256 amount, string calldata reason) external;
    function slash(address staker, uint256 amount, string calldata reason) external;
    function getStake(address staker) external view returns (uint256);
    function getStakeInfo(address staker) external view returns (StakeInfo memory);
    function getTotalStaked() external view returns (uint256);
    function isStakeSufficient(address staker, uint256 requiredAmount) external view returns (bool);
    function lockStake(address staker, uint256 lockDuration) external;
}

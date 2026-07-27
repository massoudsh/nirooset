// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ISettlementEngine {
    event SettlementExecuted(uint256 indexed timeSlot, address indexed participant, uint256 energyAmount, uint256 paymentAmount);
    event SettlementBatchCompleted(uint256 indexed timeSlot, uint256 participantCount, uint256 totalEnergy, uint256 totalPayment);
    event PenaltyAssessed(address indexed participant, uint256 amount, string reason);
    event DisputeRaised(uint256 indexed timeSlot, address indexed participant);

    struct SettlementRecord {
        uint256 timeSlot;
        address participant;
        uint256 energyProduced;
        uint256 energyConsumed;
        uint256 netEnergy;
        uint256 paymentAmount;
        bool isSettled;
    }

    struct TimeSlotSettlement {
        uint256 timeSlot;
        uint256 clearingPrice;
        uint256 totalEnergy;
        uint256 totalPayment;
        bool isFinalized;
    }

    function settleTimeSlot(uint256 timeSlot) external;
    function settleParticipant(uint256 timeSlot, address participant) external returns (SettlementRecord memory);
    function assessPenalty(address participant, uint256 amount, string calldata reason) external;
    function raiseDispute(uint256 timeSlot, address participant) external;
    function getSettlementRecord(uint256 timeSlot, address participant) external view returns (SettlementRecord memory);
    function getTimeSlotSettlement(uint256 timeSlot) external view returns (TimeSlotSettlement memory);
    function isTimeSlotSettled(uint256 timeSlot) external view returns (bool);
    function finalizeTimeSlot(uint256 timeSlot) external;
}

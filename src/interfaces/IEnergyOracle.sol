// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEnergyOracle {
    event ProductionReported(uint256 indexed panelId, uint256 timestamp, uint256 energyWh, address reporter);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event TimeSlotFinalized(uint256 indexed timeSlot, uint256 totalEnergy);

    struct ProductionReport {
        uint256 panelId;
        uint256 timestamp;
        uint256 energyWh;
        address reporter;
        bool verified;
    }

    struct TimeSlotData {
        uint256 startTime;
        uint256 endTime;
        uint256 totalEnergy;
        bool finalized;
    }

    function reportProduction(uint256 panelId, uint256 timestamp, uint256 energyWh) external;
    function finalizeTimeSlot(uint256 timeSlot) external;
    function getProductionReport(uint256 panelId, uint256 timestamp) external view returns (ProductionReport memory);
    function getTimeSlotData(uint256 timeSlot) external view returns (TimeSlotData memory);
    function getTotalProductionInSlot(uint256 timeSlot) external view returns (uint256);
    function isTimeSlotFinalized(uint256 timeSlot) external view returns (bool);
    function updateOracle(address newOracle) external;
}

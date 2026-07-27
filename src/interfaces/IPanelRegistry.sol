// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPanelRegistry {
    event PanelRegistered(uint256 indexed tokenId, address indexed owner, uint256 capacityWatt);
    event PanelDeregistered(uint256 indexed tokenId);
    event ProductionReported(uint256 indexed tokenId, uint256 timestamp, uint256 energyWh);

    struct PanelRecord {
        uint256 tokenId;
        address owner;
        uint256 capacityWatt;
        uint256 totalEnergyProduced;
        uint256 lastReportTimestamp;
        bool isRegistered;
    }

    function registerPanel(uint256 tokenId, address owner, uint256 capacityWatt) external;
    function deregisterPanel(uint256 tokenId) external;
    function reportProduction(uint256 tokenId, uint256 timestamp, uint256 energyWh) external;
    function getPanelRecord(uint256 tokenId) external view returns (PanelRecord memory);
    function getTotalProduction(uint256 tokenId) external view returns (uint256);
    function getProductionInTimeSlot(uint256 tokenId, uint256 startTime, uint256 endTime) external view returns (uint256);
    function isRegistered(uint256 tokenId) external view returns (bool);
    function getRegisteredPanels() external view returns (uint256[] memory);
}

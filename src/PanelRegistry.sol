// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPanelRegistry.sol";
import "./interfaces/IPanelNFT.sol";

/**
 * @title PanelRegistry
 * @notice Tracks registered panels and production data per time slot.
 * @dev When panelNFT is set, registerPanel requires owner_ to be the current ownerOf(tokenId) on PanelNFT.
 */
contract PanelRegistry is IPanelRegistry {
    struct ProductionEntry {
        uint256 timestamp;
        uint256 energyWh;
    }

    mapping(uint256 => PanelRecord) private _records;
    mapping(uint256 => ProductionEntry[]) private _productionLog;
    uint256[] private _registeredIds;
    mapping(uint256 => uint256) private _idToIndex; // 1-based index in _registeredIds, 0 = not present

    address public owner;
    address public panelNFT; // when set, registerPanel requires owner_ == IPanelNFT(panelNFT).ownerOf(tokenId)
    mapping(address => bool) public registrars;
    mapping(address => bool) public reporters;

    error Unauthorized();
    error ZeroAddress();
    error NotRegistered();
    error AlreadyRegistered();
    error NotPanelNFTOwner();

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyRegistrar() {
        if (!registrars[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyReporter() {
        if (!reporters[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setRegistrar(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        registrars[account] = granted;
    }

    function setReporter(address account, bool granted) external onlyOwner {
        if (account == address(0)) revert ZeroAddress();
        reporters[account] = granted;
    }

    function setPanelNFT(address _panelNFT) external onlyOwner {
        panelNFT = _panelNFT;
    }

    function registerPanel(uint256 tokenId, address owner_, uint256 capacityWatt) external override onlyRegistrar {
        if (_records[tokenId].isRegistered) revert AlreadyRegistered();
        if (panelNFT != address(0)) {
            if (IPanelNFT(panelNFT).ownerOf(tokenId) != owner_) revert NotPanelNFTOwner();
        }
        _records[tokenId] = PanelRecord({
            tokenId: tokenId,
            owner: owner_,
            capacityWatt: capacityWatt,
            totalEnergyProduced: 0,
            lastReportTimestamp: 0,
            isRegistered: true
        });
        _registeredIds.push(tokenId);
        _idToIndex[tokenId] = _registeredIds.length;
        emit PanelRegistered(tokenId, owner_, capacityWatt);
    }

    function deregisterPanel(uint256 tokenId) external override onlyRegistrar {
        if (!_records[tokenId].isRegistered) revert NotRegistered();
        _records[tokenId].isRegistered = false;
        uint256 idx = _idToIndex[tokenId];
        if (idx != 0 && idx <= _registeredIds.length) {
            uint256 lastId = _registeredIds[_registeredIds.length - 1];
            _registeredIds[idx - 1] = lastId;
            _idToIndex[lastId] = idx;
            _registeredIds.pop();
            _idToIndex[tokenId] = 0;
        }
        emit PanelDeregistered(tokenId);
    }

    function reportProduction(uint256 tokenId, uint256 timestamp, uint256 energyWh) external override onlyReporter {
        if (!_records[tokenId].isRegistered) revert NotRegistered();
        _records[tokenId].totalEnergyProduced += energyWh;
        _records[tokenId].lastReportTimestamp = timestamp;
        _productionLog[tokenId].push(ProductionEntry({ timestamp: timestamp, energyWh: energyWh }));
        emit ProductionReported(tokenId, timestamp, energyWh);
    }

    function getPanelRecord(uint256 tokenId) external view override returns (PanelRecord memory) {
        return _records[tokenId];
    }

    function getTotalProduction(uint256 tokenId) external view override returns (uint256) {
        return _records[tokenId].totalEnergyProduced;
    }

    function getProductionInTimeSlot(uint256 tokenId, uint256 startTime, uint256 endTime) external view override returns (uint256) {
        uint256 total = 0;
        ProductionEntry[] storage log = _productionLog[tokenId];
        for (uint256 i = 0; i < log.length; i++) {
            if (log[i].timestamp >= startTime && log[i].timestamp <= endTime) {
                total += log[i].energyWh;
            }
        }
        return total;
    }

    function isRegistered(uint256 tokenId) external view override returns (bool) {
        return _records[tokenId].isRegistered;
    }

    function getRegisteredPanels() external view override returns (uint256[] memory) {
        return _registeredIds;
    }
}

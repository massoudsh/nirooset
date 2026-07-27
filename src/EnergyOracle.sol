// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IEnergyOracle.sol";

/**
 * @title EnergyOracle
 * @notice Reports production data with multi-oracle consensus and circuit-breaker controls.
 * @dev
 *  Multi-oracle (NEW-8 / issue #21):
 *    Multiple oracle addresses can be registered. A time slot is auto-confirmed when
 *    `requiredConsensus` distinct oracles have each called reportProduction for that slot.
 *    The legacy single confirmer is still supported in parallel.
 *
 *  Rate limiting / circuit breaker (NEW-17 / issue #30):
 *    - `paused` flag (circuit breaker): owner can halt all oracle operations.
 *    - Per-(oracle, panel, slot) rate limit: each oracle may report a given
 *      (panelId, slotId) combination at most once, preventing duplicate writes.
 */
contract EnergyOracle is IEnergyOracle {
    uint256 public constant SLOT_DURATION = 1 hours;

    // -------------------------------------------------------------------------
    // Core production storage
    // -------------------------------------------------------------------------
    mapping(uint256 => mapping(uint256 => ProductionReport)) private _reports;
    mapping(uint256 => uint256) private _slotTotalEnergy;
    mapping(uint256 => bool)    private _slotFinalized;
    mapping(uint256 => bool)    private _slotConfirmed;

    // -------------------------------------------------------------------------
    // Multi-oracle consensus (issue #21)
    // -------------------------------------------------------------------------
    /// @notice Set of registered oracle addresses.
    mapping(address => bool) public oracles;
    /// @notice Total number of currently registered oracles.
    uint256 public oracleCount;
    /// @notice Minimum number of oracle reports required to auto-confirm a slot.
    uint256 public requiredConsensus;
    /// @dev slot => oracle => has reported this slot?
    mapping(uint256 => mapping(address => bool)) private _oracleReportedSlot;
    /// @dev slot => count of distinct oracles that have reported
    mapping(uint256 => uint256) private _slotReportCount;

    // -------------------------------------------------------------------------
    // Rate limiting (issue #30)
    // @dev panelId => slotId => oracle => already reported?
    // -------------------------------------------------------------------------
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private _panelSlotOracleReported;

    // -------------------------------------------------------------------------
    // Circuit breaker (issue #30)
    // -------------------------------------------------------------------------
    bool public paused;

    // -------------------------------------------------------------------------
    // Admin / legacy fields
    // -------------------------------------------------------------------------
    address public owner;
    /// @notice Legacy single-confirmer: still supported alongside consensus path.
    address public confirmer;

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------
    error Unauthorized();
    error ZeroAddress();
    error SlotAlreadyFinalized();
    error SlotNotConfirmed();
    error OracleAlreadyRegistered();
    error OracleNotRegistered();
    error AlreadyReported();
    error OraclePaused();
    error InvalidConsensus();

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------
    event TimeSlotConfirmed(uint256 indexed timeSlot);
    event OracleRegistered(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event RequiredConsensusUpdated(uint256 newValue);
    event PausedChanged(bool isPaused);

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyOracle() {
        if (!oracles[msg.sender] && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyConfirmer() {
        if (msg.sender != confirmer && msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert OraclePaused();
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    constructor() {
        owner = msg.sender;
        // Owner is the first oracle by default.
        oracles[msg.sender] = true;
        oracleCount = 1;
        requiredConsensus = 1; // single oracle is sufficient until more are added
    }

    // =========================================================================
    // Admin functions
    // =========================================================================

    /**
     * @notice Legacy: replace the primary oracle address.
     *         Also registers the new address in the oracle set.
     */
    function updateOracle(address newOracle) external override onlyOwner {
        if (newOracle == address(0)) revert ZeroAddress();
        emit OracleUpdated(msg.sender, newOracle);
        if (!oracles[newOracle]) {
            oracles[newOracle] = true;
            oracleCount++;
            emit OracleRegistered(newOracle);
        }
    }

    /// @notice Register an additional oracle address.
    function registerOracle(address oracle_) external onlyOwner {
        if (oracle_ == address(0)) revert ZeroAddress();
        if (oracles[oracle_]) revert OracleAlreadyRegistered();
        oracles[oracle_] = true;
        oracleCount++;
        emit OracleRegistered(oracle_);
    }

    /// @notice Remove an oracle from the trusted set.
    function removeOracle(address oracle_) external onlyOwner {
        if (!oracles[oracle_]) revert OracleNotRegistered();
        oracles[oracle_] = false;
        oracleCount--;
        emit OracleRemoved(oracle_);
    }

    /**
     * @notice Set the number of oracle reports required to auto-confirm a slot.
     * @param n Must be > 0 and <= oracleCount.
     */
    function setRequiredConsensus(uint256 n) external onlyOwner {
        if (n == 0 || n > oracleCount) revert InvalidConsensus();
        requiredConsensus = n;
        emit RequiredConsensusUpdated(n);
    }

    /// @notice Set (or clear) the legacy single-step confirmer.
    function setConfirmer(address newConfirmer) external onlyOwner {
        confirmer = newConfirmer;
    }

    /**
     * @notice Circuit breaker: halt (true) or resume (false) all oracle writes.
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit PausedChanged(_paused);
    }

    // =========================================================================
    // Oracle operations
    // =========================================================================

    /// @notice Legacy single-confirmer path: manually confirm a time slot.
    function confirmTimeSlot(uint256 timeSlot) external onlyConfirmer {
        _slotConfirmed[timeSlot] = true;
        emit TimeSlotConfirmed(timeSlot);
    }

    /**
     * @notice Report energy production for a panel at a given timestamp.
     * @dev Rate-limited: each oracle may report a (panelId, slot) pair at most once.
     *      Multi-oracle: auto-confirms the slot when requiredConsensus oracles have reported.
     */
    function reportProduction(uint256 panelId, uint256 timestamp, uint256 energyWh)
        external
        override
        onlyOracle
        whenNotPaused
    {
        uint256 slotId = (timestamp / SLOT_DURATION) * SLOT_DURATION;

        // --- Rate limit: one report per (oracle, panel, slot) ---
        if (_panelSlotOracleReported[panelId][slotId][msg.sender]) revert AlreadyReported();
        _panelSlotOracleReported[panelId][slotId][msg.sender] = true;

        _slotTotalEnergy[slotId] += energyWh;
        _reports[panelId][timestamp] = ProductionReport({
            panelId:   panelId,
            timestamp: timestamp,
            energyWh:  energyWh,
            reporter:  msg.sender,
            verified:  true
        });
        emit ProductionReported(panelId, timestamp, energyWh, msg.sender);

        // --- Multi-oracle consensus: count distinct oracle reports per slot ---
        if (!_oracleReportedSlot[slotId][msg.sender]) {
            _oracleReportedSlot[slotId][msg.sender] = true;
            _slotReportCount[slotId]++;

            // Auto-confirm once threshold is reached
            if (!_slotConfirmed[slotId] && _slotReportCount[slotId] >= requiredConsensus) {
                _slotConfirmed[slotId] = true;
                emit TimeSlotConfirmed(slotId);
            }
        }
    }

    /**
     * @notice Finalize a time slot, locking its total energy for settlement.
     * @dev Requires slot to be confirmed (via consensus or legacy confirmer) when
     *      a confirmer is configured; otherwise the oracle can finalize directly.
     */
    function finalizeTimeSlot(uint256 timeSlot) external override onlyOracle whenNotPaused {
        if (_slotFinalized[timeSlot]) revert SlotAlreadyFinalized();
        // If a legacy confirmer is set AND the slot wasn't auto-confirmed, require manual confirmation.
        if (confirmer != address(0) && !_slotConfirmed[timeSlot]) revert SlotNotConfirmed();
        _slotFinalized[timeSlot] = true;
        emit TimeSlotFinalized(timeSlot, _slotTotalEnergy[timeSlot]);
    }

    // =========================================================================
    // View functions
    // =========================================================================

    function getProductionReport(uint256 panelId, uint256 timestamp)
        external view override returns (ProductionReport memory)
    {
        return _reports[panelId][timestamp];
    }

    function getTimeSlotData(uint256 timeSlot) external view override returns (TimeSlotData memory) {
        return TimeSlotData({
            startTime:   timeSlot,
            endTime:     timeSlot + SLOT_DURATION,
            totalEnergy: _slotTotalEnergy[timeSlot],
            finalized:   _slotFinalized[timeSlot]
        });
    }

    function getTotalProductionInSlot(uint256 timeSlot) external view override returns (uint256) {
        return _slotTotalEnergy[timeSlot];
    }

    function isTimeSlotFinalized(uint256 timeSlot) external view override returns (bool) {
        return _slotFinalized[timeSlot];
    }

    function isTimeSlotConfirmed(uint256 timeSlot) external view returns (bool) {
        return _slotConfirmed[timeSlot];
    }

    /// @notice Number of distinct oracles that have reported for this slot.
    function getSlotReportCount(uint256 timeSlot) external view returns (uint256) {
        return _slotReportCount[timeSlot];
    }

    /// @notice Whether a specific oracle has already reported for this slot.
    function hasOracleReportedSlot(uint256 timeSlot, address oracle_) external view returns (bool) {
        return _oracleReportedSlot[timeSlot][oracle_];
    }

    /// @notice Whether a specific oracle has reported a given (panel, slot) pair.
    function hasPanelSlotBeenReported(uint256 panelId, uint256 slotId, address oracle_)
        external view returns (bool)
    {
        return _panelSlotOracleReported[panelId][slotId][oracle_];
    }
}

# EnergyOracle Multi-Oracle Consensus Design

**Issue:** NEW-8 (#21)
**Status:** Implemented in `src/EnergyOracle.sol`

---

## Problem

The original `EnergyOracle` relied on a single trusted address (`oracle`) to report production data. This creates a single point of failure and trust centralisation:

- If the oracle key is compromised, false production data can be submitted.
- There is no mechanism for independent verification before a time slot is finalised.

---

## Design Goals

1. **Decentralisation of trust** — Multiple independent entities can report production data.
2. **Threshold consensus** — A configurable number of oracle confirmations is required before a slot is considered reliable enough to finalise.
3. **Gas efficiency** — Avoid on-chain aggregation of raw values; use a *presence* model (did enough oracles report for this slot?).
4. **Backwards compatibility** — The single-oracle and legacy `confirmer` paths remain functional.

---

## Chosen Approach: N-of-M Oracle Threshold

### Oracle Set

- The owner maintains a set of registered oracle addresses via `registerOracle(addr)` / `removeOracle(addr)`.
- `oracleCount` tracks the current set size.
- `requiredConsensus` (1 ≤ N ≤ M) is the number of distinct oracles that must call `reportProduction` for the same time slot before the slot is **auto-confirmed**.

### Auto-Confirmation

When oracle #N calls `reportProduction` for slot S:

```
_slotReportCount[S] >= requiredConsensus
  → _slotConfirmed[S] = true
  → emit TimeSlotConfirmed(S)
```

This confirmation unlocks `finalizeTimeSlot(S)` (unless a manual confirmer is also set, in which case the manual path is still required).

### Legacy Confirmer

The existing `confirmer` / `confirmTimeSlot` flow is still supported. If `confirmer != address(0)` the slot must be confirmed (either by the confirmer or via consensus) before finalisation. This lets existing deployments upgrade gradually.

---

## Gas Cost Analysis

| Operation | Extra storage writes | Approx extra gas |
|---|---|---|
| `registerOracle` | 1 mapping write + uint256 incr | ~22,000 |
| `reportProduction` (first oracle in slot) | 2 mapping writes | ~45,000 |
| `reportProduction` (Nth oracle, triggers auto-confirm) | 2 mapping writes + 1 bool | ~50,000 |
| `finalizeTimeSlot` | No change | — |

The overhead per `reportProduction` call is approximately **+23,000 gas** compared to the single-oracle version (two extra mapping writes: `_oracleReportedSlot` and `_panelSlotOracleReported`).

---

## Configuration Recommendations

| Scenario | `oracleCount` | `requiredConsensus` |
|---|---|---|
| Development / testnet | 1 | 1 |
| Production (high trust) | 3 | 2 |
| Production (max security) | 5 | 3 |

---

## Rate Limiting (Issue #30)

Each oracle is allowed to report a given `(panelId, slotId)` pair **at most once**. This prevents:

- Accidental duplicate submissions (e.g. retries after a network hiccup).
- Malicious inflation of `_slotTotalEnergy` by a single oracle submitting multiple values.

The check uses: `_panelSlotOracleReported[panelId][slotId][msg.sender]`.

Note that different oracles *can* report for the same `(panelId, slotId)`, which is intentional — their energy values are summed. In a real deployment, oracle off-chain software should validate that each oracle reads from a separate metering device or data source to avoid double-counting.

---

## Circuit Breaker (Issue #30)

`setPaused(true)` halts all `reportProduction` and `finalizeTimeSlot` calls. The owner can use this to:

- Pause oracle operations during a security incident.
- Coordinate a protocol upgrade that requires a clean state.

---

## Testing

See `test/EnergyOracleConsensus.t.sol` for full coverage of:

- Single oracle default (1-of-1)
- Two-of-two auto-confirmation
- Two-of-three threshold
- Rate limiting (duplicate report reverts)
- Circuit breaker (pause / resume)
- Legacy confirmer path compatibility

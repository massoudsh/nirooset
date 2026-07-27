# Market Intelligence — Design

**Feature:** Energy Exchange & Settlement Infrastructure — AI/analytics layer
**Status:** v1 (heuristic) implemented in `sdk/src/index.ts` + `ui/src/components/views/MarketIntelligence.jsx`

---

## Motivation

GRIDSET Protocol already provides the settlement "wedge" described in the
product brief: multi-oracle production reporting (`EnergyOracle`), NFT-backed
panel ownership (`PanelRegistry` / `PanelNFT`), and a batch-auction order book
with token escrow (`EnergyMarket`). This is the auditable transaction and
settlement layer for a decentralised renewable-energy market.

The next stage of value — explicitly called out as the product's growth
path — is turning that transaction history into **decision support**:
predicting supply/demand, catching bad data early, and helping counterparties
converge on fair prices. This document covers the first slice of that layer.

## Problem

As the number of independent producers grows, participants have no
standardized way to answer:

1. How much supply/demand should we expect in the next time slot?
2. Is a given production report plausible, or does it look like a faulty
   meter / bad actor?
3. What's a reasonable price to bid/ask right now, given recent history?

Today this requires manually reading the order book and oracle data.

## Design goals

1. **No contract changes.** Everything is computed off-chain from existing
   `EnergyOracle` / `EnergyMarket` view functions — zero gas cost, zero
   deployment risk.
2. **Explainable v1.** Use transparent statistical heuristics (moving
   averages, z-scores, recency-weighted means) rather than an opaque model,
   so every number has a plain-language justification (`basis` / `message`
   fields).
3. **Swappable internals.** The public API (`forecastSupplyDemand`,
   `suggestFairPrice`, `detectProductionAnomalies`) is stable; the
   implementation of `computeForecast` / `computeAnomalies` can be replaced
   with a trained model later without breaking callers.
4. **Precision-safe.** Price/quantity math (wei/Wh scale) stays in `bigint`
   arithmetic end-to-end; only anomaly z-scores (which operate on
   moderate-magnitude Wh readings, not wei) use floating point.

## v1: heuristic implementation

Implemented as pure, unit-tested functions in `sdk/src/index.ts`
(`sdk/src/marketIntelligence.test.ts`):

| Function | Approach |
|---|---|
| `computeForecast(history)` | Split series into first-half / second-half averages, extrapolate the trend one step forward. Confidence = fraction of consecutive steps that moved in the trend's direction. |
| `computeAnomalies(values, zThreshold=2)` | Standard z-score outlier detection; flags points where `\|z\| > zThreshold`. Needs ≥3 points. |
| `computeWeightedPrice(prices)` | Linearly recency-weighted average (`weight = index + 1`), pure `bigint` math — no float rounding on price values. |

SDK-level wrappers fetch the last `lookback` hourly slots (default 24) via
`EnergyOracle.getTotalProductionInSlot` / `EnergyMarket.getAuction` and feed
them into the helpers:

- `forecastSupplyDemand(currentSlot, lookback?)` → next-slot predicted
  supply (from production history) and demand (from `totalBidQuantity`
  history), plus a combined confidence score.
- `suggestFairPrice(currentSlot, lookback?)` → recency-weighted average of
  recent **cleared** auction clearing prices.
- `detectProductionAnomalies(panelId, timestamps, zThreshold?)` → per-panel
  outlier reports via `EnergyOracle.getProductionReport`, classified into
  `low` / `medium` / `high` severity by z-score magnitude.

## v2 roadmap (not built yet)

- Replace `computeForecast` with a trained time-series model (e.g.
  weather-aware solar output prediction) behind the same interface.
- Cross-panel/cross-region anomaly correlation (distinguish a single faulty
  meter from a real grid-wide event).
- Buyer/seller matching suggestions and risk-adjusted price bands, feeding
  back into `EnergyMarket` order placement as optional UI hints (never
  auto-submitted — the trader always confirms).

## UI

`ui/src/components/views/MarketIntelligence.jsx` renders:

- A forecast card (predicted supply/demand for the next slot + confidence).
- A suggested fair-price banner with its `basis` explanation.
- An anomaly alert list with severity badges.

It follows the same pattern as `EnergyMarket.jsx`: live contract calls when
`contracts.energyOracle` / `contracts.energyMarket` are available, falling
back to representative mock data in demo mode.

## Testing

See `sdk/src/marketIntelligence.test.ts` (`npm run test` inside `sdk/`,
**run on the deployment server, not in this container** — see
`.noqte/context/build.md`) for coverage of:

- Empty / single-point series edge cases.
- Upward and downward trend extrapolation (never predicts negative supply).
- Outlier detection on a clean series with one injected spike.
- Custom z-score thresholds.
- Recency-sensitivity of the weighted price (a recent spike weighs more than
  an old one).

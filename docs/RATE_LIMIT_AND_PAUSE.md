# Rate Limiting and Pause (Market / Oracle)

Design and operational notes for pausing or rate-limiting the Energy Market and Energy Oracle.

## Pause (EnergyMarket)

The EnergyMarket contract supports an owner-controlled **pause** flag:

- **setPaused(bool)** – only owner. When `paused` is true:
  - **placeBid** and **placeAsk** revert with `MarketPaused`.
  - **startAuction** reverts with `MarketPaused`.
- **clearAuction**, **cancelOrder**, and read-only functions are unchanged (so existing orders can be cleared or cancelled; no new orders or auctions).

**When to pause:** Suspected bug, emergency (e.g. oracle compromise), or planned maintenance. Document in runbook who can pause and how to unpause.

**Runbook (example):**
1. Owner calls `setPaused(true)`.
2. Investigate; fix or deploy fix if needed.
3. Owner calls `setPaused(false)` to resume.

## Rate limiting (design only)

No rate limit is enforced on-chain in the current implementation. Optional future options:

- **Per-user, per-slot order cap:** e.g. max N orders per (user, timeSlot) in EnergyMarket. Would require storage and checks in placeBid/placeAsk.
- **Oracle report throttling:** max reports per (panelId, timestamp) or per slot in EnergyOracle. Could mitigate spam; adds complexity.

Gas and UX trade-offs should be evaluated before adding rate limits.

## EnergyOracle

The Energy Oracle does not have a pause flag. To stop new reports or finalization:

- **updateOracle(address(0))** is not recommended (could break integrations).
- Prefer: use a dedicated “pause” oracle address that reverts or no-ops, or add an optional **paused** flag and **setPaused** to the oracle contract in a future change.

For now, operational control is via the oracle key (revoke or rotate) and the confirmer (two-step finalization when confirmer is set).

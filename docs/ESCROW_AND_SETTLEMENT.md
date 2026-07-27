# EnergyMarket Escrow and SettlementEngine

## Overview

With **NEW-2 (EnergyMarket token escrow)**:

- **EnergyMarket** locks tokens on `placeBid` (buyer: price × quantity) and `placeAsk` (seller: quantity). On `clearAuction` it settles matched fills by moving locked amounts: `transferLocked(buyer, seller, fill × price)` and `transferLocked(seller, buyer, fill)`. On `cancelOrder` it unlocks the remaining locked amount.

- **SettlementEngine** runs after a slot is cleared and finalized. It computes net positions from the same order book (energy consumed vs produced) and then:
  - Collects from net buyers: `transferFrom(participant, engine, owed)`
  - Pays net sellers: `transfer(participant, paymentAmount)`

So for a cleared slot, **two layers** move tokens:

1. **Market clear** – actual matched fill transfers (buyer→seller payment, seller→buyer energy).
2. **Engine settlement** – net settlement at clearing price (collect from net consumers, pay net producers).

## Current behavior and tests

- Unit tests (EnergyMarket.t.sol, SettlementEngine.t.sol) are aligned with this: after clear + settle, expected balances (e.g. alice 92_040, bob 107_960 in the settlement test) reflect both the market’s `transferLocked` and the engine’s collect/pay.
- No double-spend: the engine uses `transferFrom` for amounts participants still have (after the market has already moved only the matched locked amounts).

## Possible future change

To avoid overlapping semantics (market already moved tokens on clear; engine does a second pass), a follow-up could:

- Make the engine **skip** or **reduce** token transfers for slots where the market already settled (e.g. only run engine for non-market settlements or for penalties), or
- Document that “market clear = instant settlement for matched volume” and “engine = net settlement / reconciliation layer” and keep both as designed.

Until then, both run; test expectations are set accordingly.

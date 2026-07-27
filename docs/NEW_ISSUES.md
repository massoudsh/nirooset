# New Issues for Development

This document lists **new, concrete issues** to add to the GitHub project. Copy or create GitHub issues from these. Labels and priorities are suggestions.

---

## Features

### [NEW-1] Utilities: Cart, checkout, and GRID credit linking
**Priority:** Medium  
**Labels:** `enhancement`, `ui`, `phase-7`

- Add cart state (context or local storage) for Utilities products.
- Implement “Checkout” flow (mock or real payment; document as placeholder if mock).
- When wallet connected, allow “Link to GRIDSET” to associate a product purchase with wallet for future energy-credit eligibility (store mapping or event).
- Consider product SKU → PanelNFT or EnergyToken reward rules (design only or stub).

**Acceptance:** Cart persists across nav; checkout shows order summary; linked products appear in a “My utilities” section when connected.

---

### [NEW-2] EnergyMarket: Token escrow on place order
**Priority:** High  
**Labels:** `smart-contract`, `phase-3`

- Currently orders are intent-only (no token lock). Add integration with EnergyToken: on `placeAsk`, lock seller’s tokens for the order quantity; on `placeBid`, lock buyer’s tokens (or separate collateral).
- On `clearAuction`, transfer tokens between matched parties or release locks.
- Define and document escrow/lock rules (e.g. lock until clear or cancel).

**Acceptance:** Placing an ask/bid locks the required EnergyToken amount; clearing or cancel releases or transfers correctly; tests cover lock/unlock paths.

---

### [NEW-3] SettlementEngine implementation (Phase 4)
**Priority:** High  
**Labels:** `smart-contract`, `phase-4`

- Implement net position calculation per participant from EnergyOracle production and EnergyMarket cleared orders.
- Integrate EnergyToken for payments (transfer from buyer to seller, or via vault).
- Implement `assessPenalty` (e.g. call StakingVault or burn) and `raiseDispute` (state + event).
- Add `finalizeTimeSlot` and guard settlement so a slot can only be settled after oracle finalization and market clear.

**Acceptance:** All interface functions implemented; unit tests for net position and payment; integration test with EnergyToken + EnergyMarket + EnergyOracle.

---

### [NEW-4] GovernanceDAO implementation (Phase 5)
**Priority:** Medium  
**Labels:** `smart-contract`, `phase-5`

- Implement proposal creation with voting period and snapshot of voting power (e.g. from EnergyToken balance or StakingVault stake).
- Implement `castVote`, `hasVoted`, `getVote`, and simple majority execution (e.g. call a target contract or emit execution params).
- Add `cancelProposal` (e.g. only proposer or timelock).
- Document how “execution” works (parameter change vs. contract call).

**Acceptance:** Proposals can be created, voted on, and marked executable; execution step is defined and tested.

---

### [NEW-5] UI: Contract addresses and ABIs in env
**Priority:** Medium  
**Labels:** `ui`, `phase-7`

- Add `VITE_*` env vars for EnergyToken, EnergyMarket, PanelRegistry, StakingVault, etc.
- Load ABIs from build output (e.g. `out/EnergyToken.sol/EnergyToken.json`) or a dedicated `ui/abis/` folder.
- Expose contract instances in Web3Context (or a ContractsContext) so views can call read/write without hardcoding.

**Acceptance:** All contract addresses and ABIs come from env + build; one place (e.g. context) provides contract instances.

---

### [NEW-6] UI: Real-time order book and clearing price
**Priority:** Medium  
**Labels:** `ui`, `phase-7`

- Energy Market view: fetch `getOrderBook(timeSlot)` and `getAuction(timeSlot)` from EnergyMarket contract.
- Display bids/asks in a table or order-book style; show clearing price and cleared quantity after auction clear.
- Support selecting time slot (e.g. next slot id or timestamp-based slot).

**Acceptance:** Order book and auction state reflect on-chain data; clearing price visible after clear.

---

### [NEW-7] PanelRegistry: Link to PanelNFT ownership
**Priority:** Medium  
**Labels:** `smart-contract`, `phase-1`

- Restrict `registerPanel` so that `owner` must be the current `ownerOf(tokenId)` on a PanelNFT contract (inject IPanelNFT and token address).
- Optionally restrict `reportProduction` or panel updates to registry to the panel owner or an authorized reporter only.

**Acceptance:** Only the current PanelNFT owner (or authorized registrar) can register a panel; tests verify reverts when not owner.

---

### [NEW-8] EnergyOracle: Multi-oracle / consensus
**Priority:** Medium  
**Labels:** `smart-contract`, `phase-2`

- Allow multiple oracle addresses; require N-of-M to report the same (panelId, timestamp, energyWh) before accepting.
- Or: keep single oracle but add “confirm” step by a second role before `finalizeTimeSlot` (e.g. auditor).
- Document trust model and gas impact.

**Acceptance:** Design doc and (if implemented) tests for multi-oracle or confirm flow.

---

## Infrastructure & DX

### [NEW-9] Deployment scripts (Foundry + env)
**Priority:** High  
**Labels:** `devops`, `phase-8`

- Add `script/Deploy.s.sol` (or similar) to deploy EnergyToken, PanelNFT, PanelRegistry, StakingVault, EnergyOracle, EnergyMarket in dependency order.
- Use env or CLI for RPC and deployer key; output deployed addresses to a JSON file or stdout for UI env.
- Document local (Anvil) and testnet (e.g. Sepolia) deployment steps.

**Acceptance:** One command (e.g. `forge script script/Deploy.s.sol`) deploys full stack; addresses are written for UI consumption.

---

### [NEW-10] SDK or client library (JS/TS)
**Priority:** Low  
**Labels:** `sdk`, `phase-8`

- Provide a small JS/TS package that wraps contract calls (ethers/viem): deploy addresses + ABIs, methods for mint, placeBid, placeAsk, clearAuction, getOrderBook, etc.
- Optional: event subscriptions for OrderPlaced, AuctionCleared, SettlementExecuted.

**Acceptance:** Package can be imported in a Node or browser app and used to interact with a deployed GRIDSET suite.

---

### [NEW-11] E2E tests (Playwright or Cypress)
**Priority:** Medium  
**Labels:** `testing`, `phase-6`

- Add E2E tests for: connect wallet, navigate to Market, place (mock) bid/ask, navigate to Utilities, add to cart.
- Run against local chain (Anvil) + local UI with deployed contracts, or against a static build with mocked contracts.

**Acceptance:** At least 3 critical user flows covered; CI runs E2E on PR.

---

### [NEW-12] Gas optimization pass
**Priority:** Low  
**Labels:** `optimization`, `issue-11`

- Profile EnergyMarket.clearAuction (sorting + loop), PanelRegistry.getProductionInTimeSlot (loop), and StakingVault deposit/withdraw.
- Apply optimizations (batch storage, reduce loops, use calldata where possible) and document trade-offs.

**Acceptance:** Gas report before/after; no behavior change; notes in code or docs.

---

## Product & UX

### [NEW-13] Utilities: Product detail page and filters
**Priority:** Low  
**Labels:** `ui`, `enhancement`

- Add a detail view/modal for each product (full specs, gallery, “Add to cart”).
- Add filters: price range, capacity range, brand, category (power bank vs station vs cell).
- Optional: sort by price, rating, newest.

**Acceptance:** Clicking a product opens detail; filters and sort update the product list.

---

### [NEW-14] Dashboard: Real metrics from contracts
**Priority:** Medium  
**Labels:** `ui`, `phase-7`

- Replace mock dashboard data with reads from contracts: total supply (EnergyToken), total staked (StakingVault), registered panels count (PanelRegistry), last clearing price (EnergyMarket).
- Add loading and error states; consider caching or polling interval.

**Acceptance:** Dashboard numbers reflect on-chain state when wallet connected and contracts configured.

---

### [NEW-15] Notifications or activity feed
**Priority:** Low  
**Labels:** `ui`, `enhancement`

- Show recent activity: “Auction cleared for slot X”, “Proposal #Y created”, “Your order filled”.
- Source: contract events (via indexer or provider.getLogs) or backend that indexes events.
- Design as a sidebar widget or a dedicated “Activity” view.

**Acceptance:** At least one event type (e.g. auction cleared) appears in the UI from chain/indexer.

---

## Security & Compliance

### [NEW-16] Slither / Aderyn (or similar) static analysis
**Priority:** Medium  
**Labels:** `security`, `phase-6`

- Add Slither (or Aderyn) to CI; fix or document all high/medium findings.
- Optionally add a security checklist (e.g. access control, reentrancy, integer overflow) in CONTRIBUTING or docs.

**Acceptance:** CI runs static analysis; no unacknowledged high/medium in main branch.

---

### [NEW-17] Rate limiting or circuit breaker on market/oracle
**Priority:** Low  
**Labels:** `smart-contract`, `security`

- Consider rate limits (e.g. max orders per user per slot) or pause by owner in EnergyMarket to mitigate abuse or bugs.
- Document operational runbook (when to pause, who can unpause).

**Acceptance:** Design doc or implemented pause/rate limit with tests and docs.

---

## Summary

| Id      | Title (short)                          | Priority |
|---------|----------------------------------------|----------|
| NEW-1   | Utilities cart, checkout, GRID linking  | Medium   |
| NEW-2   | EnergyMarket token escrow              | High     |
| NEW-3   | SettlementEngine implementation        | High     |
| NEW-4   | GovernanceDAO implementation           | Medium   |
| NEW-5   | UI: Contract addresses and ABIs in env | Medium   |
| NEW-6   | UI: Real-time order book               | Medium   |
| NEW-7   | PanelRegistry link to PanelNFT         | Medium   |
| NEW-8   | EnergyOracle multi-oracle              | Medium   |
| NEW-9   | Deployment scripts                     | High     |
| NEW-10  | SDK / client library                   | Low      |
| NEW-11  | E2E tests                              | Medium   |
| NEW-12  | Gas optimization pass                  | Low      |
| NEW-13  | Utilities detail page and filters      | Low      |
| NEW-14  | Dashboard real metrics                 | Medium   |
| NEW-15  | Notifications / activity feed          | Low      |
| NEW-16  | Static analysis (Slither/Aderyn)       | Medium   |
| NEW-17  | Rate limit / circuit breaker           | Low      |

Use this list to create GitHub issues (e.g. title “NEW-1: Utilities cart, checkout, GRID linking” and paste the body from above).

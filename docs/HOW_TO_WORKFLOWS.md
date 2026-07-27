# GRIDSET App – How-To & User Workflows

This guide describes how different users can use the GRIDSET app: **panel owners**, **market participants (small capital)**, and **long-term infrastructure investors** (batteries, panels, infra).

---

## Personas Overview

| Persona | Goal | Main app areas |
|--------|------|-----------------|
| **Panel owner** | Monetize production, register panels, get settlements | Panel Registry, Energy Wallet, Settlement, Energy Market (sell) |
| **Market participant (small)** | Trade energy credits with limited capital | Energy Market, Energy Wallet, Dashboard |
| **Long-term infra investor** | Buy hardware, stake, govern | Utilities (products), Staking, Governance, Panel Registry |

---

## 1. Panel owners (I have panels)

**Goal:** Register my production assets, receive energy credits for production, sell or use them, and get settled.

### Workflow

1. **Connect wallet** (header). Use a wallet with testnet ETH on Sepolia (or mainnet when live).
2. **Register panels** (Panel Registry)
   - Click “Register New Panel”.
   - Enter capacity (kW), location, installation date, metadata URI.
   - Confirm via Email / Text / Google; submit. Panel is linked to your wallet.
3. **View production & balance**
   - **Energy Wallet:** See total, available, and locked GRID (energy credits). Production and settlements update these.
   - **Settlement:** View settlement history and net positions per time slot.
4. **Sell energy credits** (Energy Market)
   - Go to Energy Market, choose time slot, place an **Ask** (sell) with price and quantity.
   - Confirm with Email / Text / Google. When the auction clears, you receive payment (or tokens) per protocol rules.
5. **Optional: Stake** (Staking Vault) to back larger positions or earn governance power.

### Big picture

- Panel owners are the **supply side**: they register assets, get credited for production, and can sell GRID in the market or hold for settlement.

---

## 2. Market participants (small money, trading)

**Goal:** Buy and sell energy credits in the market with limited capital; no panels.

### Workflow

1. **Connect wallet.** Get testnet ETH from the faucet (Sepolia) so you can pay gas.
2. **Get GRID** (demo or testnet)
   - In **demo mode** you start with a simulated balance to try the app.
   - On testnet/mainnet: receive GRID from a faucet, airdrop, or buy in the market (place a bid and get filled).
3. **Trade on Energy Market**
   - **Dashboard** or **Energy Market:** Pick a time slot, see order book (bids/asks).
   - Place a **Bid** (buy) or **Ask** (sell) with price and quantity. Confirm with Email / Text / Google.
   - After the auction clears, your balance and positions update.
4. **Energy Wallet**
   - Check balance (total, available, locked). Transfer GRID to another address if needed (with confirmation flow).
5. **Settlement**
   - If you have a net position in a time slot, view settlement and payments in Settlement.

### Big picture

- Market participants provide **liquidity** and **price discovery**; they trade GRID without owning physical panels.

---

## 3. Long-term investors (batteries, panels, infra)

**Goal:** Buy hardware (batteries, panels, power stations), stake GRID, and participate in governance.

### Workflow

1. **Connect wallet.**
2. **Browse and buy hardware** (Utilities)
   - Browse power banks, power stations, solar cells. Use filters (e.g. capacity, brand).
   - Add products to **cart**, go to **checkout**, complete order (mock or real per deployment).
   - Optionally **“Link to GRIDSET”** so the purchase can be tied to your wallet for future energy-credit eligibility.
3. **Stake GRID** (Staking Vault)
   - Deposit GRID to increase protocol security and (if applicable) governance weight.
   - Withdraw when unlocked. Understand lock period and penalties (see Staking info in the app).
4. **Governance** (Governance DAO)
   - View **active proposals** (e.g. parameter changes, oracle rules).
   - **Create a proposal** (title, description, voting period); confirm with Email / Text / Google.
   - **Vote** For or Against on proposals; confirm with the same flow.
5. **Panel Registry** (if you deploy new panels)
   - Same as “Panel owners”: register panels linked to your wallet for production and settlements.

### Big picture

- Long-term investors **consume Utilities**, **stake**, and **govern**; they may also become panel owners over time.

---

## App entry points (all users)

- **Demo mode:** Open the app without connecting; you can try balances, orders, transfers, and confirmations. Connect wallet when you want to use testnet/mainnet.
- **Connect wallet:** Single CTA in the header. Supports **multiple chains** (Sepolia, OP Sepolia, Ethereum mainnet when deployed). Use the **chain selector** next to your address to switch network.
- **Confirmations:** Sensitive actions (transfer, place order, stake, register panel, create proposal, vote) use Email / Text (SMS) or Google verification before executing.

---

## Where workflows are implemented

| Feature | Status / doc |
|--------|----------------|
| Panel registration + confirmation | Implemented (Panel Registry + ConfirmActionModal) |
| Energy Market bid/ask + confirmation | Implemented (Energy Market + ConfirmActionModal) |
| Energy Wallet transfer + confirmation | Implemented (TransferConfirmModal) |
| Staking deposit/withdraw + confirmation | Implemented (StakingVault + ConfirmActionModal) |
| Governance create proposal / vote + confirmation | Implemented (Governance + ConfirmActionModal) |
| Utilities cart, checkout, GRID linking | Implemented (cart in header, checkout with “Link to GRIDSET”, My linked purchases) |
| Real-time order book from chain | See NEW-6 (issue #19) |
| Activity feed / notifications | See NEW-15 (issue #28) |

---

## Completed issues & big picture

- **#12 Multi-chain support:** Header chain selector; switch between Sepolia, OP Sepolia, Ethereum. Unsupported chain is highlighted. See [MULTICHAIN.md](MULTICHAIN.md). *Big picture:* Same app for testnets and mainnet; one-click network switch for all personas.

- **#14 NEW-1 Utilities cart, checkout, GRID linking:** Cart persists in localStorage and across nav; header cart icon with count; cart drawer with list, quantity, remove; checkout flow with order summary and Email/Text/Google verification; “Link to GRIDSET” checkbox when wallet connected (associates purchase with wallet); “My linked purchases” section in Utilities when connected. *Big picture:* Long-term infra investors can browse, add to cart, checkout (placeholder payment), and link orders to their wallet for future energy-credit eligibility; cart is always available.

- **#15 NEW-2 EnergyMarket token escrow:** On placeBid the buyer’s EnergyToken is locked (price × quantity); on placeAsk the seller’s quantity is locked. On clearAuction, matched fills are settled via transferLocked (buyer→seller payment, seller→buyer quantity). On cancelOrder, remaining locked amount is unlocked. EnergyToken has transferLocked(from, to, amount); deploy sets EnergyMarket as locker. *Big picture:* Orders are collateralized; no intent-only exposure.

- **#19 NEW-6 Real-time order book:** Energy Market view fetches getOrderBook(timeSlot) and getAuction(timeSlot) from the EnergyMarket contract. Bids/asks are shown in order-book style; when the slot is cleared, clearing price and cleared quantity are displayed. Time slot selector and refresh load on-chain data; mock data is used when no contract or empty book. *Big picture:* Order book and auction state reflect chain; clearing price visible after clear.

- **#26 NEW-13 Utilities detail and filters:** Product detail modal (full specs, gallery, Add to cart) opens on card click or “View details”. Filters: category, brand, price range, capacity range. Sort: price low/high, rating, newest. *Big picture:* Clicking a product opens detail; filters and sort update the list.

- **#28 NEW-15 Activity feed:** Dedicated “Activity” view (sidebar) shows recent items: “Auction cleared for slot X”, “Proposal #Y created”, “Order filled”. When wallet is connected and EnergyMarket is set, the feed fetches AuctionCleared and OrderPlaced from the contract (last 50k blocks); mock feed when no provider or no events. *Big picture:* At least one event type from chain (auction cleared, order placed) when contracts are deployed.

- **NEW-5 UI: Contract addresses and ABIs:** All addresses from VITE_* env; minimal ABIs for EnergyToken, EnergyMarket, StakingVault, PanelRegistry, SettlementEngine, GovernanceDAO, EnergyOracle. Web3Context exposes contracts.panelRegistry, settlementEngine, governanceDAO, energyOracle. *Big picture:* One place provides all contract instances.

- **NEW-14 Dashboard real metrics:** Overview loads Total Supply, Total Staked, Registered Panels count, Last Clearing Price (slot 1000 when cleared). Loading state and Live when from chain. *Big picture:* Dashboard reflects on-chain state when configured.

- **NEW-7 PanelRegistry link to PanelNFT:** When PanelRegistry has a PanelNFT address set (via setPanelNFT), registerPanel requires the given owner to be the current ownerOf(tokenId) on that PanelNFT. Deploy script sets panelRegistry.setPanelNFT(panelNFT). *Big picture:* Only the current PanelNFT owner can be registered as the panel owner; tests verify revert when not owner.

- **NEW-8 EnergyOracle confirm step:** Optional confirmer role: when set, finalizeTimeSlot requires confirmTimeSlot(timeSlot) to be called first (by confirmer or owner). Single-oracle when confirmer is not set; two-step (report → confirm → finalize) when confirmer is set. See [ORACLE_TRUST_MODEL.md](ORACLE_TRUST_MODEL.md). *Big picture:* Second role can be used to audit or sign off before slot finalization.

- **NEW-10 SDK:** Minimal `sdk/` package (gridset-sdk): getContracts(provider, addresses) returns energyToken, energyMarket, stakingVault Contract instances; minimal ABIs for read/write and events. See `sdk/README.md`.

- **NEW-11 E2E:** Playwright tests in `ui/e2e/`: dashboard load and sidebar nav, Energy Market (order book, place order), Utilities and cart (add to cart, open cart drawer). CI runs them with `npm run preview`; run locally with `npm run dev` then `npm run test:e2e` in ui.

- **NEW-16 Static analysis:** Slither runs in CI; see [STATIC_ANALYSIS.md](STATIC_ANALYSIS.md) for local run and policy (fix or document high/medium).

- **NEW-17 Pause and rate-limit design:** EnergyMarket has owner-only setPaused(bool); when paused, placeBid, placeAsk, startAuction revert. Design doc [RATE_LIMIT_AND_PAUSE.md](RATE_LIMIT_AND_PAUSE.md) (runbook, optional rate limits).

This doc will be updated as more issues are completed and new flows are added.

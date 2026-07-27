# Next Phases

Summary of where the project is and recommended next steps. See [ROADMAP.md](../ROADMAP.md) and [NEW_ISSUES.md](NEW_ISSUES.md) for full context.

---

## Current state (done)

- **Phases 1–8:** Core contracts, Oracle, Market (with escrow), Settlement, Governance, testing, UI integration, docs, deployment script — all completed.
- **Enhancements done:** Gas optimization (#11), multi-chain support (#12), dashboard metrics (#13).
- **NEW issues done:** NEW-1, NEW-2, NEW-5, NEW-6, NEW-7, NEW-8, NEW-9, NEW-10 (SDK), NEW-11 (E2E), NEW-12, NEW-13, NEW-14, NEW-15, NEW-16 (Slither doc), NEW-17 (pause + doc).
- **140 Forge tests** passing; demo mode, confirmation flows, and testnet-ready UI in place.

---

## Immediate next phases

### Phase 9: Testnet deployment & community testing (in progress)

**Goal:** Run a real testnet (e.g. Sepolia), verify contracts, and collect feedback.

- **Deploy:** Use [DEPLOYMENT.md](DEPLOYMENT.md) and `script/deploy-sepolia.sh` (or `Deploy.s.sol`). Ensure deployer has testnet ETH (faucet).
- **UI:** Set `ui/.env` with `VITE_*` contract addresses; run UI and test connect, market, wallet, staking, governance.
- **Verify:** Contract verification on block explorer (Sepolia).
- **Test:** End-to-end flows (register panel, place bid/ask, clear auction, settle, stake, create proposal, vote). Fix bugs and iterate.
- **Docs:** Keep [TESTNET.md](TESTNET.md) and release notes updated; optional “Testnet live” announcement.

**Output:** Stable testnet deployment and a short testnet report (what was tested, known limitations).

---

### Phase 10: Mainnet preparation & launch

**Goal:** Complete pre-mainnet checklist, then deploy and launch mainnet.

- **Pre-mainnet:** Follow [MAINNET_CHECKLIST.md](MAINNET_CHECKLIST.md):
  - Security: audit (and/or bounty) when ready; update SECURITY.md and ROADMAP Phase 6.
  - Testnet: Phase 9 done; critical bugs fixed.
  - Code: 131+ tests passing; deployment script and roles (owner, minter, locker, penalizer) defined; multisig/timelock if desired.
  - Docs: README/ROADMAP and public mainnet chain/explorer/addresses.
- **Deploy:** Mainnet RPC and secure key management; run deploy script; verify contracts; set and verify roles.
- **UI:** Production build with mainnet addresses and chain ID; no testnet keys or debug flags.
- **Post-deploy:** Monitoring (RPC, events, errors); launch announcement; support channel and incident process.

**Output:** Mainnet live with monitoring and clear ownership/ops plan.

---

## Backlog (after testnet / mainnet)

Prioritized by impact; can be scheduled in parallel with Phase 9/10 where it makes sense.

Backlog cleared for NEW-10, NEW-11, NEW-16, NEW-17. Remaining optional: further E2E coverage, Aderyn, stricter Slither policy.

---

## Suggested order

1. **Now:** Finish Phase 9 — get testnet deployed (faucet if needed), verify, run full user flows, document.
2. **Next:** Phase 10 — complete mainnet checklist (audit when ready, testnet sign-off, roles, docs), then mainnet deploy and monitoring.
3. **In parallel or after:** Optional: more E2E coverage, Aderyn, or stricter Slither policy.

For detailed issue text and acceptance criteria, see [NEW_ISSUES.md](NEW_ISSUES.md).

# Release Readiness

Short checklist to get to **testnet release** and then **mainnet** as fast as possible.

---

## Testnet release (goal: “we’re live on testnet”)

Do these in order. When all are done, you have a testnet release.

| Step | Task | Status / Notes |
|------|------|----------------|
| 1 | Get testnet ETH (e.g. [Sepolia faucet](https://sepoliafaucet.com/)) for deployer | Manual |
| 2 | Deploy: `forge script script/Deploy.s.sol --rpc-url <SEPOLIA_RPC> --broadcast` | [DEPLOYMENT.md](DEPLOYMENT.md) |
| 3 | (Optional) Verify contracts: add `--verify --etherscan-api-key $ETHERSCAN_API_KEY` | Speeds up explorer UX |
| 4 | Copy logged addresses into `ui/.env` (see `ui/.env.example`) | UI will use them on next start |
| 5 | Build & host UI (e.g. Vercel/Netlify) or run `npm run dev` and share URL | Set env in hosting dashboard if needed |
| 6 | Pin testnet announcement: chain (Sepolia), chain ID (11155111), app URL, “Get test ETH” link | Issue or README section |

**Rough time:** 1–2 hours (once you have RPC + key + faucet).

**Optional but useful:** Document how testers get test GRID (e.g. “Deployer can mint; DM us your address” or a simple faucet contract later).

---

## Mainnet release (goal: “we’re live on mainnet”)

Do **not** go to mainnet until testnet has been used and the checklist below is satisfied.

| Step | Task | Status / Notes |
|------|------|----------------|
| 1 | Testnet release done and running for at least 2–4 weeks | Use it; fix bugs |
| 2 | External security review completed; critical/high findings fixed or accepted | [SECURITY.md](../SECURITY.md), [MAINNET_CHECKLIST.md](MAINNET_CHECKLIST.md) |
| 3 | Mainnet deploy (same script, mainnet RPC + key) | [DEPLOYMENT.md](DEPLOYMENT.md) |
| 4 | Verify contracts on block explorer | |
| 5 | Set production UI env (mainnet addresses, correct chain ID) and deploy UI | |
| 6 | Monitoring and runbook (RPC, events, who to contact) | [MAINNET_CHECKLIST.md](MAINNET_CHECKLIST.md) |
| 7 | Public announcement: network, app URL, “use at your own risk,” support channel | |

**Rough time:** Dominated by audit and testnet period; deploy + verification + docs is ~1–2 days.

---

## Path to release sooner

- **This week:** Do the testnet release steps above. One deploy, one env paste, one place (README or issue) that says “Testnet live on Sepolia at [URL]. Get Sepolia ETH: [link].”
- **Next 2–4 weeks:** Use testnet; fix bugs; start audit (scope: settlement, market, access control, token economics).
- **After audit + testnet sign-off:** Run mainnet deploy and launch per [MAINNET_CHECKLIST.md](MAINNET_CHECKLIST.md).

Defer post-launch items (cart, escrow, notifications, etc.) until after mainnet so they don’t block release.

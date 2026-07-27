# Testnet Deployment & Community Testing

This document covers deploying GRIDSET to a public testnet (e.g. Sepolia) and running a community beta.

## Prerequisites

- Deployer wallet with testnet ETH (e.g. [Sepolia faucet](https://sepoliafaucet.com/))
- `PRIVATE_KEY` and RPC URL for the testnet

## Deploy to testnet

1. **Get RPC and key**
   - Sepolia: `https://sepolia.infura.io/v3/YOUR_KEY` or Alchemy/QuickNode
   - Set `PRIVATE_KEY` (testnet-only key, no mainnet funds)

2. **Deploy**
   ```bash
   forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
   ```
   Optional: verify on Etherscan
   ```bash
   forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
   ```

3. **Publish addresses**
   - Put deployed addresses in `ui/.env` (or a public `deployments/sepolia.json`) so the UI points to testnet.
   - Document in README or a pinned issue: “Testnet live at …” with network name, chain ID, and contract links.

## Testnet checklist

- [ ] Deploy suite on testnet (Sepolia or other)
- [ ] Verify contracts on block explorer
- [ ] Configure UI (env or Settings) with testnet addresses and correct chain ID
- [ ] Mint test tokens to a few wallets for testers
- [ ] Run one full flow: register panel → market bid/ask → clear auction → settle (optional: oracle + settlement)
- [ ] Pin testnet announcement (issue or README) with network, chain ID, faucet, and feedback channel

## Community beta testing

- **Invite**: Share testnet URL, chain ID, and faucet link; ask testers to connect wallet and try Energy Wallet, Market, and (if enabled) Governance.
- **Feedback**: Collect via GitHub Discussions, Discord, or a form (e.g. “What broke? What was confusing?”).
- **Bug fixes**: Triage and fix in a branch; cut a testnet patch release if useful.
- **Iterate**: Re-deploy or upgrade (if using proxies later) and re-share testnet info.

## Rollback

Testnet deployments are not upgradeable by default. For a clean reset, deploy again with the same script (new addresses) and update the UI config.

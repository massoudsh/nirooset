# Mainnet Deployment & Launch Checklist

Use this checklist when preparing for and executing mainnet deployment. Do not deploy mainnet until security review and testnet validation are complete.

## Pre–mainnet

- [ ] **Security**
  - [ ] Professional audit completed and findings addressed or accepted
  - [ ] Bug bounty (if any) scope and rules published
  - [ ] [SECURITY.md](../SECURITY.md) and [Phase 6](../ROADMAP.md) status updated
- [ ] **Testnet**
  - [ ] Testnet deployed and contracts verified
  - [ ] Community/testing period completed; critical bugs fixed
  - [ ] [docs/TESTNET.md](TESTNET.md) and testnet announcement updated
- [ ] **Code & config**
  - [ ] All 130+ tests passing; coverage ≥95%
  - [ ] Deployment script and [DEPLOYMENT.md](DEPLOYMENT.md) reviewed for mainnet (RPC, keys, gas)
  - [ ] Owner/minter/registrar/penalizer roles and keys defined; multisig or timelock if applicable
- [ ] **Documentation**
  - [ ] README and ROADMAP reflect “mainnet” or “live” where appropriate
  - [ ] Public docs for mainnet chain ID, explorer, and contract addresses

## Mainnet deployment

- [ ] **Environment**
  - [ ] Mainnet RPC and deployer key (secure key management; consider hardware/multisig)
  - [ ] Gas and deployer balance checked
- [ ] **Deploy**
  - [ ] Run `forge script script/Deploy.s.sol --rpc-url <MAINNET_RPC> --broadcast` (or equivalent)
  - [ ] Verify contracts on block explorer
  - [ ] Set and verify roles (minter, locker, registrar, penalizer) per [DEPLOYMENT.md](DEPLOYMENT.md)
- [ ] **UI & config**
  - [ ] Production UI env uses mainnet contract addresses and correct chain ID
  - [ ] No testnet/development keys or debug flags in production build

## Post-deploy: monitoring & launch

- [ ] **Monitoring**
  - [ ] RPC and node health (alerts if using own node)
  - [ ] Contract events (e.g. OrderPlaced, AuctionCleared, SettlementExecuted) and dashboards if needed
  - [ ] Error tracking for frontend (e.g. Sentry) and API if any
- [ ] **Launch**
  - [ ] Mainnet announcement (blog, Twitter, Discord, etc.) with network, explorer, and “use at your own risk” disclaimer
  - [ ] Support channel and incident process (who to contact, how to pause or respond if critical bug)
- [ ] **Ongoing**
  - [ ] Plan for upgrades (if applicable) or parameter changes via Governance
  - [ ] Regular dependency and security updates

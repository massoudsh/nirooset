# Security

## Reporting a vulnerability

If you believe you have found a security vulnerability in the GRIDSET Protocol contracts or tooling:

1. **Do not** open a public GitHub issue.
2. Email the maintainers or report via your preferred private channel with:
   - Description of the vulnerability and steps to reproduce
   - Impact assessment (e.g. loss of funds, governance takeover)
   - Suggested fix if any
3. Allow reasonable time for a fix before any public disclosure.

We will acknowledge receipt and work with you on a fix and disclosure timeline.

## Scope

In scope for security review and bug bounty (when active):

- Smart contracts in `src/`: EnergyToken, PanelNFT, PanelRegistry, StakingVault, EnergyOracle, EnergyMarket, SettlementEngine, GovernanceDAO
- Deployment and upgrade flows (owner/minter/registrar/penalizer roles)
- Token economics: lock/unlock, mint/burn, stake, penalties, settlement flows
- Governance: proposal creation, voting power, execution

Out of scope (unless otherwise stated):

- Third-party dependencies (OpenZeppelin, Forge std)
- Frontend/UI (e.g. `ui/`) and off-chain services
- Social engineering and physical security

## Audit status

- **Phase 6** (Security Audit & Testing): Testing complete; ready for external audit.
- **Test coverage**: Forge ≥95% line coverage; 131 tests (unit/behavior + fuzz: EnergyToken mint/supply, StakingVault deposit/totalStaked).
- **CI**: GitHub Actions run `forge build`, `forge test`, `forge coverage` on push/PR.
- **Professional audit**: Not yet completed. Plan to engage an external auditor before mainnet.
- **Bug bounty**: To be announced with scope and rewards before mainnet.

## Security checklist (pre-audit)

- [x] Access control: owner-only and role-based (minter, locker, registrar, penalizer) enforced
- [x] Input validation: zero address, zero amount, and invalid state reverts
- [x] Reentrancy: no external calls before state updates in critical paths; consider OZ ReentrancyGuard for future upgrades
- [x] Integer overflow/underflow: Solidity 0.8+ built-in checks
- [x] Token semantics: EnergyToken lock/unlock and available vs locked balance respected in transfer/burn
- [x] Settlement: finalize → settle ordering; pull-from-payers then push-to-receivers
- [ ] Formal verification: not yet applied (candidate: invariants for token supply, stake totals)
- [x] Fuzz/invariant tests: EnergyToken mint/supply; StakingVault deposit/totalStaked consistency

## References

- [ROADMAP.md](ROADMAP.md) – Phases 6 (Security) and 7 (UI)
- [docs/architecture.md](docs/architecture.md) – System design and trust assumptions

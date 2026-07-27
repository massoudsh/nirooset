# GRIDSET Protocol

GRIDSET is a market-based energy and compute settlement system that enables financial settlement of energy obligations through blockchain infrastructure. The protocol operates on discrete time slots, uses batch auctions for price discovery, relies on oracle-reported production data, and implements stake-backed penalty mechanisms to ensure system integrity and participant compliance.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GRIDSET Protocol                         │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  PanelNFT     │    │ EnergyToken   │    │ StakingVault  │
│  (Assets)     │    │ (Settlement)  │    │ (Security)    │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│PanelRegistry  │    │ EnergyOracle  │    │ EnergyMarket  │
│(Tracking)     │    │ (Data)        │    │ (Pricing)     │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐
│SettlementEngine│    │ GovernanceDAO │
│(Execution)     │    │ (Control)     │
└────────────────┘    └───────────────┘
```

## Key Components

- **EnergyToken**: Fungible energy credits for settlement
- **PanelNFT**: Non-fungible tokens representing energy production assets
- **PanelRegistry**: Registry tracking panel ownership and production
- **StakingVault**: Economic security through staking mechanisms
- **EnergyOracle**: Authoritative production data reporting
- **EnergyMarket**: Batch auction price discovery
- **SettlementEngine**: Financial settlement execution
- **GovernanceDAO**: Decentralized protocol governance

## Important Notice

**This protocol settles financial obligations, not physical energy delivery.** GRIDSET operates as a financial settlement layer that tracks energy production and consumption as financial claims, executes payments based on net energy positions, and does not guarantee physical energy delivery. The protocol is designed to work on top of existing physical energy infrastructure.

## Project Structure

```
gridset-protocol/
├── src/
│   ├── interfaces/          # Contract interfaces
│   │   ├── IEnergyToken.sol
│   │   ├── IPanelNFT.sol
│   │   ├── IPanelRegistry.sol
│   │   ├── IStakingVault.sol
│   │   ├── IEnergyOracle.sol
│   │   ├── IEnergyMarket.sol
│   │   ├── ISettlementEngine.sol
│   │   └── IGovernanceDAO.sol
│   ├── EnergyToken.sol      # Placeholder implementations
│   ├── PanelNFT.sol
│   ├── PanelRegistry.sol
│   ├── StakingVault.sol
│   ├── EnergyOracle.sol
│   ├── EnergyMarket.sol
│   ├── SettlementEngine.sol
│   └── GovernanceDAO.sol
├── test/                    # Forge tests (130 tests, >95% line coverage)
├── script/
│   └── Deploy.s.sol         # Deploy full suite (Anvil/testnet/mainnet)
├── docs/
│   ├── architecture.md      # System architecture
│   ├── GETTING_STARTED.md   # Clone → build → test → deploy → UI
│   ├── DEPLOYMENT.md        # Deployment order, env vars, post-deploy
│   └── NEW_ISSUES.md        # Backlog
├── ui/                      # React + Vite web UI
│   └── src/
│       ├── components/      # Views (Dashboard, Energy Wallet, Market, etc.)
│       ├── context/         # Web3Context (contracts, addresses)
│       └── config/          # Contract addresses & ABIs from env
└── foundry.toml             # Foundry configuration
```

## Development

### Prerequisites

- Foundry (forge, cast, anvil)
- Solidity ^0.8.20

### Build

```bash
forge build
```

### Test

```bash
forge test
```

### Run UI

The project includes a modern web UI for interacting with the protocol:

```bash
cd ui
npm install
npm run dev
```

The UI will open at `http://localhost:5173` (or the URL Vite prints) and includes:
- Energy dashboard with real-time metrics
- Energy market with order book visualization
- Panel registry management
- Energy wallet and token transfers
- Settlement engine monitoring
- Staking vault management
- Governance DAO participation

See `ui/README.md` for more details.

### Release path

See **[docs/RELEASE_READINESS.md](docs/RELEASE_READINESS.md)** for the shortest path to testnet and mainnet release.

### Testnet live (after you deploy)

Once the deployer has Sepolia ETH, run:

```bash
export PRIVATE_KEY=0x...
./script/deploy-sepolia.sh
# or: forge script script/Deploy.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast
```

Then restart the UI (`cd ui && npm run dev`). **Share** with testers:

- **App URL:** your hosted URL (e.g. Vercel) or `http://localhost:5173` for local
- **Network:** Sepolia (Chain ID 11155111)
- **Get test ETH:** [sepoliafaucet.com](https://sepoliafaucet.com/)

Copy-paste for announcements: *"GRIDSET testnet is live on Sepolia. Switch your wallet to Sepolia (11155111), get test ETH at [sepoliafaucet.com](https://sepoliafaucet.com/), then open the app. Set contract addresses in Settings if needed."*

### Deploy locally

See **[docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)** for the full flow. Quick version:

```bash
anvil
# In another terminal:
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
# Copy logged addresses into ui/.env (see ui/.env.example), then:
cd ui && npm install && npm run dev
```

### Current Status

- ✅ **Contracts**: EnergyToken, PanelNFT, PanelRegistry, StakingVault, EnergyOracle, EnergyMarket, SettlementEngine, GovernanceDAO (full implementations)
- ✅ **Tests**: 130 Forge tests, >95% line coverage; fuzz test for EnergyToken
- ✅ **UI**: Dashboard, Energy Wallet (balance/transfer), Energy Market (live order book), Panel Registry, Staking, Governance, Settlement, Utilities; contract wiring via env
- ✅ **Deployment**: `script/Deploy.s.sol` for local/testnet/mainnet; [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- ✅ **Docs**: [GETTING_STARTED](docs/GETTING_STARTED.md), [DEPLOYMENT](docs/DEPLOYMENT.md), [TESTNET](docs/TESTNET.md), [MAINNET_CHECKLIST](docs/MAINNET_CHECKLIST.md), [ROADMAP](ROADMAP.md), [SECURITY](SECURITY.md)

## License

MIT

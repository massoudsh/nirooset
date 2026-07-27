# Getting Started

This guide gets you from clone to a running UI with contracts deployed on a local chain.

## Prerequisites

- **Foundry**: [Install Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`, `anvil`)
- **Node.js** 18+ (for the web UI)
- **Solidity** ^0.8.20 (via Foundry)

## 1. Clone and build

```bash
git clone https://github.com/massoudsh/gridset-protocol.git
cd gridset-protocol
forge build
```

## 2. Run tests

```bash
forge test
```

Optional: run with coverage (≥95% line coverage expected):

```bash
forge coverage --report summary
```

## 3. Start a local chain and deploy

In one terminal, start Anvil:

```bash
anvil
```

In another terminal, deploy the full contract suite:

```bash
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

The script logs deployed addresses. Copy them into `ui/.env` (see [Deployment](DEPLOYMENT.md)).

Create `ui/.env` with the addresses printed by the script (keys from `ui/.env.example`). Example for a **fresh** Anvil + first deploy:

```
VITE_ENERGY_TOKEN_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
VITE_ENERGY_MARKET_ADDRESS=0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
VITE_PANEL_NFT_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
VITE_PANEL_REGISTRY_ADDRESS=0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
VITE_STAKING_VAULT_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
VITE_ENERGY_ORACLE_ADDRESS=0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
VITE_SETTLEMENT_ENGINE_ADDRESS=0x0165878A594ca255338adfa4d48449f69242Eb8F
VITE_GOVERNANCE_DAO_ADDRESS=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
```

Addresses change if you redeploy or use a different deployer; always use the addresses from your own script output.

## 4. Run the web UI

```bash
cd ui
npm install
npm run dev
```

Open http://localhost:5173 (or the URL Vite prints). Connect MetaMask (or another wallet) to the Anvil network (e.g. http://127.0.0.1:8545, chain ID 31337) and use the first Anvil account. You can mint tokens and use the Energy Wallet and Energy Market views against the deployed contracts.

## 5. Mint tokens (optional)

The deployer is set as minter. Using `cast` (with Anvil default key):

```bash
cast send <ENERGY_TOKEN_ADDRESS> "mint(address,uint256)" <YOUR_ADDRESS> 1000000000000000000000 --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Then in the UI, open **Energy Wallet** to see balance and **Energy Market** to see live order book (after starting an auction and placing orders; see [DEPLOYMENT](DEPLOYMENT.md)).

## Next steps

- [Deployment](DEPLOYMENT.md) – Testnet, env vars, and deployment details
- [Architecture](architecture.md) – System design and contracts
- [ROADMAP](../ROADMAP.md) – Phases and issues

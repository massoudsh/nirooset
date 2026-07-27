# Deployment

This document describes how to deploy the GRIDSET contract suite and wire the UI.

## Contract deployment order

Dependencies (deploy first):

1. **EnergyToken** – no dependencies
2. **PanelNFT** – no dependencies
3. **PanelRegistry** – no dependencies
4. **StakingVault** – requires `IEnergyToken`
5. **EnergyOracle** – no dependencies
6. **EnergyMarket** – requires `IEnergyToken` (for escrow: lock on placeBid/placeAsk, transferLocked on clear)
7. **SettlementEngine** – requires `IEnergyToken`, `IEnergyMarket`
8. **GovernanceDAO** – requires `IEnergyToken`

The Forge script `script/Deploy.s.sol` deploys in this order and then:

- Sets the deployer as **minter** on EnergyToken and PanelNFT
- Sets **SettlementEngine** and **EnergyMarket** as **lockers** on EnergyToken (market escrow: lock/unlock/transferLocked on place, cancel, clear)
- Sets **PanelNFT** address on PanelRegistry (`setPanelNFT`) so only the current NFT owner can be registered as panel owner
- Sets the deployer as **registrar** and **reporter** on PanelRegistry
- Sets the deployer as **penalizer** on StakingVault and SettlementEngine
- **EnergyOracle:** Optional two-step finalization: call `energyOracle.setConfirmer(confirmerAddress)` so that `finalizeTimeSlot` requires `confirmTimeSlot(slot)` first. See [ORACLE_TRUST_MODEL.md](ORACLE_TRUST_MODEL.md).

## Running the deploy script

### Local (Anvil)

```bash
anvil
# In another terminal:
forge script script/Deploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast
```

Use `PRIVATE_KEY` or the default Anvil key (script uses Anvil default if `PRIVATE_KEY` is not set).

### Testnet (e.g. Sepolia)

1. Set `PRIVATE_KEY` (or use `--private-key`).
2. Set `RPC_URL` (or use `--rpc-url`).

```bash
export PRIVATE_KEY=0x...
forge script script/Deploy.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_KEY --broadcast
```

Optional: verify on Etherscan:

```bash
forge script script/Deploy.s.sol --rpc-url ... --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

## UI environment variables

After deployment, set these in `ui/.env` (see `ui/.env.example`):

| Variable | Description |
|----------|-------------|
| `VITE_ENERGY_TOKEN_ADDRESS` | EnergyToken |
| `VITE_ENERGY_MARKET_ADDRESS` | EnergyMarket |
| `VITE_PANEL_NFT_ADDRESS` | PanelNFT |
| `VITE_PANEL_REGISTRY_ADDRESS` | PanelRegistry |
| `VITE_STAKING_VAULT_ADDRESS` | StakingVault |
| `VITE_ENERGY_ORACLE_ADDRESS` | EnergyOracle |
| `VITE_SETTLEMENT_ENGINE_ADDRESS` | SettlementEngine |
| `VITE_GOVERNANCE_DAO_ADDRESS` | GovernanceDAO |

Restart the UI (`npm run dev`) after changing `.env`.

## Post-deploy: first auction (Energy Market)

To see live data in the **Energy Market** view:

1. Start an auction for a time slot (owner only):
   ```bash
   cast send <ENERGY_MARKET_ADDRESS> "startAuction(uint256,uint256)" 1000 3600 --rpc-url $RPC --private-key $PK
   ```
2. Place a bid and an ask (any account with tokens):
   ```bash
   cast send <ENERGY_MARKET_ADDRESS> "placeBid(uint256,uint256,uint256)" 1000 100 50 --rpc-url $RPC --private-key $PK
   cast send <ENERGY_MARKET_ADDRESS> "placeAsk(uint256,uint256,uint256)" 1000 90 40 --rpc-url $RPC --private-key $PK
   ```
3. Clear the auction (owner):
   ```bash
   cast send <ENERGY_MARKET_ADDRESS> "clearAuction(uint256)" 1000 --rpc-url $RPC --private-key $PK
   ```

Then open the UI Energy Market, set time slot to **1000**, and use Refresh to see best bid/ask and clearing price.

## Testnet release in 3 steps

1. **Deploy** (need Sepolia ETH: [faucet](https://sepoliafaucet.com/)):
   ```bash
   export PRIVATE_KEY=0x...
   forge script script/Deploy.s.sol --rpc-url https://ethereum-sepolia-rpc.publicnode.com --broadcast
   ```
2. **Copy** the logged addresses into `ui/.env` (keys from table above) if not already set. If deploy failed with "insufficient funds", get Sepolia ETH and re-run; addresses are deterministic. Restart the UI.
3. **Share** app URL + “Switch to Sepolia (11155111) and get test ETH at [faucet].”

See [RELEASE_READINESS.md](RELEASE_READINESS.md) for the full testnet checklist.

## Testnet and mainnet

- **Testnet**: See [TESTNET.md](TESTNET.md) for testnet deploy, checklist, and community beta.
- **Mainnet**: See [MAINNET_CHECKLIST.md](MAINNET_CHECKLIST.md) before mainnet deploy and launch.

## Programmatic usage (SDK-style)

Contracts follow the interfaces in `src/interfaces/`. You can use:

- **ethers.js** or **viem** with ABIs from `out/` (e.g. `out/EnergyToken.sol/EnergyToken.json`) and the deployed addresses.
- **cast** for one-off calls:
  ```bash
  cast call <ENERGY_TOKEN_ADDRESS> "balanceOf(address)(uint256)" <ACCOUNT> --rpc-url $RPC
  ```

A thin SDK (e.g. Node package wrapping addresses + ABIs and common methods) can be added later; see [NEW_ISSUES.md](NEW_ISSUES.md) (NEW-10).

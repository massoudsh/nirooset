# Multi-Chain Support

GRIDSET UI supports multiple networks. Contract addresses in `ui/.env` are for a single deployment (e.g. Sepolia); the app lets users switch to a supported chain.

## Supported networks

| Chain ID | Name       | Type    | Notes                    |
|----------|------------|---------|--------------------------|
| 1        | Ethereum   | Mainnet | When GRIDSET is deployed |
| 11155111 | Sepolia    | Testnet | Faucet: sepoliafaucet.com |
| 11155420 | OP Sepolia | Testnet | Faucet: app.optimism.io/faucet |

## In the app

- **Header (when connected):** A chain selector shows the current network. Click it to switch to another supported chain. The wallet will prompt to add the network if needed.
- **Unsupported chain:** If the wallet is on a chain that isn’t in the list, the selector is highlighted and “Switch to a supported network” is shown. Use the dropdown to pick e.g. Sepolia.
- **Testnet banner:** On Sepolia or OP Sepolia, a banner shows testnet name and a link to get test ETH.

## Configuration

- Supported chains and EIP-3085 params (for `wallet_addEthereumChain`) are in `ui/src/config/chains.js`.
- Contract addresses in `ui/.env` apply to the chain you deployed to (e.g. Sepolia). For true multi-chain deployments, the app would need address-by-chainId (future enhancement).

## Big picture (issue #12)

Multi-chain support lets panel owners, market participants, and infra investors use the same app on testnets (Sepolia, OP Sepolia) and, when ready, on mainnet. Switching networks is one click from the header.

/**
 * chains.js — Supported blockchain networks for نیروست Protocol
 *
 * Issue #12: Multi-chain Support
 *
 * Each entry defines the chain metadata used for:
 *  - Wallet network switching (EIP-3085 wallet_addEthereumChain)
 *  - UI labels and explorer links
 *  - Testnet faucet links (where applicable)
 */

export const SUPPORTED_CHAINS = {
  // ── Ethereum Mainnet ────────────────────────────────────────────────────
  1: {
    chainId: 1,
    name: 'Ethereum',
    shortName: 'eth',
    testnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://ethereum.publicnode.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    faucets: [],
  },

  // ── Sepolia Testnet ──────────────────────────────────────────────────────
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    shortName: 'sep',
    testnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org', 'https://sepolia.publicnode.com'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
    faucets: ['https://sepoliafaucet.com', 'https://faucet.sepolia.dev'],
  },

  // ── OP Sepolia Testnet ───────────────────────────────────────────────────
  11155420: {
    chainId: 11155420,
    name: 'OP Sepolia',
    shortName: 'op-sep',
    testnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.optimism.io'],
    blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'],
    faucets: ['https://console.optimism.io/faucet'],
  },

  // ── Optimism Mainnet ────────────────────────────────────────────────────
  10: {
    chainId: 10,
    name: 'Optimism',
    shortName: 'op',
    testnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io', 'https://optimism.publicnode.com'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    faucets: [],
  },

  // ── Arbitrum One ────────────────────────────────────────────────────────
  42161: {
    chainId: 42161,
    name: 'Arbitrum One',
    shortName: 'arb',
    testnet: false,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc', 'https://arbitrum.publicnode.com'],
    blockExplorerUrls: ['https://arbiscan.io'],
    faucets: [],
  },

  // ── Arbitrum Sepolia ────────────────────────────────────────────────────
  421614: {
    chainId: 421614,
    name: 'Arbitrum Sepolia',
    shortName: 'arb-sep',
    testnet: true,
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://sepolia.arbiscan.io'],
    faucets: ['https://faucet.arbitrum.io'],
  },

  // ── Polygon PoS Mainnet ──────────────────────────────────────────────────
  137: {
    chainId: 137,
    name: 'Polygon',
    shortName: 'pol',
    testnet: false,
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com', 'https://polygon.publicnode.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    faucets: [],
  },

  // ── Polygon Amoy Testnet ─────────────────────────────────────────────────
  80002: {
    chainId: 80002,
    name: 'Polygon Amoy',
    shortName: 'pol-amoy',
    testnet: true,
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com'],
    faucets: ['https://faucet.polygon.technology'],
  },
};

/** Array of all supported chain IDs. */
export const SUPPORTED_CHAIN_IDS = Object.keys(SUPPORTED_CHAINS).map(Number);

/** Returns true if the given chainId is supported. */
export function isSupportedChain(chainId) {
  return SUPPORTED_CHAIN_IDS.includes(Number(chainId));
}

/** Returns chain metadata or null if unsupported. */
export function getChain(chainId) {
  return SUPPORTED_CHAINS[Number(chainId)] ?? null;
}

/**
 * Build EIP-3085 `wallet_addEthereumChain` parameters for a given chainId.
 * Returns null for chains that don't require explicit addition (e.g. mainnet).
 */
export function getChainParams(chainId) {
  const chain = getChain(chainId);
  if (!chain) return null;
  return {
    chainId: `0x${chain.chainId.toString(16)}`,
    chainName: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: chain.rpcUrls,
    blockExplorerUrls: chain.blockExplorerUrls,
  };
}

/** Returns only the testnet chains. */
export function getTestnets() {
  return Object.values(SUPPORTED_CHAINS).filter((c) => c.testnet);
}

/** Returns only the mainnet chains. */
export function getMainnets() {
  return Object.values(SUPPORTED_CHAINS).filter((c) => !c.testnet);
}

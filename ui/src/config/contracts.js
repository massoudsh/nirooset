/**
 * contracts.js — Smart contract addresses and ABIs for GRIDSET Protocol
 *
 * Issue #12: Multi-chain Support
 *
 * Contract addresses are keyed by chainId, allowing the UI to switch
 * seamlessly between Sepolia, Optimism, Arbitrum, Polygon, and mainnet.
 *
 * Populate each chain's addresses via environment variables or a deployment
 * manifest. The `getAddresses(chainId)` helper returns the right set
 * for the connected network.
 */

// ---------------------------------------------------------------------------
// Per-chain contract addresses
// ---------------------------------------------------------------------------

/**
 * Add a block of VITE_* env vars for each network you deploy to:
 *
 *   VITE_SEPOLIA_ENERGY_TOKEN=0x...
 *   VITE_OP_ENERGY_TOKEN=0x...
 *   ...
 *
 * Or import a deployment JSON produced by `forge script ... --json`.
 */
const CHAIN_ADDRESSES = {
  // ── Ethereum Mainnet (1) ─────────────────────────────────────────────────
  1: {
    energyToken:      import.meta.env.VITE_MAINNET_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_MAINNET_ENERGY_MARKET      ?? '',
    panelNFT:         import.meta.env.VITE_MAINNET_PANEL_NFT          ?? '',
    panelRegistry:    import.meta.env.VITE_MAINNET_PANEL_REGISTRY     ?? '',
    stakingVault:     import.meta.env.VITE_MAINNET_STAKING_VAULT      ?? '',
    energyOracle:     import.meta.env.VITE_MAINNET_ENERGY_ORACLE      ?? '',
    settlementEngine: import.meta.env.VITE_MAINNET_SETTLEMENT_ENGINE  ?? '',
    governanceDAO:    import.meta.env.VITE_MAINNET_GOVERNANCE_DAO     ?? '',
  },

  // ── Sepolia Testnet (11155111) ────────────────────────────────────────────
  11155111: {
    energyToken:      import.meta.env.VITE_SEPOLIA_ENERGY_TOKEN      ?? import.meta.env.VITE_ENERGY_TOKEN_ADDRESS      ?? '',
    energyMarket:     import.meta.env.VITE_SEPOLIA_ENERGY_MARKET     ?? import.meta.env.VITE_ENERGY_MARKET_ADDRESS     ?? '',
    panelNFT:         import.meta.env.VITE_SEPOLIA_PANEL_NFT         ?? import.meta.env.VITE_PANEL_NFT_ADDRESS         ?? '',
    panelRegistry:    import.meta.env.VITE_SEPOLIA_PANEL_REGISTRY    ?? import.meta.env.VITE_PANEL_REGISTRY_ADDRESS    ?? '',
    stakingVault:     import.meta.env.VITE_SEPOLIA_STAKING_VAULT     ?? import.meta.env.VITE_STAKING_VAULT_ADDRESS     ?? '',
    energyOracle:     import.meta.env.VITE_SEPOLIA_ENERGY_ORACLE     ?? import.meta.env.VITE_ENERGY_ORACLE_ADDRESS     ?? '',
    settlementEngine: import.meta.env.VITE_SEPOLIA_SETTLEMENT_ENGINE ?? import.meta.env.VITE_SETTLEMENT_ENGINE_ADDRESS ?? '',
    governanceDAO:    import.meta.env.VITE_SEPOLIA_GOVERNANCE_DAO    ?? import.meta.env.VITE_GOVERNANCE_DAO_ADDRESS    ?? '',
  },

  // ── OP Sepolia (11155420) ─────────────────────────────────────────────────
  11155420: {
    energyToken:      import.meta.env.VITE_OP_SEP_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_OP_SEP_ENERGY_MARKET     ?? '',
    panelNFT:         import.meta.env.VITE_OP_SEP_PANEL_NFT         ?? '',
    panelRegistry:    import.meta.env.VITE_OP_SEP_PANEL_REGISTRY    ?? '',
    stakingVault:     import.meta.env.VITE_OP_SEP_STAKING_VAULT     ?? '',
    energyOracle:     import.meta.env.VITE_OP_SEP_ENERGY_ORACLE     ?? '',
    settlementEngine: import.meta.env.VITE_OP_SEP_SETTLEMENT_ENGINE ?? '',
    governanceDAO:    import.meta.env.VITE_OP_SEP_GOVERNANCE_DAO    ?? '',
  },

  // ── Optimism Mainnet (10) ─────────────────────────────────────────────────
  10: {
    energyToken:      import.meta.env.VITE_OP_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_OP_ENERGY_MARKET     ?? '',
    panelNFT:         import.meta.env.VITE_OP_PANEL_NFT         ?? '',
    panelRegistry:    import.meta.env.VITE_OP_PANEL_REGISTRY    ?? '',
    stakingVault:     import.meta.env.VITE_OP_STAKING_VAULT     ?? '',
    energyOracle:     import.meta.env.VITE_OP_ENERGY_ORACLE     ?? '',
    settlementEngine: import.meta.env.VITE_OP_SETTLEMENT_ENGINE ?? '',
    governanceDAO:    import.meta.env.VITE_OP_GOVERNANCE_DAO    ?? '',
  },

  // ── Arbitrum One (42161) ──────────────────────────────────────────────────
  42161: {
    energyToken:      import.meta.env.VITE_ARB_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_ARB_ENERGY_MARKET     ?? '',
    panelNFT:         import.meta.env.VITE_ARB_PANEL_NFT         ?? '',
    panelRegistry:    import.meta.env.VITE_ARB_PANEL_REGISTRY    ?? '',
    stakingVault:     import.meta.env.VITE_ARB_STAKING_VAULT     ?? '',
    energyOracle:     import.meta.env.VITE_ARB_ENERGY_ORACLE     ?? '',
    settlementEngine: import.meta.env.VITE_ARB_SETTLEMENT_ENGINE ?? '',
    governanceDAO:    import.meta.env.VITE_ARB_GOVERNANCE_DAO    ?? '',
  },

  // ── Arbitrum Sepolia (421614) ─────────────────────────────────────────────
  421614: {
    energyToken:      import.meta.env.VITE_ARB_SEP_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_ARB_SEP_ENERGY_MARKET     ?? '',
    panelNFT:         import.meta.env.VITE_ARB_SEP_PANEL_NFT         ?? '',
    panelRegistry:    import.meta.env.VITE_ARB_SEP_PANEL_REGISTRY    ?? '',
    stakingVault:     import.meta.env.VITE_ARB_SEP_STAKING_VAULT     ?? '',
    energyOracle:     import.meta.env.VITE_ARB_SEP_ENERGY_ORACLE     ?? '',
    settlementEngine: import.meta.env.VITE_ARB_SEP_SETTLEMENT_ENGINE ?? '',
    governanceDAO:    import.meta.env.VITE_ARB_SEP_GOVERNANCE_DAO    ?? '',
  },

  // ── Polygon (137) ─────────────────────────────────────────────────────────
  137: {
    energyToken:      import.meta.env.VITE_POL_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_POL_ENERGY_MARKET     ?? '',
    panelNFT:         import.meta.env.VITE_POL_PANEL_NFT         ?? '',
    panelRegistry:    import.meta.env.VITE_POL_PANEL_REGISTRY    ?? '',
    stakingVault:     import.meta.env.VITE_POL_STAKING_VAULT     ?? '',
    energyOracle:     import.meta.env.VITE_POL_ENERGY_ORACLE     ?? '',
    settlementEngine: import.meta.env.VITE_POL_SETTLEMENT_ENGINE ?? '',
    governanceDAO:    import.meta.env.VITE_POL_GOVERNANCE_DAO    ?? '',
  },

  // ── Polygon Amoy (80002) ──────────────────────────────────────────────────
  80002: {
    energyToken:      import.meta.env.VITE_POL_AMOY_ENERGY_TOKEN      ?? '',
    energyMarket:     import.meta.env.VITE_POL_AMOY_ENERGY_MARKET     ?? '',
    panelNFT:         import.meta.env.VITE_POL_AMOY_PANEL_NFT         ?? '',
    panelRegistry:    import.meta.env.VITE_POL_AMOY_PANEL_REGISTRY    ?? '',
    stakingVault:     import.meta.env.VITE_POL_AMOY_STAKING_VAULT     ?? '',
    energyOracle:     import.meta.env.VITE_POL_AMOY_ENERGY_ORACLE     ?? '',
    settlementEngine: import.meta.env.VITE_POL_AMOY_SETTLEMENT_ENGINE ?? '',
    governanceDAO:    import.meta.env.VITE_POL_AMOY_GOVERNANCE_DAO    ?? '',
  },
};

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Returns contract addresses for the given chainId.
 * Falls back to an all-empty object if the chain is not configured.
 */
export function getAddresses(chainId) {
  return (
    CHAIN_ADDRESSES[Number(chainId)] ?? {
      energyToken:      '',
      energyMarket:     '',
      panelNFT:         '',
      panelRegistry:    '',
      stakingVault:     '',
      energyOracle:     '',
      settlementEngine: '',
      governanceDAO:    '',
    }
  );
}

/**
 * Returns true if at least one contract address is configured for the chainId.
 */
export function hasAddressesForChain(chainId) {
  const addrs = getAddresses(chainId);
  return Object.values(addrs).some((a) => a && a.length >= 20);
}

/**
 * Legacy single-chain helper (kept for backwards compatibility).
 * Reads from legacy env vars (VITE_ENERGY_TOKEN_ADDRESS, etc.).
 */
export const contractAddresses = {
  energyToken:      import.meta.env.VITE_ENERGY_TOKEN_ADDRESS      ?? '',
  energyMarket:     import.meta.env.VITE_ENERGY_MARKET_ADDRESS     ?? '',
  panelNFT:         import.meta.env.VITE_PANEL_NFT_ADDRESS         ?? '',
  panelRegistry:    import.meta.env.VITE_PANEL_REGISTRY_ADDRESS    ?? '',
  stakingVault:     import.meta.env.VITE_STAKING_VAULT_ADDRESS     ?? '',
  energyOracle:     import.meta.env.VITE_ENERGY_ORACLE_ADDRESS     ?? '',
  settlementEngine: import.meta.env.VITE_SETTLEMENT_ENGINE_ADDRESS ?? '',
  governanceDAO:    import.meta.env.VITE_GOVERNANCE_DAO_ADDRESS    ?? '',
};

export function hasAnyAddress() {
  return Object.values(contractAddresses).some((a) => a && a.length >= 20);
}

// ---------------------------------------------------------------------------
// Minimal ABIs (unchanged from original, used by Web3Context)
// ---------------------------------------------------------------------------

export const ENERGY_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function getEnergyBalance(address account) view returns (uint256)',
  'function getLockedBalance(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

export const ENERGY_MARKET_ABI = [
  'function getAuction(uint256 timeSlot) view returns (tuple(uint256 timeSlot, uint256 startTime, uint256 endTime, uint256 clearingPrice, uint256 totalBidQuantity, uint256 totalAskQuantity, bool isCleared))',
  'function getBestBid(uint256 timeSlot) view returns (uint256 price, uint256 quantity)',
  'function getBestAsk(uint256 timeSlot) view returns (uint256 price, uint256 quantity)',
  'function getOrderBook(uint256 timeSlot) view returns (tuple(uint256 orderId, address trader, bool isBid, uint256 price, uint256 quantity, uint256 filledQuantity, uint256 timeSlot, bool isActive)[] bids, tuple(uint256 orderId, address trader, bool isBid, uint256 price, uint256 quantity, uint256 filledQuantity, uint256 timeSlot, bool isActive)[] asks)',
  'function placeBid(uint256 timeSlot, uint256 price, uint256 quantity) returns (uint256)',
  'function placeAsk(uint256 timeSlot, uint256 price, uint256 quantity) returns (uint256)',
  'function cancelOrder(uint256 orderId)',
  'function clearAuction(uint256 timeSlot) returns (uint256)',
  'event AuctionCleared(uint256 indexed timeSlot, uint256 clearingPrice, uint256 totalMatched)',
  'event OrderPlaced(uint256 indexed orderId, address indexed trader, bool isBid, uint256 price, uint256 quantity)',
  'event OrderCancelled(uint256 indexed orderId)',
];

export const STAKING_VAULT_ABI = [
  'function getStake(address account) view returns (uint256)',
];

export const PANEL_REGISTRY_ABI = [
  'function getRegisteredPanels() view returns (uint256[])',
  'function getPanelRecord(uint256 tokenId) view returns (tuple(uint256 tokenId, address owner, uint256 capacityWatt, uint256 totalEnergyProduced, uint256 lastReportTimestamp, bool isRegistered))',
];

export const SETTLEMENT_ENGINE_ABI = [
  'function getSettlement(uint256 timeSlot) view returns (tuple(uint256 timeSlot, bool settled, uint256 totalSettled))',
];

export const GOVERNANCE_DAO_ABI = [
  'function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string description, uint256 forVotes, uint256 againstVotes, bool executed))',
];

export const ENERGY_ORACLE_ABI = [
  'function getTimeSlotData(uint256 timeSlot) view returns (tuple(uint256 startTime, uint256 endTime, uint256 totalEnergy, bool finalized))',
  'function getTotalProductionInSlot(uint256 timeSlot) view returns (uint256)',
  'function isTimeSlotFinalized(uint256 timeSlot) view returns (bool)',
  'function getSlotReportCount(uint256 timeSlot) view returns (uint256)',
  'function requiredConsensus() view returns (uint256)',
  'function oracleCount() view returns (uint256)',
  'function getProductionReport(uint256 panelId, uint256 timestamp) view returns (tuple(uint256 panelId, uint256 timestamp, uint256 energyWh, address reporter, bool verified))',
  'event TimeSlotFinalized(uint256 indexed timeSlot, uint256 totalEnergy)',
  'event TimeSlotConfirmed(uint256 indexed timeSlot)',
];

export const PANEL_NFT_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function getPanelMetadata(uint256 tokenId) view returns (tuple(uint256 tokenId, string uri, uint256 capacityWatt, uint256 installedAt, bool active))',
  'event PanelMinted(uint256 indexed tokenId, address indexed owner, uint256 capacityWatt)',
];

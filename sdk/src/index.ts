/**
 * @gridset/sdk — JavaScript/TypeScript client library for GRIDSET Protocol
 *
 * Issue #23: SDK or client library (JS/TS)
 *
 * Usage:
 *   import { GridsetSDK } from '@gridset/sdk';
 *
 *   const sdk = new GridsetSDK(provider, {
 *     energyToken:  '0x...',
 *     energyMarket: '0x...',
 *     panelNFT:     '0x...',
 *     // ...
 *   });
 *
 *   const orderBook = await sdk.getOrderBook(timeSlot);
 *   await sdk.placeBid(timeSlot, price, quantity);
 */

import {
  Contract,
  ContractRunner,
  ContractTransactionResponse,
  ethers,
} from 'ethers';

// ---------------------------------------------------------------------------
// ABI definitions (minimal — only the functions the SDK exposes)
// ---------------------------------------------------------------------------

const ENERGY_TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function getEnergyBalance(address account) view returns (uint256)',
  'function getLockedBalance(address account) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount)',
] as const;

const ENERGY_MARKET_ABI = [
  'function startAuction(uint256 timeSlot, uint256 duration)',
  'function placeBid(uint256 timeSlot, uint256 price, uint256 quantity) returns (uint256)',
  'function placeAsk(uint256 timeSlot, uint256 price, uint256 quantity) returns (uint256)',
  'function cancelOrder(uint256 orderId)',
  'function clearAuction(uint256 timeSlot) returns (uint256 clearingPrice)',
  'function getOrder(uint256 orderId) view returns (tuple(uint256 orderId, address trader, bool isBid, uint256 price, uint256 quantity, uint256 filledQuantity, uint256 timeSlot, bool isActive))',
  'function getAuction(uint256 timeSlot) view returns (tuple(uint256 timeSlot, uint256 startTime, uint256 endTime, uint256 clearingPrice, uint256 totalBidQuantity, uint256 totalAskQuantity, bool isCleared))',
  'function getBestBid(uint256 timeSlot) view returns (uint256 price, uint256 quantity)',
  'function getBestAsk(uint256 timeSlot) view returns (uint256 price, uint256 quantity)',
  'function getOrderBook(uint256 timeSlot) view returns (tuple(uint256 orderId, address trader, bool isBid, uint256 price, uint256 quantity, uint256 filledQuantity, uint256 timeSlot, bool isActive)[] bids, tuple(uint256 orderId, address trader, bool isBid, uint256 price, uint256 quantity, uint256 filledQuantity, uint256 timeSlot, bool isActive)[] asks)',
  'event OrderPlaced(uint256 indexed orderId, address indexed trader, bool isBid, uint256 price, uint256 quantity)',
  'event AuctionCleared(uint256 indexed timeSlot, uint256 clearingPrice, uint256 totalMatched)',
] as const;

const PANEL_NFT_ABI = [
  'function mint(address to, uint256 tokenId, uint256 capacityWatt)',
  'function retire(uint256 tokenId)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function getPanelMetadata(uint256 tokenId) view returns (tuple(uint256 tokenId, string uri, uint256 capacityWatt, uint256 installedAt, bool active))',
] as const;

const PANEL_REGISTRY_ABI = [
  'function registerPanel(uint256 tokenId, address owner, uint256 capacityWatt)',
  'function deregisterPanel(uint256 tokenId)',
  'function reportProduction(uint256 tokenId, uint256 timestamp, uint256 energyWh)',
  'function getPanelRecord(uint256 tokenId) view returns (tuple(uint256 tokenId, address owner, uint256 capacityWatt, uint256 totalEnergyProduced, uint256 lastReportTimestamp, bool isRegistered))',
  'function getRegisteredPanels() view returns (uint256[])',
  'function isRegistered(uint256 tokenId) view returns (bool)',
] as const;

const ENERGY_ORACLE_ABI = [
  'function reportProduction(uint256 panelId, uint256 timestamp, uint256 energyWh)',
  'function finalizeTimeSlot(uint256 timeSlot)',
  'function getTimeSlotData(uint256 timeSlot) view returns (tuple(uint256 startTime, uint256 endTime, uint256 totalEnergy, bool finalized))',
  'function getTotalProductionInSlot(uint256 timeSlot) view returns (uint256)',
  'function isTimeSlotFinalized(uint256 timeSlot) view returns (bool)',
  'function getSlotReportCount(uint256 timeSlot) view returns (uint256)',
  'function oracles(address) view returns (bool)',
  'function requiredConsensus() view returns (uint256)',
] as const;

const STAKING_VAULT_ABI = [
  'function getStake(address account) view returns (uint256)',
] as const;

const SETTLEMENT_ENGINE_ABI = [
  'function getSettlement(uint256 timeSlot) view returns (tuple(uint256 timeSlot, bool settled, uint256 totalSettled))',
] as const;

const GOVERNANCE_DAO_ABI = [
  'function getProposal(uint256 proposalId) view returns (tuple(uint256 id, address proposer, string description, uint256 forVotes, uint256 againstVotes, bool executed))',
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GridsetAddresses {
  energyToken?: string;
  energyMarket?: string;
  panelNFT?: string;
  panelRegistry?: string;
  energyOracle?: string;
  stakingVault?: string;
  settlementEngine?: string;
  governanceDAO?: string;
}

export interface Order {
  orderId: bigint;
  trader: string;
  isBid: boolean;
  price: bigint;
  quantity: bigint;
  filledQuantity: bigint;
  timeSlot: bigint;
  isActive: boolean;
}

export interface Auction {
  timeSlot: bigint;
  startTime: bigint;
  endTime: bigint;
  clearingPrice: bigint;
  totalBidQuantity: bigint;
  totalAskQuantity: bigint;
  isCleared: boolean;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
}

export interface TimeSlotData {
  startTime: bigint;
  endTime: bigint;
  totalEnergy: bigint;
  finalized: boolean;
}

export interface PanelRecord {
  tokenId: bigint;
  owner: string;
  capacityWatt: bigint;
  totalEnergyProduced: bigint;
  lastReportTimestamp: bigint;
  isRegistered: boolean;
}

// ---------------------------------------------------------------------------
// Main SDK class
// ---------------------------------------------------------------------------

export class GridsetSDK {
  private runner: ContractRunner;
  private addresses: GridsetAddresses;

  // Contract instances (lazy-initialised)
  private _energyToken?: Contract;
  private _energyMarket?: Contract;
  private _panelNFT?: Contract;
  private _panelRegistry?: Contract;
  private _energyOracle?: Contract;
  private _stakingVault?: Contract;
  private _settlementEngine?: Contract;
  private _governanceDAO?: Contract;

  constructor(runner: ContractRunner, addresses: GridsetAddresses) {
    this.runner    = runner;
    this.addresses = addresses;
  }

  // -------------------------------------------------------------------------
  // Contract accessors
  // -------------------------------------------------------------------------

  get energyToken(): Contract {
    if (!this._energyToken) {
      this._assertAddress('energyToken');
      this._energyToken = new Contract(this.addresses.energyToken!, ENERGY_TOKEN_ABI, this.runner);
    }
    return this._energyToken;
  }

  get energyMarket(): Contract {
    if (!this._energyMarket) {
      this._assertAddress('energyMarket');
      this._energyMarket = new Contract(this.addresses.energyMarket!, ENERGY_MARKET_ABI, this.runner);
    }
    return this._energyMarket;
  }

  get panelNFT(): Contract {
    if (!this._panelNFT) {
      this._assertAddress('panelNFT');
      this._panelNFT = new Contract(this.addresses.panelNFT!, PANEL_NFT_ABI, this.runner);
    }
    return this._panelNFT;
  }

  get panelRegistry(): Contract {
    if (!this._panelRegistry) {
      this._assertAddress('panelRegistry');
      this._panelRegistry = new Contract(this.addresses.panelRegistry!, PANEL_REGISTRY_ABI, this.runner);
    }
    return this._panelRegistry;
  }

  get energyOracle(): Contract {
    if (!this._energyOracle) {
      this._assertAddress('energyOracle');
      this._energyOracle = new Contract(this.addresses.energyOracle!, ENERGY_ORACLE_ABI, this.runner);
    }
    return this._energyOracle;
  }

  get stakingVault(): Contract {
    if (!this._stakingVault) {
      this._assertAddress('stakingVault');
      this._stakingVault = new Contract(this.addresses.stakingVault!, STAKING_VAULT_ABI, this.runner);
    }
    return this._stakingVault;
  }

  get settlementEngine(): Contract {
    if (!this._settlementEngine) {
      this._assertAddress('settlementEngine');
      this._settlementEngine = new Contract(this.addresses.settlementEngine!, SETTLEMENT_ENGINE_ABI, this.runner);
    }
    return this._settlementEngine;
  }

  get governanceDAO(): Contract {
    if (!this._governanceDAO) {
      this._assertAddress('governanceDAO');
      this._governanceDAO = new Contract(this.addresses.governanceDAO!, GOVERNANCE_DAO_ABI, this.runner);
    }
    return this._governanceDAO;
  }

  // -------------------------------------------------------------------------
  // EnergyToken helpers
  // -------------------------------------------------------------------------

  /** Mint energy tokens to an address (requires owner signer). */
  async mint(to: string, amount: bigint): Promise<ContractTransactionResponse> {
    return this.energyToken.mint(to, amount) as Promise<ContractTransactionResponse>;
  }

  /** Get the available (unlocked) energy balance. */
  async getBalance(account: string): Promise<bigint> {
    return this.energyToken.getEnergyBalance(account) as Promise<bigint>;
  }

  /** Get the locked energy balance. */
  async getLockedBalance(account: string): Promise<bigint> {
    return this.energyToken.getLockedBalance(account) as Promise<bigint>;
  }

  // -------------------------------------------------------------------------
  // EnergyMarket helpers
  // -------------------------------------------------------------------------

  /** Fetch the full order book for a time slot. */
  async getOrderBook(timeSlot: bigint | number): Promise<OrderBook> {
    const slot = BigInt(timeSlot);
    const result = await this.energyMarket.getOrderBook(slot);
    return {
      bids: this._mapOrders(result.bids),
      asks: this._mapOrders(result.asks),
    };
  }

  /** Fetch auction state for a time slot. */
  async getAuction(timeSlot: bigint | number): Promise<Auction> {
    const slot = BigInt(timeSlot);
    const a = await this.energyMarket.getAuction(slot);
    return {
      timeSlot:         a.timeSlot,
      startTime:        a.startTime,
      endTime:          a.endTime,
      clearingPrice:    a.clearingPrice,
      totalBidQuantity: a.totalBidQuantity,
      totalAskQuantity: a.totalAskQuantity,
      isCleared:        a.isCleared,
    };
  }

  /** Get best bid (highest price in the order book). */
  async getBestBid(timeSlot: bigint | number): Promise<{ price: bigint; quantity: bigint }> {
    return this.energyMarket.getBestBid(BigInt(timeSlot)) as Promise<{ price: bigint; quantity: bigint }>;
  }

  /** Get best ask (lowest price in the order book). */
  async getBestAsk(timeSlot: bigint | number): Promise<{ price: bigint; quantity: bigint }> {
    return this.energyMarket.getBestAsk(BigInt(timeSlot)) as Promise<{ price: bigint; quantity: bigint }>;
  }

  /** Place a buy order and return the transaction. */
  async placeBid(
    timeSlot: bigint | number,
    price: bigint,
    quantity: bigint,
  ): Promise<ContractTransactionResponse> {
    return this.energyMarket.placeBid(
      BigInt(timeSlot),
      price,
      quantity,
    ) as Promise<ContractTransactionResponse>;
  }

  /** Place a sell order and return the transaction. */
  async placeAsk(
    timeSlot: bigint | number,
    price: bigint,
    quantity: bigint,
  ): Promise<ContractTransactionResponse> {
    return this.energyMarket.placeAsk(
      BigInt(timeSlot),
      price,
      quantity,
    ) as Promise<ContractTransactionResponse>;
  }

  /** Cancel an existing order. */
  async cancelOrder(orderId: bigint | number): Promise<ContractTransactionResponse> {
    return this.energyMarket.cancelOrder(BigInt(orderId)) as Promise<ContractTransactionResponse>;
  }

  /** Clear the auction for a time slot (owner only). Returns the clearing price. */
  async clearAuction(timeSlot: bigint | number): Promise<ContractTransactionResponse> {
    return this.energyMarket.clearAuction(BigInt(timeSlot)) as Promise<ContractTransactionResponse>;
  }

  // -------------------------------------------------------------------------
  // PanelNFT helpers
  // -------------------------------------------------------------------------

  /** Mint a new panel NFT. */
  async mintPanel(
    to: string,
    tokenId: bigint | number,
    capacityWatt: bigint | number,
  ): Promise<ContractTransactionResponse> {
    return this.panelNFT.mint(to, BigInt(tokenId), BigInt(capacityWatt)) as Promise<ContractTransactionResponse>;
  }

  /** Get the owner of a panel NFT. */
  async getPanelOwner(tokenId: bigint | number): Promise<string> {
    return this.panelNFT.ownerOf(BigInt(tokenId)) as Promise<string>;
  }

  // -------------------------------------------------------------------------
  // PanelRegistry helpers
  // -------------------------------------------------------------------------

  /** Register a panel in the registry. */
  async registerPanel(
    tokenId: bigint | number,
    owner: string,
    capacityWatt: bigint | number,
  ): Promise<ContractTransactionResponse> {
    return this.panelRegistry.registerPanel(
      BigInt(tokenId),
      owner,
      BigInt(capacityWatt),
    ) as Promise<ContractTransactionResponse>;
  }

  /** Get panel record from the registry. */
  async getPanelRecord(tokenId: bigint | number): Promise<PanelRecord> {
    const r = await this.panelRegistry.getPanelRecord(BigInt(tokenId));
    return {
      tokenId:              r.tokenId,
      owner:                r.owner,
      capacityWatt:         r.capacityWatt,
      totalEnergyProduced:  r.totalEnergyProduced,
      lastReportTimestamp:  r.lastReportTimestamp,
      isRegistered:         r.isRegistered,
    };
  }

  /** Get all registered panel IDs. */
  async getRegisteredPanels(): Promise<bigint[]> {
    return this.panelRegistry.getRegisteredPanels() as Promise<bigint[]>;
  }

  // -------------------------------------------------------------------------
  // EnergyOracle helpers
  // -------------------------------------------------------------------------

  /** Get production data for a time slot. */
  async getTimeSlotData(timeSlot: bigint | number): Promise<TimeSlotData> {
    const d = await this.energyOracle.getTimeSlotData(BigInt(timeSlot));
    return {
      startTime:   d.startTime,
      endTime:     d.endTime,
      totalEnergy: d.totalEnergy,
      finalized:   d.finalized,
    };
  }

  /** Get total energy produced in a slot. */
  async getTotalProduction(timeSlot: bigint | number): Promise<bigint> {
    return this.energyOracle.getTotalProductionInSlot(BigInt(timeSlot)) as Promise<bigint>;
  }

  // -------------------------------------------------------------------------
  // Utility: compute current time slot
  // -------------------------------------------------------------------------

  /** Returns the current hourly time slot (floored to the hour). */
  static currentTimeSlot(): bigint {
    const now = Math.floor(Date.now() / 1000);
    return BigInt(Math.floor(now / 3600) * 3600);
  }

  /** Returns the time slot for a specific Date. */
  static timeSlotFor(date: Date): bigint {
    const ts = Math.floor(date.getTime() / 1000);
    return BigInt(Math.floor(ts / 3600) * 3600);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private _assertAddress(key: keyof GridsetAddresses): void {
    const addr = this.addresses[key];
    if (!addr || addr.length < 20) {
      throw new Error(`[GridsetSDK] Missing contract address for "${key}". Pass it in the constructor.`);
    }
  }

  private _mapOrders(raw: unknown[]): Order[] {
    return raw.map((o: unknown) => {
      const order = o as Record<string, unknown>;
      return {
        orderId:       order.orderId       as bigint,
        trader:        order.trader        as string,
        isBid:         order.isBid         as boolean,
        price:         order.price         as bigint,
        quantity:      order.quantity      as bigint,
        filledQuantity: order.filledQuantity as bigint,
        timeSlot:      order.timeSlot      as bigint,
        isActive:      order.isActive      as boolean,
      };
    });
  }
}

// ---------------------------------------------------------------------------
// Named exports — ABIs are exported so integrators can build their own instances
// ---------------------------------------------------------------------------
export {
  ENERGY_TOKEN_ABI,
  ENERGY_MARKET_ABI,
  PANEL_NFT_ABI,
  PANEL_REGISTRY_ABI,
  ENERGY_ORACLE_ABI,
  STAKING_VAULT_ABI,
  SETTLEMENT_ENGINE_ABI,
  GOVERNANCE_DAO_ABI,
};

// ---------------------------------------------------------------------------
// Convenience factory
// ---------------------------------------------------------------------------

/**
 * Create a GridsetSDK instance from a browser wallet (ethers v6 BrowserProvider).
 *
 * @example
 * const sdk = await createSDKFromBrowser(window.ethereum, addresses);
 */
export async function createSDKFromBrowser(
  ethereum: unknown,
  addresses: GridsetAddresses,
): Promise<GridsetSDK> {
  const provider = new ethers.BrowserProvider(ethereum as Parameters<typeof ethers.BrowserProvider>[0]);
  const signer   = await provider.getSigner();
  return new GridsetSDK(signer, addresses);
}

/**
 * Create a read-only GridsetSDK instance from an RPC URL (no signer).
 *
 * @example
 * const sdk = createSDKFromRPC('https://sepolia.infura.io/v3/...', addresses);
 */
export function createSDKFromRPC(rpcUrl: string, addresses: GridsetAddresses): GridsetSDK {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new GridsetSDK(provider, addresses);
}

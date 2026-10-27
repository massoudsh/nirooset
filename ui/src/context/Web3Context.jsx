/**
 * Web3Context.jsx — Wallet connectivity and contract instances
 *
 * Issue #12: Multi-chain Support
 *
 * Uses getAddresses(chainId) so each network has its own set of
 * contract addresses loaded from environment variables.
 * Supports: Ethereum, Sepolia, OP Sepolia, Optimism, Arbitrum, Polygon.
 */

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from 'react';
import { ethers } from 'ethers';
import {
  getAddresses,
  hasAddressesForChain,
  ENERGY_TOKEN_ABI,
  ENERGY_MARKET_ABI,
  PANEL_REGISTRY_ABI,
  STAKING_VAULT_ABI,
  SETTLEMENT_ENGINE_ABI,
  GOVERNANCE_DAO_ABI,
  ENERGY_ORACLE_ABI,
  PANEL_NFT_ABI,
} from '../config/contracts';
import {
  isSupportedChain,
  getChainParams,
  SUPPORTED_CHAIN_IDS,
  getChain,
} from '../config/chains';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [account,   setAccount]   = useState(null);
  const [provider,  setProvider]  = useState(null);
  const [signer,    setSigner]    = useState(null);
  const [chainId,   setChainId]   = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // -------------------------------------------------------------------------
  // Contract instances — re-created whenever signer or chainId changes
  // -------------------------------------------------------------------------

  const contracts = useMemo(() => {
    const runner = signer ?? provider;
    if (!runner || !chainId) return null;

    const addrs = getAddresses(chainId);

    function makeContract(address, abi) {
      if (!address || address.length < 20) return null;
      try {
        return new ethers.Contract(address, abi, runner);
      } catch {
        return null;
      }
    }

    return {
      energyToken:      makeContract(addrs.energyToken,      ENERGY_TOKEN_ABI),
      energyMarket:     makeContract(addrs.energyMarket,     ENERGY_MARKET_ABI),
      panelNFT:         makeContract(addrs.panelNFT,         PANEL_NFT_ABI),
      panelRegistry:    makeContract(addrs.panelRegistry,    PANEL_REGISTRY_ABI),
      stakingVault:     makeContract(addrs.stakingVault,     STAKING_VAULT_ABI),
      energyOracle:     makeContract(addrs.energyOracle,     ENERGY_ORACLE_ABI),
      settlementEngine: makeContract(addrs.settlementEngine, SETTLEMENT_ENGINE_ABI),
      governanceDAO:    makeContract(addrs.governanceDAO,    GOVERNANCE_DAO_ABI),
    };
  }, [signer, provider, chainId]);

  // -------------------------------------------------------------------------
  // Connect wallet
  // -------------------------------------------------------------------------

  const connectWallet = useCallback(async () => {
    try {
      const eth = window.ethereum;
      if (!eth) {
        alert('No Web3 wallet detected. Please install MetaMask or a compatible wallet.');
        return;
      }
      if (typeof eth.on !== 'function' || typeof eth.removeListener !== 'function') {
        throw new TypeError('Wallet event subscriptions are unavailable.');
      }
      const accounts = await eth.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(eth);
      const _signer   = await _provider.getSigner();
      const network   = await _provider.getNetwork();
      const _chainId  = Number(network.chainId);

      setAccount(accounts[0]);
      setProvider(_provider);
      setSigner(_signer);
      setChainId(_chainId);
      setIsConnected(true);
    } catch (e) {
      console.error('connectWallet:', e);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Disconnect wallet
  // -------------------------------------------------------------------------

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setIsConnected(false);
  }, []);

  // -------------------------------------------------------------------------
  // Switch chain
  // -------------------------------------------------------------------------

  const switchChain = useCallback(async (targetChainId) => {
    let eth;
    try {
      eth = window.ethereum;
      if (!eth) return;
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError) {
      // Chain not added to wallet — try adding it
      if (switchError.code === 4902) {
        const params = getChainParams(targetChainId);
        if (params) {
          try {
            await eth.request({ method: 'wallet_addEthereumChain', params: [params] });
          } catch (addError) {
            console.error('Failed to add chain:', addError);
          }
        }
      } else {
        console.error('Failed to switch chain:', switchError);
      }
    }
  }, []);

  // -------------------------------------------------------------------------
  // Computed helpers
  // -------------------------------------------------------------------------

  const currentChain     = chainId ? getChain(chainId) : null;
  const isChainSupported = chainId ? isSupportedChain(chainId) : false;
  const hasContracts     = chainId ? hasAddressesForChain(chainId) : false;

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------

  const value = useMemo(() => ({
    account,
    provider,
    signer,
    chainId,
    isConnected,
    contracts,
    currentChain,
    isChainSupported,
    hasContracts,
    supportedChainIds: SUPPORTED_CHAIN_IDS,
    getChain,
    isSupportedChain,
    connectWallet,
    disconnectWallet,
    switchChain,
  }), [
    account,
    provider,
    signer,
    chainId,
    isConnected,
    contracts,
    currentChain,
    isChainSupported,
    hasContracts,
    connectWallet,
    disconnectWallet,
    switchChain,
  ]);

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) {
    throw new Error('useWeb3 must be used inside <Web3Provider>');
  }
  return ctx;
}

/**
 * GRIDSET SDK – client for GRIDSET protocol contracts.
 * Usage: import { getContracts } from 'gridset-sdk'; const c = getContracts(provider, addresses);
 * Requires ethers ^6.
 */
import { Contract } from 'ethers'
import { energyTokenAbi, energyMarketAbi, stakingVaultAbi } from './abis.js'

/**
 * @param {import('ethers').Provider|import('ethers').Signer} providerOrSigner - ethers v6 Provider or Signer
 * @param {{ energyToken?: string, energyMarket?: string, stakingVault?: string }} addresses - contract addresses (omit or '' to skip)
 * @returns {{ energyToken: Contract|null, energyMarket: Contract|null, stakingVault: Contract|null }}
 */
export function getContracts(providerOrSigner, addresses = {}) {
  const out = { energyToken: null, energyMarket: null, stakingVault: null }
  if (!providerOrSigner) return out
  const a = addresses
  if (a.energyToken && a.energyToken.startsWith('0x') && a.energyToken.length >= 40) {
    out.energyToken = new Contract(a.energyToken, energyTokenAbi, providerOrSigner)
  }
  if (a.energyMarket && a.energyMarket.startsWith('0x') && a.energyMarket.length >= 40) {
    out.energyMarket = new Contract(a.energyMarket, energyMarketAbi, providerOrSigner)
  }
  if (a.stakingVault && a.stakingVault.startsWith('0x') && a.stakingVault.length >= 40) {
    out.stakingVault = new Contract(a.stakingVault, stakingVaultAbi, providerOrSigner)
  }
  return out
}

export { energyTokenAbi, energyMarketAbi, stakingVaultAbi } from './abis.js'

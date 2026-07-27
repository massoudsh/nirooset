import { useWeb3 } from '../context/Web3Context'
import { getChain } from '../config/chains'

export default function TestnetBanner() {
  const { chainId, isConnected } = useWeb3()
  const chain = getChain(chainId)
  const testnet = chain?.isTestnet

  if (!isConnected || !testnet) return null

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
      <span className="text-amber-200 font-medium">Testnet: {chain.name} (Chain ID {chainId})</span>
      {chain.faucet && (
      <a
        href={chain.faucet}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-300 hover:text-amber-100 underline"
      >
        Get test ETH
      </a>
      )}
      <span className="text-gray-400">·</span>
      <span className="text-gray-400">Set contract addresses in Settings to use the app</span>
    </div>
  )
}

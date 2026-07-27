import { Wallet } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'

export default function CollectWalletCTA({ variant = 'inline', message }) {
  const { isConnected, connectWallet } = useWeb3()

  if (isConnected) return null

  const defaultMessage = 'Connect your wallet to execute this on-chain and trade for real.'
  const text = message ?? defaultMessage

  if (variant === 'banner') {
    return (
      <div className="rounded-xl border border-energy-green/50 bg-energy-green/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-energy-green font-medium">{text}</p>
        <button
          type="button"
          onClick={connectWallet}
          className="btn-primary shrink-0 flex items-center gap-2"
        >
          <Wallet className="w-5 h-5" />
          Connect wallet
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-energy-blue/40 bg-energy-blue/10 p-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-energy-blue text-sm">{text}</p>
      <button
        type="button"
        onClick={connectWallet}
        className="btn-primary text-sm py-2 px-4 flex items-center gap-2 shrink-0"
      >
        <Wallet className="w-4 h-4" />
        Connect wallet
      </button>
    </div>
  )
}

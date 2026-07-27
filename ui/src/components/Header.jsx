import { useState } from 'react'
import { Menu, Zap, Wallet, ChevronDown, ShoppingCart } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'
import { useCart } from '../context/CartContext'

export default function Header({ sidebarOpen, setSidebarOpen, setCartOpen }) {
  const { account, isConnected, connectWallet, disconnectWallet, chainId, switchChain, isSupportedChain, getChain, supportedChainIds } = useWeb3()
  const { cartCount } = useCart()
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false)

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const currentChain = getChain(chainId)
  const chainLabel = currentChain ? currentChain.name : chainId ? `Chain ${chainId}` : null

  return (
    <header className="bg-slate-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-energy-green" />
            <h1 className="text-2xl font-bold text-white">GRIDSET Protocol</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {setCartOpen && (
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-700 text-gray-300 hover:text-white"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[1.25rem] h-5 px-1 flex items-center justify-center bg-energy-green text-white text-xs font-bold rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}
          {isConnected ? (
            <>
              {chainId != null && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setChainDropdownOpen((o) => !o)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      isSupportedChain(chainId)
                        ? 'border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {chainLabel || `Chain ${chainId}`}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {chainDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setChainDropdownOpen(false)} aria-hidden="true" />
                      <div className="absolute right-0 mt-1 py-1 w-48 bg-slate-800 border border-gray-700 rounded-lg shadow-xl z-50">
                        {supportedChainIds.map((id) => {
                          const c = getChain(id)
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => { switchChain(id); setChainDropdownOpen(false) }}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${chainId === id ? 'text-energy-green' : 'text-gray-200'}`}
                            >
                              {c?.name || `Chain ${id}`}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              {chainId != null && !isSupportedChain(chainId) && (
                <span className="text-amber-400 text-xs">Switch to a supported network</span>
              )}
              <div className="flex items-center gap-2 px-4 py-2 bg-energy-green/20 border border-energy-green rounded-lg">
                <div className="w-2 h-2 bg-energy-green rounded-full animate-pulse"></div>
                <span className="text-energy-green font-medium">{formatAddress(account)}</span>
              </div>
              <button
                type="button"
                onClick={disconnectWallet}
                className="btn-secondary"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={connectWallet}
              className="btn-primary flex items-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

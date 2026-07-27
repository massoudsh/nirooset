import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { Wallet, Lock, Unlock, Send, ArrowRightLeft, RefreshCw } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'
import { useDemo } from '../../context/DemoContext'
import TransferConfirmModal from '../TransferConfirmModal'

export default function EnergyWallet() {
  const { isConnected, account, contracts } = useWeb3()
  const { isDemoMode, demoBalance, demoTransactions, demoTransfer } = useDemo()
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [balance, setBalance] = useState({ total: 0, available: 0, locked: 0 })
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchBalance = useCallback(() => {
    if (!contracts?.energyToken || !account) return
    setBalanceLoading(true)
    contracts.energyToken
      .getEnergyBalance(account)
      .then((b) =>
        setBalance({
          total: Number(ethers.formatEther(b.total)),
          available: Number(ethers.formatEther(b.available)),
          locked: Number(ethers.formatEther(b.locked)),
        })
      )
      .catch(() => setBalance({ total: 0, available: 0, locked: 0 }))
      .finally(() => setBalanceLoading(false))
  }, [contracts?.energyToken, account])

  useEffect(() => {
    if (!contracts?.energyToken || !account) {
      setBalance({ total: 0, available: 0, locked: 0 })
      return
    }
    let cancelled = false
    setBalanceLoading(true)
    contracts.energyToken
      .getEnergyBalance(account)
      .then((b) => {
        if (!cancelled)
          setBalance({
            total: Number(ethers.formatEther(b.total)),
            available: Number(ethers.formatEther(b.available)),
            locked: Number(ethers.formatEther(b.locked)),
          })
      })
      .catch(() => {
        if (!cancelled) setBalance({ total: 0, available: 0, locked: 0 })
      })
      .finally(() => {
        if (!cancelled) setBalanceLoading(false)
      })
    return () => { cancelled = true }
  }, [contracts?.energyToken, account, refreshKey])

  useEffect(() => {
    if (!contracts?.energyToken || !account) return
    const id = setInterval(fetchBalance, 30_000)
    return () => clearInterval(id)
  }, [fetchBalance])

  const displayBalance = isDemoMode
    ? demoBalance
    : contracts?.energyToken
      ? balance
      : { total: 1250.5, available: 980.3, locked: 270.2 }

  const transactions = isDemoMode ? demoTransactions : [
    {
      type: 'transfer',
      amount: 50.0,
      to: '0x742d...35Cc',
      timestamp: '2 hours ago',
      status: 'completed',
    },
    {
      type: 'mint',
      amount: 200.0,
      from: 'Settlement',
      timestamp: '1 day ago',
      status: 'completed',
    },
    {
      type: 'lock',
      amount: 100.0,
      reason: 'Market Order',
      timestamp: '2 days ago',
      status: 'completed',
    },
  ]

  const validateAndOpenConfirm = () => {
    if (!transferTo.trim() || !transferAmount) {
      alert('Enter recipient and amount')
      return
    }
    const amt = parseFloat(transferAmount)
    if (isDemoMode && amt > demoBalance.available) {
      alert('Insufficient available balance')
      return
    }
    if (!isConnected && !isDemoMode) {
      alert('Please connect your wallet first')
      return
    }
    setConfirmOpen(true)
  }

  const executeTransfer = async () => {
    if (isDemoMode) {
      demoTransfer(transferAmount, transferTo.trim())
      setTransferTo('')
      setTransferAmount('')
      return
    }
    if (contracts?.energyToken && transferTo && transferAmount) {
      try {
        const tx = await contracts.energyToken.transfer(transferTo, ethers.parseEther(String(transferAmount)))
        await tx.wait()
        fetchBalance()
        setTransferTo('')
        setTransferAmount('')
      } catch (e) {
        alert('Transfer failed: ' + (e.message || e))
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Energy Wallet</h2>
          <p className="text-gray-400">Manage your energy token balances</p>
        </div>
        {contracts?.energyToken && account && (
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50"
            title="Refresh balance"
            aria-label="Refresh balance"
            disabled={balanceLoading}
          >
            <RefreshCw className={`w-5 h-5 ${balanceLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      <TransferConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={executeTransfer}
        recipient={transferTo}
        amount={transferAmount}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-6 h-6 text-energy-green" />
            <h3 className="text-gray-400">Total Balance</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {balanceLoading ? '…' : displayBalance.total.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm mt-1">kWh</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3 mb-4">
            <Unlock className="w-6 h-6 text-energy-blue" />
            <h3 className="text-gray-400">Available</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {balanceLoading ? '…' : displayBalance.available.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm mt-1">kWh</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-6 h-6 text-energy-yellow" />
            <h3 className="text-gray-400">Locked</h3>
          </div>
          <p className="text-3xl font-bold text-white">
            {balanceLoading ? '…' : displayBalance.locked.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm mt-1">kWh</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Transfer Energy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Recipient Address</label>
              <input
                type="text"
                value={transferTo}
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Amount (kWh)</label>
              <input
                type="number"
                step="0.1"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.0"
                className="input-field w-full"
              />
            </div>
            {transferAmount && (
              <div className="p-3 bg-gray-800 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Available Balance</span>
                  <span className="text-white font-semibold">{displayBalance.available.toFixed(2)} kWh</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={validateAndOpenConfirm}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Transfer
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.type === 'transfer' ? 'bg-energy-blue/20' :
                    tx.type === 'mint' ? 'bg-energy-green/20' :
                    'bg-energy-yellow/20'
                  }`}>
                    <ArrowRightLeft className={`w-4 h-4 ${
                      tx.type === 'transfer' ? 'text-energy-blue' :
                      tx.type === 'mint' ? 'text-energy-green' :
                      'text-energy-yellow'
                    }`} />
                  </div>
                  <div>
                    <div className="text-white font-semibold capitalize">{tx.type}</div>
                    <div className="text-sm text-gray-400">
                      {tx.to || tx.from || tx.reason} • {tx.timestamp}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    tx.type === 'mint' ? 'text-energy-green' : 'text-white'
                  }`}>
                    {tx.type === 'mint' ? '+' : '-'}{tx.amount} kWh
                  </div>
                  <div className="text-sm text-energy-green">{tx.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

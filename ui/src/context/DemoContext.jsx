import { createContext, useContext, useState, useCallback } from 'react'
import { useWeb3 } from './Web3Context'

const DEMO_INITIAL_BALANCE = { total: 10000, available: 8000, locked: 2000 }

const DemoContext = createContext()

export function DemoProvider({ children }) {
  const { isConnected } = useWeb3()
  const [demoBalance, setDemoBalance] = useState(DEMO_INITIAL_BALANCE)
  const [demoTransactions, setDemoTransactions] = useState([
    { type: 'mint', amount: 2000, from: 'Faucet', timestamp: 'Just now', status: 'completed' },
    { type: 'transfer', amount: 50, to: '0x742d...35Cc', timestamp: '2 hours ago', status: 'completed' },
    { type: 'lock', amount: 100, reason: 'Market Order', timestamp: '2 days ago', status: 'completed' },
  ])
  const [demoOrders, setDemoOrders] = useState([])

  const isDemoMode = !isConnected

  const addDemoTransaction = useCallback((tx) => {
    setDemoTransactions((prev) => [{ ...tx, timestamp: 'Just now', status: 'completed' }, ...prev])
  }, [])

  const demoTransfer = useCallback((amount, to) => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return false
    setDemoBalance((b) => {
      const available = b.available - amt
      if (available < 0) return b
      addDemoTransaction({ type: 'transfer', amount: amt, to })
      return { ...b, total: b.total - amt, available }
    })
    return true
  }, [addDemoTransaction])

  const addDemoOrder = useCallback((order) => {
    const amt = parseFloat(order.quantity) || 0
    const pr = parseFloat(order.price) || 0
    const slot = order.timeSlot || '—'
    const newOrder = { id: Date.now(), type: order.type, price: pr, quantity: amt, timeSlot: slot }
    if (order.type === 'bid' && amt > 0 && pr > 0) {
      const cost = amt * pr
      setDemoBalance((b) => {
        if (b.available < cost) return b
        return { ...b, available: b.available - cost, locked: b.locked + cost }
      })
      addDemoTransaction({ type: 'lock', amount: cost, reason: `Bid slot ${slot}` })
    }
    if (order.type === 'ask' && amt > 0) setDemoOrders((prev) => [...prev, { ...newOrder }])
    else if (order.type === 'bid' && amt > 0) setDemoOrders((prev) => [...prev, newOrder])
  }, [addDemoTransaction])

  const resetDemo = useCallback(() => {
    setDemoBalance(DEMO_INITIAL_BALANCE)
    setDemoTransactions([
      { type: 'mint', amount: 2000, from: 'Faucet', timestamp: 'Just now', status: 'completed' },
      { type: 'transfer', amount: 50, to: '0x742d...35Cc', timestamp: '2 hours ago', status: 'completed' },
      { type: 'lock', amount: 100, reason: 'Market Order', timestamp: '2 days ago', status: 'completed' },
    ])
    setDemoOrders([])
  }, [])

  const value = {
    isDemoMode,
    demoBalance,
    demoTransactions,
    demoOrders,
    setDemoBalance,
    addDemoTransaction,
    demoTransfer,
    addDemoOrder,
    resetDemo,
  }

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}

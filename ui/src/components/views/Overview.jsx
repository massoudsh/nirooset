import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Zap, TrendingUp, Sun, DollarSign, Clock, Activity, Sparkles, X } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useWeb3 } from '../../context/Web3Context'
import { useDemo } from '../../context/DemoContext'

const mockEnergyData = [
  { time: '00:00', production: 120, consumption: 80, price: 0.05 },
  { time: '04:00', production: 100, consumption: 70, price: 0.04 },
  { time: '08:00', production: 350, consumption: 150, price: 0.06 },
  { time: '12:00', production: 500, consumption: 200, price: 0.08 },
  { time: '16:00', production: 450, consumption: 180, price: 0.07 },
  { time: '20:00', production: 200, consumption: 120, price: 0.05 },
]

const mockPriceData = [
  { time: '00:00', price: 0.05 },
  { time: '04:00', price: 0.04 },
  { time: '08:00', price: 0.06 },
  { time: '12:00', price: 0.08 },
  { time: '16:00', price: 0.07 },
  { time: '20:00', price: 0.05 },
]

const DEFAULT_SLOT_FOR_PRICE = 1000

const ONBOARDING_DISMISSED_KEY = 'gridset-onboarding-dismissed'

export default function Overview({ setActiveView }) {
  const { account, contracts } = useWeb3()
  const { isDemoMode } = useDemo()
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    try { return localStorage.getItem(ONBOARDING_DISMISSED_KEY) === '1' } catch { return false }
  })
  const [chainMetrics, setChainMetrics] = useState({
    totalSupply: null,
    totalStaked: null,
    registeredPanelsCount: null,
    lastClearingPrice: null,
  })
  const [metricsLoading, setMetricsLoading] = useState(false)

  useEffect(() => {
    const hasAny = contracts?.energyToken || contracts?.stakingVault || contracts?.panelRegistry || contracts?.energyMarket
    if (!hasAny) {
      setChainMetrics({ totalSupply: null, totalStaked: null, registeredPanelsCount: null, lastClearingPrice: null })
      return
    }
    let cancelled = false
    setMetricsLoading(true)
    const load = async () => {
      try {
        const [supply, staked, panels, auction] = await Promise.all([
          contracts.energyToken ? contracts.energyToken.totalSupply() : Promise.resolve(null),
          contracts.stakingVault ? contracts.stakingVault.getTotalStaked() : Promise.resolve(null),
          contracts.panelRegistry ? contracts.panelRegistry.getRegisteredPanels().then((arr) => (arr?.length ?? 0)) : Promise.resolve(null),
          contracts.energyMarket ? contracts.energyMarket.getAuction(DEFAULT_SLOT_FOR_PRICE).catch(() => null) : Promise.resolve(null),
        ])
        if (cancelled) return
        let clearingPrice = null
        if (auction?.isCleared && auction?.clearingPrice != null) {
          const raw = Number(auction.clearingPrice)
          clearingPrice = raw >= 1e10 ? Number(ethers.formatEther(auction.clearingPrice)) : raw
        }
        setChainMetrics({
          totalSupply: supply != null ? Number(ethers.formatEther(supply)) : null,
          totalStaked: staked != null ? Number(ethers.formatEther(staked)) : null,
          registeredPanelsCount: panels != null ? panels : null,
          lastClearingPrice: clearingPrice,
        })
      } catch {
        if (!cancelled) setChainMetrics({ totalSupply: null, totalStaked: null, registeredPanelsCount: null, lastClearingPrice: null })
      } finally {
        if (!cancelled) setMetricsLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [contracts?.energyToken, contracts?.stakingVault, contracts?.panelRegistry, contracts?.energyMarket])

  const formatMetric = (n) => (n == null ? null : n >= 1e6 ? `${(n / 1e6).toFixed(2)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(2)}K` : n.toFixed(2))

  const metrics = [
    {
      title: 'Total Supply (GRID)',
      value: chainMetrics.totalSupply != null ? `${formatMetric(chainMetrics.totalSupply)}` : '—',
      change: chainMetrics.totalSupply != null ? 'Live' : null,
      icon: Zap,
      color: 'text-energy-green',
      bgColor: 'bg-energy-green/20',
    },
    {
      title: 'Last Clearing Price',
      value: chainMetrics.lastClearingPrice != null ? `${chainMetrics.lastClearingPrice} (slot #${DEFAULT_SLOT_FOR_PRICE})` : '—',
      change: chainMetrics.lastClearingPrice != null ? 'Live' : null,
      icon: TrendingUp,
      color: 'text-energy-blue',
      bgColor: 'bg-energy-blue/20',
    },
    {
      title: 'Registered Panels',
      value: chainMetrics.registeredPanelsCount != null ? String(chainMetrics.registeredPanelsCount) : '—',
      change: chainMetrics.registeredPanelsCount != null ? 'Live' : null,
      icon: Sun,
      color: 'text-energy-yellow',
      bgColor: 'bg-energy-yellow/20',
    },
    {
      title: 'Total Staked (GRID)',
      value: chainMetrics.totalStaked != null ? `${formatMetric(chainMetrics.totalStaked)}` : '—',
      change: chainMetrics.totalStaked != null ? 'Live' : null,
      icon: DollarSign,
      color: 'text-energy-orange',
      bgColor: 'bg-energy-orange/20',
    },
  ]

  const dismissOnboarding = () => {
    setOnboardingDismissed(true)
    try { localStorage.setItem(ONBOARDING_DISMISSED_KEY, '1') } catch {}
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Energy Dashboard</h2>
        <p className="text-gray-400">Real-time overview of the GRIDSET Protocol</p>
      </div>

      {isDemoMode && !onboardingDismissed && (
        <div className="card bg-energy-green/10 border-energy-green/30 relative">
          <button
            type="button"
            onClick={dismissOnboarding}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex gap-4">
            <div className="p-3 rounded-lg bg-energy-green/20 shrink-0">
              <Sparkles className="w-8 h-8 text-energy-green" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Welcome — you’re in demo mode</h3>
              <p className="text-gray-300 text-sm mb-3">
                Try the app without a wallet. Your balance and orders are simulated. When you’re ready, connect a wallet for testnet or mainnet.
              </p>
              <ul className="text-sm text-gray-400 space-y-1 mb-4">
                <li>• <button type="button" onClick={() => setActiveView?.('market')} className="text-energy-green hover:underline">Energy Market</button> — place a bid or ask (use “Place order (demo)” and confirm)</li>
                <li>• <button type="button" onClick={() => setActiveView?.('wallet')} className="text-energy-green hover:underline">Energy Wallet</button> — view balance and send GRID</li>
                <li>• <button type="button" onClick={() => setActiveView?.('utilities')} className="text-energy-green hover:underline">Utilities</button> — browse products and add to cart</li>
              </ul>
              <p className="text-xs text-gray-500">Connect your wallet in the header when you’re ready for real chains.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="metric-card">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                {metricsLoading ? <span className="text-gray-500 text-sm">…</span> : metric.change && <span className="text-energy-green text-sm font-semibold">{metric.change}</span>}
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{metric.title}</h3>
              <p className="text-2xl font-bold text-white">{metricsLoading && metric.value === '—' ? '…' : metric.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Energy Production & Consumption</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockEnergyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="production" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                name="Production (kWh)"
              />
              <Area 
                type="monotone" 
                dataKey="consumption" 
                stroke="#f97316" 
                fill="#f97316" 
                fillOpacity={0.3}
                name="Consumption (kWh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Energy Price Trend</h3>
            <TrendingUp className="w-5 h-5 text-energy-green" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockPriceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${value}/kWh`, 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Current Time Slot</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Slot ID</span>
              <span className="text-white font-semibold">#12,458</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-energy-green font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Ends In</span>
              <span className="text-white font-semibold">23:45</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-energy-green rounded-full"></div>
              <span className="text-gray-300 text-sm">Settlement completed for slot #12,457</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-energy-blue rounded-full"></div>
              <span className="text-gray-300 text-sm">New panel registered: #342</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-energy-yellow rounded-full"></div>
              <span className="text-gray-300 text-sm">Auction cleared at $0.067/kWh</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveView?.('market')}
              className="w-full btn-primary text-left"
            >
              Place Market Order
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('panels')}
              className="w-full btn-secondary text-left"
            >
              Register Panel
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('settlement')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-left"
            >
              View Settlement
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('utilities')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-left"
            >
              Green Energy Utilities
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Sun, Zap, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'
import { useDemo } from '../../context/DemoContext'
import ConfirmActionModal from '../ConfirmActionModal'

export default function PanelRegistry({ setActiveView }) {
  const { isConnected } = useWeb3()
  const { isDemoMode } = useDemo()
  const [showRegister, setShowRegister] = useState(false)
  const [registerConfirmOpen, setRegisterConfirmOpen] = useState(false)
  const [capacity, setCapacity] = useState('')
  const [location, setLocation] = useState('')
  const [installDate, setInstallDate] = useState('')
  const [metadataUri, setMetadataUri] = useState('')

  const mockPanels = [
    {
      id: 1,
      capacity: 5.2,
      location: 'San Francisco, CA',
      installed: '2024-01-15',
      production: 4.8,
      efficiency: 92.3,
      status: 'active',
    },
    {
      id: 2,
      capacity: 3.5,
      location: 'Los Angeles, CA',
      installed: '2024-02-20',
      production: 3.2,
      efficiency: 91.4,
      status: 'active',
    },
    {
      id: 3,
      capacity: 7.8,
      location: 'San Diego, CA',
      installed: '2023-12-10',
      production: 7.1,
      efficiency: 91.0,
      status: 'active',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Panel Registry</h2>
          <p className="text-gray-400">Manage your energy production panels</p>
        </div>
        {(isConnected || isDemoMode) && (
          <button
            type="button"
            onClick={() => setShowRegister(!showRegister)}
            className="btn-primary"
          >
            {isDemoMode ? 'Register panel (demo)' : 'Register New Panel'}
          </button>
        )}
      </div>

      {showRegister && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Register New Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Panel Capacity (kW)</label>
              <input
                type="number"
                step="0.1"
                placeholder="5.0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Location</label>
              <input
                type="text"
                placeholder="City, State"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Installation Date</label>
              <input
                type="date"
                value={installDate}
                onChange={(e) => setInstallDate(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Metadata URI</label>
              <input
                type="text"
                placeholder="ipfs://..."
                value={metadataUri}
                onChange={(e) => setMetadataUri(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                if (!capacity.trim()) {
                  alert('Enter panel capacity')
                  return
                }
                setRegisterConfirmOpen(true)
              }}
              className="btn-primary"
            >
              Register Panel
            </button>
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={registerConfirmOpen}
        onClose={() => setRegisterConfirmOpen(false)}
        onConfirm={() => {
          if (isDemoMode) alert(`Demo: Panel registered (${capacity} kW, ${location || '—'}). Connect wallet to register on-chain.`)
          setCapacity('')
          setLocation('')
          setInstallDate('')
          setMetadataUri('')
          setShowRegister(false)
        }}
        title="Confirm panel registration"
      >
        <p className="text-gray-400 text-sm mb-1">Capacity</p>
        <p className="text-white font-semibold">{capacity || '—'} kW</p>
        <p className="text-gray-400 text-sm mt-2 mb-1">Location</p>
        <p className="text-white font-semibold">{location || '—'}</p>
        <p className="text-gray-400 text-sm mt-2 mb-1">Installation date</p>
        <p className="text-white font-semibold">{installDate || '—'}</p>
        {metadataUri && (
          <>
            <p className="text-gray-400 text-sm mt-2 mb-1">Metadata URI</p>
            <p className="text-white font-mono text-sm truncate">{metadataUri}</p>
          </>
        )}
      </ConfirmActionModal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-2">
            <Sun className="w-5 h-5 text-energy-green" />
            <h3 className="text-gray-400 text-sm">Total Panels</h3>
          </div>
          <p className="text-2xl font-bold text-white">{mockPanels.length}</p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-energy-yellow" />
            <h3 className="text-gray-400 text-sm">Total Capacity</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {mockPanels.reduce((sum, p) => sum + p.capacity, 0).toFixed(1)} kW
          </p>
        </div>
        <div className="metric-card">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-energy-blue" />
            <h3 className="text-gray-400 text-sm">Avg Efficiency</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {(mockPanels.reduce((sum, p) => sum + p.efficiency, 0) / mockPanels.length).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPanels.map((panel) => (
          <div key={panel.id} className="card hover:border-energy-green transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-energy-green/20 rounded-lg">
                  <Sun className="w-6 h-6 text-energy-green" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Panel #{panel.id}</h3>
                  <span className="text-energy-green text-sm">Active</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-energy-yellow" />
                <span className="text-gray-400">Capacity:</span>
                <span className="text-white font-semibold">{panel.capacity} kW</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-energy-blue" />
                <span className="text-gray-400">Production:</span>
                <span className="text-white font-semibold">{panel.production} kW</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">{panel.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">Installed: {panel.installed}</span>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Efficiency</span>
                  <span className="text-energy-green font-semibold">{panel.efficiency}%</span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-energy-green h-2 rounded-full"
                    style={{ width: `${panel.efficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveView?.('panels')}
                className="flex-1 btn-secondary text-sm"
              >
                View Details
              </button>
              <button
                type="button"
                onClick={() => setActiveView?.('wallet')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Transfer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

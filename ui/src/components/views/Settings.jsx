import { Settings as SettingsIcon, Network, Wallet, Bell } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'

export default function Settings() {
  const { isConnected, chainId, account, contractAddresses, hasContractAddresses } = useWeb3()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">Configure your GRIDSET Protocol preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Network className="w-5 h-5 text-energy-green" />
            <h3 className="text-xl font-semibold text-white">Network Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Current Network</label>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-white">
                  {chainId ? `Chain ID: ${chainId}` : 'Not Connected'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">RPC Endpoint</label>
              <input
                type="text"
                placeholder="https://..."
                className="input-field w-full"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="w-5 h-5 text-energy-blue" />
            <h3 className="text-xl font-semibold text-white">Wallet Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Connected Address</label>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-white">
                  {account || 'Not Connected'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Contract Addresses (from .env)</label>
              {!hasContractAddresses && (
                <p className="text-amber-500/90 text-sm mb-2">Set VITE_*_ADDRESS in ui/.env — see ui/.env.example</p>
              )}
              <div className="space-y-2">
                <input readOnly value={contractAddresses?.energyToken || ''} placeholder="EnergyToken" className="input-field w-full text-sm bg-gray-800/80" />
                <input readOnly value={contractAddresses?.energyMarket || ''} placeholder="EnergyMarket" className="input-field w-full text-sm bg-gray-800/80" />
                <input readOnly value={contractAddresses?.panelRegistry || ''} placeholder="PanelRegistry" className="input-field w-full text-sm bg-gray-800/80" />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-energy-yellow" />
            <h3 className="text-xl font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Settlement Notifications</span>
              <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Market Price Alerts</span>
              <input type="checkbox" className="w-5 h-5 rounded" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Proposal Updates</span>
              <input type="checkbox" className="w-5 h-5 rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">Staking Reminders</span>
              <input type="checkbox" className="w-5 h-5 rounded" />
            </label>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-5 h-5 text-energy-orange" />
            <h3 className="text-xl font-semibold text-white">Display Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Theme</label>
              <select className="input-field w-full">
                <option>Dark (Default)</option>
                <option>Light</option>
                <option>Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Time Zone</label>
              <select className="input-field w-full">
                <option>UTC</option>
                <option>EST</option>
                <option>PST</option>
                <option>GMT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Refresh Interval</label>
              <select className="input-field w-full">
                <option>30 seconds</option>
                <option>1 minute</option>
                <option>5 minutes</option>
                <option>Manual</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">About GRIDSET Protocol</h3>
        <div className="space-y-3 text-gray-300">
          <p>
            GRIDSET is a market-based energy and compute settlement system that enables financial settlement
            of energy obligations through blockchain infrastructure.
          </p>
          <p className="text-sm text-gray-400">
            Version 1.0.0 • Built with React & Vite
          </p>
        </div>
      </div>
    </div>
  )
}

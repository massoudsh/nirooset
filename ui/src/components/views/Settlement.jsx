import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'

export default function Settlement() {
  const { isConnected } = useWeb3()

  const mockSettlements = [
    {
      slotId: 12457,
      status: 'completed',
      netPosition: 45.2,
      payment: 3.03,
      timestamp: '2 hours ago',
    },
    {
      slotId: 12456,
      status: 'completed',
      netPosition: -32.1,
      payment: -2.15,
      timestamp: '1 day ago',
    },
    {
      slotId: 12455,
      status: 'pending',
      netPosition: 0,
      payment: 0,
      timestamp: 'Processing...',
    },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-energy-green" />
      case 'pending':
        return <Clock className="w-5 h-5 text-energy-yellow" />
      default:
        return <AlertCircle className="w-5 h-5 text-red-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Settlement Engine</h2>
        <p className="text-gray-400">View settlement records and financial positions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="metric-card">
          <h3 className="text-gray-400 text-sm mb-2">Total Settled</h3>
          <p className="text-2xl font-bold text-white">1,247</p>
          <p className="text-gray-400 text-xs mt-1">Time Slots</p>
        </div>
        <div className="metric-card">
          <h3 className="text-gray-400 text-sm mb-2">Net Position</h3>
          <p className="text-2xl font-bold text-energy-green">+13.1 kWh</p>
          <p className="text-gray-400 text-xs mt-1">Last 7 days</p>
        </div>
        <div className="metric-card">
          <h3 className="text-gray-400 text-sm mb-2">Total Payments</h3>
          <p className="text-2xl font-bold text-energy-blue">$0.88</p>
          <p className="text-gray-400 text-xs mt-1">Last 7 days</p>
        </div>
        <div className="metric-card">
          <h3 className="text-gray-400 text-sm mb-2">Pending</h3>
          <p className="text-2xl font-bold text-energy-yellow">1</p>
          <p className="text-gray-400 text-xs mt-1">Settlements</p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-white mb-4">Settlement History</h3>
        <div className="space-y-3">
          {mockSettlements.map((settlement) => (
            <div
              key={settlement.slotId}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-4">
                {getStatusIcon(settlement.status)}
                <div>
                  <div className="text-white font-semibold">Time Slot #{settlement.slotId}</div>
                  <div className="text-sm text-gray-400">{settlement.timestamp}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Net Position</div>
                  <div className={`font-semibold ${
                    settlement.netPosition >= 0 ? 'text-energy-green' : 'text-red-400'
                  }`}>
                    {settlement.netPosition >= 0 ? '+' : ''}{settlement.netPosition} kWh
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Payment</div>
                  <div className={`font-semibold ${
                    settlement.payment >= 0 ? 'text-energy-green' : 'text-red-400'
                  }`}>
                    {settlement.payment >= 0 ? '+' : ''}${Math.abs(settlement.payment).toFixed(2)}
                  </div>
                </div>
                <button type="button" className="btn-secondary text-sm">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Current Time Slot</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Slot ID</span>
              <span className="text-white font-semibold">#12,458</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-energy-yellow font-semibold">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Production</span>
              <span className="text-white font-semibold">245.3 kWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Consumption</span>
              <span className="text-white font-semibold">180.1 kWh</span>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Net Position</span>
                <span className="text-energy-green font-semibold">+65.2 kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estimated Payment</span>
                <span className="text-energy-green font-semibold">+$4.37</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">Dispute Resolution</h3>
          <div className="space-y-3">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-semibold">No Active Disputes</span>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">
                All settlements have been finalized without disputes
              </p>
            </div>
            <button type="button" className="w-full btn-secondary">Raise Dispute</button>
          </div>
        </div>
      </div>
    </div>
  )
}

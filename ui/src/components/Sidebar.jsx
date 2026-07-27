import { 
  LayoutDashboard, 
  TrendingUp, 
  Sun, 
  BatteryCharging,
  Wallet, 
  Gauge, 
  Lock, 
  FileText,
  Activity,
  Settings
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'market', label: 'Energy Market', icon: TrendingUp },
  { id: 'panels', label: 'Panel Registry', icon: Sun },
  { id: 'utilities', label: 'Utilities', icon: BatteryCharging },
  { id: 'wallet', label: 'Energy Wallet', icon: Wallet },
  { id: 'settlement', label: 'Settlement', icon: Gauge },
  { id: 'staking', label: 'Staking Vault', icon: Lock },
  { id: 'governance', label: 'Governance', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeView, setActiveView, isOpen }) {
  if (!isOpen) return null

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-slate-800 border-r border-gray-700 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-energy-green text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

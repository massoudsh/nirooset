import Overview from './views/Overview'
import EnergyMarket from './views/EnergyMarket'
import PanelRegistry from './views/PanelRegistry'
import Utilities from './views/Utilities'
import EnergyWallet from './views/EnergyWallet'
import Settlement from './views/Settlement'
import StakingVault from './views/StakingVault'
import Governance from './views/Governance'
import Activity from './views/Activity'
import Settings from './views/Settings'

export default function Dashboard({ activeView, setActiveView }) {
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Overview setActiveView={setActiveView} />
      case 'market':
        return <EnergyMarket />
      case 'panels':
        return <PanelRegistry setActiveView={setActiveView} />
      case 'utilities':
        return <Utilities />
      case 'wallet':
        return <EnergyWallet />
      case 'settlement':
        return <Settlement />
      case 'staking':
        return <StakingVault />
      case 'governance':
        return <Governance />
      case 'activity':
        return <Activity />
      case 'settings':
        return <Settings />
      default:
        return <Overview setActiveView={setActiveView} />
    }
  }

  return (
    <div className="p-6">
      {renderView()}
    </div>
  )
}

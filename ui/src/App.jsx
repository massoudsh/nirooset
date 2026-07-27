import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ErrorBoundary from './components/ErrorBoundary'
import CartDrawer from './components/CartDrawer'
import { Web3Provider } from './context/Web3Context'
import { DemoProvider } from './context/DemoContext'
import { CartProvider } from './context/CartContext'
import TestnetBanner from './components/TestnetBanner'

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <ErrorBoundary>
      <Web3Provider>
        <DemoProvider>
        <CartProvider>
        <div className="min-h-screen bg-slate-900 text-gray-100">
          <Header
            setCartOpen={setCartOpen}
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
          <TestnetBanner />
          <div className="flex">
            <Sidebar 
              activeView={activeView} 
              setActiveView={setActiveView}
              isOpen={sidebarOpen}
            />
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
              <Dashboard activeView={activeView} setActiveView={setActiveView} />
            </main>
          </div>
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
        </CartProvider>
        </DemoProvider>
      </Web3Provider>
    </ErrorBoundary>
  )
}

export default App

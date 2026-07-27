# GRIDSET Protocol UI

A modern, energy-focused web interface for the GRIDSET Protocol - a market-based energy and compute settlement system.

## Features

- **Energy Dashboard**: Real-time overview with production/consumption charts and market metrics
- **Energy Market**: Order book visualization, place bids/asks, view active auctions
- **Panel Registry**: Manage solar panels, view production data, register new panels
- **Energy Wallet**: View balances, transfer tokens, track transactions
- **Settlement Engine**: Monitor settlement status, view financial positions
- **Staking Vault**: Manage staked tokens, deposit/withdraw, view penalties
- **Governance DAO**: Create proposals, vote on protocol decisions
- **Web3 Integration**: Connect MetaMask or other Web3 wallets

## Design

The UI features an energy-themed design with:
- Dark theme optimized for energy dashboards
- Green/blue color scheme representing renewable energy
- Real-time charts and visualizations
- Responsive layout for all screen sizes

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet (for blockchain interaction)

### Installation

```bash
cd ui
npm install
```

### Development

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ui/
├── src/
│   ├── components/
│   │   ├── views/          # Main view components
│   │   ├── Header.jsx      # Top navigation
│   │   ├── Sidebar.jsx     # Side navigation
│   │   └── Dashboard.jsx   # Main router
│   ├── context/
│   │   └── Web3Context.jsx  # Web3 wallet connection
│   ├── App.jsx             # Root component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Contract Integration

To connect to deployed contracts, update the contract addresses in the Settings view or configure them in the Web3Context.

## License

MIT

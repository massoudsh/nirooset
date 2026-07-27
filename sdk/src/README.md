# @gridset/sdk

JavaScript/TypeScript client library for the GRIDSET Protocol.

## Install

```bash
npm install @gridset/sdk ethers
```

## Quick start

```ts
import { createSDKFromBrowser } from '@gridset/sdk';

const sdk = await createSDKFromBrowser(window.ethereum, {
  energyToken:  '0x...',
  energyMarket: '0x...',
  panelNFT:     '0x...',
  panelRegistry:'0x...',
  energyOracle: '0x...',
});

// Get the live order book
const book = await sdk.getOrderBook(GridsetSDK.currentTimeSlot());
console.log('Bids:', book.bids);
console.log('Asks:', book.asks);

// Place a bid (requires signer)
await sdk.placeBid(GridsetSDK.currentTimeSlot(), ethers.parseEther('0.012'), 10n);

// Mint energy tokens (owner only)
await sdk.mint('0xYourAddress', ethers.parseEther('1000'));
```

## Read-only (no wallet)

```ts
import { createSDKFromRPC } from '@gridset/sdk';

const sdk = createSDKFromRPC('https://sepolia.infura.io/v3/YOUR_KEY', addresses);
const auction = await sdk.getAuction(GridsetSDK.currentTimeSlot());
```

## API

| Method | Description |
|---|---|
| `getOrderBook(slot)` | Fetch bids & asks for a time slot |
| `getAuction(slot)` | Fetch auction state (clearing price, status) |
| `getBestBid(slot)` | Highest bid price & quantity |
| `getBestAsk(slot)` | Lowest ask price & quantity |
| `placeBid(slot, price, qty)` | Submit a buy order |
| `placeAsk(slot, price, qty)` | Submit a sell order |
| `cancelOrder(orderId)` | Cancel an active order |
| `clearAuction(slot)` | Clear auction (owner only) |
| `mint(to, amount)` | Mint energy tokens (owner only) |
| `getBalance(account)` | Available token balance |
| `getLockedBalance(account)` | Locked token balance |
| `registerPanel(tokenId, owner, capacity)` | Register a panel |
| `getPanelRecord(tokenId)` | Panel registry record |
| `getRegisteredPanels()` | All registered panel IDs |
| `mintPanel(to, tokenId, capacity)` | Mint a PanelNFT |
| `getPanelOwner(tokenId)` | Owner of a panel NFT |
| `getTimeSlotData(slot)` | Oracle time slot data |
| `getTotalProduction(slot)` | Total Wh produced in a slot |
| `getProductionReport(panelId, timestamp)` | Single panel production report |
| `forecastSupplyDemand(slot, lookback?)` | Predicted next-slot supply/demand + confidence |
| `suggestFairPrice(slot, lookback?)` | Recency-weighted fair price suggestion |
| `detectProductionAnomalies(panelId, timestamps, zThreshold?)` | Flag outlier production reports |
| `GridsetSDK.currentTimeSlot()` | Current hourly slot (static) |
| `GridsetSDK.timeSlotFor(date)` | Slot for a specific Date (static) |

## Market Intelligence (beta)

Off-chain, read-only analytics layered on top of the existing oracle and
market data — no contract changes required. See
[`docs/MARKET_INTELLIGENCE_DESIGN.md`](../../docs/MARKET_INTELLIGENCE_DESIGN.md)
for the rationale and algorithm design.

```ts
const forecast = await sdk.forecastSupplyDemand(GridsetSDK.currentTimeSlot());
console.log(forecast.predictedSupply, forecast.predictedDemand, forecast.confidence);

const price = await sdk.suggestFairPrice(GridsetSDK.currentTimeSlot());
console.log(price.suggestedPrice, price.basis);

const anomalies = await sdk.detectProductionAnomalies(panelId, recentTimestamps);
anomalies.forEach((a) => console.log(a.severity, a.message));
```

The underlying pure functions (`computeForecast`, `computeAnomalies`,
`computeWeightedPrice`) are also exported directly for use outside the SDK
class (e.g. in a backend job or notebook working from CSV-exported data).

/**
 * EnergyMarket.jsx — Energy Market view
 *
 * Issue #19: UI real-time order book and clearing price
 *
 * Fetches getOrderBook(timeSlot) and getAuction(timeSlot) from the deployed
 * EnergyMarket contract and displays:
 *   - Live bid / ask order book table
 *   - Best bid / ask prices
 *   - Clearing price prominently after auction is cleared
 *   - Time slot selector
 *   - Order placement form (bid / ask)
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';
import { useDemo } from '../../context/DemoContext';
import ConfirmActionModal from '../ConfirmActionModal';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLOT_DURATION = 3600; // 1 hour in seconds

function currentSlot() {
  return Math.floor(Date.now() / 1000 / SLOT_DURATION) * SLOT_DURATION;
}

function formatSlot(slot) {
  return new Date(Number(slot) * 1000).toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrice(price) {
  try {
    return parseFloat(ethers.formatEther(price)).toFixed(4);
  } catch {
    return price?.toString() ?? '—';
  }
}

// ---------------------------------------------------------------------------
// Mock data for demo / no-contract mode
// ---------------------------------------------------------------------------

const MOCK_BIDS = [
  { orderId: 1n, trader: '0xABC...111', price: ethers.parseEther('0.0120'), quantity: 5n, filledQuantity: 0n, isActive: true },
  { orderId: 2n, trader: '0xDEF...222', price: ethers.parseEther('0.0115'), quantity: 10n, filledQuantity: 0n, isActive: true },
  { orderId: 3n, trader: '0x123...333', price: ethers.parseEther('0.0110'), quantity: 3n, filledQuantity: 0n, isActive: true },
];

const MOCK_ASKS = [
  { orderId: 4n, trader: '0x456...444', price: ethers.parseEther('0.0125'), quantity: 4n, filledQuantity: 0n, isActive: true },
  { orderId: 5n, trader: '0x789...555', price: ethers.parseEther('0.0130'), quantity: 8n, filledQuantity: 0n, isActive: true },
  { orderId: 6n, trader: '0xABC...666', price: ethers.parseEther('0.0135'), quantity: 6n, filledQuantity: 0n, isActive: true },
];

const MOCK_AUCTION = {
  timeSlot: BigInt(currentSlot()),
  startTime: BigInt(currentSlot() - 1800),
  endTime: BigInt(currentSlot() + 1800),
  clearingPrice: 0n,
  totalBidQuantity: 18n,
  totalAskQuantity: 18n,
  isCleared: false,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ClearingPriceBanner({ clearingPrice }) {
  if (!clearingPrice || clearingPrice === 0n) return null;
  return (
    <div className="mb-6 rounded-xl border border-energy-green bg-energy-green/10 p-4 flex items-center gap-3">
      <div className="text-3xl">⚡</div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Clearing Price</p>
        <p className="text-2xl font-bold text-energy-green">
          {formatPrice(clearingPrice)} GRID
        </p>
        <p className="text-xs text-slate-400">per Wh — auction has cleared</p>
      </div>
    </div>
  );
}

function OrderBookTable({ bids, asks, bestBid, bestAsk }) {
  const spread =
    bestBid?.price && bestAsk?.price && bestAsk.price > 0n && bestBid.price > 0n
      ? bestAsk.price - bestBid.price
      : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Asks (sell orders) — sorted ascending */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-red-400">
            Asks (Sell)
            {bestAsk?.price > 0n && (
              <span className="ml-2 text-xs text-slate-400">
                best: {formatPrice(bestAsk.price)} GRID
              </span>
            )}
          </h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-700">
              <th className="px-4 py-2 text-left">Price (GRID)</th>
              <th className="px-4 py-2 text-right">Qty (Wh)</th>
              <th className="px-4 py-2 text-right">Filled</th>
            </tr>
          </thead>
          <tbody>
            {[...asks]
              .filter((o) => o.isActive)
              .sort((a, b) => (a.price < b.price ? -1 : 1))
              .map((o) => (
                <tr key={o.orderId.toString()} className="border-b border-slate-700/50 hover:bg-red-500/5">
                  <td className="px-4 py-2 font-mono text-red-400">{formatPrice(o.price)}</td>
                  <td className="px-4 py-2 text-right text-slate-300">{o.quantity.toString()}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{o.filledQuantity.toString()}</td>
                </tr>
              ))}
            {asks.filter((o) => o.isActive).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">No ask orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bids (buy orders) — sorted descending */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-700">
          <h3 className="text-sm font-semibold text-energy-green">
            Bids (Buy)
            {bestBid?.price > 0n && (
              <span className="ml-2 text-xs text-slate-400">
                best: {formatPrice(bestBid.price)} GRID
              </span>
            )}
          </h3>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-700">
              <th className="px-4 py-2 text-left">Price (GRID)</th>
              <th className="px-4 py-2 text-right">Qty (Wh)</th>
              <th className="px-4 py-2 text-right">Filled</th>
            </tr>
          </thead>
          <tbody>
            {[...bids]
              .filter((o) => o.isActive)
              .sort((a, b) => (a.price > b.price ? -1 : 1))
              .map((o) => (
                <tr key={o.orderId.toString()} className="border-b border-slate-700/50 hover:bg-green-500/5">
                  <td className="px-4 py-2 font-mono text-energy-green">{formatPrice(o.price)}</td>
                  <td className="px-4 py-2 text-right text-slate-300">{o.quantity.toString()}</td>
                  <td className="px-4 py-2 text-right text-slate-500">{o.filledQuantity.toString()}</td>
                </tr>
              ))}
            {bids.filter((o) => o.isActive).length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">No bid orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Spread */}
      {spread !== null && (
        <div className="md:col-span-2 text-center text-xs text-slate-500">
          Spread: {formatPrice(spread)} GRID
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EnergyMarket() {
  const { contracts, account, isConnected } = useWeb3();
  const { demoOrders, addDemoOrder, demoBalance } = useDemo();

  // --- State ---
  const [orderType, setOrderType] = useState('bid');
  const [price, setPrice]         = useState('');
  const [quantity, setQuantity]   = useState('');
  const [timeSlot, setTimeSlot]   = useState(currentSlot());
  const [marketSlot, setMarketSlot] = useState(currentSlot());

  const [auction, setAuction]   = useState(null);
  const [bids, setBids]         = useState([]);
  const [asks, setAsks]         = useState([]);
  const [bestBid, setBestBid]   = useState({ price: 0n, quantity: 0n });
  const [bestAsk, setBestAsk]   = useState({ price: 0n, quantity: 0n });

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- Fetch order book ---
  const fetchOrderBook = useCallback(async () => {
    if (!contracts?.energyMarket) {
      // Demo mode: use mock data
      setAuction(MOCK_AUCTION);
      setBids(MOCK_BIDS);
      setAsks(MOCK_ASKS);
      setBestBid({ price: MOCK_BIDS[0].price, quantity: MOCK_BIDS[0].quantity });
      setBestAsk({ price: MOCK_ASKS[0].price, quantity: MOCK_ASKS[0].quantity });
      return;
    }

    setRefreshing(true);
    try {
      const [auctionData, orderBook, bb, ba] = await Promise.all([
        contracts.energyMarket.getAuction(marketSlot),
        contracts.energyMarket.getOrderBook(marketSlot),
        contracts.energyMarket.getBestBid(marketSlot),
        contracts.energyMarket.getBestAsk(marketSlot),
      ]);
      setAuction(auctionData);
      setBids(orderBook.bids ?? []);
      setAsks(orderBook.asks ?? []);
      setBestBid({ price: bb.price, quantity: bb.quantity });
      setBestAsk({ price: ba.price, quantity: ba.quantity });
      setError('');
    } catch (e) {
      console.error('fetchOrderBook:', e);
      setError('Could not fetch order book. Check contract deployment.');
    } finally {
      setRefreshing(false);
    }
  }, [contracts?.energyMarket, marketSlot]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    fetchOrderBook();
    const id = setInterval(fetchOrderBook, 15_000);
    return () => clearInterval(id);
  }, [fetchOrderBook]);

  // --- Order placement ---
  const handlePlaceOrder = () => {
    if (!price || !quantity) { setError('Enter price and quantity.'); return; }
    if (parseFloat(price) <= 0 || parseFloat(quantity) <= 0) { setError('Values must be > 0.'); return; }

    if (!isConnected && !account) {
      // demo mode validation
      const cost = orderType === 'bid'
        ? parseFloat(price) * parseFloat(quantity)
        : parseFloat(quantity);
      if (cost > demoBalance.available) { setError('Insufficient demo balance.'); return; }
    }

    setPendingOrder({ type: orderType, price, quantity, timeSlot });
    setConfirmOpen(true);
  };

  const handleConfirmOrder = async () => {
    setConfirmOpen(false);
    setLoading(true);
    setError('');

    try {
      if (contracts?.energyMarket && account) {
        const priceWei = ethers.parseEther(price);
        const qty      = BigInt(quantity);
        if (orderType === 'bid') {
          await contracts.energyMarket.placeBid(timeSlot, priceWei, qty);
        } else {
          await contracts.energyMarket.placeAsk(timeSlot, priceWei, qty);
        }
      } else {
        // Demo mode
        addDemoOrder({ type: orderType, price, quantity, timeSlot });
      }
      setPrice('');
      setQuantity('');
      setTimeout(fetchOrderBook, 2000);
    } catch (e) {
      setError(e.reason ?? e.message ?? 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Energy Market</h1>
          <p className="text-sm text-slate-400 mt-1">Batch auction order book — real-time</p>
        </div>
        <button
          onClick={fetchOrderBook}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-colors"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>

      {/* Clearing price banner (issue #19: prominent display) */}
      {auction && auction.isCleared && (
        <ClearingPriceBanner clearingPrice={auction.clearingPrice} />
      )}

      {/* Slot selector */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">View slot</label>
            <select
              value={marketSlot}
              onChange={(e) => setMarketSlot(Number(e.target.value))}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              {[-2, -1, 0, 1, 2].map((offset) => {
                const slot = currentSlot() + offset * SLOT_DURATION;
                return (
                  <option key={slot} value={slot}>
                    {formatSlot(slot)} {offset === 0 ? '(current)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {auction && (
            <div className="flex gap-4 text-xs text-slate-400 ml-auto">
              <span>
                Total bids:{' '}
                <span className="text-energy-green font-mono">{auction.totalBidQuantity?.toString() ?? '—'} Wh</span>
              </span>
              <span>
                Total asks:{' '}
                <span className="text-red-400 font-mono">{auction.totalAskQuantity?.toString() ?? '—'} Wh</span>
              </span>
              <span>
                Status:{' '}
                <span className={auction.isCleared ? 'text-yellow-400' : 'text-energy-green'}>
                  {auction.isCleared ? 'Cleared' : 'Open'}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Order book */}
      <OrderBookTable bids={bids} asks={asks} bestBid={bestBid} bestAsk={bestAsk} />

      {/* Place order form */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Place Order</h2>

        {/* Bid / Ask toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-700 mb-4 w-fit">
          {['bid', 'ask'].map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-6 py-2 text-sm font-medium capitalize transition-colors ${
                orderType === type
                  ? type === 'bid'
                    ? 'bg-energy-green text-slate-900'
                    : 'bg-red-500 text-white'
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {type === 'bid' ? 'Buy (Bid)' : 'Sell (Ask)'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Price (GRID / Wh)</label>
            <input
              type="number"
              min="0"
              step="0.0001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.0120"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Quantity (Wh)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="10"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Time Slot</label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(Number(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            >
              {[-1, 0, 1].map((offset) => {
                const slot = currentSlot() + offset * SLOT_DURATION;
                return (
                  <option key={slot} value={slot}>
                    {formatSlot(slot)}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className={`mt-4 px-6 py-2.5 rounded-lg font-medium text-sm transition-colors ${
            orderType === 'bid'
              ? 'bg-energy-green hover:bg-green-400 text-slate-900'
              : 'bg-red-500 hover:bg-red-400 text-white'
          } disabled:opacity-50`}
        >
          {loading ? 'Submitting…' : `Place ${orderType === 'bid' ? 'Buy' : 'Sell'} Order`}
        </button>
      </div>

      {/* Demo order history */}
      {demoOrders && demoOrders.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <h2 className="text-sm font-semibold text-slate-400 mb-3">My Orders (Demo)</h2>
          <div className="space-y-2">
            {demoOrders.map((o, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-700/50 pb-2">
                <span className={o.type === 'bid' ? 'text-energy-green' : 'text-red-400'}>
                  {o.type.toUpperCase()} {o.quantity} Wh @ {o.price} GRID
                </span>
                <span>{formatSlot(o.timeSlot)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order confirmation modal */}
      {confirmOpen && pendingOrder && (
        <ConfirmActionModal
          title={`Confirm ${pendingOrder.type === 'bid' ? 'Buy' : 'Sell'} Order`}
          description={`You are placing a ${pendingOrder.type === 'bid' ? 'bid (buy)' : 'ask (sell)'} order for ${pendingOrder.quantity} Wh at ${pendingOrder.price} GRID per Wh. Tokens will be locked in escrow until the auction clears.`}
          onConfirm={handleConfirmOrder}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

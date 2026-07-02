/**
 * Activity.jsx — Notifications / Activity Feed
 *
 * Issue #28: Notifications or activity feed
 *
 * Displays recent blockchain events:
 *   - AuctionCleared  (from EnergyMarket)
 *   - OrderPlaced     (from EnergyMarket)
 *   - TimeSlotFinalized (from EnergyOracle)
 *   - TimeSlotConfirmed (from EnergyOracle)
 *   - ProposalCreated  (from GovernanceDAO — mock when not deployed)
 *
 * Data source: getLogs over the last 50,000 blocks, or mock data in demo mode.
 * Auto-refreshes every 30 seconds.
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------
const EVENT_TYPES = {
  AUCTION_CLEARED:     'AuctionCleared',
  ORDER_PLACED:        'OrderPlaced',
  ORDER_CANCELLED:     'OrderCancelled',
  SLOT_FINALIZED:      'TimeSlotFinalized',
  SLOT_CONFIRMED:      'TimeSlotConfirmed',
  PROPOSAL_CREATED:    'ProposalCreated',
};

// ---------------------------------------------------------------------------
// Relative time helper
// ---------------------------------------------------------------------------
function timeAgo(timestamp) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60)      return 'Just now';
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ---------------------------------------------------------------------------
// Mock events for demo / no-contract mode
// ---------------------------------------------------------------------------
const now = Math.floor(Date.now() / 1000);

const MOCK_EVENTS = [
  {
    type: EVENT_TYPES.AUCTION_CLEARED,
    title: 'Auction Cleared',
    detail: 'Slot 2026-07-02 14:00 — clearing price 0.0120 GRID, 48 Wh matched',
    timestamp: now - 180,
    color: 'text-energy-green',
    icon: '⚡',
  },
  {
    type: EVENT_TYPES.ORDER_PLACED,
    title: 'New Bid',
    detail: '0xA1b2…c3d4 placed a bid: 10 Wh @ 0.0115 GRID',
    timestamp: now - 420,
    color: 'text-blue-400',
    icon: '📥',
  },
  {
    type: EVENT_TYPES.ORDER_PLACED,
    title: 'New Ask',
    detail: '0xE5f6…g7h8 placed an ask: 8 Wh @ 0.0125 GRID',
    timestamp: now - 900,
    color: 'text-red-400',
    icon: '📤',
  },
  {
    type: EVENT_TYPES.SLOT_FINALIZED,
    title: 'Time Slot Finalized',
    detail: 'Slot 2026-07-02 13:00 — total production 320 Wh',
    timestamp: now - 3600,
    color: 'text-yellow-400',
    icon: '✅',
  },
  {
    type: EVENT_TYPES.SLOT_CONFIRMED,
    title: 'Time Slot Confirmed',
    detail: 'Oracle consensus reached for slot 2026-07-02 13:00',
    timestamp: now - 3900,
    color: 'text-purple-400',
    icon: '🔒',
  },
  {
    type: EVENT_TYPES.PROPOSAL_CREATED,
    title: 'Governance Proposal',
    detail: 'Proposal #7: "Increase requiredConsensus to 3-of-5 oracles"',
    timestamp: now - 7200,
    color: 'text-orange-400',
    icon: '🏛️',
  },
  {
    type: EVENT_TYPES.AUCTION_CLEARED,
    title: 'Auction Cleared',
    detail: 'Slot 2026-07-02 13:00 — clearing price 0.0118 GRID, 35 Wh matched',
    timestamp: now - 7800,
    color: 'text-energy-green',
    icon: '⚡',
  },
];

// ---------------------------------------------------------------------------
// Parse on-chain events into a unified shape
// ---------------------------------------------------------------------------
function parseAuctionCleared(log, iface, blockTs) {
  const decoded = iface.parseLog(log);
  return {
    type: EVENT_TYPES.AUCTION_CLEARED,
    title: 'Auction Cleared',
    detail: `Slot ${new Date(Number(decoded.args.timeSlot) * 1000).toLocaleString()} — price ${ethers.formatEther(decoded.args.clearingPrice)} GRID, ${decoded.args.totalMatched} Wh matched`,
    timestamp: blockTs,
    color: 'text-energy-green',
    icon: '⚡',
  };
}

function parseOrderPlaced(log, iface, blockTs) {
  const decoded = iface.parseLog(log);
  const side = decoded.args.isBid ? 'Bid' : 'Ask';
  const trader = `${decoded.args.trader.slice(0, 6)}…${decoded.args.trader.slice(-4)}`;
  return {
    type: EVENT_TYPES.ORDER_PLACED,
    title: `New ${side}`,
    detail: `${trader} placed a ${side.toLowerCase()}: ${decoded.args.quantity} Wh @ ${ethers.formatEther(decoded.args.price)} GRID`,
    timestamp: blockTs,
    color: decoded.args.isBid ? 'text-blue-400' : 'text-red-400',
    icon: decoded.args.isBid ? '📥' : '📤',
  };
}

function parseSlotFinalized(log, iface, blockTs) {
  const decoded = iface.parseLog(log);
  return {
    type: EVENT_TYPES.SLOT_FINALIZED,
    title: 'Time Slot Finalized',
    detail: `Slot ${new Date(Number(decoded.args.timeSlot) * 1000).toLocaleString()} — ${decoded.args.totalEnergy} Wh`,
    timestamp: blockTs,
    color: 'text-yellow-400',
    icon: '✅',
  };
}

function parseSlotConfirmed(log, iface, blockTs) {
  const decoded = iface.parseLog(log);
  return {
    type: EVENT_TYPES.SLOT_CONFIRMED,
    title: 'Time Slot Confirmed',
    detail: `Oracle consensus reached for slot ${new Date(Number(decoded.args.timeSlot) * 1000).toLocaleString()}`,
    timestamp: blockTs,
    color: 'text-purple-400',
    icon: '🔒',
  };
}

// ---------------------------------------------------------------------------
// Hook: fetch activity feed
// ---------------------------------------------------------------------------
const MARKET_IFACE = new ethers.Interface([
  'event AuctionCleared(uint256 indexed timeSlot, uint256 clearingPrice, uint256 totalMatched)',
  'event OrderPlaced(uint256 indexed orderId, address indexed trader, bool isBid, uint256 price, uint256 quantity)',
]);

const ORACLE_IFACE = new ethers.Interface([
  'event TimeSlotFinalized(uint256 indexed timeSlot, uint256 totalEnergy)',
  'event TimeSlotConfirmed(uint256 indexed timeSlot)',
]);

function useActivityFeed(contracts, provider) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  const fetch = useCallback(async () => {
    if (!contracts?.energyMarket || !provider) {
      setEvents(MOCK_EVENTS);
      setUsingMock(true);
      return;
    }

    setLoading(true);
    try {
      const latestBlock = await provider.getBlockNumber();
      const fromBlock   = Math.max(0, latestBlock - 50_000);

      const [clearedLogs, placedLogs, finalizedLogs, confirmedLogs] = await Promise.all([
        provider.getLogs({
          address: await contracts.energyMarket.getAddress(),
          topics: [MARKET_IFACE.getEvent('AuctionCleared').topicHash],
          fromBlock,
        }),
        provider.getLogs({
          address: await contracts.energyMarket.getAddress(),
          topics: [MARKET_IFACE.getEvent('OrderPlaced').topicHash],
          fromBlock,
        }),
        contracts.energyOracle
          ? provider.getLogs({
              address: await contracts.energyOracle.getAddress(),
              topics: [ORACLE_IFACE.getEvent('TimeSlotFinalized').topicHash],
              fromBlock,
            })
          : Promise.resolve([]),
        contracts.energyOracle
          ? provider.getLogs({
              address: await contracts.energyOracle.getAddress(),
              topics: [ORACLE_IFACE.getEvent('TimeSlotConfirmed').topicHash],
              fromBlock,
            })
          : Promise.resolve([]),
      ]);

      // Fetch block timestamps in parallel (limit to most recent 30 logs)
      const allLogs = [
        ...clearedLogs,
        ...placedLogs,
        ...finalizedLogs,
        ...confirmedLogs,
      ]
        .sort((a, b) => b.blockNumber - a.blockNumber)
        .slice(0, 30);

      const blockNumbers = [...new Set(allLogs.map((l) => l.blockNumber))];
      const blockMap     = {};
      await Promise.all(
        blockNumbers.map(async (bn) => {
          const block = await provider.getBlock(bn);
          if (block) blockMap[bn] = block.timestamp;
        }),
      );

      const parsed = allLogs.map((log) => {
        const ts = blockMap[log.blockNumber] ?? Math.floor(Date.now() / 1000);
        try {
          if (clearedLogs.includes(log))   return parseAuctionCleared(log, MARKET_IFACE, ts);
          if (placedLogs.includes(log))    return parseOrderPlaced(log, MARKET_IFACE, ts);
          if (finalizedLogs.includes(log)) return parseSlotFinalized(log, ORACLE_IFACE, ts);
          if (confirmedLogs.includes(log)) return parseSlotConfirmed(log, ORACLE_IFACE, ts);
        } catch {
          return null;
        }
        return null;
      }).filter(Boolean);

      if (parsed.length === 0) {
        setEvents(MOCK_EVENTS);
        setUsingMock(true);
      } else {
        setEvents(parsed.sort((a, b) => b.timestamp - a.timestamp));
        setUsingMock(false);
      }
    } catch (e) {
      console.error('Activity feed fetch error:', e);
      setEvents(MOCK_EVENTS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [contracts, provider]);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, [fetch]);

  return { events, loading, usingMock, refresh: fetch };
}

// ---------------------------------------------------------------------------
// Event card
// ---------------------------------------------------------------------------
function EventCard({ event }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-slate-600 transition-colors">
      <div className="text-2xl flex-shrink-0 w-8 text-center">{event.icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold ${event.color}`}>{event.title}</span>
          <span className="text-xs text-slate-500 flex-shrink-0">{timeAgo(event.timestamp)}</span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{event.detail}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------
const FILTER_OPTIONS = [
  { label: 'All',        value: null },
  { label: 'Auctions',   value: EVENT_TYPES.AUCTION_CLEARED },
  { label: 'Orders',     value: EVENT_TYPES.ORDER_PLACED },
  { label: 'Oracle',     value: EVENT_TYPES.SLOT_FINALIZED },
  { label: 'Governance', value: EVENT_TYPES.PROPOSAL_CREATED },
];

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Activity() {
  const { contracts, provider } = useWeb3();
  const { events, loading, usingMock, refresh } = useActivityFeed(contracts, provider);
  const [activeFilter, setActiveFilter] = useState(null);

  const displayed = activeFilter
    ? events.filter((e) =>
        e.type === activeFilter ||
        (activeFilter === EVENT_TYPES.SLOT_FINALIZED &&
          (e.type === EVENT_TYPES.SLOT_FINALIZED || e.type === EVENT_TYPES.SLOT_CONFIRMED))
      )
    : events;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
          <p className="text-sm text-slate-400 mt-1">
            {usingMock ? 'Demo data — connect to a deployed contract for live events' : `${events.length} recent events from the blockchain`}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-colors"
        >
          <span className={loading ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => setActiveFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === opt.value
                ? 'bg-energy-green text-slate-900'
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Live indicator */}
      {!usingMock && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-energy-green animate-pulse" />
          Live — refreshes every 30 seconds
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">No events found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map((event, i) => (
            <EventCard key={`${event.type}-${event.timestamp}-${i}`} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

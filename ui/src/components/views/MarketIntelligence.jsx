/**
 * MarketIntelligence.jsx — Market Intelligence view
 *
 * Feature: Energy Exchange & Settlement Infrastructure — AI/analytics layer
 * See docs/MARKET_INTELLIGENCE_DESIGN.md for the full design rationale.
 *
 * Off-chain, read-only heuristics computed over recent EnergyOracle /
 * EnergyMarket history:
 *   - Next-slot supply/demand forecast with a confidence score
 *   - Recency-weighted "suggested fair price" banner
 *   - Production anomaly alerts (statistical outliers per panel)
 *
 * Mirrors the EnergyMarket.jsx pattern: live contract reads when available,
 * representative mock data in demo mode.
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../../context/Web3Context';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLOT_DURATION = 3600; // 1 hour in seconds
const LOOKBACK_SLOTS = 12;

function currentSlot() {
  return Math.floor(Date.now() / 1000 / SLOT_DURATION) * SLOT_DURATION;
}

// ---------------------------------------------------------------------------
// Pure heuristics (display-oriented: operate on plain numbers, not bigint —
// mirrors sdk/src/index.ts's computeForecast / computeAnomalies /
// computeWeightedPrice, kept independent since the UI doesn't depend on the
// SDK package)
// ---------------------------------------------------------------------------

function computeForecast(history) {
  const n = history.length;
  if (n === 0) return { predicted: 0, confidence: 0 };
  if (n === 1) return { predicted: history[0], confidence: 0.3 };

  const avg = (arr) => (arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length);
  const mid = Math.floor(n / 2);
  const firstAvg = avg(history.slice(0, mid));
  const secondAvg = avg(history.slice(mid));
  const trend = secondAvg - firstAvg;

  const predicted = Math.max(0, secondAvg + trend);

  const overallUp = trend >= 0;
  let consistent = 0;
  for (let i = 1; i < n; i++) {
    const stepUp = history[i] >= history[i - 1];
    if (stepUp === overallUp) consistent++;
  }
  const confidence = Math.round((consistent / (n - 1)) * 100) / 100;

  return { predicted, confidence };
}

function computeAnomalies(values, zThreshold = 2) {
  if (values.length < 3) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);
  if (std === 0) return [];

  const points = [];
  values.forEach((v, index) => {
    const zScore = (v - mean) / std;
    if (Math.abs(zScore) > zThreshold) {
      points.push({ index, zScore: Math.round(zScore * 100) / 100 });
    }
  });
  return points;
}

function computeWeightedPrice(prices) {
  if (prices.length === 0) return 0;
  let weightedSum = 0;
  let totalWeight = 0;
  prices.forEach((p, i) => {
    const weight = i + 1;
    weightedSum += p * weight;
    totalWeight += weight;
  });
  return weightedSum / totalWeight;
}

function severityFromZ(zScore) {
  const abs = Math.abs(zScore);
  if (abs >= 3.5) return 'high';
  if (abs >= 2.5) return 'medium';
  return 'low';
}

// ---------------------------------------------------------------------------
// Mock data for demo / no-contract mode
// ---------------------------------------------------------------------------

const MOCK_SUPPLY_HISTORY = [420, 460, 505, 480, 530, 560, 540, 590, 610, 580, 630, 660];
const MOCK_DEMAND_HISTORY = [400, 430, 470, 500, 520, 510, 540, 560, 550, 590, 600, 620];
const MOCK_PRICE_HISTORY  = [0.0110, 0.0112, 0.0115, 0.0113, 0.0118, 0.0121, 0.0119, 0.0124];
const MOCK_PANEL_PRODUCTION = [102, 98, 105, 101, 99, 340, 103, 100]; // index 5 is an injected anomaly

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ConfidenceBadge({ confidence }) {
  const pct = Math.round(confidence * 100);
  const color =
    confidence >= 0.7 ? 'text-energy-green' : confidence >= 0.4 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-mono ${color}`}>{pct}% confidence</span>;
}

function SeverityBadge({ severity }) {
  const styles = {
    high:   'bg-red-500/20 text-red-400 border-red-500/40',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    low:    'bg-slate-500/20 text-slate-300 border-slate-500/40',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${styles[severity]}`}>
      {severity}
    </span>
  );
}

function ForecastCard({ forecast }) {
  if (!forecast) return null;
  const gap = forecast.predictedSupply - forecast.predictedDemand;
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Next-Slot Forecast</h2>
        <ConfidenceBadge confidence={forecast.confidence} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Predicted Supply</p>
          <p className="text-2xl font-bold text-energy-green">{Math.round(forecast.predictedSupply)} Wh</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Predicted Demand</p>
          <p className="text-2xl font-bold text-blue-400">{Math.round(forecast.predictedDemand)} Wh</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Supply − Demand</p>
          <p className={`text-2xl font-bold ${gap >= 0 ? 'text-energy-green' : 'text-red-400'}`}>
            {gap >= 0 ? '+' : ''}{Math.round(gap)} Wh
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Based on the last {LOOKBACK_SLOTS} hourly slots — trend extrapolation, not a guarantee.
      </p>
    </div>
  );
}

function PriceSuggestionBanner({ suggestion }) {
  if (!suggestion) return null;
  return (
    <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 flex items-center gap-3">
      <div className="text-3xl">🎯</div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Suggested Fair Price</p>
        <p className="text-2xl font-bold text-blue-400">{suggestion.price.toFixed(4)} GRID</p>
        <p className="text-xs text-slate-400">{suggestion.basis}</p>
      </div>
    </div>
  );
}

function AnomalyList({ anomalies }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="px-4 py-3 bg-slate-700/50 border-b border-slate-700">
        <h3 className="text-sm font-semibold text-white">Production Anomalies</h3>
      </div>
      {anomalies.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-slate-500">No anomalies detected in the sampled window.</p>
      ) : (
        <ul className="divide-y divide-slate-700/50">
          {anomalies.map((a, i) => (
            <li key={i} className="px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-200">Panel #{a.panelId} — slot #{a.index}</p>
                <p className="text-xs text-slate-500">{a.message}</p>
              </div>
              <SeverityBadge severity={a.severity} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function MarketIntelligence() {
  const { contracts } = useWeb3();

  const [forecast, setForecast]     = useState(null);
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [anomalies, setAnomalies]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      if (!contracts?.energyOracle || !contracts?.energyMarket) {
        // --- Demo mode: use mock history ---
        const supplyForecast = computeForecast(MOCK_SUPPLY_HISTORY);
        const demandForecast = computeForecast(MOCK_DEMAND_HISTORY);
        setForecast({
          predictedSupply: supplyForecast.predicted,
          predictedDemand: demandForecast.predicted,
          confidence: Math.min(supplyForecast.confidence, demandForecast.confidence),
        });
        setPriceSuggestion({
          price: computeWeightedPrice(MOCK_PRICE_HISTORY),
          basis: `Recency-weighted average of ${MOCK_PRICE_HISTORY.length} recent cleared auctions (demo data)`,
        });
        const anomalyPoints = computeAnomalies(MOCK_PANEL_PRODUCTION);
        setAnomalies(anomalyPoints.map((p) => ({
          panelId: 1,
          index: p.index,
          severity: severityFromZ(p.zScore),
          message: `Production of ${MOCK_PANEL_PRODUCTION[p.index]} Wh deviates ${Math.abs(p.zScore)}σ from baseline (demo data)`,
        })));
        return;
      }

      // --- Live mode: pull recent slots from EnergyOracle / EnergyMarket ---
      const nowSlot = currentSlot();
      const slots = Array.from({ length: LOOKBACK_SLOTS }, (_, i) => nowSlot - (LOOKBACK_SLOTS - 1 - i) * SLOT_DURATION);

      const supplyHistory = [];
      const demandHistory = [];
      const clearedPrices = [];
      for (const slot of slots) {
        const [production, auction] = await Promise.all([
          contracts.energyOracle.getTotalProductionInSlot(slot),
          contracts.energyMarket.getAuction(slot),
        ]);
        supplyHistory.push(Number(production));
        demandHistory.push(Number(auction.totalBidQuantity));
        if (auction.isCleared && auction.clearingPrice > 0n) {
          clearedPrices.push(parseFloat(ethers.formatEther(auction.clearingPrice)));
        }
      }

      const supplyForecast = computeForecast(supplyHistory);
      const demandForecast = computeForecast(demandHistory);
      setForecast({
        predictedSupply: supplyForecast.predicted,
        predictedDemand: demandForecast.predicted,
        confidence: Math.min(supplyForecast.confidence, demandForecast.confidence),
      });

      setPriceSuggestion({
        price: computeWeightedPrice(clearedPrices),
        basis: clearedPrices.length > 0
          ? `Recency-weighted average of ${clearedPrices.length} recent cleared auction(s)`
          : 'No recent cleared auctions — insufficient data',
      });

      // Anomaly detection needs per-panel history; without a panel selector
      // this view samples aggregate supply history as a lightweight signal.
      const anomalyPoints = computeAnomalies(supplyHistory);
      setAnomalies(anomalyPoints.map((p) => ({
        panelId: '—',
        index: p.index,
        severity: severityFromZ(p.zScore),
        message: `Total slot production of ${supplyHistory[p.index]} Wh deviates ${Math.abs(p.zScore)}σ from the recent baseline`,
      })));
    } catch (e) {
      console.error('MarketIntelligence.refresh:', e);
      setError('Could not compute market intelligence. Check contract deployment.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [contracts?.energyOracle, contracts?.energyMarket]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Market Intelligence</h1>
          <p className="text-sm text-slate-400 mt-1">
            Heuristic supply/demand forecasting, price suggestion &amp; anomaly detection
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm text-slate-300 transition-colors"
        >
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {loading && !forecast ? (
        <p className="text-sm text-slate-500">Computing forecast…</p>
      ) : (
        <>
          <ForecastCard forecast={forecast} />
          <PriceSuggestionBanner suggestion={priceSuggestion} />
          <AnomalyList anomalies={anomalies} />
        </>
      )}
    </div>
  );
}

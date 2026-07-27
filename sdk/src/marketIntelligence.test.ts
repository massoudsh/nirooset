/**
 * marketIntelligence.test.ts — unit tests for the pure statistical helpers
 * behind the Market Intelligence feature (forecasting, anomaly detection,
 * recency-weighted pricing). These are plain-function tests — no contract
 * or network mocking required.
 */

import { describe, it, expect } from 'vitest';
import { computeForecast, computeAnomalies, computeWeightedPrice } from './index';

describe('computeForecast', () => {
  it('returns zero confidence for an empty series', () => {
    const result = computeForecast([]);
    expect(result.predicted).toBe(0n);
    expect(result.confidence).toBe(0);
  });

  it('returns the single value with low confidence for a 1-point series', () => {
    const result = computeForecast([100n]);
    expect(result.predicted).toBe(100n);
    expect(result.confidence).toBe(0.3);
  });

  it('extrapolates an upward trend', () => {
    // Steady +10 per step: 100, 110, 120, 130, 140, 150
    const history = [100n, 110n, 120n, 130n, 140n, 150n];
    const result = computeForecast(history);
    expect(result.predicted).toBeGreaterThan(150n);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  it('extrapolates a downward trend and never predicts negative', () => {
    const history = [50n, 40n, 30n, 20n, 10n, 0n];
    const result = computeForecast(history);
    expect(result.predicted).toBeGreaterThanOrEqual(0n);
  });

  it('gives low confidence for a noisy/flat series', () => {
    const history = [100n, 10n, 90n, 20n, 80n, 30n];
    const result = computeForecast(history);
    expect(result.confidence).toBeLessThan(0.7);
  });
});

describe('computeAnomalies', () => {
  it('returns no anomalies for fewer than 3 points', () => {
    expect(computeAnomalies([1n, 2n])).toEqual([]);
  });

  it('returns no anomalies for a perfectly uniform series', () => {
    expect(computeAnomalies([100n, 100n, 100n, 100n])).toEqual([]);
  });

  it('flags a single clear outlier', () => {
    const values = [100n, 105n, 98n, 102n, 500n, 101n, 99n];
    const anomalies = computeAnomalies(values);
    expect(anomalies.length).toBe(1);
    expect(anomalies[0].index).toBe(4);
    expect(anomalies[0].zScore).toBeGreaterThan(2);
  });

  it('respects a custom z-score threshold', () => {
    const values = [100n, 110n, 90n, 200n, 105n];
    const strict = computeAnomalies(values, 5); // very high threshold — nothing qualifies
    expect(strict).toEqual([]);
  });
});

describe('computeWeightedPrice', () => {
  it('returns 0 for an empty list', () => {
    expect(computeWeightedPrice([])).toBe(0n);
  });

  it('returns the single price unchanged', () => {
    expect(computeWeightedPrice([42n])).toBe(42n);
  });

  it('weighs later (more recent) entries more heavily', () => {
    // Weights are 1,2,3 for [10, 10, 100] -> (10*1+10*2+100*3)/6 = 330/6 = 55
    const result = computeWeightedPrice([10n, 10n, 100n]);
    expect(result).toBe(55n);
  });

  it('is order-sensitive (recency matters)', () => {
    const risingRecent  = computeWeightedPrice([10n, 10n, 100n]); // spike is most recent
    const fallingRecent = computeWeightedPrice([100n, 10n, 10n]); // spike is oldest
    expect(risingRecent).toBeGreaterThan(fallingRecent);
  });
});

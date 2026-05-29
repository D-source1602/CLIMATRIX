/**
 * AI-powered carbon emission anomaly detection.
 *
 * Tier-1 implementation is a pure statistical rule (rolling z-score + sudden
 * percentage spike). Stateless — accepts a series of CO2 readings in the
 * request body and returns alerts. No DB, no model training, no Python.
 *
 * Swapping in a real ML model later is a one-line change inside `detect()`:
 * the route shape is intentionally identical to what an ML microservice
 * (e.g. FastAPI + Isolation Forest) would expose.
 */
import { Router } from 'express';

export const anomalyRouter = Router();

interface EmissionReading {
  timestamp: string;
  co2: number;
}

interface AnomalyAlert {
  timestamp: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  reason: string;
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function standardDeviation(values: number[]): number {
  const avg = mean(values);
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function getSeverity(
  zScore: number,
  percentageIncrease: number,
): 'low' | 'medium' | 'high' {
  if (zScore >= 3.5 || percentageIncrease >= 80) return 'high';
  if (zScore >= 2.5 || percentageIncrease >= 40) return 'medium';
  return 'low';
}

anomalyRouter.post('/detect', (req, res) => {
  const readings = req.body?.readings as EmissionReading[] | undefined;

  if (!Array.isArray(readings) || readings.length < 3) {
    return res.status(400).json({
      hasAnomaly: false,
      alerts: [],
      summary: 'At least 3 CO2 readings are required for anomaly detection.',
    });
  }

  const alerts: AnomalyAlert[] = [];
  const windowSize = 5;

  for (let i = 1; i < readings.length; i++) {
    const current = readings[i];
    const previous = readings[i - 1];
    if (!current || !previous) continue;

    const start = Math.max(0, i - windowSize);
    const historical = readings.slice(start, i).map((r) => r.co2);

    const avg = mean(historical);
    const stdDev = standardDeviation(historical) || 1;
    const zScore = (current.co2 - avg) / stdDev;
    const percentageIncrease =
      previous.co2 === 0
        ? 0
        : ((current.co2 - previous.co2) / previous.co2) * 100;

    const isZScoreAnomaly = zScore > 2.5;
    const isSuddenSpike = percentageIncrease >= 40;

    if (isZScoreAnomaly || isSuddenSpike) {
      alerts.push({
        timestamp: current.timestamp,
        value: current.co2,
        severity: getSeverity(zScore, percentageIncrease),
        confidence: Number(
          Math.min(0.99, Math.max(0.7, zScore / 4)).toFixed(2),
        ),
        reason: isSuddenSpike
          ? `CO2 increased by ${percentageIncrease.toFixed(1)}% compared to previous reading`
          : `CO2 z-score ${zScore.toFixed(2)} exceeded anomaly threshold of 2.5`,
      });
    }
  }

  return res.json({
    hasAnomaly: alerts.length > 0,
    alerts,
    summary:
      alerts.length > 0
        ? `${alerts.length} sudden carbon emission spike${alerts.length > 1 ? 's' : ''} detected.`
        : 'No abnormal emission spike detected.',
  });
});

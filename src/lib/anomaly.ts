import { api } from './api';

export interface EmissionReading {
  timestamp: string;
  co2: number;
}

export interface AnomalyAlert {
  timestamp: string;
  value: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  reason: string;
}

export interface AnomalyResponse {
  hasAnomaly: boolean;
  alerts: AnomalyAlert[];
  summary: string;
}

/**
 * Calls the backend anomaly detection endpoint.
 * Uses the shared `api()` helper so it picks up VITE_API_URL automatically
 * (no hard-coded localhost ports).
 */
export async function detectAnomaly(
  readings: EmissionReading[],
): Promise<AnomalyResponse> {
  return api<AnomalyResponse>('/anomaly/detect', {
    method: 'POST',
    body: { readings },
  });
}

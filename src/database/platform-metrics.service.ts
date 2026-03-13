
'use client';

import { initializeFirebase } from '@/firebase';
import { doc, setDoc, increment, Firestore } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';

/**
 * Global Platform Metrics Service.
 * Tracks operational costs and total API usage across the platform.
 * Used by admins to monitor the 99%+ profit margins.
 */
export class PlatformMetricsService {
  private readonly db: Firestore;

  constructor() {
    const { firestore } = initializeFirebase();
    this.db = firestore;
  }

  /**
   * Records operational costs for the platform.
   * Internal Costs: 
   * - AI: $0.0001 per call
   * - SERP: $0.01 per search
   */
  async recordMetrics(costs: { ai_cost?: number; serp_cost?: number }) {
    const now = new Date();
    const monthId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const metricsRef = doc(this.db, 'platform_metrics', monthId);

    const data = {
      ai_cost_estimate: increment(costs.ai_cost || 0),
      serp_api_cost: increment(costs.serp_cost || 0),
      total_api_calls: increment(1),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Non-blocking write to avoid slowing down the main process
      setDoc(metricsRef, data, { merge: true }).catch(err => {
        logger.error({ error: err.message, monthId }, "PlatformMetricsService: Failed to increment metrics");
      });
    } catch (err: any) {
      logger.error({ error: err.message }, "PlatformMetricsService: Error initiating metric record");
    }
  }
}

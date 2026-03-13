
'use client';
/**
 * @fileOverview Organization Usage Tracking Utility.
 * 
 * Records metered resource consumption events (e.g., AI Audits, AI Credits).
 * Also performs atomic aggregation into monthly summaries.
 */

import { collection, doc, setDoc, increment, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface UsageInput {
  organizationId: string;
  userId?: string;
  eventType: 'AI_AUDIT' | 'AI_CREDIT' | string;
  quantity?: number;
  metadata?: Record<string, any>;
}

/**
 * Records a discrete usage event for an organization and triggers aggregation.
 */
export async function trackUsage(
  db: Firestore,
  data: UsageInput
) {
  const { organizationId, userId, eventType, quantity = 1, metadata = {} } = data;
  
  // 1. Log discrete event
  const usageRef = collection(db, 'organizations', organizationId, 'usage_events');
  addDocumentNonBlocking(usageRef, {
    organizationId,
    userId: userId || null,
    eventType,
    quantity,
    metadata,
    createdAt: new Date().toISOString(),
  });

  // 2. Perform atomic aggregation into monthly summary
  incrementUsageSummary(db, { organizationId, eventType, quantity });
}

/**
 * Atomically increments usage for an organization within the current billing period.
 * Summaries are stored at: /organizations/{orgId}/usage_summaries/{YYYY-MM}
 */
export function incrementUsageSummary(
  db: Firestore,
  data: { organizationId: string; eventType: string; quantity: number }
) {
  const { organizationId, eventType, quantity = 1 } = data;
  
  const now = new Date();
  const periodId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  
  const summaryRef = doc(db, 'organizations', organizationId, 'usage_summaries', periodId);
  
  setDoc(summaryRef, {
    organizationId,
    periodId,
    totals: {
      [eventType]: increment(quantity)
    },
    updatedAt: new Date().toISOString(),
  }, { merge: true }).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: summaryRef.path,
        operation: 'update',
        requestResourceData: { totals: { [eventType]: `increment(${quantity})` } },
      })
    );
  });
}

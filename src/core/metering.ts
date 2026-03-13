'use client';

import { collection, doc, setDoc, increment, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileOverview Metering Service.
 * Handles metered usage tracking and atomic monthly aggregation.
 */

export interface MeteringInput {
  organizationId: string;
  userId?: string;
  eventType: 'aiCreditsUsed' | 'crawlsExecuted' | 'keywordsTracked' | string;
  quantity?: number;
  metadata?: Record<string, any>;
}

/**
 * Records a discrete usage event and updates the monthly summary.
 */
export async function trackUsage(db: Firestore, data: MeteringInput) {
  const { organizationId, userId, eventType, quantity = 1, metadata = {} } = data;
  
  const usageRef = collection(db, 'organizations', organizationId, 'usage_events');
  addDocumentNonBlocking(usageRef, {
    organizationId,
    userId: userId || null,
    eventType,
    quantity,
    metadata,
    createdAt: new Date().toISOString(),
  });

  incrementUsageSummary(db, organizationId, eventType, quantity);
}

/**
 * Atomically increments the monthly usage total for an organization.
 */
function incrementUsageSummary(db: Firestore, organizationId: string, eventType: string, quantity: number) {
  const now = new Date();
  const periodId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  
  const summaryRef = doc(db, 'organizations', organizationId, 'usage_summaries', periodId);
  
  setDoc(summaryRef, {
    organizationId,
    periodId,
    totals: {
      [eventType]: increment(quantity)
    },
    // Mirroring specific fields requested by the guard
    [eventType]: increment(quantity),
    updatedAt: new Date().toISOString(),
  }, { merge: true }).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: summaryRef.path,
        operation: 'update',
        requestResourceData: { [eventType]: `increment(${quantity})` },
      })
    );
  });
}

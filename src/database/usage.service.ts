import { collection, doc, setDoc, increment, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Metered Resource Consumption Tracking Service.
 */

export interface UsageInput {
  organizationId: string;
  userId?: string;
  eventType: 'AI_AUDIT' | 'AI_CREDIT' | string;
  quantity?: number;
  metadata?: Record<string, any>;
}

export async function trackUsage(db: Firestore, data: UsageInput) {
  const { organizationId, userId, eventType, quantity = 1, metadata = {} } = data;
  const usageRef = collection(db, 'organizations', organizationId, 'usage_events');
  addDocumentNonBlocking(usageRef, { organizationId, userId: userId || null, eventType, quantity, metadata, createdAt: new Date().toISOString() });
  incrementUsageSummary(db, organizationId, eventType, quantity);
}

function incrementUsageSummary(db: Firestore, organizationId: string, eventType: string, quantity: number) {
  const now = new Date();
  const periodId = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const summaryRef = doc(db, 'organizations', organizationId, 'usage_summaries', periodId);
  setDoc(summaryRef, { organizationId, periodId, totals: { [eventType]: increment(quantity) }, updatedAt: new Date().toISOString() }, { merge: true })
    .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: summaryRef.path, operation: 'update', requestResourceData: { totals: { [eventType]: `inc(${quantity})` } } })));
}

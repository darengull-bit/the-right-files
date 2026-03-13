import { collection, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * Organization Audit Trail Service.
 */

export interface AuditLogEntry {
  organizationId: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValueHash?: string;
  newValueHash?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
  createdAt?: string;
}

export function logAuditAction(db: Firestore, entry: Omit<AuditLogEntry, 'createdAt' | 'userAgent' | 'timestamp'>) {
  const auditLogsRef = collection(db, 'organizations', entry.organizationId, 'auditLogs');
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'BackgroundWorker';
  const now = new Date().toISOString();
  addDocumentNonBlocking(auditLogsRef, { ...entry, userAgent, timestamp: now, createdAt: now });
}

export async function audit(db: Firestore, data: AuditLogEntry) {
  if (!data.organizationId) return;
  return logAuditAction(db, data);
}

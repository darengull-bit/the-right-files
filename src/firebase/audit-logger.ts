
'use client';

import { collection, Firestore } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * Interface for Audit Log entries based on your requested schema.
 * Supports hashing for data integrity tracking.
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

/**
 * Logs an action to the organization's audit trail.
 * Automatically captures environment metadata on the client.
 * 
 * @param db - Firestore instance.
 * @param entry - The audit data to log.
 */
export function logAuditAction(
  db: Firestore, 
  entry: Omit<AuditLogEntry, 'createdAt' | 'userAgent' | 'ipAddress' | 'timestamp'>
) {
  const auditLogsRef = collection(db, 'organizations', entry.organizationId, 'auditLogs');
  
  // Capture client-side metadata if available
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Server/Background';
  const now = new Date().toISOString();
  
  addDocumentNonBlocking(auditLogsRef, {
    ...entry,
    userAgent,
    timestamp: now,
    createdAt: now,
  });
}

/**
 * An alias for logAuditAction that matches the mental model of a prisma-like audit call.
 * This is used primarily in server actions where we might want to wait or have a consistent API.
 */
export async function audit(
  db: Firestore,
  data: AuditLogEntry
) {
  if (!data.organizationId) return;
  
  const now = new Date().toISOString();
  const entry = {
    ...data,
    timestamp: data.timestamp || now,
    createdAt: data.createdAt || now,
  };

  return logAuditAction(db, entry);
}

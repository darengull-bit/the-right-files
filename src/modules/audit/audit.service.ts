import { Firestore } from 'firebase/firestore';
import { logAuditAction as logToDb } from '@/firebase/audit-logger';

/**
 * Audit Module Service
 * Handles platform and organization-level audit trails.
 */
export class AuditService {
  constructor(private readonly db: Firestore) {}

  async log(entry: {
    organizationId: string;
    userId?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    oldValueHash?: string;
    newValueHash?: string;
    metadata?: Record<string, any>;
  }) {
    return logToDb(this.db, entry);
  }
}


import { Firestore } from 'firebase/firestore';
import { trackUsage as trackInDb } from '@/firebase/usage-tracker';

/**
 * Usage Module Service
 * Manages metered resource consumption and aggregation.
 */
export class UsageService {
  constructor(private readonly db: Firestore) {}

  /**
   * Records a resource consumption event.
   */
  async record(input: {
    organizationId: string;
    userId?: string;
    eventType: 'AI_AUDIT' | 'AI_CREDIT' | 'ai_content_grading' | string;
    quantity?: number;
    metadata?: Record<string, any>;
  }) {
    return trackInDb(this.db, input);
  }
}

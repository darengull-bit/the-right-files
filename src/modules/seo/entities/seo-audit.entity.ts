/**
 * @fileOverview SeoAudit Entity.
 * Represents a historical record of an SEO content or performance audit.
 */

export interface SeoAudit {
  id: string;
  organizationId: string;
  userId: string;
  url: string;
  score?: number;
  breakdown?: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
}

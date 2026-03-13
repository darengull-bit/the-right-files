/**
 * @fileOverview Data Transfer Object for creating an SEO Audit record.
 */

export interface CreateSeoAuditDto {
  organizationId: string;
  userId: string;
  url: string;
  status: 'pending' | 'completed' | 'failed';
  score?: number;
  breakdown?: Record<string, any>;
  error?: string;
}

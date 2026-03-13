import { FixTask } from '../../fix-engine/models/fix-task.model';

/**
 * @fileOverview Data model for an AI-driven SEO resolution request.
 * Contains the specific task and the organizational context for optimization.
 */
export interface AiFixRequest {
  task: FixTask;
  siteContext: {
    businessName: string;
    city?: string;
    province?: string;
    primaryKeywords: string[];
  };
}

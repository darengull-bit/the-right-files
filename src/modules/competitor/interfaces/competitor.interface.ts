
/**
 * @fileOverview Competitor Module Interfaces.
 */

export interface Competitor {
  id: string;
  organizationId: string;
  domain: string;
  name?: string;
  visibilityScore: number;
  topKeywords: string[];
  lastAnalyzedAt: string;
}

export interface CompetitorAnalysisResult {
  domain: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  metadata?: any;
}

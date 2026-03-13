
/**
 * @fileOverview Data Transfer Objects for Competitor Analysis.
 */

export interface AnalyzeCompetitorDto {
  organizationId: string;
  userId: string;
  keyword: string;
  city?: string;
  targetDomain: string;
}

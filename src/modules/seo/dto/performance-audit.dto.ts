/**
 * @fileOverview Data Transfer Objects for Performance Auditing.
 */

export interface PerformanceAuditRequestDto {
  url: string;
  strategy?: 'mobile' | 'desktop';
}

export interface PerformanceAuditResponseDto {
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

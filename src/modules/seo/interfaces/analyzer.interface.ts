
/**
 * @fileOverview Standard interfaces for SEO Analyzers.
 */

export interface AnalyzerResult {
  score: number;
  maxScore: number;
  issues: string[];
  recommendations: string[];
  metadata?: any;
}

export interface SeoAnalyzer {
  name: string;
  weight: number;
  /**
   * Analyzes the provided content.
   * Interface is kept lean to ensure analyzers focus purely on technical/semantic checks.
   */
  analyze(html: string, url: string): Promise<AnalyzerResult>;
}

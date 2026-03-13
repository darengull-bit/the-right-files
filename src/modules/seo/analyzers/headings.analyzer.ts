
import { SeoAnalyzer, AnalyzerResult } from '../interfaces/analyzer.interface';
import * as cheerio from 'cheerio';

/**
 * Validates heading hierarchy (H1-H3).
 */
export class HeadingsAnalyzer implements SeoAnalyzer {
  name = 'Headings Analyzer';
  weight = 25;

  async analyze(html: string, url: string): Promise<AnalyzerResult> {
    const $ = cheerio.load(html);
    const h1s = $('h1');
    const h2s = $('h2');
    const h3s = $('h3');

    let score = this.weight;
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (h1s.length === 0) {
      score -= 15;
      issues.push('Missing H1 tag');
      recommendations.push('Add exactly one H1 tag to define the page topic.');
    } else if (h1s.length > 1) {
      score -= 5;
      issues.push('Multiple H1 tags');
      recommendations.push('Consolidate H1 tags; use only one for optimal structure.');
    }

    if (h2s.length === 0) {
      score -= 5;
      issues.push('Missing H2 tags');
      recommendations.push('Use H2 tags to break content into logical sections.');
    }

    return {
      score: Math.max(0, score),
      maxScore: this.weight,
      issues,
      recommendations,
      metadata: {
        h1Count: h1s.length,
        h2Count: h2s.length,
        h3Count: h3s.length,
      },
    };
  }
}

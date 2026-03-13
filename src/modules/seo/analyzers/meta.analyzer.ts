
import { SeoAnalyzer, AnalyzerResult } from '../interfaces/analyzer.interface';
import * as cheerio from 'cheerio';

/**
 * Analyzes meta description for presence and length.
 */
export class MetaAnalyzer implements SeoAnalyzer {
  name = 'Meta Description Analyzer';
  weight = 15;

  async analyze(html: string, url: string): Promise<AnalyzerResult> {
    const $ = cheerio.load(html);
    const description = $('meta[name="description"]').attr('content')?.trim() || '';

    if (!description) {
      return {
        score: 0,
        maxScore: this.weight,
        issues: ['Missing meta description'],
        recommendations: ['Add a unique meta description to entice users to click from search results.'],
      };
    }

    const length = description.length;
    let score = this.weight;
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (length < 120) {
      score = Math.round(this.weight * 0.7);
      issues.push('Meta description too short');
      recommendations.push('Extend description to at least 120 characters.');
    } else if (length > 160) {
      score = Math.round(this.weight * 0.8);
      issues.push('Meta description too long');
      recommendations.push('Keep description under 160 characters to ensure it displays correctly.');
    }

    return {
      score,
      maxScore: this.weight,
      issues,
      recommendations,
      metadata: { length, text: description },
    };
  }
}

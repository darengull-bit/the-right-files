
import { SeoAnalyzer, AnalyzerResult } from '../interfaces/analyzer.interface';
import * as cheerio from 'cheerio';

/**
 * Analyzes the HTML title tag for length and presence.
 */
export class TitleAnalyzer implements SeoAnalyzer {
  name = 'Title Analyzer';
  weight = 15;

  async analyze(html: string, url: string): Promise<AnalyzerResult> {
    const $ = cheerio.load(html);
    const title = $('title').text().trim();

    if (!title) {
      return {
        score: 0,
        maxScore: this.weight,
        issues: ['Missing title tag'],
        recommendations: ['Add a descriptive <title> tag to your page.'],
      };
    }

    const length = title.length;
    let score = this.weight;
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (length < 30) {
      score = Math.round(this.weight * 0.6);
      issues.push('Title too short');
      recommendations.push('Extend title to at least 30 characters for better visibility.');
    } else if (length > 60) {
      score = Math.round(this.weight * 0.7);
      issues.push('Title too long');
      recommendations.push('Shorten title to under 60 characters to avoid truncation in SERPs.');
    }

    return {
      score,
      maxScore: this.weight,
      issues,
      recommendations,
      metadata: { length, text: title },
    };
  }
}

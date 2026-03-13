
import * as cheerio from 'cheerio';
import { AiService } from '@/modules/ai/ai.service';
import { SeoAnalyzer, AnalyzerResult } from '../interfaces/analyzer.interface';

/**
 * @fileOverview AI-Enhanced Content Analyzer.
 * 
 * Performs technical and semantic analysis of page content using 
 * cheerio for parsing and modular AI flows for grading.
 */

export class ContentAnalyzer implements SeoAnalyzer {
  name = 'Content Analyzer';
  weight = 25;

  constructor(private readonly aiService: AiService) {}

  /**
   * Executes a deep content audit on raw HTML.
   * Contextual usage tracking is handled by the calling service.
   */
  async analyze(html: string, url: string): Promise<AnalyzerResult> {
    const $ = cheerio.load(html);
    
    // 1. Extract and Clean Content
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    // 2. Technical Check: Thin Content
    if (!content || content.length < 300) {
      return {
        score: 0,
        maxScore: 25,
        issues: ['Thin content'],
        recommendations: ['Add more detailed, high-value content to reach at least 300 words.'],
      };
    }

    // 3. AI Grading with Fallback
    try {
      const aiScore = await this.aiService.gradeSeoContent({
        content,
        targetKeyword: this.extractKeyword(url),
        city: this.extractCity(content),
      });

      // 4. Calculate Weighted Score (Total 60 max pts normalized to 25)
      const total =
        aiScore.depth +
        aiScore.relevance +
        aiScore.localOptimization +
        aiScore.readability +
        aiScore.conversionClarity +
        aiScore.eeatSignals;

      const normalized = Math.round((total / 60) * 25);

      return {
        score: normalized,
        maxScore: 25,
        issues: normalized < 15 ? ['Low content quality or poor semantic relevance'] : [],
        recommendations: aiScore.recommendations,
        metadata: aiScore,
      };
    } catch (e) {
      return {
        score: 10,
        maxScore: 25,
        issues: ['AI scoring unavailable'],
        recommendations: ['Check content for semantic depth and local intent manually.'],
      };
    }
  }

  private extractKeyword(url: string): string {
    try {
      const parts = url.split('/');
      const slug = parts.pop() || parts.pop() || '';
      return slug.replace(/-/g, ' ');
    } catch {
      return '';
    }
  }

  private extractCity(content: string): string | undefined {
    const match = content.match(
      /(calgary|vancouver|toronto|victoria|courtenay|kelowna|edmonton)/i
    );
    return match?.[0];
  }
}

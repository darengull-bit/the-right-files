import * as cheerio from 'cheerio';
import { logger } from '@/core/logging/logger';

/**
 * @fileOverview SEO Engine.
 * Handles the Crawl + Analyze logic for the platform.
 */

export interface PageAnalysis {
  url: string;
  title?: string;
  description?: string;
  h1Count: number;
  wordCount: number;
  hasSchema: boolean;
  score: number;
  issues: string[];
}

export class SeoEngine {
  /**
   * Performs a technical scan of a page's HTML.
   */
  async analyzePage(html: string, url: string): Promise<PageAnalysis> {
    logger.info({ url }, "SeoEngine: Analyzing page content");
    const $ = cheerio.load(html);
    
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content')?.trim();
    const h1Count = $('h1').length;
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).length;
    const hasSchema = $('script[type="application/ld+json"]').length > 0;

    const issues: string[] = [];
    let score = 100;

    if (!title) {
      issues.push("Missing title tag");
      score -= 20;
    } else if (title.length > 60) {
      issues.push("Title too long");
      score -= 5;
    }

    if (!description) {
      issues.push("Missing meta description");
      score -= 15;
    }

    if (h1Count === 0) {
      issues.push("Missing H1 tag");
      score -= 15;
    } else if (h1Count > 1) {
      issues.push("Multiple H1 tags detected");
      score -= 5;
    }

    if (wordCount < 300) {
      issues.push("Thin content (under 300 words)");
      score -= 10;
    }

    if (!hasSchema) {
      issues.push("No structured data (JSON-LD) found");
      score -= 10;
    }

    return {
      url,
      title,
      description,
      h1Count,
      wordCount,
      hasSchema,
      score: Math.max(0, score),
      issues
    };
  }

  /**
   * Simplified crawler logic.
   */
  async fetchPage(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'AgentPro-Bot/1.0' },
        next: { revalidate: 3600 }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err: any) {
      logger.error({ url, error: err.message }, "SeoEngine: Fetch failed");
      throw err;
    }
  }
}

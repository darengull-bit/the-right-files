
import axios from "axios";
import { logger } from "@/lib/logger";

/**
 * Service for interacting with the Google PageSpeed Insights API.
 */

export interface PageSpeedResult {
  performanceScore: number;
  accessibilityScore: number;
  seoScore: number;
  bestPracticesScore: number;
}

/**
 * Runs a PageSpeed Insights audit for a given URL.
 * 
 * @param url - The URL to analyze.
 * @param strategy - The analysis strategy ('mobile' or 'desktop').
 */
export async function fetchPageSpeedData(url: string, strategy: 'mobile' | 'desktop' = 'mobile'): Promise<PageSpeedResult> {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    logger.error("Google API Key is missing for PageSpeed audit");
    throw new Error("PageSpeed configuration incomplete");
  }

  try {
    logger.info({ url, strategy }, "Running Google PageSpeed audit");

    const response = await axios.get("https://www.googleapis.com/pagespeedonline/v5/runPagespeed", {
      params: {
        key: apiKey,
        url: url,
        strategy: strategy,
        category: ["performance", "accessibility", "seo", "best-practices"]
      }
    });

    const lighthouse = response.data.lighthouseResult;
    const categories = lighthouse.categories;

    return {
      performanceScore: Math.round((categories.performance?.score || 0) * 100),
      accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
      seoScore: Math.round((categories.seo?.score || 0) * 100),
      bestPracticesScore: Math.round((categories["best-practices"]?.score || 0) * 100),
    };

  } catch (err: any) {
    logger.error({ error: err.message, url }, "Failed to fetch PageSpeed data from Google");
    throw err;
  }
}

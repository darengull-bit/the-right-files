
import { logger } from "@/core/logging/logger";

/**
 * SERP Scraper for Competitor Discovery.
 * Identifies domains dominating search results for specific keywords using SerpApi.
 */
export class SerpScraper {
  /**
   * Fetches top organic search results from SerpApi.
   * 
   * @param query - The search query.
   * @param limit - Number of results to return.
   * @returns Array of result URLs.
   */
  async getTopResults(query: string, limit: number): Promise<string[]> {
    const apiKey = process.env.SERP_API_KEY;
    
    if (!apiKey) {
      logger.error("SERP_API_KEY is missing. Falling back to empty results.");
      return [];
    }

    try {
      logger.info({ query, limit }, "SerpScraper: Fetching organic results from SerpApi");
      
      const response = await fetch(
        `https://serpapi.com/search?q=${encodeURIComponent(query)}&num=${limit}&api_key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`SerpApi request failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.organic_results) {
        logger.warn({ data }, "SerpScraper: No organic results found in SerpApi response");
        return [];
      }

      return data.organic_results
        .slice(0, limit)
        .map((r: any) => r.link);
    } catch (err: any) {
      logger.error({ query, error: err.message }, "SerpScraper: Discovery failed");
      return [];
    }
  }
}

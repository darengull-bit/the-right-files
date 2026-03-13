import { logger } from "@/core/logging/logger";
import { PlatformMetricsService } from "@/database/platform-metrics.service";

/**
 * @fileOverview SERP Provider.
 * Updated to use standard fetch for build stability.
 */
export class SerpProvider {
  private readonly metricsService = new PlatformMetricsService();

  async search(query: string): Promise<any> {
    const apiKey = process.env.SERP_API_KEY;
    
    if (!apiKey) {
      logger.error("SERP_API_KEY is missing.");
      return { organic_results: [] };
    }

    this.metricsService.recordMetrics({ serp_cost: 0.01 });

    try {
      const response = await fetch(
        `https://serpapi.com/search?q=${encodeURIComponent(query)}&num=20&api_key=${apiKey}`
      );

      if (!response.ok) {
        throw new Error(`SerpApi failed: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      logger.error({ query, error: err.message }, "SerpProvider: Search failed");
      throw err;
    }
  }
}

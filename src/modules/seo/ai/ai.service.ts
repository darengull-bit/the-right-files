
import { logger } from '@/core/logging/logger';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PlatformMetricsService } from '@/database/platform-metrics.service';

/**
 * @fileOverview SEO AI Resolution Service.
 * Provides low-level AI utilities for generating structured SEO optimizations.
 */
export class SeoAiService {
  private readonly metricsService = new PlatformMetricsService();

  /**
   * Shared utility to generate a structured JSON response using Genkit.
   * Ensures the LLM returns perfectly valid JSON matching the requested shape.
   */
  async generateStructuredResponse(prompt: string, schema?: z.ZodTypeAny): Promise<any> {
    // Record AI cost estimate before generation
    // Est: $0.0001 per call for Gemini 2.5 Flash usage
    this.metricsService.recordMetrics({ ai_cost: 0.0001 });

    const { output } = await ai.generate({
      system: 'You are an expert real estate SEO engineer. Return only valid JSON. No commentary.',
      prompt,
      output: {
        schema: schema || z.any(),
      },
      config: {
        temperature: 0.3,
      }
    });

    if (!output) {
      logger.error({ prompt }, "SeoAiService: AI failed to generate output");
      throw new Error("AI failed to generate a structured response.");
    }

    return output;
  }
}

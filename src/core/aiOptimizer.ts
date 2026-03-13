
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { logger } from '@/core/logging/logger';
import { generateSocialContent as socialFlow } from '@/ai/flows/social-content-flow';

/**
 * @fileOverview AI Optimizer Core.
 * Centralized logic for AI-driven SEO and content generation.
 */
export class AiOptimizer {
  /**
   * Generates optimized real estate metadata.
   */
  async optimizeMetadata(context: {
    domain: string;
    city: string;
    keyword: string;
    currentTitle?: string;
    currentDescription?: string;
  }) {
    logger.info({ keyword: context.keyword }, "AiOptimizer: Optimizing metadata");

    const schema = z.object({
      title: z.string().max(60),
      description: z.string().max(160),
      confidence: z.number()
    });

    const { output } = await ai.generate({
      prompt: `Generate high-CTR real estate metadata for ${context.domain} in ${context.city}.
      Target Keyword: ${context.keyword}
      Current Title: ${context.currentTitle || 'N/A'}
      Current Description: ${context.currentDescription || 'N/A'}`,
      output: { schema },
      config: { temperature: 0.2 }
    });

    if (!output) throw new Error("Metadata generation failed");
    return output;
  }

  /**
   * Generates Schema.org JSON-LD.
   */
  async generateSchema(context: {
    businessName: string;
    city: string;
    type?: 'RealEstateAgent' | 'LocalBusiness';
  }) {
    const type = context.type || 'RealEstateAgent';
    
    const { output } = await ai.generate({
      prompt: `Generate valid JSON-LD schema for a ${type} named "${context.businessName}" in ${context.city}.`,
      output: { 
        schema: z.object({ 
          schema: z.any(), 
          confidence: z.number() 
        }) 
      }
    });

    if (!output) throw new Error("Schema generation failed");
    return output;
  }

  /**
   * Generates platform-specific social media variants.
   */
  async generateSocialContent(context: {
    propertyTitle: string;
    city: string;
    description: string;
    keyFeatures: string[];
  }) {
    return socialFlow(context);
  }
}

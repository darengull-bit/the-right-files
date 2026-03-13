import { ai } from '@/ai/genkit';
import { runSeoAudit, type SeoAuditInput } from "@/ai/flows/seo-audit-flow";
import { optimizePageContent, type ContentOptimizationInput } from "@/ai/flows/content-optimization-flow";
import { generateSocialContent, type SocialContentInput } from "@/ai/flows/social-content-flow";

/**
 * @fileOverview AI Integration Service (OpenAI/Genkit Adapter).
 * Provides a unified interface for all GenAI operations.
 */

export class OpenAiIntegrationService {
  /**
   * Wrapper for SEO Audit Genkit Flow.
   */
  async seoAudit(input: SeoAuditInput) {
    return runSeoAudit(input);
  }

  /**
   * Wrapper for Content Optimization Genkit Flow.
   */
  async optimizeContent(input: ContentOptimizationInput) {
    return optimizePageContent(input);
  }

  /**
   * Wrapper for Social Media Generation Genkit Flow.
   */
  async socialGen(input: SocialContentInput) {
    return generateSocialContent(input);
  }

  /**
   * Direct prompt access via Genkit.
   */
  async generate(prompt: string) {
    const { text } = await ai.generate(prompt);
    return text;
  }
}

import { OpenAiIntegrationService } from "@/integrations/openai/openai.service";
import { type SeoAuditInput } from "@/ai/flows/seo-audit-flow";
import { type ContentOptimizationInput } from "@/ai/flows/content-optimization-flow";
import { type SocialContentInput } from "@/ai/flows/social-content-flow";
import { seoContentPrompt, type SeoContentInput } from "./prompts/seo-content.prompt";
import { gradeContentPrompt, type GradeContentInput } from "./prompts/grade-content.prompt";
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/**
 * AI Module Service.
 * 
 * Orchestrates Genkit flows and modular prompts.
 * Metered usage recording is handled by controllers or higher-level services.
 */
export class AiService {
  private readonly aiIntegration = new OpenAiIntegrationService();

  /**
   * Generates a structured JSON response using Genkit's schema validation.
   * Replaces raw OpenAI client logic with the project's native Genkit architecture.
   */
  async generateStructuredResponse<T = any>(prompt: string, schema?: z.ZodTypeAny): Promise<T> {
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
      throw new Error("AI failed to generate a structured response.");
    }

    return output as T;
  }

  /**
   * Performs a deep SEO audit using the Genkit flow.
   */
  async performSeoAudit(input: SeoAuditInput) {
    return this.aiIntegration.seoAudit(input);
  }

  /**
   * Optimizes existing page metadata.
   */
  async optimizeContent(input: ContentOptimizationInput) {
    return this.aiIntegration.optimizeContent(input);
  }

  /**
   * Generates social media variants for a listing.
   */
  async generateSocialPosts(input: SocialContentInput) {
    return this.aiIntegration.socialGen(input);
  }

  /**
   * Generates high-level SEO metadata using the modular prompt registry.
   */
  async generateSeoContent(input: SeoContentInput) {
    const { output } = await seoContentPrompt(input);
    if (!output) throw new Error("AI failed to generate SEO content.");
    return output;
  }

  /**
   * Grades existing SEO content based on specific real estate and technical parameters.
   */
  async gradeSeoContent(input: GradeContentInput) {
    const { output } = await gradeContentPrompt({
      ...input,
      content: input.content.slice(0, 8000)
    });
    
    if (!output) throw new Error("AI failed to grade SEO content.");
    return output;
  }
}

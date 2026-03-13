
import { AiService } from './ai.service';
import { SeoAuditInput } from '@/ai/flows/seo-audit-flow';
import { ContentOptimizationInput } from '@/ai/flows/content-optimization-flow';
import { SocialContentInput } from '@/ai/flows/social-content-flow';
import { GradeContentInput } from './prompts/grade-content.prompt';
import { UsageModule } from '../usage/usage.module';

/**
 * AI Module Controller.
 * Manages external AI requests and records consumption for billing.
 */
export class AiController {
  private readonly usageService = UsageModule.getService();

  constructor(private readonly aiService: AiService) {}

  async runSeoAudit(input: SeoAuditInput) {
    return this.aiService.performSeoAudit(input);
  }

  async optimizePageContent(input: ContentOptimizationInput) {
    return this.aiService.optimizeContent(input);
  }

  async generateSocialPosts(input: SocialContentInput) {
    return this.aiService.generateSocialPosts(input);
  }

  /**
   * Triggers content grading and records consumption event.
   */
  async gradeContent(organizationId: string, userId: string, input: GradeContentInput) {
    const result = await this.aiService.gradeSeoContent(input);

    // Record usage for metered billing
    await this.usageService.record({
      organizationId,
      userId,
      eventType: 'ai_content_grading',
      quantity: 1,
    });

    return result;
  }
}

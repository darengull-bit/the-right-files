'use server';

import { generateBlogPost, type BlogPostInput, type BlogPostOutput } from "@/ai/flows/blog-post-flow";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { logger } from "@/lib/logger";
import { initializeFirebase } from "@/firebase";
import { trackUsage } from "@/firebase/usage-tracker";
import { audit } from "@/firebase/audit-logger";

/**
 * Server Action to generate SEO-optimized blog posts.
 * Normalized to 1 Credit per task.
 */
export async function generateBlogPostAction(
  organizationId: string, 
  userId: string, 
  input: BlogPostInput
): Promise<{ success: boolean; data?: BlogPostOutput; error?: string }> {
  try {
    // 1. Plan Enforcement
    await assertWithinPlanLimits(organizationId, 'ai');

    logger.info({ organizationId, topic: input.topic }, "Generating SEO blog post");

    // 2. Execute Genkit Flow
    const result = await generateBlogPost(input);

    // 3. Record Usage & Audit (1 Task = 1 Credit)
    const { firestore } = initializeFirebase();
    await trackUsage(firestore, {
      organizationId,
      userId,
      eventType: "AI_CREDIT",
      quantity: 1, 
      metadata: { topic: input.topic, city: input.city, task: 'blog_post' }
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "BLOG_POST_GENERATED",
      resourceType: "AI_Content",
      metadata: { topic: input.topic }
    });

    return {
      success: true,
      data: result
    };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Blog Post Generation failed");
    return {
      success: false,
      error: err.message || "Failed to generate SEO content."
    };
  }
}

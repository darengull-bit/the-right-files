'use server';

import { generateSocialContent, type SocialContentInput, type SocialContentOutput } from "@/ai/flows/social-content-flow";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { logger } from "@/lib/logger";
import { initializeFirebase } from "@/firebase";
import { trackUsage } from "@/firebase/usage-tracker";
import { audit } from "@/firebase/audit-logger";

/**
 * Server Action to generate AI social media posts with usage enforcement.
 */
export async function generateSocialPostsAction(organizationId: string, userId: string, input: SocialContentInput): Promise<{ success: boolean; data?: SocialContentOutput; error?: string }> {
  try {
    // 1. ENFORCEMENT: Throws error if plan limit reached
    await assertWithinPlanLimits(organizationId, 'AI_CONTENT');

    // 2. Execute AI Flow
    const result = await generateSocialContent(input);

    // 3. Track Usage and Audit
    const { firestore } = initializeFirebase();
    await trackUsage(firestore, {
      organizationId,
      userId,
      eventType: "AI_SOCIAL_GEN",
      quantity: 1,
      metadata: { property: input.propertyTitle }
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "SOCIAL_CONTENT_GENERATED",
      resourceType: "AI_Service",
      metadata: { property: input.propertyTitle }
    });

    return {
      success: true,
      data: result
    };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Social Post Generation failed");
    return {
      success: false,
      error: err.message || "Failed to generate social media content."
    };
  }
}

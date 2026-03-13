
'use server';

import { initializeFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { logger } from "@/core/logging/logger";
import { trackUsage } from "@/core/metering";
import { audit } from "@/database/audit.service";

/**
 * Server Action to schedule a social media post with video content.
 */
export async function scheduleSocialPostAction(
  organizationId: string,
  userId: string,
  data: {
    caption: string;
    mediaUrl: string;
    mediaType: 'video' | 'image';
    platforms: string[];
    scheduledAt: string;
  }
) {
  try {
    // 1. Quota Enforcement
    await assertWithinPlanLimits(organizationId, 'ai');

    const { firestore } = initializeFirebase();

    // 2. Persist to Firestore
    const postsRef = collection(firestore, `organizations/${organizationId}/social_posts`);
    const newDoc = await addDoc(postsRef, {
      ...data,
      status: 'scheduled',
      organizationId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // 3. Track Usage & Audit
    await trackUsage(firestore, {
      organizationId,
      userId,
      eventType: 'AI_SOCIAL_GEN',
      quantity: 1,
      metadata: { postId: newDoc.id, platforms: data.platforms }
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "SOCIAL_POST_SCHEDULED",
      resourceType: "SocialPost",
      resourceId: newDoc.id,
      metadata: { scheduledAt: data.scheduledAt }
    });

    logger.info({ organizationId, postId: newDoc.id }, "Social post successfully scheduled");

    return { success: true, postId: newDoc.id };
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to schedule social post");
    return { success: false, error: err.message || "Failed to schedule content." };
  }
}

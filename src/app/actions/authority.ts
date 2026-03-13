'use server';

import { generatePressRelease, type PressReleaseInput } from "@/ai/flows/press-release-flow";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { logger } from "@/core/logging/logger";
import { trackUsage } from "@/database/usage.service";
import { audit } from "@/database/audit.service";

/**
 * Server Action to generate a professional SEO press release.
 */
export async function createPressReleaseAction(
  organizationId: string, 
  userId: string, 
  input: PressReleaseInput
) {
  try {
    await assertWithinPlanLimits(organizationId, 'ai');

    const result = await generatePressRelease(input);

    const { firestore } = initializeFirebase();
    
    // Store in authority_assets
    const assetRef = await addDoc(collection(firestore, 'organizations', organizationId, 'authority_assets'), {
      type: 'press_release',
      title: result.headline,
      content: result,
      status: 'draft',
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });

    await trackUsage(firestore, {
      organizationId,
      userId,
      eventType: "AI_CREDIT",
      quantity: 1,
      metadata: { type: 'press_release', title: result.headline }
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "PRESS_RELEASE_GENERATED",
      resourceType: "AuthorityAsset",
      resourceId: assetRef.id,
      metadata: { title: result.headline }
    });

    return { success: true, data: result, id: assetRef.id };
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to generate press release");
    return { success: false, error: err.message };
  }
}


'use server';

import { initializeFirebase } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { encrypt } from "@/lib/encryption";
import { audit } from "@/firebase/audit-logger";
import { logger } from "@/lib/logger";

/**
 * Server Action to securely register a new social media account for an organization.
 */
export async function registerSocialAccountAction(
  organizationId: string,
  provider: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'google_business' | 'buffer',
  token: string,
  userId: string
) {
  if (!organizationId || !provider || !token || !userId) {
    return { success: false, error: "Missing required parameters." };
  }

  try {
    const { firestore } = initializeFirebase();
    
    // 1. Securely encrypt the platform access token
    const encryptedToken = encrypt(token);

    // 2. Persist SocialAccount record
    const socialRef = collection(firestore, 'organizations', organizationId, 'social_accounts');
    const newDoc = await addDoc(socialRef, {
      organizationId,
      provider,
      encryptedToken,
      status: 'connected',
      createdAt: new Date().toISOString()
    });

    // 3. Audit the integration
    await audit(firestore, {
      organizationId,
      userId,
      action: "SOCIAL_ACCOUNT_CONNECTED",
      resourceType: "SocialAccount",
      resourceId: newDoc.id,
      metadata: { provider }
    });

    logger.info({ organizationId, provider, accountId: newDoc.id }, "Social account securely connected");

    return { success: true, accountId: newDoc.id };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId, provider }, "Failed to register social account");
    return { success: false, error: err.message || "Failed to link social profile." };
  }
}

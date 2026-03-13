'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';
import { audit } from '@/database/audit.service';

/**
 * Server Action to create a custom content blueprint for an organization.
 */
export async function createCustomTemplateAction(
  organizationId: string,
  userId: string,
  data: {
    name: string;
    description: string;
    category: 'listing' | 'social' | 'market' | 'script';
    promptHint: string;
  }
) {
  if (!organizationId || !userId) {
    return { success: false, error: "Missing authentication context." };
  }

  try {
    const { firestore } = initializeFirebase();
    const templatesRef = collection(firestore, 'organizations', organizationId, 'custom_templates');
    
    const docRef = await addDoc(templatesRef, {
      ...data,
      organizationId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "CUSTOM_TEMPLATE_CREATED",
      resourceType: "CustomTemplate",
      resourceId: docRef.id,
      metadata: { name: data.name, category: data.category }
    });

    logger.info({ organizationId, templateId: docRef.id }, "Custom blueprint created successfully");

    return { success: true, id: docRef.id };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Failed to create custom blueprint");
    return { success: false, error: err.message || "Failed to save blueprint." };
  }
}

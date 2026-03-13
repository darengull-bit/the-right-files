
'use server';

import crypto from 'crypto';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';
import { audit } from '@/firebase/audit-logger';

/**
 * Server Action to generate a new secure API key.
 * Uses SHA-256 hashing to store the key securely in Firestore.
 */
export async function generateApiKeyAction(organizationId: string, name: string, userId: string, permissions: Record<string, any> = {}) {
  if (!organizationId || !name || !userId) {
    throw new Error('Missing required parameters for key generation.');
  }

  try {
    const { firestore } = initializeFirebase();
    
    // 1. Generate a raw secure key (32 bytes)
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    
    // 2. Hash the key for secure storage
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');
    
    // 3. Store a preview (first 12 chars of the raw key) for identification
    const prefix = rawKey.substring(0, 12);

    const keysRef = collection(firestore, 'organizations', organizationId, 'apiKeys');
    
    const newDoc = await addDoc(keysRef, {
      id: '', // Will be updated by SDK if needed, but we often leave empty for auto-id
      name,
      hashedKey,
      prefix,
      organizationId,
      permissions,
      revoked: false,
      revokedAt: null,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
    });

    // 4. Audit the action
    await audit(firestore, {
      organizationId,
      userId,
      action: 'API_KEY_GENERATED',
      resourceType: 'ApiKey',
      resourceId: newDoc.id,
      metadata: { keyName: name, permissions }
    });

    logger.info({ organizationId, keyId: newDoc.id }, 'Secure API key generated and hashed');

    // Return the raw key ONLY ONCE
    return { 
      success: true, 
      id: newDoc.id,
      rawKey 
    };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, 'Failed to generate API key');
    return { success: false, error: err.message };
  }
}

/**
 * @fileOverview Core API Authentication Utility.
 * Validates 'x-api-key' headers against organization credentials using SHA-256.
 */

import { NextRequest } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { collectionGroup, query, where, getDocs, limit, updateDoc } from 'firebase/firestore';
import crypto from 'crypto';

export async function validateApiKey(req: NextRequest) {
  const rawKey = req.headers.get('x-api-key');
  
  if (!rawKey) return null;

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const { firestore } = initializeFirebase();
  
  if (!firestore || (firestore as any).name === 'firestore-shell') return null;

  const q = query(
    collectionGroup(firestore, 'apiKeys'),
    where('hashedKey', '==', keyHash),
    limit(1)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();

    if (data.revoked || data.revokedAt) return null;

    // Log use asynchronously
    updateDoc(docSnap.ref, {
      lastUsedAt: new Date().toISOString()
    }).catch(() => {});

    return {
      id: docSnap.id,
      organizationId: data.organizationId,
      name: data.name,
      permissions: data.permissions || {},
      ...data
    };
  } catch (err) {
    return null;
  }
}

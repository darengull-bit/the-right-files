
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/core/auth/api-auth';
import { assertWithinPlanLimits } from '@/core/guards/usage-guard';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';

/**
 * API Route: Trigger SEO Audit
 * POST /api/seo/run
 */
export async function POST(req: NextRequest) {
  const apiKeyData = await validateApiKey(req);
  if (!apiKeyData) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { url, keywords } = body;
    
    if (!url) return NextResponse.json({ error: "Missing URL" }, { status: 400 });

    const orgId = apiKeyData.organizationId;
    
    // 1. Quota Enforcement
    await assertWithinPlanLimits(orgId, 'ai');

    // 2. Create Job Record
    const { firestore } = initializeFirebase();
    const jobsRef = collection(firestore, 'organizations', orgId, 'jobs');
    
    const input = {
      keywords: keywords || [{ keyword: url, position: 0, volume: 0 }],
      metrics: { dominance: 0, mapPack: 0, revenue: 0 },
      pageContext: `API triggered audit for ${url}`
    };

    const jobRef = await addDoc(jobsRef, {
      type: "seo_audit",
      status: "pending",
      payload: input,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    logger.info({ orgId, jobId: jobRef.id }, "API: SEO Audit job enqueued");

    return NextResponse.json({ 
      success: true, 
      jobId: jobRef.id,
      status: "pending" 
    });

  } catch (err: any) {
    logger.error({ error: err.message }, "API: SEO Run Failure");
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

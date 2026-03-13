
import { NextRequest, NextResponse } from "next/server";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";
import { logger } from "@/core/logging/logger";

/**
 * API Route: Enqueue AI Task
 * POST /api/ai/generate
 * 
 * Creates a persistent Firestore job for background processing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, payload } = body;

    if (!orgId || !payload) {
      return NextResponse.json({ error: "Missing orgId or payload" }, { status: 400 });
    }

    // 1. Quota Enforcement
    await assertWithinPlanLimits(orgId, "ai");

    // 2. Initialize Firestore via Client SDK
    const { firestore } = initializeFirebase();

    // 3. Create persistent Firestore job record
    // The JobOrchestrator poller will pick this up automatically.
    const jobsRef = collection(firestore, `organizations/${orgId}/jobs`);
    const jobData = {
      type: "ai_task",
      payload,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const jobRef = await addDoc(jobsRef, jobData);

    logger.info({ orgId, jobId: jobRef.id }, "API: AI Task job enqueued in Firestore");

    return NextResponse.json({ 
      success: true,
      jobId: jobRef.id,
      status: "pending"
    });

  } catch (err: any) {
    logger.error({ error: err.message }, "API: AI Generation Failure");
    return NextResponse.json({ 
      error: err.message || "Failed to initiate AI task" 
    }, { status: 500 });
  }
}

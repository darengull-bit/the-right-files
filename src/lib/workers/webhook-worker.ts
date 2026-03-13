import { Worker } from "bullmq";
import Redis from "ioredis";
import { logger } from "@/shared/logger";
import crypto from 'crypto';

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && process.env.NEXT_PHASE === 'phase-production-build';
const redisUrl = process.env.REDIS_URL;

if (!isBrowser && !isBuild && redisUrl) {
  try {
    const connection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });

    new Worker(
      "webhookQueue",
      async (job) => {
        const { url, secret, payload } = job.data;
        if (!url || !secret || !payload) return { status: 'invalid' };
        const payloadString = JSON.stringify(payload);
        const signature = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
        
        try {
          const response = await fetch(url, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'x-agentpro-signature': signature }, 
            body: payloadString, 
            signal: AbortSignal.timeout(10000) 
          });
          if (!response.ok) throw new Error(`Status ${response.status}`);
          return { success: true };
        } catch (e) {
          throw e;
        }
      },
      { connection, concurrency: 10 }
    );
    
    logger.info("Webhook Worker active");
  } catch (err) {}
}

import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Kubernetes readiness and liveness probes.
 * Returns the current status and service identifier matching the HorizontalPodAutoscaler target.
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'agentpro-api',
    version: '1.0.0',
    deployment: 'production-ready'
  });
}

import { register } from '@/lib/metrics';
import { NextResponse } from 'next/server';

/**
 * Metrics endpoint for Prometheus scraping.
 * Returns the current registry state in the Prometheus text format.
 * Includes default Node.js metrics and custom application histograms.
 */
export async function GET() {
  try {
    const metrics = await register.metrics();
    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (err: any) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

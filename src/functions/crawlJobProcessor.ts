
import { SeoEngine } from '@/core/seoEngine';
import { trackUsage } from '@/core/metering';
import { initializeFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/core/logging/logger';
import { PlatformMetricsService } from '@/database/platform-metrics.service';

/**
 * Specialized logic for crawling and analyzing pages.
 */
export async function handleCrawlJob(organizationId: string, jobId: string, url: string) {
  const seoEngine = new SeoEngine();
  const { firestore } = initializeFirebase();
  const jobRef = doc(firestore, 'organizations', organizationId, 'jobs', jobId);
  const metricsService = new PlatformMetricsService();

  logger.info({ jobId, url }, "CrawlJobProcessor: Initiating page ingestion");

  try {
    // 1. Fetch live content
    const html = await seoEngine.fetchPage(url);
    
    // 2. Perform technical analysis
    const analysis = await seoEngine.analyzePage(html, url);

    // 3. Record consumption (Using key required by assertWithinPlanLimits)
    await trackUsage(firestore, {
      organizationId,
      eventType: 'crawlsExecuted',
      quantity: 1,
      metadata: { jobId, url }
    });

    // 4. Record Internal COGS ($0.01 per SERP/Scrape)
    await metricsService.recordMetrics({ serp_cost: 0.01 });

    // 5. Store Results in historical audit log
    const auditsRef = collection(firestore, 'organizations', organizationId, 'seo_audits');
    const auditDoc = await addDoc(auditsRef, {
      ...analysis,
      jobId,
      status: 'completed',
      type: 'crawl_analysis',
      createdAt: new Date().toISOString()
    });

    // 6. Update Job Record
    await updateDoc(jobRef, {
      status: 'completed',
      result: { auditId: auditDoc.id, score: analysis.score },
      updatedAt: serverTimestamp()
    });

    return {
      url,
      score: analysis.score,
      auditId: auditDoc.id
    };
  } catch (err: any) {
    logger.error({ jobId, url, error: err.message }, "CrawlJobProcessor: Failed to ingest page");
    
    await updateDoc(jobRef, {
      status: 'failed',
      error: err.message,
      updatedAt: serverTimestamp()
    });
    
    throw err;
  }
}


import { Job } from 'bullmq';
import { SeoModule } from '../seo.module';
import { AuditModule } from '../../audit/audit.module';
import { UsageModule } from '../../usage/usage.module';
import { DatabaseModule } from '@/database/database.module';
import { triggerWebhooks } from '@/lib/webhooks';
import { logger } from '@/core/logging/logger';
import { initializeFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { runSeoAudit } from '@/ai/flows/seo-audit-flow';

/**
 * SEO Background Processor.
 * 
 * Handles heavy-lifting SEO audits asynchronously and manages Job lifecycle state.
 */
export class SeoProcessor {
  private readonly seoService = SeoModule.getService();
  private readonly auditService = AuditModule.getService();
  private readonly usageService = UsageModule.getService();
  private readonly firestoreService = DatabaseModule.getFirestoreService();

  /**
   * Main job handler for 'process-audit' tasks.
   */
  async handleAudit(job: Job) {
    const { organizationId, userId, jobId, input } = job.data;
    const { firestore } = initializeFirebase();
    const jobRef = doc(firestore, 'organizations', organizationId, 'jobs', jobId);

    try {
      // 1. Update Job progress
      await updateDoc(jobRef, {
        status: 'processing',
        progress: 20,
        updatedAt: serverTimestamp()
      });

      logger.info({ organizationId, jobId }, "SEO Processor: Starting AI Audit Flow");

      // 2. Execute AI Flow
      const auditResult = await runSeoAudit(input);

      // 3. Persist Technical Audit Record
      const auditDocId = `audit_${Date.now()}`;
      const auditData = {
        id: auditDocId,
        organizationId,
        userId,
        url: input.keywords?.[0]?.keyword || 'Multiple',
        score: auditResult.overallScore,
        breakdown: auditResult.technicalChecks,
        summary: auditResult.summary,
        rankPredictions: auditResult.rankPredictions,
        status: 'completed',
        createdAt: new Date().toISOString(),
      };

      await this.firestoreService.setDocument(
        `organizations/${organizationId}/seo_audits`,
        auditData,
        auditDocId
      );

      // 4. Record Usage Event
      await this.usageService.record({
        organizationId,
        userId,
        eventType: 'AI_AUDIT',
        quantity: 1,
      });

      // 5. Finalize Job
      await updateDoc(jobRef, {
        status: 'completed',
        progress: 100,
        result: {
          auditId: auditDocId,
          score: auditResult.overallScore,
          opportunities: auditResult.topOpportunities.length
        },
        updatedAt: serverTimestamp()
      });

      // 6. Audit Log & Webhooks
      await this.auditService.log({
        action: 'SEO_AUDIT_COMPLETED',
        userId,
        organizationId,
        metadata: { auditId: auditDocId, score: auditResult.overallScore },
      });

      await triggerWebhooks(organizationId, 'SEO_AUDIT_COMPLETED', {
        jobId,
        auditId: auditDocId,
        score: auditResult.overallScore,
      });

      logger.info({ jobId, score: auditResult.overallScore }, "SEO Processor: Job completed successfully");
      return auditData;

    } catch (error: any) {
      logger.error({ error: error.message, jobId }, "SEO Processor: Job execution failed");

      // Update Job status to failed
      await updateDoc(jobRef, {
        status: 'failed',
        error: error.message || "AI flow execution encountered an error.",
        updatedAt: serverTimestamp()
      });

      // Log failure to audit trail
      await this.auditService.log({
        action: 'SEO_AUDIT_FAILED',
        userId,
        organizationId,
        metadata: { jobId, error: error.message },
      });

      throw error;
    }
  }
}

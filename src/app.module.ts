import { logger } from "@/core/logging/logger";
import { JobOrchestrator } from "@/lib/job-orchestrator";
import { AiModule } from "@/modules/ai/ai.module";
import { SeoModule } from "@/modules/seo/seo.module";
import { OrganizationsModule } from "@/modules/organizations/organizations.module";
import { UsageModule } from "@/modules/usage/usage.module";
import { AuditModule } from "@/modules/audit/audit.module";
import { ReportingModule } from "@/modules/reporting/reporting.module";

/**
 * Application Module Bootstrapper.
 * HARDENED: Prevents server-side service initialization during Firebase build phase.
 */

const isBrowser = typeof window !== 'undefined';
const isBuildPhase = !isBrowser && (
  process['env']['NEXT_PHASE'] === 'phase-production-build' || 
  !process['env']['GOOGLE_API_KEY'] ||
  process['env']['CI'] === 'true'
);

export class AppModule {
  private static jobOrchestrator: JobOrchestrator;

  static async boot() {
    // Logic Gate: Return immediately if in build phase or browser.
    if (isBrowser || isBuildPhase) return;

    try {
      logger.info("AgentPro Intelligence Engine Booting (Server Runtime)...");
      
      // Initialize module singletons
      AiModule.getService();
      SeoModule.getService();
      OrganizationsModule.getService();
      UsageModule.getService();
      AuditModule.getService();
      ReportingModule.getService();
      
      // Start the Firestore-native job poller
      this.jobOrchestrator = new JobOrchestrator();
      this.jobOrchestrator.start();
    } catch (err) {
      // Fail silently during build phase to prevent rollout blockage.
    }
  }
}

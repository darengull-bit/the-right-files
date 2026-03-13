/**
 * @fileOverview Unified SEO API Wrapper.
 * Provides client-side access to modular SEO operations.
 */

import { runAutopilotAction } from "@/app/actions/autopilot";
import { executeSeoAuditAction } from "@/app/actions/audit";
import { type SeoAuditInput } from "@/ai/flows/seo-audit-flow";

export class SeoApiService {
  /**
   * Triggers the full Autopilot workflow for a specific site.
   */
  static async runAutopilot(organizationId: string, siteId: string, userId: string) {
    return runAutopilotAction(organizationId, siteId, userId);
  }

  /**
   * Performs a focused SEO audit on demand.
   */
  static async runAudit(organizationId: string, input: SeoAuditInput) {
    return executeSeoAuditAction(organizationId, input);
  }
}

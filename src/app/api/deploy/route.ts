
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/core/auth/api-auth';
import { assertWithinPlanLimits } from '@/core/guards/usage-guard';
import { CmsModule } from '@/modules/seo/cms/cms.module';
import { SitesModule } from '@/modules/sites/sites.module';
import { logger } from '@/core/logging/logger';
import { audit } from '@/database/audit.service';
import { initializeFirebase } from '@/firebase';

/**
 * API Route: Deploy SEO Optimizations
 * POST /api/deploy
 * 
 * Pushes validated AI optimizations to an external CMS.
 */
export async function POST(req: NextRequest) {
  const apiKeyData = await validateApiKey(req);
  if (!apiKeyData) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { siteId, changes } = await req.json();
    if (!siteId || !changes || !Array.isArray(changes)) {
      return NextResponse.json({ error: "Missing siteId or valid changes array" }, { status: 400 });
    }

    const orgId = apiKeyData.organizationId;
    
    // 1. Enforcement Gate: Usage Check
    await assertWithinPlanLimits(orgId, 'ai');

    const sitesService = SitesModule.getService();
    const site = await sitesService.getSiteById(orgId, siteId);
    if (!site) return NextResponse.json({ error: "Site integration not found" }, { status: 404 });

    logger.info({ orgId, siteId, count: changes.length }, "API: Initiating deployment");

    // 2. Execute via modular CMS service (Includes automated backup/rollback)
    const cmsService = CmsModule.getService();
    await cmsService.deploy(site, changes);

    // 3. Audit Logging
    const { firestore } = initializeFirebase();
    await audit(firestore, {
      organizationId: orgId,
      action: 'API_DEPLOYMENT_EXECUTED',
      resourceType: 'SiteIntegration',
      resourceId: siteId,
      metadata: { changeCount: changes.length }
    });

    return NextResponse.json({ 
      success: true, 
      deployedAt: new Date().toISOString(),
      count: changes.length
    });

  } catch (err: any) {
    logger.error({ error: err.message }, "API Deploy Failure");
    return NextResponse.json({ error: err.message || "Failed to deploy optimizations" }, { status: 500 });
  }
}

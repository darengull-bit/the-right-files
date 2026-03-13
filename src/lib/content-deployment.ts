
import { initializeFirebase } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { logger } from './logger';
import { audit } from '@/firebase/audit-logger';
import { triggerWebhooks } from './webhooks';
import { updateWordPressPage, createWordPressPost, updateWordPressPostMetadata, SiteIntegration } from './website-integration';

/**
 * Content Deployment Engine
 * 
 * Manages the pushing of AI-optimized content to integrated websites 
 * and maintains the versioning lifecycle.
 */

export interface DeploymentResult {
  success: boolean;
  versionId: string;
  deployedAt: string;
}

/**
 * Deploys a specific page version to the live external site.
 * Supports WordPress REST API for automated updates.
 */
export async function deployPageVersion(
  organizationId: string,
  siteId: string,
  versionId: string,
  userId: string
): Promise<DeploymentResult> {
  const { firestore } = initializeFirebase();
  
  try {
    logger.info({ organizationId, versionId }, "Content Deployment: Initiating push to site");

    // 1. Fetch Version Data
    const versionRef = doc(firestore, 'organizations', organizationId, 'page_versions', versionId);
    const versionSnap = await getDoc(versionRef);
    
    if (!versionSnap.exists()) {
      throw new Error("Page version not found.");
    }

    const versionData = versionSnap.data();

    // 2. Fetch Site Integration Data
    const siteRef = doc(firestore, 'organizations', organizationId, 'site_integrations', siteId);
    const siteSnap = await getDoc(siteRef);
    
    if (!siteSnap.exists()) {
      throw new Error("Site integration not found.");
    }

    const siteData = siteSnap.data() as SiteIntegration;

    // 3. Platform Specific Deployment
    if (siteData.platform === 'wordpress') {
      logger.info({ siteId, platform: 'wordpress', seoPlugin: siteData.seoPlugin }, "Executing WordPress API Deployment");
      
      // Determine external ID (simulated or stored in version metadata)
      const externalId = versionData.externalPageId || 123; 

      // Push Body Content
      if (versionData.externalPageId) {
        await updateWordPressPage(siteData, versionData.externalPageId, versionData.aiContent);
      } else {
        await createWordPressPost(siteData, versionData.aiTitle || `Optimized: ${versionData.pageUrl}`, versionData.aiContent);
      }

      // Push SEO Metadata and Structured Data
      const meta: Record<string, any> = {};
      
      // Handle Standard SEO Plugin Fields
      if (siteData.seoPlugin === 'rankmath') {
        if (versionData.aiTitle) meta.rank_math_title = versionData.aiTitle;
        if (versionData.aiDescription) meta.rank_math_description = versionData.aiDescription;
      } else if (siteData.seoPlugin === 'yoast') {
        if (versionData.aiTitle) meta._yoast_wpseo_title = versionData.aiTitle;
        if (versionData.aiDescription) meta._yoast_wpseo_metadesc = versionData.aiDescription;
      }

      // Push JSON-LD Schema to a dedicated AgentPro meta field
      if (versionData.aiJsonLd) {
        meta._agentpro_json_ld = versionData.aiJsonLd;
      }

      if (Object.keys(meta).length > 0) {
        logger.info({ postId: externalId, plugin: siteData.seoPlugin }, "Pushing SEO metadata and JSON-LD to WordPress");
        await updateWordPressPostMetadata(siteData, externalId, meta);
      }
    } else {
      logger.info({ targetUrl: versionData.pageUrl, platform: siteData.platform }, "Content Deployment: Pushing to custom endpoint (Simulated)");
    }

    // 4. Record Successful Deployment
    const deployedAt = new Date().toISOString();
    await updateDoc(versionRef, {
      deployedAt,
      deployedBy: userId,
      status: 'deployed'
    });

    // 5. Trigger Webhooks and Audit
    await triggerWebhooks(organizationId, 'PAGE_CONTENT_DEPLOYED', {
      siteId,
      pageUrl: versionData.pageUrl,
      versionId,
      deployedAt
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "CONTENT_DEPLOYED",
      resourceType: "PageVersion",
      resourceId: versionId,
      metadata: { siteId, pageUrl: versionData.pageUrl, platform: siteData.platform, seoSync: siteData.seoPlugin }
    });

    return {
      success: true,
      versionId,
      deployedAt
    };
  } catch (err: any) {
    logger.error({ error: err.message, organizationId, versionId }, "Content Deployment: Failed");
    throw err;
  }
}

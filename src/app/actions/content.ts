'use server';

import { 
  fetchExternalPageContent, 
  discoverPostMetadata, 
  uploadWordPressMedia, 
  updateWordPressFeaturedMedia,
  SiteIntegration 
} from "@/lib/website-integration";
import { deployPageVersion as deployEngine } from "@/lib/content-deployment";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { encrypt } from "@/shared/encryption";
import { logger } from "@/core/logging/logger";
import { audit } from "@/database/audit.service";
import { optimizePageContent, type ContentOptimizationInput } from "@/ai/flows/content-optimization-flow";
import { assertWithinPlanLimits } from "@/core/guards/usage-guard";

export async function ingestExternalPageAction(organizationId: string, siteId: string, url: string) {
  try {
    const content = await fetchExternalPageContent(url);
    const { firestore } = initializeFirebase();
    const versionsRef = collection(firestore, 'organizations', organizationId, 'page_versions');
    
    const newVersion = await addDoc(versionsRef, {
      organizationId,
      siteId,
      pageUrl: url,
      originalContent: content.bodyHtml,
      aiContent: "", 
      aiTitle: "",
      aiDescription: "",
      status: 'ingested',
      createdAt: new Date().toISOString()
    });

    return { success: true, versionId: newVersion.id, originalContent: content.bodyHtml };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function optimizePageContentAction(
  organizationId: string,
  versionId: string,
  input: Omit<ContentOptimizationInput, 'pageContent'>
) {
  try {
    // 1. Plan Enforcement
    await assertWithinPlanLimits(organizationId, 'AI_CONTENT');

    const { firestore } = initializeFirebase();
    const versionRef = doc(firestore, 'organizations', organizationId, 'page_versions', versionId);
    const versionSnap = await getDoc(versionRef);

    if (!versionSnap.exists()) throw new Error("Page version not found.");

    const optimization = await optimizePageContent({
      ...input,
      pageContent: versionSnap.data().originalContent || ""
    });

    const jsonLd = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": optimization.faq_schema.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": { "@type": "Answer", "text": item.answer }
      }))
    });

    await updateDoc(versionRef, {
      aiTitle: optimization.meta_title,
      aiDescription: optimization.meta_description,
      aiJsonLd: jsonLd,
      metadata: { internalLinks: optimization.internal_links },
      status: 'optimized',
      updatedAt: new Date().toISOString()
    });

    return { success: true, optimization };
  } catch (err: any) {
    logger.error({ error: err.message, versionId }, "Content Optimization failed");
    return { success: false, error: err.message };
  }
}

export async function deployContentAction(organizationId: string, siteId: string, versionId: string, userId: string) {
  try {
    const result = await deployEngine(organizationId, siteId, versionId, userId);
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function registerSiteAction(
  organizationId: string, 
  baseUrl: string, 
  platform: 'wordpress' | 'shopify' | 'custom' | 'kvcore' | 'lofty',
  username?: string,
  appPassword?: string,
  seoPlugin: 'yoast' | 'rankmath' | 'none' = 'none'
) {
  try {
    const { firestore } = initializeFirebase();
    const integrationsRef = collection(firestore, 'organizations', organizationId, 'site_integrations');
    
    const newSite = await addDoc(integrationsRef, {
      organizationId,
      baseUrl,
      platform,
      username: username || null,
      encryptedAppPassword: appPassword ? encrypt(appPassword) : null,
      seoPlugin,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return { success: true, siteId: newSite.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function uploadMediaAction(
  organizationId: string, 
  siteId: string, 
  fileName: string, 
  base64Data: string,
  userId: string
) {
  try {
    const { firestore } = initializeFirebase();
    const siteRef = doc(firestore, 'organizations', organizationId, 'site_integrations', siteId);
    const siteSnap = await getDoc(siteRef);

    if (!siteSnap.exists()) throw new Error("Site integration not found.");

    const siteData = siteSnap.data() as SiteIntegration;
    const buffer = Buffer.from(base64Data, 'base64');

    if (siteData.platform === 'wordpress') {
      const result = await uploadWordPressMedia(siteData, buffer, fileName);
      await audit(firestore, {
        organizationId,
        userId,
        action: "MEDIA_UPLOADED",
        resourceType: "SiteIntegration",
        resourceId: siteId,
        metadata: { fileName, mediaId: result.id, url: result.source_url }
      });
      return { success: true, mediaId: result.id, sourceUrl: result.source_url };
    }
    throw new Error(`Platform ${siteData.platform} not supported for media.`);
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Media upload failed");
    return { success: false, error: err.message };
  }
}

export async function setFeaturedMediaAction(
  organizationId: string,
  siteId: string,
  postId: string | number,
  mediaId: number,
  userId: string,
  type: 'posts' | 'pages' = 'posts'
) {
  try {
    const { firestore } = initializeFirebase();
    const siteRef = doc(firestore, 'organizations', organizationId, 'site_integrations', siteId);
    const siteSnap = await getDoc(siteRef);

    if (!siteSnap.exists()) throw new Error("Site integration not found.");

    const siteData = siteSnap.data() as SiteIntegration;
    if (siteData.platform === 'wordpress') {
      await updateWordPressFeaturedMedia(siteData, postId, mediaId, type);
      await audit(firestore, {
        organizationId,
        userId,
        action: "FEATURED_MEDIA_SET",
        resourceType: "SiteIntegration",
        resourceId: siteId,
        metadata: { postId, mediaId, type }
      });
      return { success: true };
    }
    throw new Error("Platform not supported.");
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

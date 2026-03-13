import { 
  fetchWordPressPosts, 
  uploadWordPressMedia, 
  SiteIntegration 
} from "@/integrations/wordpress/wordpress.service";
import { fetchExternalPageContent } from "@/lib/website-integration";
import { RegisterSiteDto } from "./dto/register-site.dto";
import { initializeFirebase } from "@/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { encrypt } from "@/shared/encryption";
import { logger } from "@/shared/logger";

/**
 * Sites Module Service.
 */
export class SitesService {
  async registerSite(dto: RegisterSiteDto) {
    try {
      const { firestore } = initializeFirebase();
      const integrationsRef = collection(firestore, 'organizations', dto.organizationId, 'site_integrations');
      
      const newSite = await addDoc(integrationsRef, {
        organizationId: dto.organizationId,
        baseUrl: dto.baseUrl,
        platform: dto.platform,
        username: dto.username || null,
        encryptedAppPassword: dto.appPassword ? encrypt(dto.appPassword) : null,
        seoPlugin: dto.seoPlugin || 'none',
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      return { success: true, siteId: newSite.id };
    } catch (err: any) {
      logger.error({ error: err.message, dto }, "SitesService: Failed to register site");
      throw err;
    }
  }

  async ingestPage(url: string) {
    return fetchExternalPageContent(url);
  }

  async getWordPressContent(site: SiteIntegration) {
    return fetchWordPressPosts(site);
  }

  async uploadMedia(site: SiteIntegration, buffer: Buffer, fileName: string) {
    return uploadWordPressMedia(site, buffer, fileName);
  }

  async getSiteById(organizationId: string, siteId: string): Promise<SiteIntegration | null> {
    const { firestore } = initializeFirebase();
    const siteRef = doc(firestore, 'organizations', organizationId, 'site_integrations', siteId);
    const snap = await getDoc(siteRef);
    return snap.exists() ? (snap.data() as SiteIntegration) : null;
  }
}

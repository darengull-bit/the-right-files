import { google } from "googleapis";
import { initializeFirebase } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { logger } from "@/core/logging/logger";
import { decrypt, encrypt } from "@/shared/encryption";

/**
 * @fileOverview DEFINITIVE GOOGLE SERVICE
 * The single source of truth for OAuth2, Search Console, and Keyword Ranking.
 */

const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && (process.env.NEXT_PHASE === 'phase-production-build' || process.env.CI === 'true');

// SINGLETON: OAuth2 Client (Runtime only)
export const oauth2Client = (!isBrowser && !isBuild && process.env.GOOGLE_CLIENT_ID)
  ? new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
  : {
      generateAuthUrl: () => "#",
      getToken: async () => ({ tokens: {} }),
      setCredentials: () => {}
    } as any;

export const SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"];

/**
 * Retrieves an authenticated Google API client for a specific organization.
 */
async function getAuthenticatedClient(organizationId: string) {
  if (isBuild || isBrowser) throw new Error("Google Auth is server-side only.");
  
  const { firestore } = initializeFirebase();
  const connRef = doc(firestore, "organizations", organizationId, "googleConnection", "default");
  const snap = await getDoc(connRef);
  
  if (!snap.exists()) throw new Error(`No Google connection found for: ${organizationId}`);
  
  const data = snap.data();
  const refreshToken = data.refreshToken ? decrypt(data.refreshToken) : null;
  const accessToken = data.accessToken ? decrypt(data.accessToken) : null;
  const expiryDate = data.expiryDate ? new Date(data.expiryDate).getTime() : 0;
  
  if (!refreshToken) throw new Error("Missing refresh token in secure storage.");
  
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID, 
    process.env.GOOGLE_CLIENT_SECRET, 
    process.env.GOOGLE_REDIRECT_URI
  );
  
  auth.setCredentials({ 
    access_token: accessToken, 
    refresh_token: refreshToken, 
    expiry_date: expiryDate 
  });
  
  if (Date.now() >= (expiryDate - 5 * 60 * 1000)) {
    try {
      const { credentials } = await auth.refreshAccessToken();
      await updateDoc(connRef, {
        accessToken: credentials.access_token ? encrypt(credentials.access_token) : data.accessToken,
        expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : data.expiryDate,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      logger.error("Token refresh failed");
    }
  }
  return auth;
}

export async function fetchSearchAnalytics(organizationId: string, siteUrl: string, startDate: string, endDate: string) {
  const auth = await getAuthenticatedClient(organizationId);
  const sc = google.searchconsole({ version: "v1", auth });
  const response = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate, endDate, dimensions: ["query", "page", "country"], rowLimit: 1000 }
  });
  return { success: true, data: response.data };
}

export async function checkKeywordRank(keyword: string, targetDomain: string) {
  const cse = google.customsearch('v1');
  try {
    const response = await cse.cse.list({
      auth: process.env.GOOGLE_API_KEY || '',
      cx: process.env.SEARCH_ENGINE_ID || '',
      q: keyword,
      num: 10
    });
    
    const items = response.data.items || [];
    const foundIndex = items.findIndex((item: any) => 
      item.link.toLowerCase().includes(targetDomain.toLowerCase())
    );
    
    if (foundIndex !== -1) {
      return { keyword, position: foundIndex + 1, url: items[foundIndex].link, found: true };
    }
    return { keyword, position: 101, url: "", found: false };
  } catch (e) {
    return { keyword, position: 101, url: "", found: false };
  }
}

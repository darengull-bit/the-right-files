import { NextRequest, NextResponse } from "next/server";
import { oauth2Client } from "@/lib/google.service";
import { initializeFirebase } from "@/firebase";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { logger } from "@/core/logging/logger";
import { encrypt } from "@/shared/encryption";

/**
 * Route Handler for the Google OAuth2 callback.
 * Exchanges the code for tokens and persists them to a dedicated GoogleConnection sub-collection.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const organizationId = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    logger.error({ error, organizationId }, "Google OAuth Callback Error");
    return NextResponse.redirect(new URL(`/settings?error=google_auth_failed`, req.url));
  }

  if (!code || !organizationId) {
    logger.error("Missing code or state in Google OAuth callback");
    return NextResponse.redirect(new URL(`/settings?error=invalid_callback`, req.url));
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const { firestore } = initializeFirebase();

    const connRef = doc(firestore, "organizations", organizationId, "googleConnection", "default");
    
    await setDoc(connRef, {
      id: "default",
      organizationId,
      accessToken: tokens.access_token ? encrypt(tokens.access_token) : null,
      refreshToken: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    const orgRef = doc(firestore, "organizations", organizationId);
    await updateDoc(orgRef, {
      googleConnected: true,
      updatedAt: new Date().toISOString(),
    });

    logger.info({ organizationId }, "Successfully connected GSC and encrypted tokens");

    return NextResponse.redirect(new URL(`/settings?google_connect=success`, req.url));
  } catch (err: any) {
    logger.error({ error: err.message, organizationId }, "Failed to complete Google OAuth exchange");
    return NextResponse.redirect(new URL(`/settings?error=google_exchange_failed`, req.url));
  }
}

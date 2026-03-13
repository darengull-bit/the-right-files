'use server';

import { redirect } from "next/navigation";
import { oauth2Client, SCOPES } from "@/lib/google.service";
import { logger } from "@/core/logging/logger";

export async function initiateGoogleConnection(organizationId: string) {
  if (!organizationId) throw new Error("Org ID required.");

  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      prompt: 'consent',
      state: organizationId 
    });

    redirect(url);
  } catch (err: any) {
    throw err;
  }
}

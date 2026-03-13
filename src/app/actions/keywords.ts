'use server';

import { checkKeywordRank } from "@/lib/google.service";
import { initializeFirebase } from "@/firebase";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { logger } from "@/core/logging/logger";
import { audit } from "@/database/audit.service";

export async function refreshKeywordRankAction(
  organizationId: string, 
  keywordId: string, 
  keyword: string, 
  targetDomain: string,
  userId: string
) {
  try {
    const { firestore } = initializeFirebase();
    const result = await checkKeywordRank(keyword, targetDomain);

    const keywordRef = doc(firestore, "organizations", organizationId, "keywords", keywordId);
    await updateDoc(keywordRef, {
      position: result.position,
      updatedAt: new Date().toISOString()
    });

    const rankingsRef = collection(firestore, "organizations", organizationId, "rankings");
    await addDoc(rankingsRef, {
      organizationId,
      keyword,
      position: result.position,
      url: result.url,
      timestamp: new Date().toISOString()
    });

    await audit(firestore, {
      organizationId,
      userId,
      action: "KEYWORD_RANK_REFRESHED",
      resourceType: "Keyword",
      resourceId: keywordId,
      metadata: { keyword, position: result.position }
    });

    return { success: true, position: result.position };
  } catch (err: any) {
    logger.error({ error: err.message }, "Failed to refresh keyword rank");
    return { success: false, error: err.message };
  }
}

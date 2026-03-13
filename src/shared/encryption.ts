import crypto from "crypto";

/**
 * DEFINITIVE ENCRYPTION SERVICE
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const isBrowser = typeof window !== 'undefined';
const isBuild = !isBrowser && (process.env.NEXT_PHASE === 'phase-production-build' || !process.env.ENCRYPTION_KEY);

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || isBuild || isBrowser) {
    return Buffer.from("f2730303e4590327f2c96c4d6211603589b27463f2560317e290827362916035", "hex");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(text: string): string {
  if (isBuild || isBrowser) return "build_mock_blob";
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (e) {
    return "encryption_error";
  }
}

export function decrypt(encryptedData: string): string {
  if (isBuild || !encryptedData || isBrowser) return ""; 
  try {
    const [ivHex, authTagHex, ciphertextHex] = encryptedData.split(":");
    if (!ivHex || !authTagHex || !ciphertextHex) return "";
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return "";
  }
}

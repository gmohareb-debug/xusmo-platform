// =============================================================================
// WordPress Credentials Vault
// Encrypts/decrypts WordPress credentials using AES-256-GCM.
// Stores credentials in the WpCredential table via Prisma.
// Usage: import { storeCredentials, getCredentials, rotateCredentials } from "@/lib/wordpress/credentials";
// =============================================================================

import crypto from "crypto";
import { exec } from "child_process";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

// ---------------------------------------------------------------------------
// Encryption constants
// ---------------------------------------------------------------------------

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128-bit IV
const TAG_LENGTH = 16; // 128-bit auth tag
const ENCODING: BufferEncoding = "hex";

// ---------------------------------------------------------------------------
// Get encryption key from environment
// ---------------------------------------------------------------------------

function getEncryptionKey(): Buffer {
  const keyHex = process.env.WP_CREDENTIAL_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(
      "[credentials] WP_CREDENTIAL_ENCRYPTION_KEY environment variable is not set."
    );
  }

  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error(
      `[credentials] WP_CREDENTIAL_ENCRYPTION_KEY must be 64 hex chars (32 bytes). Got ${keyHex.length} chars.`
    );
  }

  return key;
}

// ---------------------------------------------------------------------------
// Encrypt plaintext -> "iv:tag:encrypted"
// ---------------------------------------------------------------------------

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", ENCODING);
  encrypted += cipher.final(ENCODING);

  const tag = cipher.getAuthTag();

  return `${iv.toString(ENCODING)}:${tag.toString(ENCODING)}:${encrypted}`;
}

// ---------------------------------------------------------------------------
// Decrypt "iv:tag:encrypted" -> plaintext
// ---------------------------------------------------------------------------

export function decrypt(packed: string): string {
  const key = getEncryptionKey();
  const parts = packed.split(":");

  if (parts.length !== 3) {
    throw new Error(
      "[credentials] Invalid encrypted format. Expected iv:tag:encrypted."
    );
  }

  const [ivHex, tagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, ENCODING);
  const tag = Buffer.from(tagHex, ENCODING);
  const encrypted = Buffer.from(encryptedHex, ENCODING);

  if (tag.length !== TAG_LENGTH) {
    throw new Error(
      `[credentials] Invalid auth tag length. Expected ${TAG_LENGTH} bytes, got ${tag.length}.`
    );
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

// ---------------------------------------------------------------------------
// Store credentials — encrypt passwords, upsert WpCredential
// ---------------------------------------------------------------------------

export async function storeCredentials(
  siteId: string,
  creds: {
    user: string;
    pass: string;
    dbUser?: string;
    dbPass?: string;
    sshUser?: string;
    sshKeyRef?: string;
  }
): Promise<void> {
  const wpAdminPassEnc = encrypt(creds.pass);
  const wpDbPassEnc = creds.dbPass ? encrypt(creds.dbPass) : null;

  await prisma.wpCredential.upsert({
    where: { siteId },
    create: {
      siteId,
      wpAdminUser: creds.user,
      wpAdminPassEnc,
      wpDbUser: creds.dbUser ?? null,
      wpDbPassEnc,
      sshUser: creds.sshUser ?? null,
      sshKeyRef: creds.sshKeyRef ?? null,
    },
    update: {
      wpAdminUser: creds.user,
      wpAdminPassEnc,
      wpDbUser: creds.dbUser ?? undefined,
      wpDbPassEnc: wpDbPassEnc ?? undefined,
      sshUser: creds.sshUser ?? undefined,
      sshKeyRef: creds.sshKeyRef ?? undefined,
    },
  });
}

// ---------------------------------------------------------------------------
// Get credentials — fetch, decrypt, return
// ---------------------------------------------------------------------------

export async function getCredentials(
  siteId: string
): Promise<{
  wpAdminUser: string;
  wpAdminPass: string;
  wpDbUser?: string;
  wpDbPass?: string;
  sshUser?: string;
  sshKeyRef?: string;
} | null> {
  const record = await prisma.wpCredential.findUnique({
    where: { siteId },
  });

  if (!record) return null;

  const wpAdminPass = decrypt(record.wpAdminPassEnc);
  const wpDbPass = record.wpDbPassEnc ? decrypt(record.wpDbPassEnc) : undefined;

  return {
    wpAdminUser: record.wpAdminUser,
    wpAdminPass,
    wpDbUser: record.wpDbUser ?? undefined,
    wpDbPass,
    sshUser: record.sshUser ?? undefined,
    sshKeyRef: record.sshKeyRef ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// SSH helper — run a command on the site's server
// ---------------------------------------------------------------------------

async function sshExec(
  serverIp: string,
  sshUser: string,
  command: string,
  sshKeyRef?: string
): Promise<string> {
  const keyFlag = sshKeyRef ? `-i ${sshKeyRef}` : "";
  const sshCommand = `ssh -o StrictHostKeyChecking=no ${keyFlag} ${sshUser}@${serverIp} ${JSON.stringify(command)}`;

  return new Promise((resolve, reject) => {
    exec(sshCommand, { timeout: 60_000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`SSH exec failed: ${error.message}\nstderr: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// Rotate credentials — generate new password, update WP, re-encrypt, store
// ---------------------------------------------------------------------------

export async function rotateCredentials(siteId: string): Promise<void> {
  // Fetch current credentials
  const current = await getCredentials(siteId);
  if (!current) {
    throw new Error(`[credentials] No credentials found for site ${siteId}`);
  }

  // Fetch site connection details
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
  });

  const serverIp = site.serverIp ?? process.env.WP_SERVER_IP;
  const sshUser = current.sshUser ?? process.env.WP_SERVER_USER ?? "root";
  const sshKeyRef = current.sshKeyRef;
  const wpDir = site.wpDirectory ?? `/home/runcloud/webapps/site-${siteId}`;

  if (!serverIp) {
    throw new Error(`[credentials] No server IP found for site ${siteId}`);
  }

  // Generate a cryptographically secure random password
  const newPassword = crypto.randomBytes(24).toString("base64url");

  // Update WordPress user password via WP-CLI
  await sshExec(
    serverIp,
    sshUser,
    `cd ${wpDir} && wp user update ${current.wpAdminUser} --user_pass="${newPassword}" --allow-root`,
    sshKeyRef
  );

  // Re-encrypt and store
  const newPassEnc = encrypt(newPassword);
  const now = new Date();
  const rotationDue = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  await prisma.wpCredential.update({
    where: { siteId },
    data: {
      wpAdminPassEnc: newPassEnc,
      lastRotatedAt: now,
      rotationDueAt: rotationDue,
    },
  });

  await logActivity(
    siteId,
    "credentials.rotated",
    "security",
    "info",
    `Rotated WordPress admin password for user "${current.wpAdminUser}"`,
    {
      wpAdminUser: current.wpAdminUser,
      rotatedAt: now.toISOString(),
      nextRotationDue: rotationDue.toISOString(),
    }
  );
}

// =============================================================================
// Shared SSH Helper
// Provides sshExec() for running remote commands and getSiteConnection() for
// resolving SSH credentials per site from DB or env fallbacks.
// Usage: import { sshExec, getSiteConnection } from "@/workers/agents/ssh";
// =============================================================================

import { exec } from "child_process";
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// sshExec — run a command on a remote host via SSH
// ---------------------------------------------------------------------------

export async function sshExec(
  host: string,
  user: string,
  command: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const escaped = command.replace(/"/g, '\\"');
    const cmd = `ssh -o StrictHostKeyChecking=no ${user}@${host} "${escaped}"`;

    exec(cmd, { timeout: 60_000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(
          new Error(
            `SSH exec failed on ${host}: ${error.message}\nstderr: ${stderr}\nstdout: ${stdout}`
          )
        );
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// getSiteConnection — resolve SSH host/user/wpPath for a given site
// ---------------------------------------------------------------------------

export interface SiteConnection {
  host: string;
  user: string;
  wpPath: string;
}

export async function getSiteConnection(siteId: string): Promise<SiteConnection> {
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    include: { wpCredential: true },
  });

  // Prefer per-site WpCredential, fall back to env vars
  const host = site.serverIp ?? process.env.WP_SERVER_IP;
  if (!host) {
    throw new Error(`No server IP for site ${siteId} — set serverIp or WP_SERVER_IP`);
  }

  const user =
    site.wpCredential?.sshUser ??
    process.env.WP_SERVER_USER ??
    "runcloud";

  const wpPath =
    site.wpDirectory ??
    process.env.WP_DEFAULT_PATH ??
    `/home/${user}/webapps/${siteId}`;

  return { host, user, wpPath };
}

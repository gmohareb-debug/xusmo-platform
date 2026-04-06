// =============================================================================
// Security Agent
// Runs after Publishing Agent to harden the live site.
// Handles: admin credentials, XML-RPC, file editing, plugin updates.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SecurityJobData {
  buildId: string;
  blueprintId: string;
}

// ---------------------------------------------------------------------------
// Generate strong password
// ---------------------------------------------------------------------------

function generatePassword(length = 24): string {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}

// ---------------------------------------------------------------------------
// Process security job
// ---------------------------------------------------------------------------

export async function processSecurityJob(job: Job<SecurityJobData>) {
  const startTime = Date.now();
  const { buildId } = job.data;

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "security",
      status: "STARTED",
      input: job.data as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    const build = await prisma.build.findUniqueOrThrow({
      where: { id: buildId },
      include: { site: true },
    });

    if (!build.site) {
      throw new Error("No site linked to build");
    }

    const wp = getExecutor(build.siteId ?? undefined);
    const steps: string[] = [];

    // 1. Change admin username if it's "admin"
    try {
      const currentUser = await wp.execute("user get 1 --field=user_login");
      if (currentUser.trim() === "admin") {
        const newUsername = `sf_${crypto.randomBytes(4).toString("hex")}`;
        // WP-CLI doesn't allow changing user_login directly, so we create a new admin
        const newPassword = generatePassword();
        await wp.execute(
          `user create ${newUsername} admin@xusmo.local --role=administrator --user_pass="${newPassword}"`
        );
        steps.push(`Created new admin user: ${newUsername}`);

        // Update site record with new credentials
        await prisma.site.update({
          where: { id: build.site.id },
          data: { wpAdminUser: newUsername },
        });
      } else {
        steps.push(`Admin username already changed: ${currentUser.trim()}`);
      }
    } catch (err) {
      steps.push(`Warning: Admin user check — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 2. Set strong admin password
    try {
      const newPassword = generatePassword();
      await wp.execute(`user update 1 --user_pass="${newPassword}"`);
      steps.push("Reset admin password to strong random value");
    } catch (err) {
      steps.push(`Warning: Password reset — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 3. Disable XML-RPC
    try {
      await wp.execute("option update xmlrpc_enabled 0");
      steps.push("Disabled XML-RPC");
    } catch {
      // xmlrpc_enabled may not exist as an option, use plugin/filter approach
      steps.push("Skipped XML-RPC disable (option not available)");
    }

    // 4. Disable file editing in wp-admin
    try {
      const config = await wp.execute("config get DISALLOW_FILE_EDIT --format=json 2>/dev/null || echo null");
      if (config.trim() === "null" || config.includes("not defined")) {
        await wp.execute("config set DISALLOW_FILE_EDIT true --raw --type=constant");
        steps.push("Disabled file editing in wp-admin (DISALLOW_FILE_EDIT)");
      } else {
        steps.push("File editing already disabled");
      }
    } catch (err) {
      steps.push(`Warning: DISALLOW_FILE_EDIT — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 5. Remove WordPress version meta tag
    try {
      await wp.execute("option update wp_version_meta_hidden 1");
      steps.push("Flagged WP version meta removal");
    } catch {
      steps.push("Skipped WP version meta removal");
    }

    // 6. Update all plugins
    try {
      const result = await wp.execute("plugin update --all");
      const updated = result.includes("Updated") ? result.trim() : "All plugins up to date";
      steps.push(`Plugin updates: ${updated.slice(0, 200)}`);
    } catch (err) {
      steps.push(`Warning: Plugin update — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 7. Update WordPress core
    try {
      const result = await wp.execute("core update");
      steps.push(`Core update: ${result.trim().slice(0, 200)}`);
    } catch (err) {
      steps.push(`Warning: Core update — ${err instanceof Error ? err.message : "unknown"}`);
    }

    // 8. Set secure file permissions reminder
    steps.push("Reminder: Verify file permissions (644 for files, 755 for directories) on production");

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: { steps } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    console.log(`[security] Hardening complete for build ${buildId} (${durationMs}ms)`);
    return { steps, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs,
        completedAt: new Date(),
      },
    });

    // Security failures are non-fatal — don't fail the entire build
    console.error(`[security] Hardening failed for build ${buildId}:`, error);
    return { steps: ["Security hardening failed — see logs"], durationMs };
  }
}

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createSecurityWorker(connection: { host: string; port: number }) {
  return new Worker<SecurityJobData>("security", processSecurityJob, {
    connection,
    concurrency: 1,
  });
}

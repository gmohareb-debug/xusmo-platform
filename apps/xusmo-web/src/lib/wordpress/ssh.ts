// =============================================================================
// WordPress Executor
// Abstraction for running WP-CLI commands:
//   - DockerExecutor: local dev via `docker exec xusmo-wpcli wp ...`
//                     also used for Coolify containers (with allowRoot)
//   - SSHExecutor: production via SSH to Hetzner VPS (placeholder)
// Usage: import { getExecutor, registerSiteExecutor } from "@/lib/wordpress/ssh";
// =============================================================================

import { exec } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const DEFAULT_TIMEOUT = 30_000; // 30 seconds

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface WordPressExecutor {
  execute(command: string, timeout?: number): Promise<string>;
  /** Write a file directly into the WordPress environment (bypasses shell). */
  writeFile(containerPath: string, content: string, timeout?: number): Promise<void>;
}

// ---------------------------------------------------------------------------
// Docker Executor (local development + Coolify production)
// ---------------------------------------------------------------------------

export class DockerExecutor implements WordPressExecutor {
  private container: string;
  private allowRoot: boolean;

  constructor(container = "xusmo-wpcli", allowRoot = false) {
    this.container = container;
    this.allowRoot = allowRoot;
  }

  execute(command: string, timeout = DEFAULT_TIMEOUT): Promise<string> {
    // Prefix with "wp" if not already
    let wpCommand = command.startsWith("wp ") ? command : `wp ${command}`;

    // Coolify containers run as root — WP-CLI requires --allow-root
    // Also use full path /usr/local/bin/wp since docker exec may not have it in PATH
    if (this.allowRoot) {
      if (!wpCommand.includes("--allow-root")) {
        wpCommand = wpCommand.replace(/^wp /, "wp --allow-root ");
      }
      // Use full path to avoid PATH issues in docker exec
      wpCommand = wpCommand.replace(/^wp /, "/usr/local/bin/wp ");
    }

    return new Promise((resolve, reject) => {
      exec(
        `docker exec ${this.container} ${wpCommand}`,
        { timeout, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            reject(
              new Error(
                `WP-CLI error: ${error.message}\nstderr: ${stderr}\nstdout: ${stdout}`
              )
            );
            return;
          }
          resolve(stdout.trim());
        }
      );
    });
  }

  writeFile(containerPath: string, content: string, timeout = DEFAULT_TIMEOUT): Promise<void> {
    // Write content to a host temp file, then docker cp into the container.
    // This bypasses all shell quoting issues on Windows.
    const tmpFile = join(tmpdir(), `wp-sync-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    writeFileSync(tmpFile, content, "utf8");

    return new Promise((resolve, reject) => {
      exec(
        `docker cp "${tmpFile}" ${this.container}:${containerPath}`,
        { timeout },
        (error, _stdout, stderr) => {
          try { unlinkSync(tmpFile); } catch { /* ignore cleanup errors */ }
          if (error) {
            reject(new Error(`docker cp failed: ${error.message}\nstderr: ${stderr}`));
          } else {
            resolve();
          }
        }
      );
    });
  }
}

// ---------------------------------------------------------------------------
// SSH Executor (production — placeholder)
// ---------------------------------------------------------------------------

export class SSHExecutor implements WordPressExecutor {
  async execute(command: string, _timeout = DEFAULT_TIMEOUT): Promise<string> {
    // TODO: Implement SSH execution for production
    // Will use: WP_SERVER_IP, WP_SERVER_USER, WP_SSH_PRIVATE_KEY_PATH
    throw new Error(
      `SSH executor not yet implemented. Command: ${command}`
    );
  }

  async writeFile(containerPath: string, _content: string, _timeout = DEFAULT_TIMEOUT): Promise<void> {
    // TODO: Implement via SFTP/SCP for production
    throw new Error(
      `SSH writeFile not yet implemented. Path: ${containerPath}`
    );
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let cachedExecutor: WordPressExecutor | null = null;
const siteExecutors = new Map<string, WordPressExecutor>();
let lastRegisteredSiteId: string | null = null;

/**
 * Register a per-site executor (used by Coolify after provisioning).
 * This lets getExecutor(siteId) return the correct container target
 * without needing an async DB lookup.
 */
export function registerSiteExecutor(siteId: string, containerName: string, allowRoot = false): void {
  const executor = new DockerExecutor(containerName, allowRoot);
  siteExecutors.set(siteId, executor);
  lastRegisteredSiteId = siteId;
}

/**
 * Get a WP-CLI executor.
 * - With siteId: returns a per-site executor (registered > legacy naming).
 * - No siteId + Coolify mode: returns the most recently registered executor.
 * - No siteId + legacy mode: returns shared executor (xusmo-wpcli).
 */
export function getExecutor(siteId?: string): WordPressExecutor {
  if (siteId) {
    const existing = siteExecutors.get(siteId);
    if (existing) return existing;

    // In Coolify mode, per-site executors should have been registered
    // during container creation. If not found, fall back to legacy naming.
    const shortId = siteId.slice(0, 8);
    const executor = new DockerExecutor(`xusmo-cli-${shortId}`);
    siteExecutors.set(siteId, executor);
    return executor;
  }

  // Coolify mode: no shared WP container exists.
  // Fall back to the most recently registered per-site executor.
  if (process.env.COOLIFY_API_TOKEN) {
    if (lastRegisteredSiteId) {
      const executor = siteExecutors.get(lastRegisteredSiteId);
      if (executor) {
        console.warn(
          `[ssh] No siteId provided in Coolify mode — using last registered executor for ${lastRegisteredSiteId.slice(0, 8)}`
        );
        return executor;
      }
    }
    throw new Error(
      "No siteId provided and no Coolify container registered. " +
      "In Coolify mode, getExecutor() requires a siteId."
    );
  }

  if (cachedExecutor) return cachedExecutor;

  if (process.env.NODE_ENV === "production" && process.env.WP_SERVER_IP) {
    cachedExecutor = new SSHExecutor();
  } else {
    cachedExecutor = new DockerExecutor();
  }

  return cachedExecutor;
}

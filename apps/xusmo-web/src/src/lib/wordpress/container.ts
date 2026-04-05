// =============================================================================
// Per-Site Container Manager
// Creates isolated WordPress containers per site build.
//   - Coolify mode (production): provisions via Coolify API
//   - Raw Docker mode (dev): creates containers directly via docker run
//
// Usage: import { createSiteContainer, destroySiteContainer } from "@/lib/wordpress/container";
// =============================================================================

import { exec } from "child_process";
import { resolve } from "path";
import { registerSiteExecutor } from "./ssh";
import {
  provisionCoolifyWordPress,
  destroyCoolifyService,
  getContainerName as getCoolifyContainerName,
} from "./coolify";

const DEFAULT_TIMEOUT = 60_000; // 60s for container operations

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type XusmoTheme = "xusmo-service" | "xusmo-commerce" | "xusmo-venue" | "xusmo-portfolio";

export interface ContainerConfig {
  siteId: string;
  theme: XusmoTheme;
  styleVariation?: string;
  port: number;
}

export interface ContainerInfo {
  siteId: string;
  shortId: string;
  wpContainerName: string;
  cliContainerName: string;
  port: number;
  dbName: string;
  siteUrl: string;
  theme: XusmoTheme;
  /** Coolify service UUID (only set in Coolify mode) */
  coolifyServiceUuid?: string;
}

// ---------------------------------------------------------------------------
// Coolify service UUID tracking (for destroy)
// ---------------------------------------------------------------------------

const coolifyServiceMap = new Map<string, string>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd: string, timeout = DEFAULT_TIMEOUT): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${cmd}\n${error.message}\nstderr: ${stderr}`));
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

/**
 * Allocate a port for a site. Uses hash of siteId to get a port in 9000-9999 range.
 */
export function allocatePort(siteId: string): number {
  let hash = 0;
  for (let i = 0; i < siteId.length; i++) {
    hash = ((hash << 5) - hash + siteId.charCodeAt(i)) | 0;
  }
  return 9000 + (Math.abs(hash) % 1000);
}

function useCoolify(): boolean {
  return !!process.env.COOLIFY_API_TOKEN;
}

/**
 * Get the Docker network name.
 */
function getNetworkName(): string {
  return process.env.DOCKER_NETWORK || "sitefast_default";
}

/**
 * Get the absolute path to the WordPress themes/shared/patterns directories.
 */
function getProjectRoot(): string {
  return resolve(__dirname, "../../../..");
}

// ---------------------------------------------------------------------------
// Coolify-backed container lifecycle
// ---------------------------------------------------------------------------

async function createSiteContainerViaCoolify(config: ContainerConfig): Promise<ContainerInfo> {
  const { siteId, theme } = config;
  const shortId = siteId.slice(0, 8);

  console.log(`[container/coolify] Creating site: ${shortId} (theme: ${theme})`);

  const result = await provisionCoolifyWordPress(siteId, theme, `Site ${shortId}`);

  // Track the Coolify service UUID for later cleanup
  coolifyServiceMap.set(siteId, result.serviceUuid);

  // Register the executor so getExecutor(siteId) returns the right target.
  // Coolify WP containers run as root, so allowRoot=true.
  // In Coolify mode, WP-CLI runs in the WP container itself (no CLI sidecar).
  registerSiteExecutor(siteId, result.containerName, true);

  return {
    siteId,
    shortId,
    wpContainerName: result.containerName,
    cliContainerName: result.containerName, // same container in Coolify
    port: 80, // managed by Coolify proxy
    dbName: `wordpress`, // Coolify manages the DB
    siteUrl: result.siteUrl,
    theme,
    coolifyServiceUuid: result.serviceUuid,
  };
}

async function destroySiteContainerViaCoolify(siteId: string): Promise<void> {
  const serviceUuid = coolifyServiceMap.get(siteId);
  if (!serviceUuid) {
    console.warn(`[container/coolify] No service UUID found for site ${siteId}`);
    return;
  }

  await destroyCoolifyService(serviceUuid);
  coolifyServiceMap.delete(siteId);
  console.log(`[container/coolify] Site ${siteId.slice(0, 8)} destroyed via Coolify`);
}

// ---------------------------------------------------------------------------
// Raw Docker container lifecycle (dev mode fallback)
// ---------------------------------------------------------------------------

async function createSiteContainerRawDocker(config: ContainerConfig): Promise<ContainerInfo> {
  const { siteId, theme, port } = config;
  const shortId = siteId.slice(0, 8);
  const wpName = `xusmo-site-${shortId}`;
  const cliName = `xusmo-cli-${shortId}`;
  const dbName = `wp_${shortId}`;
  const network = getNetworkName();
  const projectRoot = getProjectRoot();

  console.log(`[container] Creating site container: ${wpName} (theme: ${theme}, port: ${port})`);

  // 1. Create database in shared MySQL
  try {
    await run(
      `docker exec xusmo-wp-db mariadb -uroot -prootpassword -e "CREATE DATABASE IF NOT EXISTS ${dbName}; GRANT ALL ON ${dbName}.* TO 'wordpress'@'%'; FLUSH PRIVILEGES;"`
    );
    console.log(`[container] Database ${dbName} created`);
  } catch (err) {
    console.warn(`[container] Database creation warning (may already exist):`, err);
  }

  // 2. Volume mounts for theme + shared + patterns
  const themeDir = `${projectRoot}/wordpress/themes/${theme}`;
  const sharedDir = `${projectRoot}/wordpress/shared`;
  const patternsDir = `${projectRoot}/wordpress/patterns`;
  const pluginsDir = `${projectRoot}/wordpress/plugins/generic-dropshipping-suite`;

  // 3. Create WordPress container
  const wpVolumeName = `xusmo_wp_${shortId}`;
  await run(`docker volume create ${wpVolumeName}`).catch(() => {});

  await run([
    `docker run -d`,
    `--name ${wpName}`,
    `--network ${network}`,
    `-p ${port}:80`,
    `-e WORDPRESS_DB_HOST=xusmo-wp-db`,
    `-e WORDPRESS_DB_USER=wordpress`,
    `-e WORDPRESS_DB_PASSWORD=wordpress`,
    `-e WORDPRESS_DB_NAME=${dbName}`,
    `--memory=256m`,
    `--cpus=0.5`,
    `-v ${wpVolumeName}:/var/www/html`,
    `-v "${themeDir}:/var/www/html/wp-content/themes/${theme}"`,
    `-v "${sharedDir}:/var/www/html/wp-content/themes/shared"`,
    `-v "${patternsDir}:/var/www/html/wp-content/themes/${theme}/patterns"`,
    `-v "${pluginsDir}:/var/www/html/wp-content/plugins/generic-dropshipping-suite"`,
    `wordpress:6.7-php8.2-apache`,
  ].join(" "), 120_000);

  console.log(`[container] WordPress container ${wpName} started on port ${port}`);

  // 4. Create WP-CLI sidecar
  await run([
    `docker run -d`,
    `--name ${cliName}`,
    `--network ${network}`,
    `-e WORDPRESS_DB_HOST=xusmo-wp-db`,
    `-e WORDPRESS_DB_USER=wordpress`,
    `-e WORDPRESS_DB_PASSWORD=wordpress`,
    `-e WORDPRESS_DB_NAME=${dbName}`,
    `-v ${wpVolumeName}:/var/www/html`,
    `-v "${themeDir}:/var/www/html/wp-content/themes/${theme}"`,
    `-v "${sharedDir}:/var/www/html/wp-content/themes/shared"`,
    `-v "${patternsDir}:/var/www/html/wp-content/themes/${theme}/patterns"`,
    `-v "${pluginsDir}:/var/www/html/wp-content/plugins/generic-dropshipping-suite"`,
    `--entrypoint sh`,
    `wordpress:cli-2.10-php8.2`,
    `-c "sleep infinity"`,
  ].join(" "));

  console.log(`[container] WP-CLI sidecar ${cliName} started`);

  // 5. Wait for WordPress to be ready
  const maxWait = 30;
  for (let i = 0; i < maxWait; i++) {
    try {
      await run(`docker exec ${cliName} wp db check`, 5_000);
      break;
    } catch {
      if (i === maxWait - 1) {
        throw new Error(`WordPress container ${wpName} did not become ready after ${maxWait}s`);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // 6. Install WordPress core + activate theme
  const siteUrl = `http://localhost:${port}`;
  try {
    await run(
      `docker exec ${cliName} wp core install --url="${siteUrl}" --title="Site" --admin_user=admin --admin_password=admin123 --admin_email=admin@xusmo.io --skip-email`,
      60_000
    );
  } catch (err) {
    console.warn(`[container] Core install warning:`, err);
  }

  // Activate theme
  await run(`docker exec ${cliName} wp theme activate ${theme}`);
  console.log(`[container] Theme ${theme} activated`);

  // Set permalinks
  await run(`docker exec ${cliName} wp rewrite structure "/%postname%/"`).catch(() => {});

  return {
    siteId,
    shortId,
    wpContainerName: wpName,
    cliContainerName: cliName,
    port,
    dbName,
    siteUrl,
    theme,
  };
}

async function destroySiteContainerRawDocker(siteId: string): Promise<void> {
  const shortId = siteId.slice(0, 8);
  const wpName = `xusmo-site-${shortId}`;
  const cliName = `xusmo-cli-${shortId}`;
  const dbName = `wp_${shortId}`;
  const volumeName = `xusmo_wp_${shortId}`;

  console.log(`[container] Destroying site container: ${wpName}`);

  await run(`docker rm -f ${cliName}`).catch(() => {});
  await run(`docker rm -f ${wpName}`).catch(() => {});
  await run(`docker volume rm ${volumeName}`).catch(() => {});
  await run(
    `docker exec xusmo-wp-db mariadb -uroot -prootpassword -e "DROP DATABASE IF EXISTS \`${dbName}\`;"`
  ).catch(() => {});

  console.log(`[container] Site ${shortId} fully destroyed`);
}

// ---------------------------------------------------------------------------
// Public API (delegates to Coolify or raw Docker)
// ---------------------------------------------------------------------------

/**
 * Create a per-site WordPress container.
 * Uses Coolify API when COOLIFY_API_TOKEN is set, otherwise raw Docker.
 */
export async function createSiteContainer(config: ContainerConfig): Promise<ContainerInfo> {
  if (useCoolify()) {
    return createSiteContainerViaCoolify(config);
  }
  return createSiteContainerRawDocker(config);
}

/**
 * Destroy a per-site container + its data.
 */
export async function destroySiteContainer(siteId: string): Promise<void> {
  if (useCoolify() && coolifyServiceMap.has(siteId)) {
    return destroySiteContainerViaCoolify(siteId);
  }
  return destroySiteContainerRawDocker(siteId);
}

/**
 * Check if a container exists and is running.
 */
export async function getContainerInfo(siteId: string): Promise<ContainerInfo | null> {
  const shortId = siteId.slice(0, 8);

  if (useCoolify()) {
    const serviceUuid = coolifyServiceMap.get(siteId);
    if (!serviceUuid) return null;

    const containerName = getCoolifyContainerName(serviceUuid);
    try {
      const status = await run(`docker inspect -f "{{.State.Status}}" ${containerName}`);
      if (status !== "running") return null;

      const theme = await run(
        `docker exec ${containerName} wp --allow-root theme list --status=active --field=name`
      ) as XusmoTheme;

      return {
        siteId,
        shortId,
        wpContainerName: containerName,
        cliContainerName: containerName,
        port: 80,
        dbName: "wordpress",
        siteUrl: `http://${containerName}.${process.env.COOLIFY_SERVER_IP || "135.181.83.33"}.sslip.io`,
        theme,
        coolifyServiceUuid: serviceUuid,
      };
    } catch {
      return null;
    }
  }

  // Raw Docker fallback
  const cliName = `xusmo-cli-${shortId}`;
  try {
    const status = await run(`docker inspect -f "{{.State.Status}}" ${cliName}`);
    if (status !== "running") return null;

    const wpName = `xusmo-site-${shortId}`;
    const portMapping = await run(
      `docker inspect -f "{{(index (index .NetworkSettings.Ports \\"80/tcp\\") 0).HostPort}}" ${wpName}`
    );
    const port = parseInt(portMapping) || 0;

    const theme = await run(
      `docker exec ${cliName} wp theme list --status=active --field=name`
    ) as XusmoTheme;

    return {
      siteId,
      shortId,
      wpContainerName: wpName,
      cliContainerName: cliName,
      port,
      dbName: `wp_${shortId}`,
      siteUrl: `http://localhost:${port}`,
      theme,
    };
  } catch {
    return null;
  }
}

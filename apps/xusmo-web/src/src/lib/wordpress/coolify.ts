// =============================================================================
// Coolify API Client
// Creates and manages WordPress services via the Coolify self-hosted PaaS.
//
// Environment variables:
//   COOLIFY_API_TOKEN    — Bearer token for Coolify API
//   COOLIFY_URL          — Base URL (default: http://localhost:8000)
//   COOLIFY_SERVER_UUID  — Target server UUID
//   COOLIFY_PROJECT_UUID — Project UUID to create services under
//   COOLIFY_DEST_UUID    — Docker destination UUID
//
// Usage: import { provisionCoolifyWordPress, destroyCoolifyService } from "@/lib/wordpress/coolify";
// =============================================================================

import { exec } from "child_process";
import { registerSiteExecutor } from "./ssh";

const DEFAULT_CMD_TIMEOUT = 60_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function runCmd(cmd: string, timeout = DEFAULT_CMD_TIMEOUT): Promise<string> {
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

function getCoolifyConfig() {
  return {
    url: process.env.COOLIFY_URL || "http://localhost:8000",
    token: process.env.COOLIFY_API_TOKEN || "",
    serverUuid: process.env.COOLIFY_SERVER_UUID || "",
    projectUuid: process.env.COOLIFY_PROJECT_UUID || "",
    destUuid: process.env.COOLIFY_DEST_UUID || "",
    environmentName: process.env.COOLIFY_ENVIRONMENT_NAME || "production",
  };
}

function coolifyHeaders(): Record<string, string> {
  const { token } = getCoolifyConfig();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CoolifyServiceResult {
  serviceUuid: string;
  containerName: string;
  siteUrl: string;
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Create a WordPress-with-MySQL service in Coolify.
 */
async function createService(name: string, description: string): Promise<string> {
  const config = getCoolifyConfig();
  const res = await fetch(`${config.url}/api/v1/services`, {
    method: "POST",
    headers: coolifyHeaders(),
    body: JSON.stringify({
      type: "wordpress-with-mysql",
      name,
      description,
      project_uuid: config.projectUuid,
      server_uuid: config.serverUuid,
      destination_uuid: config.destUuid,
      environment_name: config.environmentName,
      instant_deploy: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coolify: create service failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const uuid = data.uuid ?? data.id;
  if (!uuid) throw new Error(`Coolify: no UUID in response: ${JSON.stringify(data)}`);

  console.log(`[coolify] Service created: ${uuid}`);
  return uuid;
}

/**
 * Start a Coolify service.
 */
async function startService(serviceUuid: string): Promise<void> {
  const { url } = getCoolifyConfig();
  const res = await fetch(`${url}/api/v1/services/${serviceUuid}/start`, {
    method: "POST",
    headers: coolifyHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Coolify: start service failed (${res.status}): ${text}`);
  }
  console.log(`[coolify] Service ${serviceUuid} start requested`);
}

/**
 * Delete a Coolify service and all its containers/data.
 */
export async function destroyCoolifyService(serviceUuid: string): Promise<void> {
  const { url } = getCoolifyConfig();

  // Stop first
  await fetch(`${url}/api/v1/services/${serviceUuid}/stop`, {
    method: "POST",
    headers: coolifyHeaders(),
  }).catch(() => {});

  const res = await fetch(`${url}/api/v1/services/${serviceUuid}`, {
    method: "DELETE",
    headers: coolifyHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`[coolify] Delete service warning (${res.status}): ${text}`);
  } else {
    console.log(`[coolify] Service ${serviceUuid} deleted`);
  }
}

// ---------------------------------------------------------------------------
// Container operations
// ---------------------------------------------------------------------------

/**
 * Get the WordPress container name for a Coolify service.
 */
export function getContainerName(serviceUuid: string): string {
  return `wordpress-${serviceUuid}`;
}

/**
 * Wait for a Docker container to be running + WordPress ready.
 */
async function waitForContainer(containerName: string, maxWaitSeconds = 120): Promise<void> {
  console.log(`[coolify] Waiting for ${containerName}...`);

  for (let elapsed = 0; elapsed < maxWaitSeconds; elapsed += 3) {
    try {
      const status = await runCmd(
        `docker inspect -f "{{.State.Status}}" ${containerName}`,
        5_000
      );
      if (status === "running") {
        // Check WordPress is responding
        try {
          await runCmd(
            `docker exec ${containerName} test -f /var/www/html/wp-includes/version.php`,
            5_000
          );
          console.log(`[coolify] ${containerName} is ready`);
          return;
        } catch {
          // WP files not yet ready
        }
      }
    } catch {
      // Container doesn't exist yet
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error(`Container ${containerName} not ready after ${maxWaitSeconds}s`);
}

/**
 * Read environment variables from a Docker container.
 */
async function readContainerEnv(containerName: string): Promise<Record<string, string>> {
  const output = await runCmd(`docker exec ${containerName} printenv`, 5_000);
  const env: Record<string, string> = {};
  for (const line of output.split("\n")) {
    const eq = line.indexOf("=");
    if (eq > 0) env[line.slice(0, eq)] = line.slice(eq + 1);
  }
  return env;
}

/**
 * Wait for MySQL to be ready and configure it for WordPress connections.
 * MySQL 8.4+ requires TLS by default — we disable it for internal Docker connections.
 * The MySQL container name follows: mysql-{serviceUuid}
 *
 * Strategy: read actual env var values from the container via `printenv`,
 * then use them directly in SQL to avoid shell-quoting expansion issues.
 */
async function waitForDatabase(serviceUuid: string, maxWaitSeconds = 90): Promise<void> {
  const mysqlContainer = `mysql-${serviceUuid}`;
  console.log(`[coolify] Waiting for database ${mysqlContainer}...`);

  for (let elapsed = 0; elapsed < maxWaitSeconds; elapsed += 3) {
    try {
      const status = await runCmd(
        `docker inspect -f "{{.State.Status}}" ${mysqlContainer}`,
        5_000
      );
      if (status === "running") {
        // Verify MySQL is accepting connections
        try {
          await runCmd(
            `docker exec ${mysqlContainer} mysqladmin ping -h localhost --silent`,
            5_000
          );
          console.log(`[coolify] Database ${mysqlContainer} is ready`);

          // Read actual env var values from the container
          const env = await readContainerEnv(mysqlContainer);
          const dbName = env.MYSQL_DATABASE || "wordpress";
          const dbUser = env.MYSQL_USER || "wordpress";
          const dbPassword = env.MYSQL_PASSWORD || "wordpress";
          const rootPassword = env.MYSQL_ROOT_PASSWORD || "";
          console.log(`[coolify] MySQL env: db=${dbName}, user=${dbUser}`);

          // MySQL 8.4+ requires TLS by default. Disable for internal Docker connections.
          for (const rootAuth of [`--skip-password`, `-p"${rootPassword}"`]) {
            try {
              await runCmd(
                `docker exec ${mysqlContainer} mysql -uroot ${rootAuth} --ssl-mode=DISABLED -e "SET GLOBAL require_secure_transport=OFF; FLUSH PRIVILEGES;"`,
                10_000
              );
              console.log(`[coolify] MySQL SSL requirement disabled for ${mysqlContainer}`);
              break;
            } catch {
              // Try next auth method
            }
          }

          // Wait for MySQL init scripts to create the WP user
          await new Promise((r) => setTimeout(r, 8000));

          // Verify WordPress user exists and can connect
          try {
            await runCmd(
              `docker exec ${mysqlContainer} mysql -u"${dbUser}" -p"${dbPassword}" --ssl-mode=DISABLED "${dbName}" -e "SELECT 1"`,
              10_000
            );
            console.log(`[coolify] WordPress DB user connection verified`);
          } catch {
            // User doesn't exist or DB missing — create both manually via root
            console.warn(`[coolify] WordPress DB user not ready, creating manually...`);
            // Escape single quotes in password for SQL
            const escapedPassword = dbPassword.replace(/'/g, "''");
            for (const rootAuth of [`--skip-password`, `-p"${rootPassword}"`]) {
              try {
                await runCmd(
                  `docker exec ${mysqlContainer} mysql -uroot ${rootAuth} --ssl-mode=DISABLED -e "` +
                  `CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\`; ` +
                  `CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY '${escapedPassword}'; ` +
                  `GRANT ALL PRIVILEGES ON \\\`${dbName}\\\`.* TO '${dbUser}'@'%'; ` +
                  `FLUSH PRIVILEGES;"`,
                  15_000
                );
                console.log(`[coolify] WordPress DB + user created manually (db=${dbName}, user=${dbUser})`);
                break;
              } catch (createErr) {
                console.warn(`[coolify] Manual user creation attempt failed:`, createErr);
              }
            }
            // Give MySQL time to apply user grants
            await new Promise((r) => setTimeout(r, 5000));
          }

          return;
        } catch {
          // MySQL not ready yet
        }
      }
    } catch {
      // Container doesn't exist yet
    }
    await new Promise((r) => setTimeout(r, 3000));
  }

  throw new Error(`Database ${mysqlContainer} not ready after ${maxWaitSeconds}s`);
}

/**
 * Install WP-CLI in a WordPress container if not already present.
 */
async function installWpCli(containerName: string): Promise<void> {
  // Check if already installed (use full path — docker exec may not have /usr/local/bin in PATH)
  try {
    await runCmd(`docker exec ${containerName} /usr/local/bin/wp --allow-root --version`, 10_000);
    console.log(`[coolify] WP-CLI already installed in ${containerName}`);
    return;
  } catch {
    // Not installed
  }

  console.log(`[coolify] Installing WP-CLI in ${containerName}...`);
  await runCmd(
    `docker exec ${containerName} bash -c "curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && chmod +x wp-cli.phar && mv wp-cli.phar /usr/local/bin/wp"`,
    60_000
  );

  // Verify (use full path)
  const version = await runCmd(
    `docker exec ${containerName} /usr/local/bin/wp --allow-root --version`,
    10_000
  );
  console.log(`[coolify] WP-CLI installed: ${version}`);
}

/**
 * Copy theme files from the host into the WordPress container.
 */
async function installTheme(containerName: string, theme: string): Promise<void> {
  // Resolve paths relative to the app working directory
  const appRoot = process.env.WORDPRESS_THEMES_PATH
    || `${process.cwd()}/wordpress`;

  const themeDir = `${appRoot}/themes/${theme}`;
  const sharedDir = `${appRoot}/shared`;
  const patternsDir = `${appRoot}/patterns`;

  console.log(`[coolify] Copying theme ${theme} into ${containerName}...`);

  // Copy theme directory
  await runCmd(
    `docker cp "${themeDir}" ${containerName}:/var/www/html/wp-content/themes/${theme}`,
    30_000
  );

  // Copy shared directory
  try {
    await runCmd(
      `docker cp "${sharedDir}" ${containerName}:/var/www/html/wp-content/themes/shared`,
      30_000
    );
  } catch (err) {
    console.warn(`[coolify] Shared dir copy warning:`, err);
  }

  // Copy patterns into theme
  try {
    await runCmd(
      `docker cp "${patternsDir}/." ${containerName}:/var/www/html/wp-content/themes/${theme}/patterns/`,
      30_000
    );
  } catch (err) {
    console.warn(`[coolify] Patterns dir copy warning:`, err);
  }

  // Fix ownership (WordPress runs as www-data)
  await runCmd(
    `docker exec ${containerName} chown -R www-data:www-data /var/www/html/wp-content/themes/`,
    15_000
  );

  console.log(`[coolify] Theme ${theme} installed`);
}

// ---------------------------------------------------------------------------
// Main provisioning function
// ---------------------------------------------------------------------------

/**
 * Full Coolify WordPress provisioning:
 *   1. Create service via API
 *   2. Start service
 *   3. Wait for container to be ready
 *   4. Install WP-CLI
 *   5. Copy theme files
 *   6. wp core install
 *   7. Activate theme + set permalinks
 */
export async function provisionCoolifyWordPress(
  siteId: string,
  theme: string,
  siteName = "Site"
): Promise<CoolifyServiceResult> {
  const shortId = siteId.slice(0, 8);
  const serviceName = `site-${shortId}`;

  // 1. Create service
  const serviceUuid = await createService(serviceName, `WordPress for ${siteId}`);
  const containerName = getContainerName(serviceUuid);

  // 2. Start service (instant_deploy may not always work)
  try {
    await startService(serviceUuid);
  } catch (err) {
    console.warn(`[coolify] Start warning (may already be starting):`, err);
  }

  // 3. Wait for container
  await waitForContainer(containerName, 120);

  // 3.5. Register executor early so later stages can use it even if provisioning partially fails
  registerSiteExecutor(siteId, containerName, true);

  // 4. Install WP-CLI
  await installWpCli(containerName);

  // 5. Copy theme files
  await installTheme(containerName, theme);

  // 5.5. Wait for MySQL to be ready before core install
  await waitForDatabase(serviceUuid);

  // 5.6. Wait for WordPress to be able to connect to MySQL (from inside the WP container)
  console.log(`[coolify] Verifying WordPress → MySQL connection...`);
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await runCmd(
        `docker exec ${containerName} /usr/local/bin/wp --allow-root db check`,
        10_000
      );
      console.log(`[coolify] WordPress → MySQL connection verified`);
      break;
    } catch {
      if (attempt < 9) {
        await new Promise((r) => setTimeout(r, 5000));
      } else {
        console.warn(`[coolify] WordPress → MySQL connection not ready after 50s (continuing anyway)`);
      }
    }
  }

  // 6. WordPress core install (with retries — DB may need a moment)
  const serverIp = process.env.COOLIFY_SERVER_IP || "135.181.83.33";
  const siteUrl = `http://${containerName}.${serverIp}.sslip.io`;

  let coreInstalled = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await runCmd(
        `docker exec ${containerName} /usr/local/bin/wp --allow-root core install ` +
        `--url="${siteUrl}" --title="${siteName.replace(/"/g, '\\"')}" ` +
        `--admin_user=admin --admin_password=admin123 ` +
        `--admin_email=admin@xusmo.io --skip-email`,
        60_000
      );
      console.log(`[coolify] WordPress core installed`);
      coreInstalled = true;
      break;
    } catch (err) {
      if (attempt < 2) {
        console.warn(`[coolify] Core install attempt ${attempt + 1} failed, retrying in 10s...`);
        await new Promise((r) => setTimeout(r, 10_000));
      } else {
        console.warn(`[coolify] Core install warning (may already exist):`, err);
      }
    }
  }

  // 7. Activate theme + permalinks
  if (coreInstalled) {
    try {
      await runCmd(
        `docker exec ${containerName} /usr/local/bin/wp --allow-root theme activate ${theme}`,
        15_000
      );
    } catch (themeErr) {
      console.warn(`[coolify] Theme activate warning (non-fatal):`, themeErr);
    }

    await runCmd(
      `docker exec ${containerName} /usr/local/bin/wp --allow-root rewrite structure "/%postname%/"`,
      15_000
    ).catch(() => {});
  }

  console.log(`[coolify] Site provisioned: ${siteUrl}`);

  return { serviceUuid, containerName, siteUrl };
}

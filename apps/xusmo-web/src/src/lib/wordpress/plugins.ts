// =============================================================================
// WordPress Plugin Management Service
// Install, activate, deactivate, update, remove, and configure WordPress
// plugins via WP-CLI. Syncs state with the PluginCatalog and SitePlugin tables.
// Usage: import { getSitePlugins, installPlugin, ... } from "@/lib/wordpress/plugins";
// =============================================================================

import { exec } from "child_process";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WpPluginListEntry {
  name: string;
  status: string;
  update: string;
  version: string;
}

interface SitePluginResult {
  plugins: WpPluginListEntry[];
  total: number;
  active: number;
  inactive: number;
  banned: string[];
  updateAvailable: number;
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
// Resolve site connection details
// ---------------------------------------------------------------------------

async function resolveSiteConnection(siteId: string) {
  const site = await prisma.site.findUniqueOrThrow({
    where: { id: siteId },
    include: { wpCredential: true },
  });

  const serverIp = site.serverIp ?? process.env.WP_SERVER_IP;
  const sshUser = site.wpCredential?.sshUser ?? process.env.WP_SERVER_USER ?? "root";
  const sshKeyRef = site.wpCredential?.sshKeyRef ?? undefined;
  const wpDir = site.wpDirectory ?? `/home/runcloud/webapps/site-${siteId}`;

  if (!serverIp) {
    throw new Error(`[plugins] No server IP found for site ${siteId}`);
  }

  return { site, serverIp, sshUser, sshKeyRef, wpDir };
}

// ---------------------------------------------------------------------------
// Run a WP-CLI command on a site
// ---------------------------------------------------------------------------

async function wpCli(
  siteId: string,
  command: string
): Promise<string> {
  const { serverIp, sshUser, sshKeyRef, wpDir } = await resolveSiteConnection(siteId);
  return sshExec(serverIp, sshUser, `cd ${wpDir} && wp ${command} --allow-root`, sshKeyRef);
}

// ---------------------------------------------------------------------------
// Get site plugins — sync from WP to database
// ---------------------------------------------------------------------------

export async function getSitePlugins(siteId: string): Promise<SitePluginResult> {
  const rawJson = await wpCli(siteId, "plugin list --format=json");
  const plugins: WpPluginListEntry[] = JSON.parse(rawJson);

  // Fetch all catalog entries for cross-reference
  const catalogEntries = await prisma.pluginCatalog.findMany({
    where: { slug: { in: plugins.map((p) => p.name) } },
  });
  const catalogMap = new Map(catalogEntries.map((c) => [c.slug, c]));

  // Track banned plugins
  const banned: string[] = [];

  // Sync each plugin to SitePlugin table
  for (const plugin of plugins) {
    const catalogEntry = catalogMap.get(plugin.name);
    const hasUpdate = plugin.update === "available";

    if (catalogEntry?.isBanned) {
      banned.push(plugin.name);
    }

    await prisma.sitePlugin.upsert({
      where: { siteId_slug: { siteId, slug: plugin.name } },
      create: {
        siteId,
        pluginId: catalogEntry?.id ?? null,
        slug: plugin.name,
        version: plugin.version,
        isActive: plugin.status === "active",
        updateAvailable: hasUpdate ? "available" : null,
        lastCheckedAt: new Date(),
      },
      update: {
        version: plugin.version,
        isActive: plugin.status === "active",
        updateAvailable: hasUpdate ? "available" : null,
        lastCheckedAt: new Date(),
        pluginId: catalogEntry?.id ?? undefined,
      },
    });
  }

  // Remove SitePlugin records for plugins no longer installed on the server
  const currentSlugs = plugins.map((p) => p.name);
  await prisma.sitePlugin.deleteMany({
    where: {
      siteId,
      slug: { notIn: currentSlugs },
    },
  });

  const active = plugins.filter((p) => p.status === "active").length;
  const updateAvailable = plugins.filter((p) => p.update === "available").length;

  return {
    plugins,
    total: plugins.length,
    active,
    inactive: plugins.length - active,
    banned,
    updateAvailable,
  };
}

// ---------------------------------------------------------------------------
// Install a plugin
// ---------------------------------------------------------------------------

export async function installPlugin(
  siteId: string,
  slug: string,
  activate = true
): Promise<void> {
  // Check catalog — reject if BANNED
  const catalogEntry = await prisma.pluginCatalog.findUnique({
    where: { slug },
  });

  if (catalogEntry?.isBanned) {
    throw new Error(`Plugin "${slug}" is banned and cannot be installed.`);
  }

  // Install via WP-CLI
  const activateFlag = activate ? " --activate" : "";
  await wpCli(siteId, `plugin install ${slug}${activateFlag}`);

  // Get installed version
  let version: string | null = null;
  try {
    version = await wpCli(siteId, `plugin get ${slug} --field=version`);
  } catch {
    // Non-critical — version will be synced on next getSitePlugins
  }

  // Record in SitePlugin
  await prisma.sitePlugin.upsert({
    where: { siteId_slug: { siteId, slug } },
    create: {
      siteId,
      pluginId: catalogEntry?.id ?? null,
      slug,
      version,
      isActive: activate,
      installedAt: new Date(),
    },
    update: {
      version,
      isActive: activate,
      lastUpdatedAt: new Date(),
    },
  });

  // Increment catalog installed count
  if (catalogEntry) {
    await prisma.pluginCatalog.update({
      where: { id: catalogEntry.id },
      data: { installedCount: { increment: 1 } },
    });
  }

  await logActivity(
    siteId,
    "plugin.installed",
    "plugins",
    "info",
    `Installed plugin "${slug}"${activate ? " and activated" : ""}`,
    { slug, version, activated: activate }
  );
}

// ---------------------------------------------------------------------------
// Toggle plugin activation
// ---------------------------------------------------------------------------

export async function togglePlugin(
  siteId: string,
  slug: string,
  activate: boolean
): Promise<void> {
  // If deactivating, check if REQUIRED
  if (!activate) {
    const catalogEntry = await prisma.pluginCatalog.findUnique({
      where: { slug },
    });

    if (catalogEntry?.isRequired) {
      throw new Error(
        `Plugin "${slug}" is required and cannot be deactivated.`
      );
    }
  }

  const action = activate ? "activate" : "deactivate";
  await wpCli(siteId, `plugin ${action} ${slug}`);

  // Update SitePlugin record
  await prisma.sitePlugin.update({
    where: { siteId_slug: { siteId, slug } },
    data: { isActive: activate },
  });

  await logActivity(
    siteId,
    `plugin.${action}d`,
    "plugins",
    "info",
    `${activate ? "Activated" : "Deactivated"} plugin "${slug}"`,
    { slug, activate }
  );
}

// ---------------------------------------------------------------------------
// Update a plugin
// ---------------------------------------------------------------------------

export async function updatePlugin(
  siteId: string,
  slug: string,
  targetVersion?: string
): Promise<void> {
  const versionFlag = targetVersion ? ` --version=${targetVersion}` : "";
  await wpCli(siteId, `plugin update ${slug}${versionFlag}`);

  // Get new version
  let newVersion: string | null = null;
  try {
    newVersion = await wpCli(siteId, `plugin get ${slug} --field=version`);
  } catch {
    // Non-critical
  }

  // Update SitePlugin record
  await prisma.sitePlugin.update({
    where: { siteId_slug: { siteId, slug } },
    data: {
      version: newVersion,
      updateAvailable: null,
      lastUpdatedAt: new Date(),
    },
  });

  await logActivity(
    siteId,
    "plugin.updated",
    "plugins",
    "info",
    `Updated plugin "${slug}"${targetVersion ? ` to version ${targetVersion}` : " to latest"}`,
    { slug, newVersion, targetVersion }
  );
}

// ---------------------------------------------------------------------------
// Remove a plugin
// ---------------------------------------------------------------------------

export async function removePlugin(
  siteId: string,
  slug: string
): Promise<void> {
  // Check if REQUIRED
  const catalogEntry = await prisma.pluginCatalog.findUnique({
    where: { slug },
  });

  if (catalogEntry?.isRequired) {
    throw new Error(
      `Plugin "${slug}" is required and cannot be removed.`
    );
  }

  // Deactivate first, then uninstall
  await wpCli(siteId, `plugin deactivate ${slug}`).catch(() => {
    // May already be inactive — ignore
  });
  await wpCli(siteId, `plugin uninstall ${slug}`);

  // Delete SitePlugin record
  await prisma.sitePlugin.delete({
    where: { siteId_slug: { siteId, slug } },
  }).catch(() => {
    // Record may not exist — ignore
  });

  // Decrement catalog installed count
  if (catalogEntry && catalogEntry.installedCount > 0) {
    await prisma.pluginCatalog.update({
      where: { id: catalogEntry.id },
      data: { installedCount: { decrement: 1 } },
    });
  }

  await logActivity(
    siteId,
    "plugin.removed",
    "plugins",
    "info",
    `Removed plugin "${slug}"`,
    { slug }
  );
}

// ---------------------------------------------------------------------------
// Configure a plugin — plugin-specific WP option writes
// ---------------------------------------------------------------------------

export async function configurePlugin(
  siteId: string,
  slug: string,
  config: Record<string, unknown>
): Promise<void> {
  switch (slug) {
    // ----- Yoast SEO -----
    case "wordpress-seo": {
      if (config.companyName) {
        const current = await wpCli(siteId, "option get wpseo_titles --format=json");
        const titles = JSON.parse(current);
        titles.company_name = config.companyName;
        if (config.schemaType) {
          titles.schema_page_type_default = config.schemaType;
        }
        if (config.separator) {
          titles.separator = config.separator;
        }
        await wpCli(
          siteId,
          `option update wpseo_titles '${JSON.stringify(titles)}' --format=json`
        );
      }
      if (config.socialProfiles) {
        await wpCli(
          siteId,
          `option update wpseo_social '${JSON.stringify(config.socialProfiles)}' --format=json`
        );
      }
      break;
    }

    // ----- Contact Form 7 -----
    case "contact-form-7": {
      // Find the default CF7 form post
      const formIdRaw = await wpCli(
        siteId,
        `post list --post_type=wpcf7_contact_form --posts_per_page=1 --format=ids`
      );
      const formId = formIdRaw.trim();

      if (!formId) {
        throw new Error("No Contact Form 7 form found on this site.");
      }

      if (config.recipientEmail) {
        // Update the _mail meta to change recipient
        const mailMetaRaw = await wpCli(
          siteId,
          `post meta get ${formId} _mail --format=json`
        );
        const mailMeta = JSON.parse(mailMetaRaw);
        mailMeta.recipient = config.recipientEmail;
        await wpCli(
          siteId,
          `post meta update ${formId} _mail '${JSON.stringify(mailMeta)}' --format=json`
        );
      }

      if (config.formFields) {
        // Update form post_content with new field markup
        const contentB64 = Buffer.from(String(config.formFields)).toString("base64");
        await wpCli(
          siteId,
          `eval 'wp_update_post(["ID" => ${formId}, "post_content" => base64_decode("${contentB64}")]);'`
        );
      }
      break;
    }

    // ----- Generic plugins — write each config key as WP option -----
    default: {
      for (const [key, value] of Object.entries(config)) {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        await wpCli(
          siteId,
          `option update ${escapeShell(key)} '${escapeShell(serialized)}'`
        );
      }
      break;
    }
  }

  await logActivity(
    siteId,
    "plugin.configured",
    "plugins",
    "info",
    `Configured plugin "${slug}" with ${Object.keys(config).length} setting(s)`,
    { slug, configKeys: Object.keys(config) }
  );
}

// ---------------------------------------------------------------------------
// Credentials management
// ---------------------------------------------------------------------------

export async function getCredentials(siteId: string) {
  const { site, serverIp, sshUser, wpDir } = await resolveSiteConnection(siteId);

  const credential = site.wpCredential;
  return {
    siteId,
    serverIp,
    sshUser,
    wpDir,
    wpAdminUser: credential?.wpAdminUser ?? null,
    wpAdminPassword: credential ? "••••••••" : null,
    sshKeyRef: credential?.sshKeyRef ?? null,
    createdAt: credential?.createdAt ?? null,
  };
}

export async function rotateCredentials(siteId: string) {
  const { serverIp, sshUser, sshKeyRef, wpDir } = await resolveSiteConnection(siteId);

  // Generate a new WP admin password
  const newPassword = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 24);

  // Update WP admin password via WP-CLI
  const adminUser = "admin";
  await sshExec(
    serverIp,
    sshUser,
    `cd ${wpDir} && wp user update ${adminUser} --user_pass='${escapeShell(newPassword)}' --allow-root`,
    sshKeyRef
  );

  // Update credential record in DB
  await prisma.wpCredential.updateMany({
    where: { siteId },
    data: { wpAdminPassEnc: newPassword },
  });

  await logActivity(
    siteId,
    "credentials.rotated",
    "security",
    "warning",
    "WP admin credentials rotated",
    { adminUser }
  );

  return { success: true, adminUser, message: "Credentials rotated successfully" };
}

// ---------------------------------------------------------------------------
// Shell escape helper
// ---------------------------------------------------------------------------

function escapeShell(str: string): string {
  return str.replace(/'/g, "'\\''");
}

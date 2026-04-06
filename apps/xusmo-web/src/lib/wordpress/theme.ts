// =============================================================================
// WordPress Theme Customization Service
// Applies design tokens (colors, fonts) to WordPress sites via WP-CLI.
// Deploys child theme updates to managed sites.
// Usage: import { applyThemeCustomization, deployThemeToSite } from "@/lib/wordpress/theme";
// =============================================================================

import { exec } from "child_process";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/activity";
import { compileVibeToWordPressThemeJson } from "@/lib/vibe-compiler";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FontPairConfig {
  heading: string;
  body: string;
  industries: string[];
}

interface DesignPrefs {
  colors?: Record<string, string>;
  fontPreference?: string;
}

interface ThemeBlueprint {
  designPrefs: DesignPrefs;
  vibeConfig?: Record<string, unknown>; // The AI generated full aesthetic theme
}

// ---------------------------------------------------------------------------
// Font Pair Constants
// ---------------------------------------------------------------------------

export const FONT_PAIRS: Record<string, FontPairConfig> = {
  "modern-clean": {
    heading: "Inter",
    body: "Inter",
    industries: ["plumbing", "hvac", "electrical", "cleaning"],
  },
  professional: {
    heading: "Playfair Display",
    body: "Inter",
    industries: ["consulting", "coaching", "real_estate"],
  },
  "bold-energetic": {
    heading: "Montserrat",
    body: "Open Sans",
    industries: ["gym", "martial_arts", "sports"],
  },
  elegant: {
    heading: "Cormorant Garamond",
    body: "Lato",
    industries: ["restaurant", "salon", "spa", "bakery"],
  },
  friendly: {
    heading: "Nunito",
    body: "Nunito Sans",
    industries: ["daycare", "pet_care", "tutoring"],
  },
  authoritative: {
    heading: "Merriweather",
    body: "Source Sans Pro",
    industries: ["legal", "accounting", "medical"],
  },
  minimal: {
    heading: "DM Sans",
    body: "DM Sans",
    industries: ["photography", "design", "architecture"],
  },
};

// ---------------------------------------------------------------------------
// Default theme colors
// ---------------------------------------------------------------------------

const DEFAULT_COLORS: Record<string, string> = {
  primary: "#1e40af",
  secondary: "#64748b",
  accent: "#f59e0b",
  background: "#ffffff",
  foreground: "#0f172a",
  muted: "#f1f5f9",
};

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
// Resolve SSH connection details for a site
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
    throw new Error(`[theme] No server IP found for site ${siteId}`);
  }

  return { site, serverIp, sshUser, sshKeyRef, wpDir };
}

// ---------------------------------------------------------------------------
// Get font pair for industry
// ---------------------------------------------------------------------------

export function getFontPairForIndustry(industryCode: string): string {
  for (const [key, config] of Object.entries(FONT_PAIRS)) {
    if (config.industries.includes(industryCode)) {
      return key;
    }
  }
  return "modern-clean";
}

// ---------------------------------------------------------------------------
// Apply theme customization
// ---------------------------------------------------------------------------

export async function applyThemeCustomization(
  siteId: string,
  blueprint: ThemeBlueprint
): Promise<void> {
  const { site, serverIp, sshUser, sshKeyRef, wpDir } = await resolveSiteConnection(siteId);

  let globalStyles;

  if (blueprint.vibeConfig) {
    // 1. New AI Vibe Compiler Logic
    globalStyles = compileVibeToWordPressThemeJson(blueprint.vibeConfig);
  } else {
    // 2. Legacy Fallback Logic
    const colors: Record<string, string> = {
      ...DEFAULT_COLORS,
      ...(blueprint.designPrefs?.colors ?? {}),
    };

    const fontPairKey = blueprint.designPrefs?.fontPreference ?? "modern-clean";
    const fontPair = FONT_PAIRS[fontPairKey] ?? FONT_PAIRS["modern-clean"];

    globalStyles = {
      version: 2,
      settings: {
        color: {
          palette: {
            custom: [
              { slug: "primary", color: colors.primary, name: "Primary" },
              { slug: "secondary", color: colors.secondary, name: "Secondary" },
              { slug: "accent", color: colors.accent, name: "Accent" },
              { slug: "background", color: colors.background, name: "Background" },
              { slug: "foreground", color: colors.foreground, name: "Foreground" },
              { slug: "muted", color: colors.muted, name: "Muted" },
            ],
          },
        },
        typography: {
          fontFamilies: {
            custom: [
              { fontFamily: `"${fontPair.heading}", sans-serif`, slug: "heading", name: "Heading" },
              { fontFamily: `"${fontPair.body}", sans-serif`, slug: "body", name: "Body" },
            ],
          },
        },
      },
      styles: {
        color: {
          background: colors.background,
          text: colors.foreground,
        },
        typography: {
          fontFamily: "var(--wp--preset--font-family--body)",
        },
        elements: {
          heading: {
            typography: {
              fontFamily: "var(--wp--preset--font-family--heading)",
            },
          },
          link: {
            color: {
              text: colors.primary,
            },
          },
          button: {
            color: {
              background: colors.primary,
              text: colors.background,
            },
          },
        },
      },
    };
  }

  // Encode and push via WP-CLI
  const stylesJson = JSON.stringify(JSON.stringify(globalStyles));
  const wpCommand = `cd ${wpDir} && wp option update wp_global_styles ${stylesJson} --format=json --allow-root`;

  await sshExec(serverIp, sshUser, wpCommand, sshKeyRef);

  // Update themeVersion to mark customization timestamp
  const newVersion = `custom-${Date.now()}`;
  await prisma.site.update({
    where: { id: siteId },
    data: { themeVersion: newVersion },
  });

  const logMetadata = blueprint.vibeConfig 
    ? { 
        isVibeTheme: true, 
        themeVersion: newVersion,
        fonts: blueprint.vibeConfig.fonts 
      }
    : {
        fontPairKey: blueprint.designPrefs?.fontPreference ?? "modern-clean",
        themeVersion: newVersion,
        isVibeTheme: false
      };

  await logActivity(
    siteId,
    "theme.customized",
    "theme",
    "info",
    `Applied theme customization: ${blueprint.vibeConfig ? 'AI Generated Vibe' : 'Standard Fallback'}`,
    logMetadata
  );
}

// ---------------------------------------------------------------------------
// Deploy child theme to a single site
// ---------------------------------------------------------------------------

export async function deployThemeToSite(siteId: string): Promise<void> {
  const { site, serverIp, sshUser, sshKeyRef, wpDir } = await resolveSiteConnection(siteId);

  const themeSourceDir = process.env.THEME_SOURCE_DIR ?? "/opt/xusmo/theme/xusmo-child";
  const remoteThemeDir = `${wpDir}/wp-content/themes/xusmo-child`;

  // rsync child theme files to production
  const keyFlag = sshKeyRef ? `-e "ssh -i ${sshKeyRef}"` : "";
  const rsyncCommand = `rsync -avz --delete ${keyFlag} ${themeSourceDir}/ ${sshUser}@${serverIp}:${remoteThemeDir}/`;

  await new Promise<void>((resolve, reject) => {
    exec(rsyncCommand, { timeout: 120_000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`rsync failed for site ${siteId}: ${error.message}\nstderr: ${stderr}`));
        return;
      }
      resolve();
    });
  });

  // Activate theme if not already active
  await sshExec(
    serverIp,
    sshUser,
    `cd ${wpDir} && wp theme activate xusmo-child --allow-root`,
    sshKeyRef
  ).catch(() => {
    // Theme may already be active — ignore
  });

  // Update themeVersion
  const newVersion = `deploy-${Date.now()}`;
  await prisma.site.update({
    where: { id: siteId },
    data: { themeVersion: newVersion },
  });

  await logActivity(
    siteId,
    "theme.deployed",
    "theme",
    "info",
    `Deployed child theme to site ${site.businessName}`,
    { themeVersion: newVersion, serverIp }
  );
}

// ---------------------------------------------------------------------------
// Deploy theme to all managed LIVE sites
// ---------------------------------------------------------------------------

export async function deployThemeToAllSites(): Promise<{ success: number; failed: number }> {
  const managedSites = await prisma.site.findMany({
    where: {
      status: "LIVE",
      managed: true,
    },
    select: { id: true, businessName: true },
  });

  let success = 0;
  let failed = 0;

  for (const site of managedSites) {
    try {
      await deployThemeToSite(site.id);
      success++;
    } catch (error) {
      failed++;
      console.error(`[theme] Failed to deploy theme to site ${site.id} (${site.businessName}):`, error);

      await logActivity(
        site.id,
        "theme.deploy_failed",
        "theme",
        "warning",
        `Failed to deploy child theme to site ${site.businessName}: ${error instanceof Error ? error.message : String(error)}`,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  await logActivity(
    null,
    "theme.bulk_deploy",
    "theme",
    "info",
    `Bulk theme deploy completed: ${success} succeeded, ${failed} failed out of ${managedSites.length} sites`,
    { success, failed, total: managedSites.length }
  );

  return { success, failed };
}

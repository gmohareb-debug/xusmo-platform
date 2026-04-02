// =============================================================================
// WordPress Site Clone
// Creates a new WordPress site instance from the Golden Image.
// Dev mode: creates content on existing WP instance with unique prefix.
// Production: will clone to new RunCloud application.
// Usage: import { cloneSite } from "@/lib/wordpress/clone";
// =============================================================================

import { getExecutor } from "./ssh";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

// ---------------------------------------------------------------------------
// Clone site (dev mode: create pages on existing WP instance)
// ---------------------------------------------------------------------------

export interface SiteMetadata {
  siteSlug: string;
  siteUrl: string;
  adminUrl: string;
  adminUser: string;
  adminPassword: string;
}

export async function cloneSite(
  blueprintId: string,
  businessName: string
): Promise<SiteMetadata> {
  const wp = getExecutor();
  const siteSlug = slugify(businessName) || `site-${blueprintId.slice(0, 8)}`;
  const siteUrl = process.env.WP_SITE_URL ?? "http://localhost:8088";

  // In dev mode, we use the existing WP instance
  // Verify WP is accessible
  await wp.execute("option get siteurl");

  return {
    siteSlug,
    siteUrl,
    adminUrl: `${siteUrl}/wp-admin`,
    adminUser: "admin",
    adminPassword: "admin123",
  };
}

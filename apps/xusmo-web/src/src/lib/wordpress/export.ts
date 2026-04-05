// =============================================================================
// WordPress Export — Full site extraction (DB + files) as downloadable archive
//
// Exports the complete WordPress installation via WP-CLI:
//   1. Database dump (SQL)
//   2. wp-content directory (themes, uploads, plugins)
//   3. wp-config.php
//   4. theme.json (current design tokens)
//
// Uses tar + gzip inside the container, then copies the archive out.
// Usage: import { exportWordPressSite } from "@/lib/wordpress/export";
// =============================================================================

import { exec } from "child_process";
import { readFile, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { getExecutor } from "./ssh";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportResult {
  success: boolean;
  /** Archive buffer — the .tar.gz file contents */
  archive?: Buffer;
  /** Suggested file name */
  filename?: string;
  /** Human-readable summary of what was exported */
  summary?: ExportSummary;
  error?: string;
}

export interface ExportSummary {
  dbSizeMb: string;
  themeFiles: number;
  uploadFiles: number;
  pluginFiles: number;
  totalSizeMb: string;
  exportedAt: string;
}

// ---------------------------------------------------------------------------
// Shell helpers
// ---------------------------------------------------------------------------

function dockerExec(
  container: string,
  command: string,
  timeout = 120_000
): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(
      `docker exec ${container} bash -c "${command.replace(/"/g, '\\"')}"`,
      { timeout, maxBuffer: 50 * 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Docker exec error: ${error.message}\n${stderr}`));
          return;
        }
        resolve(stdout.trim());
      }
    );
  });
}

function dockerCp(
  container: string,
  containerPath: string,
  hostPath: string,
  timeout = 120_000
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `docker cp ${container}:${containerPath} "${hostPath}"`,
      { timeout, maxBuffer: 50 * 1024 * 1024 },
      (error) => {
        if (error) {
          reject(new Error(`Docker cp error: ${error.message}`));
          return;
        }
        resolve();
      }
    );
  });
}

// ---------------------------------------------------------------------------
// Export the full WordPress site
// ---------------------------------------------------------------------------

export async function exportWordPressSite(
  siteId: string
): Promise<ExportResult> {
  const WP_CONTAINER = "xusmo-wp";
  const CLI_CONTAINER = "xusmo-wpcli";
  const EXPORT_DIR = "/tmp/xusmo-export";
  const ARCHIVE_PATH = "/tmp/xusmo-export.tar.gz";

  try {
    // 1. Fetch site metadata for the filename
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { businessName: true, wpUrl: true },
    });

    const safeName = (site?.businessName || "site")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}-wordpress-${timestamp}.tar.gz`;

    console.log(`[export] Starting WordPress export for site ${siteId}...`);

    // 2. Create export directory inside the WP container
    await dockerExec(WP_CONTAINER, `rm -rf ${EXPORT_DIR} && mkdir -p ${EXPORT_DIR}`);

    // 3. Export database via mysqldump (from the MySQL container directly,
    //    because the WP-CLI image uses MariaDB client which is incompatible
    //    with MySQL 8's caching_sha2_password auth plugin)
    console.log("[export] Dumping database...");
    const DB_CONTAINER = "xusmo-wp-db";
    await dockerExec(
      DB_CONTAINER,
      `mysqldump -u wordpress -pwordpress wordpress --no-tablespaces > /tmp/xusmo-db-export.sql`,
      60_000
    );
    // Copy the dump from the DB container to the WP container's export dir
    await new Promise<void>((resolve, reject) => {
      exec(
        `docker cp ${DB_CONTAINER}:/tmp/xusmo-db-export.sql - | docker cp - ${WP_CONTAINER}:${EXPORT_DIR}/database.sql`,
        { timeout: 30_000 },
        (err) => (err ? reject(err) : resolve())
      );
    }).catch(async () => {
      // Fallback: copy through host
      const tmpHost = path.join(process.env.TEMP || "/tmp", "xusmo-db-export.sql");
      await dockerCp(DB_CONTAINER, "/tmp/xusmo-db-export.sql", tmpHost);
      await new Promise<void>((resolve, reject) => {
        exec(
          `docker cp "${tmpHost}" ${WP_CONTAINER}:${EXPORT_DIR}/database.sql`,
          { timeout: 30_000 },
          (err) => (err ? reject(err) : resolve())
        );
      });
      try { await unlink(tmpHost); } catch { /* non-critical */ }
    });
    // Clean up DB container
    await dockerExec(DB_CONTAINER, `rm -f /tmp/xusmo-db-export.sql`).catch(() => {});

    // 4. Copy wp-content (themes, uploads, plugins)
    console.log("[export] Copying wp-content...");
    await dockerExec(
      WP_CONTAINER,
      `cp -r /var/www/html/wp-content/themes ${EXPORT_DIR}/themes`
    );

    // Copy uploads if they exist
    await dockerExec(
      WP_CONTAINER,
      `[ -d /var/www/html/wp-content/uploads ] && cp -r /var/www/html/wp-content/uploads ${EXPORT_DIR}/uploads || mkdir -p ${EXPORT_DIR}/uploads`
    );

    // Copy plugins
    await dockerExec(
      WP_CONTAINER,
      `cp -r /var/www/html/wp-content/plugins ${EXPORT_DIR}/plugins`
    );

    // 5. Copy wp-config.php
    await dockerExec(
      WP_CONTAINER,
      `cp /var/www/html/wp-config.php ${EXPORT_DIR}/wp-config.php 2>/dev/null || echo 'no wp-config'`
    );

    // 6. Export WP options (design tokens) as JSON
    console.log("[export] Exporting design tokens...");
    await dockerExec(
      CLI_CONTAINER,
      `wp eval 'echo json_encode(["xusmo_google_fonts_url" => get_option("xusmo_google_fonts_url",""), "xusmo_custom_css" => get_option("xusmo_custom_css",""), "blogname" => get_option("blogname",""), "blogdescription" => get_option("blogdescription","")]);' > ${EXPORT_DIR}/xusmo-options.json`
    );

    // 7. Get file counts for summary
    const dbSize = await dockerExec(
      WP_CONTAINER,
      `du -sh ${EXPORT_DIR}/database.sql 2>/dev/null | cut -f1 || echo '0K'`
    );
    const themeCount = await dockerExec(
      WP_CONTAINER,
      `find ${EXPORT_DIR}/themes -type f 2>/dev/null | wc -l`
    );
    const uploadCount = await dockerExec(
      WP_CONTAINER,
      `find ${EXPORT_DIR}/uploads -type f 2>/dev/null | wc -l`
    );
    const pluginCount = await dockerExec(
      WP_CONTAINER,
      `find ${EXPORT_DIR}/plugins -type f 2>/dev/null | wc -l`
    );

    // 8. Create tar.gz archive
    console.log("[export] Creating archive...");
    await dockerExec(
      WP_CONTAINER,
      `tar -czf ${ARCHIVE_PATH} -C ${EXPORT_DIR} .`,
      120_000
    );

    const totalSize = await dockerExec(
      WP_CONTAINER,
      `du -sh ${ARCHIVE_PATH} | cut -f1`
    );

    // 9. Copy archive to host temp directory
    const hostArchivePath = path.join(
      process.env.TEMP || "/tmp",
      `xusmo-export-${siteId}.tar.gz`
    );
    await dockerCp(WP_CONTAINER, ARCHIVE_PATH, hostArchivePath);

    // 10. Read the archive into a buffer
    const archive = await readFile(hostArchivePath);

    // 11. Clean up
    await dockerExec(WP_CONTAINER, `rm -rf ${EXPORT_DIR} ${ARCHIVE_PATH}`);
    try {
      await unlink(hostArchivePath);
    } catch {
      // Non-critical cleanup
    }

    const summary: ExportSummary = {
      dbSizeMb: dbSize,
      themeFiles: parseInt(themeCount) || 0,
      uploadFiles: parseInt(uploadCount) || 0,
      pluginFiles: parseInt(pluginCount) || 0,
      totalSizeMb: totalSize,
      exportedAt: new Date().toISOString(),
    };

    console.log(
      `[export] Export complete: ${filename} (${totalSize}), ` +
        `DB: ${dbSize}, themes: ${themeCount} files, uploads: ${uploadCount} files, plugins: ${pluginCount} files`
    );

    return { success: true, archive, filename, summary };
  } catch (error) {
    console.error("[export] Export failed:", error);
    // Clean up on failure
    try {
      await dockerExec(WP_CONTAINER, `rm -rf ${EXPORT_DIR} ${ARCHIVE_PATH}`);
    } catch {
      // Ignore cleanup errors
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Export just the WordPress XML (standard WP export format)
// ---------------------------------------------------------------------------

export async function exportWordPressXML(siteId: string): Promise<ExportResult> {
  const CLI_CONTAINER = "xusmo-wpcli";
  const EXPORT_PATH = "/tmp/xusmo-wp-export.xml";

  try {
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { businessName: true },
    });

    const safeName = (site?.businessName || "site")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}-export-${timestamp}.xml`;

    // Use WP-CLI's built-in export
    await dockerExec(
      CLI_CONTAINER,
      `wp export --dir=/tmp --filename_format=xusmo-wp-export.xml`,
      60_000
    );

    // Copy to host
    const hostPath = path.join(
      process.env.TEMP || "/tmp",
      `xusmo-xml-export-${siteId}.xml`
    );
    await dockerCp(CLI_CONTAINER, EXPORT_PATH, hostPath);

    const archive = await readFile(hostPath);

    try {
      await unlink(hostPath);
    } catch {
      // Non-critical
    }

    return {
      success: true,
      archive,
      filename,
      summary: {
        dbSizeMb: `${(archive.length / 1024 / 1024).toFixed(2)}MB`,
        themeFiles: 0,
        uploadFiles: 0,
        pluginFiles: 0,
        totalSizeMb: `${(archive.length / 1024 / 1024).toFixed(2)}MB`,
        exportedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[export-xml] Export failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

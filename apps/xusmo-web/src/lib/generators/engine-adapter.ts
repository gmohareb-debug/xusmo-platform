// =============================================================================
// Engine Adapter — Makes @xusmo/engine usable as an alternative generator
// in the xusmo-web pipeline. The engine produces React component JSON
// (SiteDocument), which is then optionally converted to Gutenberg blocks
// via @xusmo/wordpress for WordPress provisioning.
//
// Usage: import { generateViaEngine } from "@/lib/generators/engine-adapter";
// =============================================================================

import { generateFull } from "@xusmo/engine";
import { toGutenbergBlocks } from "@xusmo/wordpress";
import type { SiteDocument } from "@xusmo/engine";

/**
 * Generator type flag — lets the pipeline choose between approaches.
 */
export type GeneratorType = "gutenberg" | "engine";

/**
 * Result from the engine adapter — includes both the React JSON
 * and pre-converted Gutenberg blocks for WordPress provisioning.
 */
export interface EngineResult {
  /** Original React component JSON from the engine */
  siteDoc: SiteDocument;
  /** Gutenberg block HTML per page slug (converted from siteDoc) */
  gutenbergPages: Record<string, string>;
}

/**
 * Generate a full site via the WP1 engine pipeline.
 * Returns both the React JSON (SiteDocument) and converted Gutenberg blocks.
 * The pipeline can use gutenbergPages for WordPress, or siteDoc for React rendering.
 *
 * Retries up to 3 times if the LLM returns truncated/invalid JSON.
 */
export async function generateViaEngine(prompt: string): Promise<EngineResult> {
  const MAX_ATTEMPTS = 3;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      console.log(`[engine-adapter] Generating via @xusmo/engine (attempt ${attempt}/${MAX_ATTEMPTS})...`);
      const siteDoc = await generateFull(prompt) as SiteDocument;

      // Convert to Gutenberg blocks for WordPress compatibility
      console.log("[engine-adapter] Converting to Gutenberg blocks...");
      const gutenbergPages = toGutenbergBlocks(siteDoc);

      const pageCount = Object.keys(gutenbergPages).length;
      console.log(`[engine-adapter] Done: ${pageCount} pages converted.`);

      return { siteDoc, gutenbergPages };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (attempt < MAX_ATTEMPTS && (msg.includes("invalid JSON") || msg.includes("JSON") || msg.includes("missing theme"))) {
        console.warn(`[engine-adapter] Attempt ${attempt} failed (${msg}), retrying in 5s...`);
        await new Promise((r) => setTimeout(r, 5000));
      } else {
        throw err;
      }
    }
  }

  throw new Error("[engine-adapter] All attempts exhausted");
}

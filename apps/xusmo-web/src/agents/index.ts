// =============================================================================
// Agent Worker Startup
// Initializes BullMQ workers for the full build pipeline + post-build agents.
// Pipeline: Content → Builder → SEO → Asset → QA → (approval) → Publishing → Security
// Standalone: Revision
// Usage: import { startWorkers } from "@/agents";
// =============================================================================

import { createContentWorker } from "./content.agent";
import { createBuilderWorker } from "./builder.agent";
import { createSEOWorker } from "./seo.agent";
import { createAssetWorker } from "./asset.agent";
import { createQAWorker } from "./qa.agent";
import { createPublishingWorker } from "./publishing.agent";
import { createRevisionWorker } from "./revision.agent";
import { createSecurityWorker } from "./security.agent";
import { redisConnection } from "@/lib/queue";
import type { Worker } from "bullmq";

const workers: Worker[] = [];

export function startWorkers() {
  console.log("[workers] Starting agent workers...");

  // --- Build Pipeline Agents ---

  const contentWorker = createContentWorker(redisConnection);
  contentWorker.on("completed", (job) => {
    console.log(`[content] Job ${job.id} completed`);
  });
  contentWorker.on("failed", (job, err) => {
    console.error(`[content] Job ${job?.id} failed:`, err.message);
  });
  workers.push(contentWorker);
  console.log("[workers] Content Agent started");

  const builderWorker = createBuilderWorker(redisConnection);
  builderWorker.on("completed", (job) => {
    console.log(`[builder] Job ${job.id} completed`);
  });
  builderWorker.on("failed", (job, err) => {
    console.error(`[builder] Job ${job?.id} failed:`, err.message);
  });
  workers.push(builderWorker);
  console.log("[workers] Builder Agent started");

  const seoWorker = createSEOWorker(redisConnection);
  seoWorker.on("completed", (job) => {
    console.log(`[seo] Job ${job.id} completed`);
  });
  seoWorker.on("failed", (job, err) => {
    console.error(`[seo] Job ${job?.id} failed:`, err.message);
  });
  workers.push(seoWorker);
  console.log("[workers] SEO Agent started");

  const assetWorker = createAssetWorker(redisConnection);
  assetWorker.on("completed", (job) => {
    console.log(`[asset] Job ${job.id} completed`);
  });
  assetWorker.on("failed", (job, err) => {
    console.error(`[asset] Job ${job?.id} failed:`, err.message);
  });
  workers.push(assetWorker);
  console.log("[workers] Asset Agent started");

  const qaWorker = createQAWorker(redisConnection);
  qaWorker.on("completed", (job) => {
    console.log(`[qa] Job ${job.id} completed`);
  });
  qaWorker.on("failed", (job, err) => {
    console.error(`[qa] Job ${job?.id} failed:`, err.message);
  });
  workers.push(qaWorker);
  console.log("[workers] QA Agent started");

  // --- Post-Build Agents ---

  const publishingWorker = createPublishingWorker(redisConnection);
  publishingWorker.on("completed", (job) => {
    console.log(`[publishing] Job ${job.id} completed`);
  });
  publishingWorker.on("failed", (job, err) => {
    console.error(`[publishing] Job ${job?.id} failed:`, err.message);
  });
  workers.push(publishingWorker);
  console.log("[workers] Publishing Agent started");

  const securityWorker = createSecurityWorker(redisConnection);
  securityWorker.on("completed", (job) => {
    console.log(`[security] Job ${job.id} completed`);
  });
  securityWorker.on("failed", (job, err) => {
    console.error(`[security] Job ${job?.id} failed:`, err.message);
  });
  workers.push(securityWorker);
  console.log("[workers] Security Agent started");

  // --- Standalone Agents ---

  const revisionWorker = createRevisionWorker(redisConnection);
  revisionWorker.on("completed", (job) => {
    console.log(`[revision] Job ${job.id} completed`);
  });
  revisionWorker.on("failed", (job, err) => {
    console.error(`[revision] Job ${job?.id} failed:`, err.message);
  });
  workers.push(revisionWorker);
  console.log("[workers] Revision Agent started");

  console.log(`[workers] All ${workers.length} agents running`);
  console.log("[workers] Pipeline: content → builder → seo → asset → qa → (approval) → publishing → security");
  console.log("[workers] Standalone: revision");
}

// Graceful shutdown
async function shutdown() {
  console.log("[workers] Shutting down...");
  await Promise.all(workers.map((w) => w.close()));
  console.log("[workers] All workers stopped");
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

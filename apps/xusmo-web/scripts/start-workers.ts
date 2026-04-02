#!/usr/bin/env tsx
// =============================================================================
// Worker Process Entry Point
// Starts all BullMQ agent workers + cron scheduler.
// Run with: tsx scripts/start-workers.ts
// =============================================================================

import { startWorkers } from "../src/agents/index";

async function main() {
  console.log("[start-workers] Starting BullMQ agent workers...");
  startWorkers();

  console.log("[start-workers] All workers and scheduler running.");
  console.log("[start-workers] Press Ctrl+C to stop.");
}

main().catch((err) => {
  console.error("[start-workers] Fatal error:", err);
  process.exit(1);
});

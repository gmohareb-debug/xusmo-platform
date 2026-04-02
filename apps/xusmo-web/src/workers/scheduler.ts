// =============================================================================
// Agent Scheduler
// BullMQ-based cron scheduling for admin agent workers.
// Schedules all 5 agents with configurable cron patterns via env vars.
// Usage: import { initScheduler } from "@/workers/scheduler";
// =============================================================================

import { Queue, Worker, type Job } from "bullmq";
import { runPatrol } from "@/workers/agents/patrol";
import { runPluginUpdater } from "@/workers/agents/plugin-updater";
import { runBackup } from "@/workers/agents/backup";
import { runSslSecurity } from "@/workers/agents/ssl-security";
import { runPerformance } from "@/workers/agents/performance";

// ---------------------------------------------------------------------------
// Redis connection (from env or default)
// ---------------------------------------------------------------------------

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6380";
const url = new URL(redisUrl);
const connection = {
  host: url.hostname,
  port: Number(url.port) || 6379,
  ...(url.password ? { password: url.password } : {}),
};

// ---------------------------------------------------------------------------
// Queue + Worker
// ---------------------------------------------------------------------------

const QUEUE_NAME = "agent-scheduler";

const schedulerQueue = new Queue(QUEUE_NAME, { connection });

// ---------------------------------------------------------------------------
// Agent registry — maps job names to runner functions
// ---------------------------------------------------------------------------

const AGENT_RUNNERS: Record<string, () => Promise<void>> = {
  patrol: runPatrol,
  "plugin-updater": runPluginUpdater,
  backup: runBackup,
  "ssl-security": runSslSecurity,
  performance: runPerformance,
};

// ---------------------------------------------------------------------------
// Default cron schedules (can be overridden via env vars)
// ---------------------------------------------------------------------------

const SCHEDULE_DEFAULTS: Record<string, string> = {
  patrol: "0 */6 * * *",           // every 6 hours
  "plugin-updater": "30 */6 * * *", // every 6 hours, offset by 30 min
  backup: "0 3 * * *",              // daily at 3:00 AM
  "ssl-security": "0 4 * * *",      // daily at 4:00 AM
  performance: "0 2 * * 0",         // weekly Sunday at 2:00 AM
};

const SCHEDULE_ENV_KEYS: Record<string, string> = {
  patrol: "AGENT_PATROL_SCHEDULE",
  "plugin-updater": "AGENT_PLUGIN_UPDATER_SCHEDULE",
  backup: "AGENT_BACKUP_SCHEDULE",
  "ssl-security": "AGENT_SSL_SCHEDULE",
  performance: "AGENT_PERFORMANCE_SCHEDULE",
};

// ---------------------------------------------------------------------------
// Worker processor
// ---------------------------------------------------------------------------

function createSchedulerWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const agentName = job.name;
      const runner = AGENT_RUNNERS[agentName];

      if (!runner) {
        console.error(`[scheduler] Unknown agent job: ${agentName}`);
        return;
      }

      console.log(`[scheduler] Executing agent: ${agentName} (job ${job.id})`);

      try {
        await runner();
        console.log(`[scheduler] Agent ${agentName} completed successfully`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        console.error(`[scheduler] Agent ${agentName} failed:`, msg);
        throw error; // Let BullMQ handle retry logic
      }
    },
    {
      connection,
      concurrency: 1, // Run one agent at a time to avoid resource contention
    }
  );

  worker.on("completed", (job) => {
    console.log(`[scheduler] Job ${job.name} (${job.id}) completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[scheduler] Job ${job?.name} (${job?.id}) failed:`, err.message);
  });

  return worker;
}

// ---------------------------------------------------------------------------
// Schedule cron jobs
// ---------------------------------------------------------------------------

async function scheduleAgentJobs(): Promise<void> {
  // Remove any existing repeatable jobs to avoid duplicates on restart
  const existingJobs = await schedulerQueue.getRepeatableJobs();
  for (const job of existingJobs) {
    await schedulerQueue.removeRepeatableByKey(job.key);
    console.log(`[scheduler] Removed stale repeatable job: ${job.name} (${job.key})`);
  }

  // Schedule each agent
  for (const [agentName, defaultCron] of Object.entries(SCHEDULE_DEFAULTS)) {
    const envKey = SCHEDULE_ENV_KEYS[agentName];
    const cron = (envKey ? process.env[envKey] : undefined) ?? defaultCron;

    await schedulerQueue.add(
      agentName,
      { scheduledAt: new Date().toISOString() },
      {
        repeat: { pattern: cron },
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 20 },
      }
    );

    console.log(`[scheduler] Scheduled ${agentName} with cron: ${cron}`);
  }
}

// ---------------------------------------------------------------------------
// Init scheduler (public entry point)
// ---------------------------------------------------------------------------

let schedulerWorker: Worker | null = null;

export async function initScheduler(): Promise<void> {
  console.log("[scheduler] Initializing agent scheduler...");

  // Create the worker that processes scheduled jobs
  schedulerWorker = createSchedulerWorker();

  // Schedule all cron jobs
  await scheduleAgentJobs();

  console.log("[scheduler] All agents scheduled:");
  console.log("[scheduler]   patrol         — every 6 hours");
  console.log("[scheduler]   plugin-updater — every 6 hours (offset)");
  console.log("[scheduler]   backup         — daily 3:00 AM");
  console.log("[scheduler]   ssl-security   — daily 4:00 AM");
  console.log("[scheduler]   performance    — weekly Sunday 2:00 AM");
  console.log("[scheduler] Ready and waiting for cron triggers...");
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

export async function stopScheduler(): Promise<void> {
  console.log("[scheduler] Shutting down...");
  if (schedulerWorker) {
    await schedulerWorker.close();
    schedulerWorker = null;
  }
  await schedulerQueue.close();
  console.log("[scheduler] Stopped");
}

process.on("SIGTERM", stopScheduler);
process.on("SIGINT", stopScheduler);

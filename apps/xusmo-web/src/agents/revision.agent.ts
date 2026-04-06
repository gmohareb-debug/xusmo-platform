// =============================================================================
// Revision Agent
// Handles customer change requests after initial build.
// Routes revisions to the appropriate agent(s) based on request type.
// =============================================================================

import { Worker, type Job } from "bullmq";
import { logAgentFeedback, setAgentMemory } from "@/lib/agents/agent-memory";
import { prisma } from "@/lib/db";
import { getExecutor } from "@/lib/wordpress/ssh";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RevisionJobData {
  revisionId: string;
}

type RevisionType = "content" | "layout" | "features" | "design" | "bug";

// ---------------------------------------------------------------------------
// Feedback tag classifier (data flywheel)
// ---------------------------------------------------------------------------

type FeedbackTag = "layout" | "branding" | "copy" | "images" | "missing_section" | "feature_request";

function classifyFeedback(description: string): FeedbackTag {
  const lower = description.toLowerCase();
  if (/color|font|style|brand|logo|theme/.test(lower)) return "branding";
  if (/layout|page|section|move|order|structure/.test(lower)) return "layout";
  if (/image|photo|picture|icon|graphic/.test(lower)) return "images";
  if (/add|missing|need|want|include|where is/.test(lower)) return "missing_section";
  if (/feature|form|map|gallery|booking|calendar/.test(lower)) return "feature_request";
  return "copy"; // default
}

// ---------------------------------------------------------------------------
// Keyword-based revision type detector
// ---------------------------------------------------------------------------

const REVISION_KEYWORDS: Record<RevisionType, string[]> = {
  content: ["text", "wording", "copy", "content", "typo", "heading", "paragraph", "description", "phone", "email", "address", "hours"],
  layout: ["page", "section", "layout", "move", "order", "rearrange", "position", "swap", "navigation", "menu"],
  design: ["color", "font", "style", "design", "logo", "theme", "dark", "light", "background", "image", "photo"],
  features: ["add", "feature", "form", "map", "gallery", "booking", "calendar", "chat", "widget", "testimonial"],
  bug: ["bug", "broken", "error", "fix", "crash", "not working", "wrong", "missing", "404"],
};

function detectRevisionType(description: string): RevisionType {
  const lower = description.toLowerCase();
  const scores: Record<RevisionType, number> = {
    content: 0,
    layout: 0,
    design: 0,
    features: 0,
    bug: 0,
  };

  for (const [type, keywords] of Object.entries(REVISION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        scores[type as RevisionType]++;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return best[0][1] > 0 ? (best[0][0] as RevisionType) : "content";
}

// ---------------------------------------------------------------------------
// Process revision job
// ---------------------------------------------------------------------------

export async function processRevisionJob(job: Job<RevisionJobData>) {
  const startTime = Date.now();
  const { revisionId } = job.data;

  const revision = await prisma.revision.findUniqueOrThrow({
    where: { id: revisionId },
    include: {
      site: {
        include: {
          build: { select: { id: true, blueprintId: true } },
          pages: true,
        },
      },
    },
  });

  const buildId = revision.site.build?.id;
  if (!buildId) {
    await prisma.revision.update({
      where: { id: revisionId },
      data: { status: "REJECTED", changesMade: "No build associated with this site" },
    });
    return;
  }

  const agentLog = await prisma.agentLog.create({
    data: {
      buildId,
      agentName: "revision",
      status: "STARTED",
      input: { revisionId, description: revision.description, type: revision.requestType } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });

  try {
    await prisma.revision.update({
      where: { id: revisionId },
      data: { status: "IN_PROGRESS" },
    });

    const revisionType = (revision.requestType as RevisionType) || detectRevisionType(revision.description);
    const wp = getExecutor(revision.site.id);
    const changes: string[] = [];
    const agentsUsed: string[] = [];

    switch (revisionType) {
      case "content": {
        agentsUsed.push("content");
        // For content revisions, update the affected pages in WordPress
        const affectedPages = (revision.pagesAffected as string[] | null) ?? ["home"];
        for (const slug of affectedPages) {
          try {
            const pageIdStr = await wp.execute(
              `post list --post_type=page --name=${slug} --field=ID --format=ids`
            );
            if (pageIdStr.trim()) {
              changes.push(`Flagged page "${slug}" (ID: ${pageIdStr.trim()}) for content update`);
            }
          } catch {
            changes.push(`Could not find page "${slug}"`);
          }
        }
        changes.push(`Content revision processed for: ${affectedPages.join(", ")}`);
        break;
      }

      case "layout": {
        agentsUsed.push("builder");
        changes.push("Layout revision request logged — requires manual review or Builder Agent re-run");
        break;
      }

      case "design": {
        agentsUsed.push("builder", "asset");
        changes.push("Design revision request logged — requires Asset + Builder Agent re-run");
        break;
      }

      case "features": {
        agentsUsed.push("builder");
        changes.push("Feature revision request logged — requires Blueprint update + Builder Agent re-run");
        break;
      }

      case "bug": {
        agentsUsed.push("qa");
        // Re-run basic QA checks
        try {
          const pageCount = await wp.execute(
            "post list --post_type=page --post_status=publish --format=count"
          );
          changes.push(`Bug report logged. Current page count: ${pageCount.trim()}`);
        } catch {
          changes.push("Bug report logged. Could not verify current state.");
        }
        break;
      }
    }

    // Classify feedback for data flywheel
    const feedbackTag = classifyFeedback(revision.description);

    // Update revision as completed
    await prisma.revision.update({
      where: { id: revisionId },
      data: {
        status: "COMPLETED",
        requestType: revisionType,
        feedbackTag,
        agentsUsed: agentsUsed as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        changesMade: changes.join("\n"),
        completedAt: new Date(),
      },
    });

    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "COMPLETED",
        output: { revisionType, changes, agentsUsed } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        durationMs,
        completedAt: new Date(),
      },
    });

    console.log(`[revision] Completed ${revisionType} revision ${revisionId} (${durationMs}ms)`);
    return { revisionType, changes, agentsUsed, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await prisma.agentLog.update({
      where: { id: agentLog.id },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs,
        completedAt: new Date(),
      },
    });

    await prisma.revision.update({
      where: { id: revisionId },
      data: { status: "REJECTED", changesMade: `Error: ${error instanceof Error ? error.message : "Unknown"}` },
    });

    throw error;
  }
}

// ---------------------------------------------------------------------------
// Exported type detector for API use
// ---------------------------------------------------------------------------

export { detectRevisionType, classifyFeedback };

// ---------------------------------------------------------------------------
// Worker factory
// ---------------------------------------------------------------------------

export function createRevisionWorker(connection: { host: string; port: number }) {
  return new Worker<RevisionJobData>("revision", processRevisionJob, {
    connection,
    concurrency: 2,
  });
}

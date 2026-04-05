// =============================================================================
// Demo Store — In-memory store for demo interview data
// Shared across API routes so demo answers flow to the preview page.
// =============================================================================

/** Answers collected during the interview, keyed by leadId */
export const demoAnswers = new Map<string, Record<string, unknown>>();

/** Maps blueprintId → leadId so the build status route can find answers */
export const demoBlueprintToLead = new Map<string, string>();

/** Build start times for simulating progress */
export const demoBuildStartTimes = new Map<string, number>();

/** Helper: get answers for a build (blueprintId) */
export function getDemoAnswersForBuild(
  buildId: string
): Record<string, unknown> | null {
  const leadId = demoBlueprintToLead.get(buildId);
  if (!leadId) return null;
  return demoAnswers.get(leadId) ?? null;
}

// =============================================================================
// POST /api/studio/[siteId]/agent — LEGACY route
// Proxies to the new multi-agent pipeline at /api/studio/[siteId]/agents
// Kept for backwards compatibility with older frontend references.
// =============================================================================

import { POST as agentsPOST } from "../agents/route";
export const POST = agentsPOST;

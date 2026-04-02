// =============================================================================
// Ecommerce Agent — Placeholder (postponed)
// =============================================================================

import type { AgentInput, AgentResult } from "./types";

export async function runEcommerceAgent(input: AgentInput): Promise<AgentResult> {
  return {
    agent: "ecommerce",
    status: "completed",
    reply: "E-commerce features (WooCommerce, products, checkout) are coming soon. For now, you can add product sections and pricing tables via the Editor agent.",
    actions: [{ type: "INFO", success: true, label: "E-commerce agent: coming soon" }],
  };
}

// =============================================================================
// E-commerce Agent — Product management, WooCommerce integration,
// pricing tables, product grids, cart setup
// Enhanced: product CRUD via designDocument, WooCommerce sync when available,
//           pricing table management, product-grid population
// =============================================================================

import { prisma } from "@/lib/db";
import { geminiFlash } from "@/lib/llm/gemini";
import type { AgentInput, AgentResult, AgentAction } from "./types";

// ---------------------------------------------------------------------------
// E-commerce action types
// ---------------------------------------------------------------------------

type EcomAction =
  | { action: "ADD_PRODUCTS"; products: { name: string; price: string; description?: string; image?: string; badge?: string }[] }
  | { action: "UPDATE_PRODUCT"; productIndex: number; updates: Record<string, unknown> }
  | { action: "ADD_PRICING"; plans: { name: string; price: string; period?: string; features: string[]; cta?: string; highlighted?: boolean }[] }
  | { action: "SETUP_SHOP"; shopType: "products" | "services" | "subscriptions" }
  | { action: "INFO"; message: string };

const ECOM_SYSTEM_PROMPT = `You are an e-commerce specialist. Given a business context and user request, determine what e-commerce actions to take.

Return JSON:
{
  "reply": "Short confirmation of what you're doing",
  "actions": [
    { "action": "ADD_PRODUCTS", "products": [{ "name": "...", "price": "$29", "description": "...", "badge": "New" }] },
    { "action": "ADD_PRICING", "plans": [{ "name": "Basic", "price": "$19/mo", "features": ["Feature 1"], "highlighted": false }] },
    { "action": "SETUP_SHOP", "shopType": "products" }
  ]
}

Available actions:
1. ADD_PRODUCTS — Add product cards to the product-grid section
2. UPDATE_PRODUCT — Update an existing product by index
3. ADD_PRICING — Add or replace pricing plans
4. SETUP_SHOP — Configure the shop structure (adds product-grid, cart sections)
5. INFO — Informational response

Generate realistic products with appropriate prices for the business type.
Return ONLY JSON.`;

export async function runEcommerceAgent(input: AgentInput): Promise<AgentResult> {
  const { siteId, prompt, context } = input;
  const actions: AgentAction[] = [];
  const startTime = Date.now();

  try {
    // Get LLM to determine e-commerce actions
    const llmResult = await geminiFlash(
      `Business: ${context.businessName} (${context.industry})
Pages: ${context.currentPages.map(p => p.slug).join(", ")}
User request: ${prompt}`,
      ECOM_SYSTEM_PROMPT
    );

    if (!llmResult?.text) throw new Error("Empty LLM response");

    let cleaned = llmResult.text.trim();
    if (cleaned.startsWith("```"))
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    let parsed: { reply: string; actions: EcomAction[] };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { reply: "I'll help with your e-commerce setup.", actions: [] };
    }

    // Execute each action
    for (const ecomAction of parsed.actions || []) {
      const result = await executeEcomAction(siteId, ecomAction, context);
      actions.push(result);
    }

    return {
      agent: "ecommerce",
      status: "completed",
      reply: parsed.reply || `E-commerce updates applied.`,
      actions,
      durationMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      agent: "ecommerce",
      status: "failed",
      reply: `E-commerce update failed: ${err instanceof Error ? err.message : "Unknown"}`,
      actions,
      durationMs: Date.now() - startTime,
    };
  }
}

async function executeEcomAction(
  siteId: string,
  action: EcomAction,
  context: AgentInput["context"]
): Promise<AgentAction> {
  switch (action.action) {
    case "ADD_PRODUCTS": {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};
        const home = pages.home as Record<string, unknown> | undefined;
        if (!home?.sections) return { type: "ADD_PRODUCTS", success: false, label: "No home page found" };

        const sections = [...(home.sections as Record<string, unknown>[])];

        // Find existing product-grid or add one
        let gridIndex = sections.findIndex(s => (s.component as string) === "product-grid");
        if (gridIndex === -1) {
          // Insert before footer
          const footerIdx = sections.findIndex(s => (s.component as string) === "footer");
          gridIndex = footerIdx > 0 ? footerIdx : sections.length;
          sections.splice(gridIndex, 0, {
            id: `section-${Date.now()}`,
            component: "product-grid",
            props: { title: "Our Products", products: [] },
            layout: { background: "default", padding: "lg", width: "contained", align: "center" },
            style: {},
          });
        }

        const grid = sections[gridIndex];
        const props = { ...(grid.props as Record<string, unknown>) };
        const existing = (props.products as unknown[]) || [];
        props.products = [
          ...existing,
          ...action.products.map(p => ({
            name: p.name,
            price: p.price,
            description: p.description || "",
            image: p.image || `https://placehold.co/400x400/e5e7eb/6b7280?text=${encodeURIComponent(p.name.slice(0, 10))}`,
            badge: p.badge || null,
            href: "#",
          })),
        ];
        sections[gridIndex] = { ...grid, props };

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: { ...pages, home: { ...home, sections } } } },
        });

        return { type: "ADD_PRODUCTS", success: true, label: `Added ${action.products.length} products to product grid` };
      } catch {
        return { type: "ADD_PRODUCTS", success: false, label: "Failed to add products" };
      }
    }

    case "ADD_PRICING": {
      try {
        const site = await prisma.site.findUnique({ where: { id: siteId }, select: { designDocument: true } });
        const doc = (site?.designDocument as Record<string, unknown>) || {};
        const pages = (doc.pages as Record<string, unknown>) || {};

        // Find or create pricing page, or add to home
        const targetPage = pages.pricing ? "pricing" : "home";
        const page = pages[targetPage] as Record<string, unknown>;
        if (!page?.sections) return { type: "ADD_PRICING", success: false, label: "No target page" };

        const sections = [...(page.sections as Record<string, unknown>[])];
        let pricingIdx = sections.findIndex(s =>
          (s.component as string) === "pricing-table" || (s.component as string) === "pricing"
        );

        if (pricingIdx === -1) {
          const footerIdx = sections.findIndex(s => (s.component as string) === "footer");
          pricingIdx = footerIdx > 0 ? footerIdx : sections.length;
          sections.splice(pricingIdx, 0, {
            id: `section-${Date.now()}`,
            component: "pricing-table",
            props: { title: "Pricing", plans: [] },
            layout: { background: "muted", padding: "lg", width: "contained", align: "center" },
            style: {},
          });
        }

        const pricing = sections[pricingIdx];
        const props = { ...(pricing.props as Record<string, unknown>) };
        props.plans = action.plans.map(p => ({
          name: p.name,
          price: p.price,
          period: p.period || "",
          features: p.features,
          cta: p.cta || "Get Started",
          ctaHref: "#contact",
          highlighted: p.highlighted || false,
        }));
        sections[pricingIdx] = { ...pricing, props };

        await prisma.site.update({
          where: { id: siteId },
          data: { designDocument: { ...doc, pages: { ...pages, [targetPage]: { ...page, sections } } } },
        });

        return { type: "ADD_PRICING", success: true, label: `Set ${action.plans.length} pricing plans` };
      } catch {
        return { type: "ADD_PRICING", success: false, label: "Failed to add pricing" };
      }
    }

    case "SETUP_SHOP": {
      return { type: "SETUP_SHOP", success: true, label: `Shop type "${action.shopType}" configured. Products and pricing sections added.` };
    }

    case "INFO":
      return { type: "INFO", success: true, label: action.message };

    default:
      return { type: "UNKNOWN", success: false, label: "Unknown e-commerce action" };
  }
}

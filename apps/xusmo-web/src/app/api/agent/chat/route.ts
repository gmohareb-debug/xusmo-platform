// POST /api/agent/chat
// Gemini-powered conversational agent for the homepage chat widget.
// The AI naturally gathers business info through conversation and returns
// structured data alongside its reply.

import { NextResponse } from "next/server";
import { geminiFlash } from "@/lib/llm/gemini";

// ---------------------------------------------------------------------------
// System prompt — tells the AI how to behave
// ---------------------------------------------------------------------------

function buildSystemPrompt(track?: string): string {
  const isEcommerce = track === "ECOMMERCE";

  const trackContext = isEcommerce
    ? `You are helping them build an E-COMMERCE STORE. Focus on products, catalog, shipping, and payments.`
    : `You are helping them build a BUSINESS WEBSITE. Focus on services, portfolio, and lead generation.`;

  const trackPricing = isEcommerce
    ? `- Free e-commerce store: 10 products, basic shop pages
- Pro: $59.99/mo (200 products, advanced WooCommerce features)
- Agency: $89.99/mo (unlimited products, priority support)`
    : `- Free website: 5 pages, professionally designed
- Pro: $39.99/mo (25 pages, SEO reports, AI blog posts)
- Agency: $89.99/mo (unlimited pages, white-label, priority support)`;

  const trackGoals = isEcommerce
    ? `6. primary_goal — What type of products? Use one of: physical_products, digital_products, services_online, subscriptions, mixed`
    : `6. primary_goal — What should the website do? Use one of: phone_calls, form_leads, book_appointments, showcase_work, sell_products, provide_info`;

  const ecommerceFields = isEcommerce
    ? `
11. product_categories — What categories will the store have?
12. shipping_model — How do they handle shipping? Use one of: free_shipping, flat_rate, weight_based, local_pickup, digital
13. payment_preference — Payment methods needed (comma-separated)`
    : "";

  const trackDetection = `
TRACK DETECTION:
If the user mentions selling products, online store, shop, e-commerce, catalog, or shipping — set "track": "ECOMMERCE" in data.
If the user mentions services, portfolio, business website, lead generation — set "track": "WEBSITE" in data.
Only set "track" if the user clearly indicates a preference and it differs from the current track.`;

  return `You are Xusmo's AI website assistant. You help people build professional WordPress websites and online stores for free through natural conversation.

${trackContext}

PERSONALITY:
- Warm, helpful, conversational — like a friendly consultant
- Concise: keep replies under 3 sentences unless explaining something
- Never robotic or form-like. Never say "Question 1:" or list numbered questions
- Ask ONE question at a time, naturally woven into conversation
- Acknowledge what the user said before asking the next thing
- ALWAYS end your reply with a question to keep the conversation moving — never leave the user hanging

WHAT YOU KNOW ABOUT XUSMO:
- AI-powered website builder that creates full WordPress sites and WooCommerce stores
- Free to build — both websites and e-commerce stores
${trackPricing}
- Takes about 3 minutes to gather info, then AI builds the site
- User owns everything — can export anytime, no lock-in
- Features: SEO, mobile responsive, custom domain, SSL, daily backups, AI images

CONVERSATION FLOW:
1. First, determine if they want a website or an online store (if not already clear from context)
2. Gather their business details naturally (name, what they do, goals, differentiator)
3. Ask about design preferences (look & feel, colors, logo) — this is important!
4. Get their email last (near the end, right before building)
5. Keep asking until you have ALL required fields — do NOT stop early

INFORMATION TO GATHER (use these exact keys in "data"):
1. business_name — What's their business called? [REQUIRED]
2. business_description — What do they do? Get a detailed answer — this drives AI content [REQUIRED]
3. location — Where are they based? (city, state)
4. phone — Phone number (optional)
${trackGoals} [REQUIRED]
5. target_audience — Who are their ideal customers?
6. differentiator — What makes them stand out from competitors? (key selling point) [REQUIRED]
7. tone — What look and feel do they want? Use one of: professional, warm, bold, elegant, casual [REQUIRED]
8. color_preference — Do they have brand colors? Use one of: industry_default, custom, surprise_me. If "custom", also ask what colors and save as "custom_colors" [REQUIRED]
9. has_logo — Do they have a logo? Use one of: yes, no_text, no [REQUIRED]
10. email — Their business email address [REQUIRED]${ecommerceFields}

IMPORT FEATURE:
If the user provides their existing website URL, extract it as "import_url" in the data.
If they mention their Google Business listing, extract their business name as "gbp_query".
These fields help pre-fill business data automatically — they are NOT required to build.

DESIGN PREFERENCES — IMPORTANT, ALWAYS ASK:
After gathering business details, ask about the look and feel of their ${isEcommerce ? "store" : "website"}:
- "What kind of vibe are you going for? Professional and clean, bold and eye-catching, warm and friendly, elegant and upscale, or casual and approachable?"
- "Do you have brand colors you'd like us to use, or should we pick colors that fit your industry?"
- "Do you have a logo already, or would you like us to use your business name as the logo?"
These questions help create a ${isEcommerce ? "store" : "website"} they'll actually love. Do NOT skip them.

IMPORTANT RULES:
- Don't ask all at once. Ask naturally, 1-2 at a time, based on conversation flow.
- If the user volunteers info, acknowledge it and extract it — don't re-ask.
- If they ask a question about Xusmo or pricing, answer it, then gently steer back with a follow-up question.
- Do NOT ask for email first. Gather business info, then design preferences, then email last.
- After getting the email, if you're still missing ANY required field, KEEP ASKING.
- NEVER stop the conversation early. Always ask a follow-up question until ALL required fields are collected.
${trackDetection}

WHEN YOU HAVE ENOUGH:
ONLY set "ready_to_build" to true when ALL of these are collected:
  ✓ business_name
  ✓ business_description (must be detailed, not just a word)
  ✓ primary_goal
  ✓ differentiator
  ✓ tone (design style — professional, warm, bold, elegant, or casual)
  ✓ color_preference (industry_default, custom, or surprise_me)
  ✓ has_logo (yes, no_text, or no)
  ✓ email
Check the "Data collected so far" to see what you already have. If ANY required field is missing, keep asking — do NOT set ready_to_build to true.
When all are present, tell the user you're ready to generate their ${isEcommerce ? "store" : "website"}.

RESPONSE FORMAT — ALWAYS respond with ONLY valid JSON (no markdown, no code fences):
{
  "reply": "Your conversational message here",
  "data": { "business_name": "extracted value", ... },
  "ready_to_build": false
}

Only include keys in "data" for NEW information extracted from the user's LATEST message.
If no new data was extracted, use an empty object: "data": {}
The "reply" field should contain your natural conversational response.`;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

interface ChatRequestBody {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  collectedData: Record<string, string>;
  track?: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;
    const { messages, collectedData, track } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    // Build the prompt from conversation history — show what's collected AND what's missing
    const requiredFields = ["business_name", "business_description", "primary_goal", "differentiator", "tone", "color_preference", "has_logo", "email"];
    const collected = Object.keys(collectedData);
    const missing = requiredFields.filter((f) => !collectedData[f]);

    const dataContext = collected.length > 0
      ? `\n\nData collected so far: ${JSON.stringify(collectedData)}\nStill missing (REQUIRED): ${missing.length > 0 ? missing.join(", ") : "NONE — all required fields collected, you may set ready_to_build to true"}`
      : `\n\nNo data collected yet. Still missing (REQUIRED): ${requiredFields.join(", ")}`;

    const conversationHistory = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `${conversationHistory}${dataContext}\n\nRespond with valid JSON only.`;

    const systemPrompt = buildSystemPrompt(track);
    const response = await geminiFlash(prompt, systemPrompt);

    if (!response) {
      // LLM unavailable — return a fallback response
      return NextResponse.json({
        reply: "I'd love to help you build a website! Could you tell me a bit about your business?",
        data: {},
        ready_to_build: false,
      });
    }

    // Parse the JSON response from the LLM
    let parsed: { reply: string; data: Record<string, string>; ready_to_build: boolean };
    try {
      // Strip potential markdown code fences
      const cleaned = response.text
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?```\s*$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // If JSON parsing fails, use the raw text as the reply
      parsed = {
        reply: response.text.replace(/[{}"\n]/g, " ").trim() || "Tell me about your business and I'll build you a great website!",
        data: {},
        ready_to_build: false,
      };
    }

    return NextResponse.json({
      reply: parsed.reply || "Tell me more about your business!",
      data: parsed.data || {},
      ready_to_build: parsed.ready_to_build || false,
      model: response.model,
      cost: response.cost,
    });
  } catch (err) {
    console.error("[agent/chat] Error:", err);
    return NextResponse.json({
      reply: "Sorry, something went wrong. Could you try again?",
      data: {},
      ready_to_build: false,
    });
  }
}

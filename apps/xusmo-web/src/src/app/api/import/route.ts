import { NextRequest, NextResponse } from "next/server";
import { extractGBPData } from "@/lib/import/gbp";
import { scrapeSite } from "@/lib/import/scraper";
import { geminiFlash } from "@/lib/llm/gemini";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type, value } = body; // type: "gbp" | "website" | "description"

  if (!value || typeof value !== "string") {
    return NextResponse.json({ error: "Value required" }, { status: 400 });
  }

  try {
    if (type === "gbp") {
      const data = await extractGBPData(value);
      return NextResponse.json({ source: "gbp", data });
    }

    if (type === "website") {
      const scraped = await scrapeSite(value);
      if (!scraped) {
        return NextResponse.json({ error: "Could not scrape website" }, { status: 400 });
      }
      // Use LLM to structure the scraped content into business data
      const prompt = `Based on this scraped website data, extract structured business information:

Title: ${scraped.title}
Description: ${scraped.description}
Headings: ${scraped.headings.slice(0, 10).join(", ")}
Content samples: ${scraped.paragraphs.slice(0, 5).join("\n")}
Phone: ${scraped.phone || "not found"}
Email: ${scraped.email || "not found"}
Address: ${scraped.address || "not found"}
Colors found: ${scraped.colors.slice(0, 5).join(", ")}

Return JSON: { "businessName", "description", "services": [], "phone", "email", "address", "colors": [], "tagline" }`;

      const result = await geminiFlash(prompt, "Extract business data from website scraping results. Return only valid JSON.");
      let structured = null;
      if (result) {
        try {
          const cleaned = result.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
          structured = JSON.parse(cleaned);
        } catch {}
      }

      return NextResponse.json({
        source: "website",
        data: structured,
        raw: { title: scraped.title, description: scraped.description, colors: scraped.colors, phone: scraped.phone, email: scraped.email },
      });
    }

    if (type === "description") {
      // One-sentence fast path — LLM generates full business profile from description
      const prompt = `A user described their business as: "${value}"

Generate a complete business profile as JSON:
{
  "businessName": "suggested business name if not provided",
  "description": "expanded 2-3 sentence description",
  "services": ["service1", "service2", "service3"],
  "tagline": "catchy tagline",
  "tone": "professional|warm|bold|elegant|casual",
  "industryCategory": "specific industry like plumbing, restaurant, photography"
}`;

      const result = await geminiFlash(prompt, "Generate business profiles from descriptions. Return only valid JSON.");
      let profile = null;
      if (result) {
        try {
          const cleaned = result.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
          profile = JSON.parse(cleaned);
        } catch {}
      }

      return NextResponse.json({ source: "description", data: profile });
    }

    return NextResponse.json({ error: "Invalid type. Use: gbp, website, or description" }, { status: 400 });
  } catch (error) {
    console.error("[import] Error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}

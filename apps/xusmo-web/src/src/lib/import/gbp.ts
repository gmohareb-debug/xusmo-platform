import { geminiFlash } from "@/lib/llm/gemini";

export interface GBPData {
  businessName: string;
  description: string;
  phone: string;
  address: string;
  website: string;
  category: string;
  hours: string;
  rating: number;
  reviewCount: number;
}

// Since we can't access Google Places API without keys, use LLM to extract
// structured data from a business name + location query
export async function extractGBPData(
  businessNameOrUrl: string
): Promise<GBPData | null> {
  const prompt = `Extract business information for: "${businessNameOrUrl}"

Return a JSON object with these fields (use null for unknown):
{
  "businessName": "exact business name",
  "description": "brief business description based on what you know",
  "phone": "phone number if known",
  "address": "full address if known",
  "website": "website URL if known",
  "category": "business category (e.g., plumber, restaurant, photographer)",
  "hours": "typical business hours if known",
  "rating": null,
  "reviewCount": null
}

Return ONLY valid JSON.`;

  const result = await geminiFlash(prompt, "You are a business data extraction assistant. Return only valid JSON.");
  if (!result) return null;

  try {
    const cleaned = result.text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as GBPData;
  } catch {
    return null;
  }
}

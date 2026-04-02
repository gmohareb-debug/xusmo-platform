// =============================================================================
// Terms of Service Generator
// Uses Gemini Flash to generate professional ToS in HTML format.
// Falls back to a basic default if LLM is unavailable.
// Usage: import { generateTermsOfService } from "@/lib/compliance/terms";
// =============================================================================

import { geminiFlash } from "@/lib/llm/gemini";

export async function generateTermsOfService(data: {
  businessName: string;
  website?: string;
  isEcommerce: boolean;
}): Promise<string> {
  const prompt = `Generate professional Terms of Service for:
Business: ${data.businessName}
Website: ${data.website || "N/A"}
Is e-commerce: ${data.isEcommerce ? "Yes" : "No"}

Generate concise, professional Terms of Service in HTML format. Include sections for:
1. Acceptance of Terms
2. Use of Website
3. Intellectual Property
4. Limitation of Liability
5. ${data.isEcommerce ? "Purchases and Refunds" : "Services"}
6. Termination
7. Governing Law
8. Contact Information

Use proper HTML headings (h2, h3), paragraphs, and lists. Include the current year. Keep it concise but professional.`;

  const result = await geminiFlash(
    prompt,
    "You are a legal document generator. Create professional, concise Terms of Service in HTML format."
  );

  return result?.text || getDefaultTerms(data.businessName);
}

function getDefaultTerms(name: string): string {
  const year = new Date().getFullYear();
  return `<h2>Terms of Service</h2>
<p><strong>Effective Date:</strong> January 1, ${year}</p>
<p>Welcome to ${name}. By accessing or using our website, you agree to be bound by these Terms of Service.</p>

<h3>Use of Website</h3>
<p>You agree to use this website only for lawful purposes and in a manner that does not infringe on the rights of others or restrict their use and enjoyment of the website.</p>

<h3>Intellectual Property</h3>
<p>All content on this website, including text, graphics, logos, and images, is the property of ${name} and is protected by applicable intellectual property laws.</p>

<h3>Limitation of Liability</h3>
<p>${name} shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of this website.</p>

<h3>Changes to Terms</h3>
<p>We reserve the right to update these Terms of Service at any time. Continued use of the website constitutes acceptance of the revised terms.</p>

<h3>Contact</h3>
<p>If you have any questions about these Terms, please contact us through our website.</p>

<p>&copy; ${year} ${name}. All rights reserved.</p>`;
}

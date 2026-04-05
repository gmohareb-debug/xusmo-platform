// =============================================================================
// Privacy Policy Generator
// Uses Gemini Flash to generate a professional, business-specific privacy
// policy in HTML format. Falls back to a basic default if LLM is unavailable.
// Usage: import { generatePrivacyPolicy } from "@/lib/compliance/privacy";
// =============================================================================

import { geminiFlash } from "@/lib/llm/gemini";

export async function generatePrivacyPolicy(data: {
  businessName: string;
  website?: string;
  email?: string;
  location?: string;
  collectsPayment: boolean;
  hasContactForm: boolean;
  usesAnalytics: boolean;
  usesNewsletter: boolean;
}): Promise<string> {
  const prompt = `Generate a professional privacy policy for:
Business: ${data.businessName}
Website: ${data.website || "N/A"}
Contact: ${data.email || "N/A"}
Location: ${data.location || "N/A"}
Collects payment: ${data.collectsPayment ? "Yes" : "No"}
Has contact form: ${data.hasContactForm ? "Yes" : "No"}
Uses analytics: ${data.usesAnalytics ? "Yes (Google Analytics)" : "No"}
Uses newsletter: ${data.usesNewsletter ? "Yes" : "No"}

Generate a complete, professional privacy policy in HTML format. Include sections for:
1. Information We Collect
2. How We Use Your Information
3. Cookies and Tracking
4. Third-Party Services
5. Data Security
6. Your Rights
7. Contact Us
8. Changes to This Policy

Use proper HTML headings (h2, h3), paragraphs, and lists. Include the current year. Make it specific to this business.`;

  const result = await geminiFlash(
    prompt,
    "You are a legal document generator. Create professional, compliant privacy policies in HTML format."
  );

  return result?.text || getDefaultPrivacyPolicy(data.businessName, data.email || "");
}

function getDefaultPrivacyPolicy(name: string, email: string): string {
  const year = new Date().getFullYear();
  return `<h2>Privacy Policy</h2>
<p><strong>Effective Date:</strong> January 1, ${year}</p>
<p>${name} ("we", "us", or "our") respects your privacy and is committed to protecting your personal information.</p>

<h3>Information We Collect</h3>
<p>We may collect personal information that you voluntarily provide to us when you use our website, including your name, email address, phone number, and any other information you choose to provide.</p>

<h3>How We Use Your Information</h3>
<p>We use the information we collect to provide and improve our services, respond to your inquiries, and communicate with you.</p>

<h3>Data Security</h3>
<p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>

<h3>Contact Us</h3>
<p>If you have any questions about this Privacy Policy, please contact us at ${email || "our website"}.</p>

<p>&copy; ${year} ${name}. All rights reserved.</p>`;
}

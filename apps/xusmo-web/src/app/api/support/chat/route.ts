// =============================================================================
// Support Chat API — POST to send a message, get AI response
// MVP: Returns mock responses. Will connect to Support Agent in production.
// =============================================================================

import { NextRequest, NextResponse } from "next/server";

const MOCK_RESPONSES: Record<string, string> = {
  billing:
    "Your website build is completely free! You only pay $11.99/mo for hosting when you're ready to go live. You can manage your subscription from the Billing page in your portal.",
  domain:
    "You can connect your own domain from the Domains page. Just update your DNS records: set an A record pointing to your server IP, and a CNAME for 'www' pointing to your-site.xusmo.io. Changes usually take 24-48 hours to propagate.",
  edit:
    "Absolutely! Your site is a real WordPress website. You can log into the WordPress admin panel to edit anything — pages, content, images, plugins, and more. You'll find the WP Admin link on your dashboard.",
  cancel:
    "You can cancel your hosting subscription anytime from the Billing page. We recommend exporting your site first so you don't lose your content. Your website build will always be free to recreate.",
};

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Simple keyword matching for MVP
    const lower = message.toLowerCase();
    let response =
      "Thanks for reaching out! I'm the Xusmo AI assistant. I can help with billing, domains, editing your website, and more. What would you like to know?";

    if (lower.includes("bill") || lower.includes("price") || lower.includes("cost") || lower.includes("pay")) {
      response = MOCK_RESPONSES.billing;
    } else if (lower.includes("domain") || lower.includes("dns") || lower.includes("url")) {
      response = MOCK_RESPONSES.domain;
    } else if (lower.includes("edit") || lower.includes("change") || lower.includes("update") || lower.includes("modify")) {
      response = MOCK_RESPONSES.edit;
    } else if (lower.includes("cancel") || lower.includes("stop") || lower.includes("delete")) {
      response = MOCK_RESPONSES.cancel;
    } else if (lower.includes("human") || lower.includes("person") || lower.includes("agent") || lower.includes("talk")) {
      response =
        "I'll escalate this to our support team. You can also reach us directly at support@xusmo.io. We typically respond within 24 hours.";
    }

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

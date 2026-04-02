// POST /api/webhooks/wpforms
// Receives WPForms webhook payload and creates a FormSubmission.
// No auth required — validates required fields from the payload.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface WpFormsPayload {
  form_id?: string;
  form_name?: string;
  fields?: Record<string, string>;
  entry_id?: string;
  site_url?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WpFormsPayload;

    const { form_id, form_name, fields, entry_id, site_url } = body;

    // Validate required fields
    if (!form_id || !form_name || !fields || !site_url) {
      return NextResponse.json(
        {
          error: "Missing required fields. Expected: form_id, form_name, fields, site_url",
        },
        { status: 400 }
      );
    }

    // Normalize the incoming URL for matching: strip trailing slashes and protocol
    const normalizeUrl = (url: string): string =>
      url
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "")
        .toLowerCase();

    const normalizedIncoming = normalizeUrl(site_url);

    // Find the site by matching wpUrl
    const sites = await prisma.site.findMany({
      where: {
        wpUrl: { not: null },
        status: { in: ["STAGING", "LIVE"] },
      },
      select: {
        id: true,
        userId: true,
        wpUrl: true,
        businessName: true,
      },
    });

    const site = sites.find((s) => {
      if (!s.wpUrl) return false;
      return normalizeUrl(s.wpUrl) === normalizedIncoming;
    });

    if (!site) {
      console.error(
        `[webhooks/wpforms] No site found for URL: ${site_url} (normalized: ${normalizedIncoming})`
      );
      return NextResponse.json(
        { error: "No matching site found for the provided site_url" },
        { status: 404 }
      );
    }

    // Determine page slug from fields or fallback
    const pageSlug = (fields as Record<string, string>).page_slug
      || (fields as Record<string, string>).page
      || "unknown";

    // Create the FormSubmission
    const submission = await prisma.formSubmission.create({
      data: {
        siteId: site.id,
        userId: site.userId,
        formName: form_name,
        pageSlug,
        fields: fields as Record<string, string>,
        submitterIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null,
        userAgent: req.headers.get("user-agent") || null,
        status: "NEW",
      },
    });

    // Create a notification for the site owner
    const submitterName =
      (fields as Record<string, string>).name
      || (fields as Record<string, string>).full_name
      || (fields as Record<string, string>).fullName
      || "Someone";

    await prisma.notification.create({
      data: {
        userId: site.userId,
        type: "NEW_LEAD",
        title: "New form submission",
        body: `${submitterName} submitted the "${form_name}" form on ${site.businessName}.`,
        linkUrl: `/studio/${site.id}/leads`,
        siteId: site.id,
      },
    });

    console.log(
      `[webhooks/wpforms] Created submission ${submission.id} for site ${site.id} (entry ${entry_id ?? "n/a"})`
    );

    return NextResponse.json({ ok: true, submissionId: submission.id }, { status: 200 });
  } catch (error) {
    console.error("[webhooks/wpforms]", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// GET /api/studio/[siteId]/leads/export
// Exports all FormSubmissions for the site as a CSV download.

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStudioAuth } from "@/lib/studio/permissions";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const auth = await getStudioAuth(session.user.email, siteId, "view");
    if (!auth) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all submissions for the site
    const submissions = await prisma.formSubmission.findMany({
      where: { siteId },
      orderBy: { receivedAt: "desc" },
      select: {
        formName: true,
        pageSlug: true,
        fields: true,
        status: true,
        receivedAt: true,
      },
    });

    // Build CSV
    const headers = ["Date", "Name", "Email", "Phone", "Form", "Page", "Message", "Status"];
    const rows: string[] = [headers.map(escapeCsvField).join(",")];

    for (const sub of submissions) {
      const fields = (sub.fields ?? {}) as Record<string, string>;

      // Extract common fields — try several common key variants
      const name = fields.name || fields.full_name || fields.fullName || fields.your_name || "";
      const email = fields.email || fields.email_address || fields.emailAddress || "";
      const phone = fields.phone || fields.phone_number || fields.phoneNumber || fields.tel || "";
      const message =
        fields.message || fields.comments || fields.comment || fields.details || fields.inquiry || "";

      const row = [
        formatDate(sub.receivedAt),
        name,
        email,
        phone,
        sub.formName,
        sub.pageSlug,
        message,
        sub.status,
      ];

      rows.push(row.map((val) => escapeCsvField(String(val))).join(","));
    }

    const csv = rows.join("\n");

    // Get site name for filename
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { businessName: true },
    });

    const safeName = (site?.businessName ?? "leads")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeName}-leads-${dateStr}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[studio/leads/export]", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}

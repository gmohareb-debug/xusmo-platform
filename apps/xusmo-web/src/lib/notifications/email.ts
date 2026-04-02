// =============================================================================
// Email Notifications
// Transactional emails for key events.
// Dev mode: logs to console. Production: placeholder for Resend/SMTP.
// =============================================================================

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Notification Types
// ---------------------------------------------------------------------------

export type NotificationType =
  | "WELCOME"
  | "INTERVIEW_COMPLETE"
  | "BUILD_STARTED"
  | "PREVIEW_READY"
  | "SITE_PUBLISHED"
  | "REVISION_COMPLETE"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "SUBSCRIPTION_CANCELED"
  | "DOMAIN_CONFIGURED";

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

interface EmailTemplate {
  subject: string;
  body: string;
}

const TEMPLATES: Record<NotificationType, EmailTemplate> = {
  WELCOME: {
    subject: "Welcome to Xusmo, {userName}!",
    body: `Hi {userName},

Welcome to Xusmo! You're one step away from having a professional website for your business.

Start your interview now and our AI will build your custom website in minutes.

— The Xusmo Team`,
  },
  INTERVIEW_COMPLETE: {
    subject: "Your blueprint is ready, {userName}!",
    body: `Hi {userName},

Great news! We've analyzed your answers and created a blueprint for {businessName}.

Your site will include custom content, SEO optimization, and professional design tailored to your industry.

We'll start building right away and notify you when your preview is ready.

— The Xusmo Team`,
  },
  BUILD_STARTED: {
    subject: "Building {businessName}'s website...",
    body: `Hi {userName},

Our AI agents are now building your website for {businessName}.

Here's what's happening:
1. Content Agent — Writing your pages
2. Builder Agent — Creating your WordPress site
3. SEO Agent — Optimizing for search engines
4. Asset Agent — Adding visual elements
5. QA Agent — Running quality checks

We'll email you when your preview is ready for review.

— The Xusmo Team`,
  },
  PREVIEW_READY: {
    subject: "Your website preview is ready!",
    body: `Hi {userName},

Your website for {businessName} is ready for preview!

Visit your dashboard to review the site, request changes, or approve it to go live.

Preview URL: {siteUrl}

— The Xusmo Team`,
  },
  SITE_PUBLISHED: {
    subject: "{businessName} is live!",
    body: `Hi {userName},

Congratulations! {businessName} is now live at:

{siteUrl}

Your site includes:
- Professional, AI-written content
- SEO optimization with Yoast
- Mobile-responsive design
- Contact forms

You can manage your site, request revisions, and update content from your dashboard.

— The Xusmo Team`,
  },
  REVISION_COMPLETE: {
    subject: "Your changes have been applied",
    body: `Hi {userName},

The revision you requested for {businessName} has been completed.

Changes made:
{changesMade}

Visit your dashboard to review the updates.

— The Xusmo Team`,
  },
  PAYMENT_SUCCESS: {
    subject: "Payment confirmed — {planName} plan",
    body: `Hi {userName},

Your payment for the {planName} plan has been confirmed. Thank you!

Plan: {planName}
Amount: {amount}
Next billing date: {nextBillingDate}

Manage your subscription from your dashboard.

— The Xusmo Team`,
  },
  PAYMENT_FAILED: {
    subject: "Payment issue — action required",
    body: `Hi {userName},

We were unable to process your payment for the {planName} plan.

Please update your payment method to avoid service interruption.

Manage billing: Visit your dashboard → Billing

— The Xusmo Team`,
  },
  SUBSCRIPTION_CANCELED: {
    subject: "Your subscription has been canceled",
    body: `Hi {userName},

Your {planName} subscription has been canceled. Your site for {businessName} will remain active until the end of your billing period.

After that, your site will be placed in maintenance mode.

If you change your mind, you can resubscribe from your dashboard at any time.

— The Xusmo Team`,
  },
  DOMAIN_CONFIGURED: {
    subject: "Your domain is active — {domainName}",
    body: `Hi {userName},

Your domain {domainName} has been configured and is now active for {businessName}.

Your site is now available at: https://{domainName}

SSL certificate is active and all traffic is encrypted.

— The Xusmo Team`,
  },
};

// ---------------------------------------------------------------------------
// Render template
// ---------------------------------------------------------------------------

function renderTemplate(
  template: EmailTemplate,
  data: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{${key}}`;
    subject = subject.replaceAll(placeholder, value);
    body = body.replaceAll(placeholder, value);
  }

  return { subject, body };
}

// ---------------------------------------------------------------------------
// Send Notification
// ---------------------------------------------------------------------------

export async function sendNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, string>
) {
  // Load user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });

  if (!user?.email) {
    console.warn(`[notify] No email for user ${userId}, skipping ${type}`);
    return;
  }

  // Merge user data
  const mergedData = {
    userName: user.name ?? "there",
    userEmail: user.email,
    ...data,
  };

  const template = TEMPLATES[type];
  const { subject, body } = renderTemplate(template, mergedData);

  // Dev mode: log to console
  if (process.env.NODE_ENV !== "production" || !process.env.EMAIL_API_KEY) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[EMAIL] To: ${user.email}`);
    console.log(`[EMAIL] Subject: ${subject}`);
    console.log(`${"=".repeat(60)}`);
    console.log(body);
    console.log(`${"=".repeat(60)}\n`);
  } else {
    // Production: send via email service (Resend, SMTP, etc.)
    // TODO: Integrate with Resend free tier
    // await resend.emails.send({ from: "Xusmo <noreply@xusmo.io>", to: user.email, subject, text: body });
    console.log(`[notify] Would send ${type} email to ${user.email}`);
  }

  // Log notification for audit trail (using AgentLog with special agentName)
  // Find a build for this user if available
  const latestBuild = await prisma.build.findFirst({
    where: {
      blueprint: { lead: { userId } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (latestBuild) {
    await prisma.agentLog.create({
      data: {
        buildId: latestBuild.id,
        agentName: "notification",
        status: "COMPLETED",
        input: { type, to: user.email, subject } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        output: { body: body.slice(0, 500) } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        completedAt: new Date(),
      },
    });
  }

  return { sent: true, to: user.email, subject, type };
}

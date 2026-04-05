// =============================================================================
// Email Templates
// HTML + plain-text transactional emails for Xusmo.
// All templates use inline styles for email-client compatibility.
// =============================================================================

// ---------------------------------------------------------------------------
// Design Tokens
// ---------------------------------------------------------------------------

const BRAND = "Xusmo";
const PRIMARY = "#4F46E5";
const BG = "#F8FAFC";
const CARD_BG = "#ffffff";
const BORDER = "#E2E8F0";
const TEXT_DARK = "#1E293B";
const TEXT_MUTED = "#64748B";
const TEXT_LIGHT = "#94A3B8";
const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Shared wrapper
// ---------------------------------------------------------------------------

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <!-- Logo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:24px;font-weight:700;color:${PRIMARY};font-family:${FONT_STACK};letter-spacing:-0.5px;">${BRAND}</span>
            </td>
          </tr>
        </table>
        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${CARD_BG};border:1px solid ${BORDER};border-radius:8px;">
          <tr>
            <td style="padding:40px 36px;">
              ${content}
            </td>
          </tr>
        </table>
        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td align="center" style="padding:24px 0 0;">
              <p style="margin:0 0 8px;font-size:13px;color:${TEXT_LIGHT};font-family:${FONT_STACK};line-height:1.6;">
                You received this email because you have a ${BRAND} account.
              </p>
              <p style="margin:0 0 8px;font-size:13px;color:${TEXT_LIGHT};font-family:${FONT_STACK};line-height:1.6;">
                <a href="{{unsubscribeUrl}}" style="color:${TEXT_LIGHT};text-decoration:underline;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="{{preferencesUrl}}" style="color:${TEXT_LIGHT};text-decoration:underline;">Email preferences</a>
              </p>
              <p style="margin:0;font-size:12px;color:${TEXT_LIGHT};font-family:${FONT_STACK};line-height:1.6;">
                ${BRAND} &middot; 123 Innovation Drive, Suite 400 &middot; San Francisco, CA 94105
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Shared HTML helpers
// ---------------------------------------------------------------------------

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${TEXT_DARK};font-family:${FONT_STACK};line-height:1.3;">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};line-height:1.6;">${text}</p>`;
}

function button(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td align="center" style="background-color:${PRIMARY};border-radius:6px;">
      <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;font-family:${FONT_STACK};text-decoration:none;border-radius:6px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function divider(): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="border-top:1px solid ${BORDER};"></td>
  </tr>
</table>`;
}

function statCell(label: string, value: string): string {
  return `<td align="center" style="padding:12px 8px;">
  <div style="font-size:22px;font-weight:700;color:${PRIMARY};font-family:${FONT_STACK};line-height:1.2;">${value}</div>
  <div style="font-size:12px;color:${TEXT_LIGHT};font-family:${FONT_STACK};text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;">${label}</div>
</td>`;
}

function signature(): string {
  return `<p style="margin:24px 0 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};line-height:1.6;">Cheers,<br />The ${BRAND} Team</p>`;
}

// ---------------------------------------------------------------------------
// 1. Welcome Email
// ---------------------------------------------------------------------------

export function welcomeEmail(businessName: string): EmailPayload {
  const subject = `Welcome to ${BRAND}, ${businessName}!`;

  const html = emailWrapper(`
${heading(`Welcome to ${BRAND}!`)}
${paragraph(`We're excited to have <strong>${businessName}</strong> on board. You're just a few steps away from a professional, AI-powered website.`)}
${divider()}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:36px;vertical-align:top;">
            <div style="width:28px;height:28px;border-radius:50%;background-color:${PRIMARY};color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:28px;font-family:${FONT_STACK};">1</div>
          </td>
          <td style="padding-left:12px;vertical-align:top;">
            <div style="font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};">Complete the Interview</div>
            <div style="font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};margin-top:2px;">Answer a few questions about your business so our AI knows exactly what to build.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:36px;vertical-align:top;">
            <div style="width:28px;height:28px;border-radius:50%;background-color:${PRIMARY};color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:28px;font-family:${FONT_STACK};">2</div>
          </td>
          <td style="padding-left:12px;vertical-align:top;">
            <div style="font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};">Review Your Site</div>
            <div style="font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};margin-top:2px;">Preview your AI-built website and request any changes before going live.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:12px 0;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:36px;vertical-align:top;">
            <div style="width:28px;height:28px;border-radius:50%;background-color:${PRIMARY};color:#ffffff;font-size:14px;font-weight:700;text-align:center;line-height:28px;font-family:${FONT_STACK};">3</div>
          </td>
          <td style="padding-left:12px;vertical-align:top;">
            <div style="font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};">Go Live</div>
            <div style="font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};margin-top:2px;">Connect your domain and launch your professional website to the world.</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
${button("Get Started", "{{dashboardUrl}}")}
${signature()}
  `);

  const text = `Welcome to ${BRAND}, ${businessName}!

We're excited to have ${businessName} on board. You're just a few steps away from a professional, AI-powered website.

Here's how to get started:

1. Complete the Interview
   Answer a few questions about your business so our AI knows exactly what to build.

2. Review Your Site
   Preview your AI-built website and request any changes before going live.

3. Go Live
   Connect your domain and launch your professional website to the world.

Get started: {{dashboardUrl}}

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 2. Site Ready Email
// ---------------------------------------------------------------------------

export function siteReadyEmail(
  businessName: string,
  siteUrl: string
): EmailPayload {
  const subject = `Your website for ${businessName} is ready for review`;

  const html = emailWrapper(`
${heading("Your Site Is Ready!")}
${paragraph(`Great news — we've finished building the website for <strong>${businessName}</strong>. It's packed with professional content, SEO optimization, and a design tailored to your industry.`)}
${paragraph("Take a look and let us know if you'd like any changes. When you're happy, approve it and we'll take it live.")}
${button("Review Your Site", siteUrl)}
${divider()}
${paragraph(`<strong>Preview link:</strong> <a href="${siteUrl}" style="color:${PRIMARY};text-decoration:underline;">${siteUrl}</a>`)}
${signature()}
  `);

  const text = `Your website for ${businessName} is ready for review!

Great news — we've finished building the website for ${businessName}. It's packed with professional content, SEO optimization, and a design tailored to your industry.

Take a look and let us know if you'd like any changes. When you're happy, approve it and we'll take it live.

Review your site: ${siteUrl}

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 3. Site Live Email
// ---------------------------------------------------------------------------

export function siteLiveEmail(
  businessName: string,
  domain: string
): EmailPayload {
  const fullUrl = `https://${domain}`;
  const subject = `${businessName} is now live!`;

  const html = emailWrapper(`
${heading("You're Live! 🎉")}
${paragraph(`Congratulations — <strong>${businessName}</strong> is now live on your custom domain.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${BG};border:1px solid ${BORDER};border-radius:6px;">
  <tr>
    <td style="padding:20px;text-align:center;">
      <a href="${fullUrl}" style="font-size:17px;font-weight:600;color:${PRIMARY};font-family:${FONT_STACK};text-decoration:none;">${domain}</a>
    </td>
  </tr>
</table>
${paragraph("Here's what's included with your site:")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="padding:4px 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;SSL certificate active &mdash; all traffic encrypted</td>
  </tr>
  <tr>
    <td style="padding:4px 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;SEO-optimized content &amp; metadata</td>
  </tr>
  <tr>
    <td style="padding:4px 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Mobile-responsive design</td>
  </tr>
  <tr>
    <td style="padding:4px 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Contact forms ready to capture leads</td>
  </tr>
  <tr>
    <td style="padding:4px 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Uptime monitoring enabled</td>
  </tr>
</table>
${button("Visit Your Dashboard", "{{dashboardUrl}}")}
${signature()}
  `);

  const text = `${businessName} is now live!

Congratulations — ${businessName} is now live on your custom domain:

${fullUrl}

Here's what's included with your site:
- SSL certificate active — all traffic encrypted
- SEO-optimized content & metadata
- Mobile-responsive design
- Contact forms ready to capture leads
- Uptime monitoring enabled

Visit your dashboard: {{dashboardUrl}}

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 4. Revision Complete Email
// ---------------------------------------------------------------------------

export function revisionCompleteEmail(
  businessName: string,
  changesSummary: string
): EmailPayload {
  const subject = `Revisions complete for ${businessName}`;

  // Convert newline-separated changes to HTML list items
  const changesHtml = changesSummary
    .split("\n")
    .filter((line) => line.trim())
    .map(
      (line) =>
        `<li style="padding:4px 0;font-size:15px;color:${TEXT_MUTED};font-family:${FONT_STACK};">${line.trim()}</li>`
    )
    .join("");

  const html = emailWrapper(`
${heading("Your Revisions Are Done")}
${paragraph(`The changes you requested for <strong>${businessName}</strong> have been applied. Here's a summary of what we updated:`)}
<ul style="margin:0 0 16px;padding-left:20px;">
  ${changesHtml}
</ul>
${paragraph("Take a moment to review everything and let us know if you need anything else.")}
${button("Review Changes", "{{dashboardUrl}}")}
${signature()}
  `);

  const text = `Revisions complete for ${businessName}

The changes you requested for ${businessName} have been applied. Here's a summary:

${changesSummary}

Review your site from your dashboard: {{dashboardUrl}}

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 5. Monthly Report Email
// ---------------------------------------------------------------------------

export function monthlyReportEmail(
  businessName: string,
  stats: { visits: number; forms: number; uptime: number; seoScore: number }
): EmailPayload {
  const subject = `Monthly report for ${businessName}`;

  const formattedVisits =
    stats.visits >= 1000
      ? `${(stats.visits / 1000).toFixed(1)}k`
      : String(stats.visits);

  const html = emailWrapper(`
${heading("Your Monthly Report")}
${paragraph(`Here's how <strong>${businessName}</strong> performed this month.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${BG};border:1px solid ${BORDER};border-radius:6px;">
  <tr>
    ${statCell("Visits", formattedVisits)}
    ${statCell("Form Leads", String(stats.forms))}
    ${statCell("Uptime", `${stats.uptime}%`)}
    ${statCell("SEO Score", `${stats.seoScore}/100`)}
  </tr>
</table>
${divider()}
${paragraph("We continuously optimize your site behind the scenes — updating SEO, monitoring uptime, and ensuring peak performance.")}
${paragraph("Want to see the full breakdown? Head to your dashboard for detailed analytics.")}
${button("View Full Report", "{{dashboardUrl}}/analytics")}
${signature()}
  `);

  const text = `Monthly report for ${businessName}

Here's how ${businessName} performed this month:

  Visits:     ${formattedVisits}
  Form Leads: ${stats.forms}
  Uptime:     ${stats.uptime}%
  SEO Score:  ${stats.seoScore}/100

We continuously optimize your site behind the scenes — updating SEO, monitoring uptime, and ensuring peak performance.

View full report: {{dashboardUrl}}/analytics

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 6. Blog Post Ready Email
// ---------------------------------------------------------------------------

export function blogPostReadyEmail(
  businessName: string,
  postTitle: string,
  postUrl: string
): EmailPayload {
  const subject = `New blog post draft: "${postTitle}"`;

  const html = emailWrapper(`
${heading("New Blog Post Ready")}
${paragraph(`Our AI content engine has drafted a new blog post for <strong>${businessName}</strong>:`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${BG};border:1px solid ${BORDER};border-radius:6px;">
  <tr>
    <td style="padding:20px;">
      <div style="font-size:11px;font-weight:600;color:${TEXT_LIGHT};font-family:${FONT_STACK};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Draft Post</div>
      <div style="font-size:17px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};line-height:1.4;">${postTitle}</div>
    </td>
  </tr>
</table>
${paragraph("This post was auto-generated based on your industry, keywords, and content strategy. Review it, make any edits, and publish when you're ready.")}
${button("Review Post", postUrl)}
${paragraph(`<span style="font-size:13px;color:${TEXT_LIGHT};">If you don't take action, the draft will stay unpublished. You're always in control.</span>`)}
${signature()}
  `);

  const text = `New blog post draft: "${postTitle}"

Our AI content engine has drafted a new blog post for ${businessName}:

"${postTitle}"

This post was auto-generated based on your industry, keywords, and content strategy. Review it, make any edits, and publish when you're ready.

Review post: ${postUrl}

If you don't take action, the draft will stay unpublished. You're always in control.

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 7. Payment Receipt Email
// ---------------------------------------------------------------------------

export function paymentReceiptEmail(
  businessName: string,
  amount: string,
  date: string,
  planName: string
): EmailPayload {
  const subject = `Payment receipt — ${planName} plan`;

  const html = emailWrapper(`
${heading("Payment Received")}
${paragraph(`Thank you! Here's your receipt for <strong>${businessName}</strong>.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${BG};border:1px solid ${BORDER};border-radius:6px;">
  <tr>
    <td style="padding:20px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${TEXT_LIGHT};font-family:${FONT_STACK};width:120px;">Plan</td>
          <td style="padding:8px 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};">${planName}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${TEXT_LIGHT};font-family:${FONT_STACK};border-top:1px solid ${BORDER};">Amount</td>
          <td style="padding:8px 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};border-top:1px solid ${BORDER};">${amount}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${TEXT_LIGHT};font-family:${FONT_STACK};border-top:1px solid ${BORDER};">Date</td>
          <td style="padding:8px 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};border-top:1px solid ${BORDER};">${date}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-size:14px;color:${TEXT_LIGHT};font-family:${FONT_STACK};border-top:1px solid ${BORDER};">Business</td>
          <td style="padding:8px 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:${FONT_STACK};border-top:1px solid ${BORDER};">${businessName}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
${paragraph("Need a formal invoice? You can download one any time from your billing dashboard.")}
${button("View Billing", "{{dashboardUrl}}/billing")}
${signature()}
  `);

  const text = `Payment receipt — ${planName} plan

Thank you! Here's your receipt for ${businessName}:

  Plan:     ${planName}
  Amount:   ${amount}
  Date:     ${date}
  Business: ${businessName}

Need a formal invoice? You can download one from your billing dashboard.

View billing: {{dashboardUrl}}/billing

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 8. Payment Failed Email
// ---------------------------------------------------------------------------

export function paymentFailedEmail(
  businessName: string,
  amount: string,
  retryDate: string
): EmailPayload {
  const subject = "Action required: payment failed";

  const html = emailWrapper(`
${heading("Payment Failed")}
${paragraph(`We were unable to process the payment of <strong>${amount}</strong> for <strong>${businessName}</strong>.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:#FEF2F2;border:1px solid #FECACA;border-radius:6px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="font-size:14px;color:#991B1B;font-family:${FONT_STACK};line-height:1.5;">
        <strong>What happens next:</strong> We'll automatically retry on <strong>${retryDate}</strong>. If the payment fails again, your site may be paused.
      </div>
    </td>
  </tr>
</table>
${paragraph("To avoid any interruption, please update your payment method before the retry date.")}
${button("Update Payment Method", "{{dashboardUrl}}/billing")}
${paragraph(`<span style="font-size:13px;color:${TEXT_LIGHT};">If you believe this is an error, please contact your bank or reach out to our support team.</span>`)}
${signature()}
  `);

  const text = `Action required: payment failed

We were unable to process the payment of ${amount} for ${businessName}.

What happens next: We'll automatically retry on ${retryDate}. If the payment fails again, your site may be paused.

To avoid any interruption, please update your payment method before the retry date.

Update payment method: {{dashboardUrl}}/billing

If you believe this is an error, please contact your bank or reach out to our support team.

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 9. Trial Ending Email
// ---------------------------------------------------------------------------

export function trialEndingEmail(
  businessName: string,
  daysLeft: number
): EmailPayload {
  const urgency = daysLeft <= 1 ? "today" : `in ${daysLeft} days`;
  const subject = `Your trial ends ${urgency}`;

  const html = emailWrapper(`
${heading(`Your Trial Ends ${daysLeft <= 1 ? "Today" : `in ${daysLeft} Days`}`)}
${paragraph(`Your free trial for <strong>${businessName}</strong> is wrapping up. Upgrade now to keep your site live and unlock all features.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${BG};border:1px solid ${BORDER};border-radius:6px;">
  <tr>
    <td style="padding:20px;">
      <div style="font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};line-height:1.6;">
        <strong style="color:${TEXT_DARK};">What you'll keep when you upgrade:</strong>
      </div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;">
        <tr><td style="padding:3px 0;font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Your custom website &amp; all content</td></tr>
        <tr><td style="padding:3px 0;font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;SEO optimizations &amp; rankings</td></tr>
        <tr><td style="padding:3px 0;font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Custom domain connection</td></tr>
        <tr><td style="padding:3px 0;font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Monthly blog posts &amp; content updates</td></tr>
        <tr><td style="padding:3px 0;font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};">&#10003;&ensp;Uptime monitoring &amp; performance reports</td></tr>
      </table>
    </td>
  </tr>
</table>
${button("Upgrade Now", "{{dashboardUrl}}/billing")}
${paragraph(`<span style="font-size:13px;color:${TEXT_LIGHT};">If you don't upgrade, your site will be paused after the trial ends. Your data will be saved for 30 days.</span>`)}
${signature()}
  `);

  const text = `Your trial ends ${urgency}

Your free trial for ${businessName} is wrapping up. Upgrade now to keep your site live and unlock all features.

What you'll keep when you upgrade:
- Your custom website & all content
- SEO optimizations & rankings
- Custom domain connection
- Monthly blog posts & content updates
- Uptime monitoring & performance reports

Upgrade now: {{dashboardUrl}}/billing

If you don't upgrade, your site will be paused after the trial ends. Your data will be saved for 30 days.

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// 10. Ghost Mode (Re-engagement) Email
// ---------------------------------------------------------------------------

export function ghostModeEmail(
  businessName: string,
  daysSinceLogin: number
): EmailPayload {
  const subject = `We miss you, ${businessName}!`;

  const weeksAway = Math.floor(daysSinceLogin / 7);
  const timeAway =
    weeksAway >= 4
      ? `over ${Math.floor(daysSinceLogin / 30)} month${Math.floor(daysSinceLogin / 30) > 1 ? "s" : ""}`
      : `${weeksAway} week${weeksAway !== 1 ? "s" : ""}`;

  const html = emailWrapper(`
${heading(`It's Been a While!`)}
${paragraph(`We noticed you haven't logged in to manage <strong>${businessName}</strong> in ${timeAway}. Your site is still running, but there are a few things that could use your attention.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;background-color:${BG};border:1px solid ${BORDER};border-radius:6px;">
  <tr>
    <td style="padding:20px;">
      <div style="font-size:14px;color:${TEXT_MUTED};font-family:${FONT_STACK};line-height:1.7;">
        <strong style="color:${TEXT_DARK};">While you were away:</strong><br />
        &#8226;&ensp;New blog post drafts are waiting for your review<br />
        &#8226;&ensp;Your monthly performance reports are available<br />
        &#8226;&ensp;We've made behind-the-scenes SEO improvements
      </div>
    </td>
  </tr>
</table>
${paragraph("A few minutes in your dashboard can help keep your online presence strong and your leads flowing.")}
${button("Visit Your Dashboard", "{{dashboardUrl}}")}
${paragraph(`<span style="font-size:13px;color:${TEXT_LIGHT};">Your site is running on autopilot, but a quick check-in helps us tailor everything to your needs.</span>`)}
${signature()}
  `);

  const text = `We miss you, ${businessName}!

We noticed you haven't logged in to manage ${businessName} in ${timeAway}. Your site is still running, but there are a few things that could use your attention.

While you were away:
- New blog post drafts are waiting for your review
- Your monthly performance reports are available
- We've made behind-the-scenes SEO improvements

A few minutes in your dashboard can help keep your online presence strong and your leads flowing.

Visit your dashboard: {{dashboardUrl}}

Your site is running on autopilot, but a quick check-in helps us tailor everything to your needs.

Cheers,
The ${BRAND} Team

---
You received this email because you have a ${BRAND} account.
Unsubscribe: {{unsubscribeUrl}}
${BRAND} · 123 Innovation Drive, Suite 400 · San Francisco, CA 94105`;

  return { subject, html, text };
}

// =============================================================================
// Terms of Service Page — Legal terms governing Xusmo usage
// =============================================================================

import type { Metadata } from "next";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Terms of Service | Xusmo",
  description:
    "Read the Terms of Service governing your use of Xusmo, including our free AI website builder and managed WordPress hosting subscriptions.",
};

// ---------------------------------------------------------------------------
// Section component for consistent styling
// ---------------------------------------------------------------------------

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 font-display text-xl font-bold text-primary-950 sm:text-2xl">
        {number}. {title}
      </h2>
      <div className="space-y-4 text-neutral-700 leading-relaxed">{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TermsOfServicePage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <div className="bg-surface-white border-b border-surface-border">
        <Container width="narrow" className="py-16 sm:py-20 text-center">
          <AnimatedSection direction="fade">
            <p className="mb-3 text-sm font-semibold tracking-widest uppercase text-primary-500">
              Legal
            </p>
            <h1 className="font-display text-4xl font-bold text-primary-950 sm:text-5xl tracking-tight">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-neutral-500">
              Last updated: February 2026
            </p>
          </AnimatedSection>
        </Container>
      </div>

      {/* Content */}
      <div className="bg-surface-cream">
        <Container width="narrow" className="py-16 sm:py-20">
          <AnimatedSection direction="up">
            <div className="space-y-12">
              {/* --------------------------------------------------------- */}
              {/* 1. Introduction & Acceptance */}
              {/* --------------------------------------------------------- */}
              <Section id="introduction" number="1" title="Introduction and Acceptance of Terms">
                <p>
                  Welcome to Xusmo. These Terms of Service (&quot;Terms&quot;) constitute a
                  legally binding agreement between you (&quot;you,&quot; &quot;your,&quot; or
                  &quot;User&quot;) and Xusmo (&quot;we,&quot; &quot;our,&quot; or
                  &quot;us&quot;) governing your access to and use of the Xusmo website at
                  xusmo.ai, the AI-powered website builder, managed WordPress hosting, and
                  all related services (collectively, the &quot;Services&quot;).
                </p>
                <p>
                  By creating an account, using our Services, or clicking &quot;I Agree,&quot;
                  you acknowledge that you have read, understood, and agree to be bound by these
                  Terms and our Privacy Policy, which is incorporated herein by reference. If
                  you do not agree to these Terms, you must not access or use our Services.
                </p>
                <p>
                  You represent that you are at least 18 years of age and have the legal
                  capacity to enter into this agreement. If you are using the Services on behalf
                  of a business entity, you represent that you have the authority to bind that
                  entity to these Terms.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 2. Account Creation */}
              {/* --------------------------------------------------------- */}
              <Section id="account" number="2" title="Account Creation and Security">
                <p>
                  To access certain features of the Services, you must create an account. When
                  you create an account, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Provide accurate, current, and complete information during the registration
                    process and keep your account information up to date.
                  </li>
                  <li>
                    Maintain the security and confidentiality of your login credentials,
                    including your password.
                  </li>
                  <li>
                    Immediately notify us of any unauthorized access to or use of your account.
                  </li>
                  <li>
                    Accept responsibility for all activities that occur under your account,
                    whether or not authorized by you.
                  </li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate your account if any information
                  provided during registration or thereafter proves to be inaccurate, not
                  current, or incomplete, or if we have reasonable grounds to suspect that your
                  account has been compromised.
                </p>
                <p>
                  You may create an account using email and password or through supported
                  third-party authentication providers (such as Google). Use of third-party
                  authentication is also subject to the applicable provider&apos;s terms of
                  service.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 3. Free Website Build */}
              {/* --------------------------------------------------------- */}
              <Section id="free-build" number="3" title="Free Website Build">
                <p>
                  Xusmo provides a <strong>FREE website build</strong> using our AI-powered
                  interview and generation system. The free website build includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    A guided AI interview to gather information about your business, industry,
                    services, and branding preferences.
                  </li>
                  <li>
                    Automated generation of a complete website blueprint including page layouts,
                    written content, color schemes, and design elements tailored to your
                    business.
                  </li>
                  <li>
                    A preview of your generated website that you can review and approve before
                    committing to a hosting subscription.
                  </li>
                </ul>
                <p>
                  The free website build does not include hosting, a custom domain, or a
                  publicly accessible website. To make your AI-generated website live on the
                  internet, you must subscribe to one of our hosting plans as described in
                  Section 4.
                </p>
                <p>
                  We reserve the right to limit the number of free website builds per account
                  or IP address to prevent abuse. Website blueprints generated through the free
                  build are stored for 90 days, after which they may be deleted if no hosting
                  subscription is activated.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 4. Hosting Subscription & Pricing */}
              {/* --------------------------------------------------------- */}
              <Section id="hosting" number="4" title="Hosting Subscription and Pricing">
                <p>
                  Xusmo offers managed WordPress hosting to make your AI-generated website
                  live on the internet. Our service model is:
                </p>
                <div className="mt-4 mb-6 rounded-xl border border-primary-200 bg-primary-50/50 p-6">
                  <p className="text-center text-lg font-display font-bold text-primary-900">
                    FREE website build + $11.99/mo hosting
                  </p>
                  <p className="mt-2 text-center text-sm text-primary-700">
                    Basic plan starting price. Additional plans available at higher tiers.
                  </p>
                </div>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  4.1 Subscription Plans
                </h3>
                <p>
                  We offer multiple subscription tiers (Basic, Pro, and Agency) with varying
                  features, page limits, and support levels. Current pricing and feature details
                  are available on our Pricing page. The Basic plan begins at $11.99 per month
                  when billed monthly. Annual billing is available at a discounted rate and
                  includes a free custom domain for the first year.
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  4.2 Billing and Payment
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Subscriptions are billed in advance on a monthly or annual recurring basis
                    depending on the billing cycle you select at checkout.
                  </li>
                  <li>
                    All prices are listed in United States Dollars (USD) and are exclusive of
                    applicable taxes, which will be added at checkout where required by law.
                  </li>
                  <li>
                    Payment is processed securely through Stripe. By subscribing, you authorize
                    us to charge your payment method on a recurring basis for the applicable
                    subscription fees until you cancel.
                  </li>
                  <li>
                    If a payment fails, we will attempt to charge your payment method up to
                    three additional times over a 14-day period. If all attempts fail, your
                    subscription may be suspended.
                  </li>
                </ul>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  4.3 Price Changes
                </h3>
                <p>
                  We reserve the right to modify our pricing at any time. Price changes for
                  existing subscribers will take effect at the start of the next billing cycle
                  following at least 30 days&apos; written notice. If you do not agree to a
                  price change, you may cancel your subscription before the new pricing takes
                  effect.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 5. Cancellation & Refunds */}
              {/* --------------------------------------------------------- */}
              <Section id="cancellation" number="5" title="Cancellation and Refunds">
                <h3 className="mb-2 font-display font-semibold text-primary-900">
                  5.1 Cancellation by You
                </h3>
                <p>
                  You may cancel your hosting subscription at any time through your account
                  portal or by contacting our support team. Upon cancellation:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Your subscription will remain active until the end of your current billing
                    period. You will not be charged for subsequent billing periods.
                  </li>
                  <li>
                    Your website will remain live and accessible until the end of the paid
                    billing period.
                  </li>
                  <li>
                    After the billing period ends, your website will be taken offline and moved
                    to a suspended state. You will have 30 days to reactivate your subscription
                    or export your data before it is permanently deleted.
                  </li>
                </ul>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  5.2 Cancellation by Us
                </h3>
                <p>
                  We reserve the right to suspend or terminate your subscription and access to
                  the Services at any time if you violate these Terms, engage in Prohibited
                  Conduct (Section 9), fail to pay subscription fees, or for any other reason
                  at our sole discretion with reasonable notice. In the event of termination by
                  us without cause, we will provide a pro-rata refund for any prepaid,
                  unused subscription period.
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  5.3 Refund Policy
                </h3>
                <p>
                  Monthly subscriptions are generally non-refundable. Annual subscriptions are
                  eligible for a pro-rata refund if cancelled within the first 30 days of the
                  subscription term. After 30 days, annual subscriptions are non-refundable but
                  will remain active until the end of the annual term. Refund requests should
                  be submitted to billing@xusmo.ai.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 6. Data Ownership */}
              {/* --------------------------------------------------------- */}
              <Section id="ownership" number="6" title="Data Ownership">
                <p>
                  We believe you should own your data. The following ownership principles apply:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Your Content:</strong> You retain full ownership of all content you
                    provide to us, including but not limited to business information, text,
                    images, logos, and other media uploaded during the interview process or added
                    to your website after generation.
                  </li>
                  <li>
                    <strong>AI-Generated Content:</strong> All website content generated by our
                    AI system specifically for your website (including written copy, layout
                    configurations, and design choices) is assigned to you upon generation. You
                    own this content and may use, modify, distribute, or delete it as you see
                    fit.
                  </li>
                  <li>
                    <strong>Website Data:</strong> All data stored within your WordPress
                    installation, including posts, pages, media, database records, and
                    configuration files, belongs to you.
                  </li>
                  <li>
                    <strong>License to Xusmo:</strong> By using our Services, you grant us a
                    limited, non-exclusive, royalty-free license to host, store, transmit,
                    display, and process your content solely for the purpose of providing the
                    Services to you. This license terminates when you delete your content or
                    close your account.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 7. Export Rights */}
              {/* --------------------------------------------------------- */}
              <Section id="export" number="7" title="Export Rights and Data Portability">
                <p>
                  We are committed to ensuring you are never locked into our platform. You have
                  the following export rights:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Full WordPress Export:</strong> At any time during your active
                    subscription, you may export your complete WordPress website using the
                    standard WordPress export tools available in your admin dashboard. This
                    includes all pages, posts, media files, comments, and metadata.
                  </li>
                  <li>
                    <strong>Database Backup:</strong> You may request a complete copy of your
                    WordPress database at any time through your account portal or by contacting
                    support.
                  </li>
                  <li>
                    <strong>File Download:</strong> You may download all files associated with
                    your website, including themes, plugins, media uploads, and configuration
                    files.
                  </li>
                  <li>
                    <strong>Post-Cancellation Export:</strong> After cancellation, you have a
                    30-day grace period during which you can still access your admin dashboard
                    and export your data. After this grace period, your data will be permanently
                    deleted.
                  </li>
                  <li>
                    <strong>Migration Assistance:</strong> While we do not provide direct
                    migration services, your exported WordPress data is compatible with any
                    standard WordPress hosting provider, enabling you to move your website to
                    another host at any time.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 8. Acceptable Use */}
              {/* --------------------------------------------------------- */}
              <Section id="acceptable-use" number="8" title="Acceptable Use Policy">
                <p>
                  You agree to use the Services only for lawful purposes and in accordance with
                  these Terms. You agree not to use the Services to:
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  8.1 Prohibited Content
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Host, display, or distribute content that is illegal, harmful, threatening,
                    abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.
                  </li>
                  <li>
                    Host content that infringes upon the intellectual property rights,
                    trademarks, trade secrets, or other proprietary rights of any third party.
                  </li>
                  <li>
                    Host content that promotes discrimination, bigotry, racism, hatred, or harm
                    against any individual or group.
                  </li>
                  <li>
                    Host phishing pages, malware, or any content designed to deceive or defraud
                    others.
                  </li>
                  <li>
                    Host content that violates any applicable law, regulation, or governmental
                    order.
                  </li>
                </ul>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  8.2 Prohibited Conduct
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Attempt to gain unauthorized access to the Services, other accounts, or
                    computer systems or networks connected to the Services.
                  </li>
                  <li>
                    Use the Services to send spam, unsolicited commercial communications, or
                    bulk messages.
                  </li>
                  <li>
                    Use the Services for cryptocurrency mining or other resource-intensive
                    activities that impair server performance.
                  </li>
                  <li>
                    Reverse engineer, decompile, disassemble, or otherwise attempt to derive the
                    source code of Xusmo&apos;s proprietary software or AI systems.
                  </li>
                  <li>
                    Use automated tools, bots, or scripts to access the Services in a manner
                    that exceeds reasonable usage or circumvents rate limits.
                  </li>
                  <li>
                    Resell, sublicense, or redistribute the Services without our prior written
                    consent (except under the Agency plan&apos;s white-label provisions).
                  </li>
                  <li>
                    Interfere with or disrupt the integrity or performance of the Services or
                    the servers and networks that host them.
                  </li>
                </ul>
                <p>
                  Violation of this Acceptable Use Policy may result in immediate suspension or
                  termination of your account without notice or refund.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 9. Intellectual Property */}
              {/* --------------------------------------------------------- */}
              <Section id="intellectual-property" number="9" title="Intellectual Property">
                <h3 className="mb-2 font-display font-semibold text-primary-900">
                  9.1 Xusmo&apos;s Intellectual Property
                </h3>
                <p>
                  The Services, including but not limited to the Xusmo platform, AI
                  algorithms, website templates, design systems, interview engine, software
                  code, user interface, documentation, trademarks, logos, and all associated
                  intellectual property, are and shall remain the exclusive property of Xusmo
                  and its licensors. These Terms do not grant you any right, title, or interest
                  in our intellectual property except for the limited right to use the Services
                  as expressly permitted by these Terms.
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  9.2 WordPress and Open Source
                </h3>
                <p>
                  Your hosted website is built on WordPress, which is open-source software
                  licensed under the GNU General Public License (GPL) version 2. Your use of
                  WordPress is subject to the GPL. Third-party plugins and themes installed on
                  your website are subject to their respective licenses.
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  9.3 Feedback
                </h3>
                <p>
                  If you provide us with any feedback, suggestions, or ideas regarding the
                  Services (&quot;Feedback&quot;), you grant us an irrevocable, non-exclusive,
                  royalty-free, worldwide license to use, reproduce, modify, and incorporate
                  such Feedback into the Services without any obligation to you.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 10. Limitation of Liability */}
              {/* --------------------------------------------------------- */}
              <Section id="liability" number="10" title="Limitation of Liability">
                <h3 className="mb-2 font-display font-semibold text-primary-900">
                  10.1 Disclaimer of Warranties
                </h3>
                <p>
                  THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot;
                  WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT
                  LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES
                  WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE, OR THAT ANY DEFECTS
                  WILL BE CORRECTED.
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  10.2 AI-Generated Content Disclaimer
                </h3>
                <p>
                  While we strive for accuracy, AI-generated content may contain errors,
                  inaccuracies, or omissions. You are solely responsible for reviewing,
                  verifying, and editing all AI-generated content before publishing it on your
                  website. Xusmo is not liable for any claims, damages, or losses arising
                  from the use of AI-generated content, including but not limited to
                  inaccuracies, copyright concerns, or misrepresentation of your business.
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  10.3 Limitation of Damages
                </h3>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL XUSMO,
                  ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
                  BUT NOT LIMITED TO LOSS OF PROFITS, DATA, BUSINESS, OR GOODWILL, ARISING OUT
                  OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICES,
                  REGARDLESS OF THE THEORY OF LIABILITY.
                </p>
                <p>
                  OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATING
                  TO THESE TERMS OR THE SERVICES SHALL NOT EXCEED THE GREATER OF (A) THE TOTAL
                  AMOUNT YOU HAVE PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR
                  (B) ONE HUNDRED UNITED STATES DOLLARS ($100.00).
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  10.4 Uptime
                </h3>
                <p>
                  We target 99.9% uptime for hosted websites but do not guarantee uninterrupted
                  service. Scheduled maintenance windows will be communicated in advance when
                  possible. We are not liable for any downtime or data loss resulting from
                  circumstances beyond our reasonable control, including but not limited to
                  natural disasters, cyberattacks, or third-party service failures.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 11. Indemnification */}
              {/* --------------------------------------------------------- */}
              <Section id="indemnification" number="11" title="Indemnification">
                <p>
                  You agree to indemnify, defend, and hold harmless Xusmo, its officers,
                  directors, employees, agents, and affiliates from and against any and all
                  claims, liabilities, damages, losses, costs, and expenses (including
                  reasonable attorneys&apos; fees) arising out of or in connection with:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of the Services or any violation of these Terms.</li>
                  <li>
                    Any content you provide, publish, or make available through the Services.
                  </li>
                  <li>
                    Your violation of any third-party rights, including intellectual property
                    rights.
                  </li>
                  <li>
                    Your violation of any applicable law, rule, or regulation.
                  </li>
                  <li>
                    Any data collected from visitors to your hosted website and your handling of
                    that data.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 12. Changes to Terms */}
              {/* --------------------------------------------------------- */}
              <Section id="changes" number="12" title="Changes to These Terms">
                <p>
                  We reserve the right to modify these Terms at any time. When we make material
                  changes, we will:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Update the &quot;Last updated&quot; date at the top of this page.
                  </li>
                  <li>
                    Provide notice through the Services (e.g., a banner or notification in your
                    account portal) or via email to the address associated with your account.
                  </li>
                  <li>
                    For material changes that adversely affect your rights, provide at least 30
                    days&apos; notice before the changes take effect.
                  </li>
                </ul>
                <p>
                  Your continued use of the Services after the effective date of any changes
                  constitutes your acceptance of the revised Terms. If you do not agree to the
                  revised Terms, you must stop using the Services and cancel your subscription.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 13. Governing Law & Disputes */}
              {/* --------------------------------------------------------- */}
              <Section id="governing-law" number="13" title="Governing Law and Dispute Resolution">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of
                  the State of Delaware, United States, without regard to its conflict of law
                  provisions.
                </p>
                <p>
                  Any dispute arising out of or relating to these Terms or the Services shall
                  first be attempted to be resolved through good-faith negotiation between the
                  parties for a period of 30 days. If the dispute cannot be resolved through
                  negotiation, either party may submit the dispute to binding arbitration
                  administered by the American Arbitration Association under its Commercial
                  Arbitration Rules. The arbitration shall take place in Wilmington, Delaware.
                </p>
                <p>
                  YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON
                  AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE
                  ACTION. You waive any right to participate in a class action lawsuit or
                  class-wide arbitration against Xusmo.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 14. General Provisions */}
              {/* --------------------------------------------------------- */}
              <Section id="general" number="14" title="General Provisions">
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Entire Agreement:</strong> These Terms, together with the Privacy
                    Policy and any other legal notices or agreements published by us on the
                    Services, constitute the entire agreement between you and Xusmo
                    concerning the Services.
                  </li>
                  <li>
                    <strong>Severability:</strong> If any provision of these Terms is held to be
                    invalid, illegal, or unenforceable, the remaining provisions shall continue
                    in full force and effect.
                  </li>
                  <li>
                    <strong>Waiver:</strong> Our failure to enforce any right or provision of
                    these Terms shall not constitute a waiver of that right or provision.
                  </li>
                  <li>
                    <strong>Assignment:</strong> You may not assign or transfer your rights or
                    obligations under these Terms without our prior written consent. We may
                    assign our rights and obligations without restriction.
                  </li>
                  <li>
                    <strong>Force Majeure:</strong> We shall not be liable for any failure or
                    delay in performing our obligations where such failure or delay results from
                    circumstances beyond our reasonable control, including but not limited to
                    natural disasters, war, terrorism, pandemics, government actions, or
                    failures of third-party services.
                  </li>
                  <li>
                    <strong>Notices:</strong> We may provide notices to you by email, through
                    the Services, or by posting on our website. Notices to us should be sent to
                    legal@xusmo.ai.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 15. Contact Information */}
              {/* --------------------------------------------------------- */}
              <Section id="contact" number="15" title="Contact Information">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 rounded-xl border border-surface-border bg-surface-white p-6">
                  <p className="font-semibold text-primary-950">Xusmo</p>
                  <p className="mt-1">Email: legal@xusmo.ai</p>
                  <p>Billing inquiries: billing@xusmo.ai</p>
                  <p>Website: xusmo.ai/contact</p>
                </div>
              </Section>
            </div>
          </AnimatedSection>
        </Container>
      </div>
    </MarketingLayout>
  );
}

// =============================================================================
// Privacy Policy Page — Legal document covering data practices
// =============================================================================

import type { Metadata } from "next";
import MarketingLayout from "@/components/layout/MarketingLayout";
import Container from "@/components/ui/Container";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "Privacy Policy | Xusmo",
  description:
    "Learn how Xusmo collects, uses, and protects your personal information when you use our AI-powered website building and WordPress hosting services.",
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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
              {/* 1. Introduction */}
              {/* --------------------------------------------------------- */}
              <Section id="introduction" number="1" title="Introduction">
                <p>
                  Xusmo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
                  protecting your privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you visit our website at
                  xusmo.ai (the &quot;Site&quot;), use our AI-powered website builder, or
                  subscribe to our WordPress hosting services (collectively, the
                  &quot;Services&quot;).
                </p>
                <p>
                  By accessing or using our Services, you acknowledge that you have read,
                  understood, and agree to be bound by this Privacy Policy. If you do not agree
                  with the terms of this Privacy Policy, please do not access or use our
                  Services.
                </p>
                <p>
                  We reserve the right to make changes to this Privacy Policy at any time and
                  for any reason. We will alert you about any changes by updating the
                  &quot;Last updated&quot; date of this Privacy Policy. You are encouraged to
                  periodically review this Privacy Policy to stay informed of updates.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 2. Information We Collect */}
              {/* --------------------------------------------------------- */}
              <Section id="data-collection" number="2" title="Information We Collect">
                <p>
                  We collect information that you provide directly to us, information collected
                  automatically when you use our Services, and information from third-party
                  sources. The categories of personal information we collect include:
                </p>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  2.1 Information You Provide
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Account Information:</strong> When you create an account, we collect
                    your name, email address, phone number, and password.
                  </li>
                  <li>
                    <strong>Business Information:</strong> During the AI-guided interview
                    process, we collect information about your business including your business
                    name, industry, services offered, location, hours of operation, and any
                    other details you provide to help us build your website.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> When you subscribe to a hosting plan,
                    we collect billing information including your credit or debit card number,
                    billing address, and transaction history. Payment processing is handled by
                    our third-party payment processor, Stripe, and we do not store your full
                    card number on our servers.
                  </li>
                  <li>
                    <strong>Communications:</strong> When you contact us via email, support
                    chat, or other channels, we collect the content of your messages and any
                    attachments you provide.
                  </li>
                  <li>
                    <strong>Content:</strong> Any text, images, logos, or other media you upload
                    or provide for use on your website.
                  </li>
                </ul>

                <h3 className="mt-6 mb-2 font-display font-semibold text-primary-900">
                  2.2 Information Collected Automatically
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Device and Usage Data:</strong> We automatically collect certain
                    information when you access our Services, including your IP address, browser
                    type and version, operating system, referring URL, pages visited, time and
                    date of your visit, and time spent on each page.
                  </li>
                  <li>
                    <strong>Analytics Data:</strong> We use analytics services to collect
                    aggregated usage data to help us improve our Services, including feature
                    usage, click patterns, and navigation flow.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 3. How We Use Artificial Intelligence */}
              {/* --------------------------------------------------------- */}
              <Section id="ai-usage" number="3" title="How We Use Artificial Intelligence">
                <p>
                  Xusmo uses artificial intelligence (AI) and machine learning technologies
                  as a core part of our Services. We believe in transparency about how AI is
                  used to process your information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Website Generation:</strong> We use AI to analyze the business
                    information you provide during the interview process and generate website
                    content, design layouts, color schemes, and page structures tailored to your
                    industry and business needs.
                  </li>
                  <li>
                    <strong>Industry Classification:</strong> Our AI automatically classifies
                    your business into an industry category and archetype to select the most
                    appropriate website templates, features, and content strategies.
                  </li>
                  <li>
                    <strong>Content Creation:</strong> AI generates written content for your
                    website including page copy, service descriptions, calls to action, and meta
                    descriptions based on the information you provide. All AI-generated content
                    is available for your review and editing before publication.
                  </li>
                  <li>
                    <strong>Ongoing Optimization:</strong> For subscribers on eligible plans, AI
                    may be used to suggest content updates, blog posts, and SEO improvements
                    over time.
                  </li>
                  <li>
                    <strong>Data Handling:</strong> The business information you provide during
                    the interview is sent to third-party AI providers (such as OpenAI) for
                    processing. We have data processing agreements in place with these providers
                    that prohibit them from using your data to train their models or for any
                    purpose other than providing the requested service to Xusmo.
                  </li>
                </ul>
                <p>
                  You retain full ownership of all information you provide and all content
                  generated for your website. You may review, edit, or request deletion of
                  AI-generated content at any time.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 4. WordPress Hosting & Data Storage */}
              {/* --------------------------------------------------------- */}
              <Section
                id="hosting"
                number="4"
                title="WordPress Hosting and Data Storage"
              >
                <p>
                  When you subscribe to a Xusmo hosting plan, we provision a managed
                  WordPress installation on your behalf. The following applies to data stored
                  in connection with your hosted website:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Server Location:</strong> Your WordPress site is hosted on
                    cloud infrastructure located in the United States. If you are located
                    outside the United States, please be aware that your data will be
                    transferred to and stored in the United States.
                  </li>
                  <li>
                    <strong>Website Data:</strong> We store all data associated with your
                    WordPress installation, including pages, posts, media files, plugins,
                    themes, and database content.
                  </li>
                  <li>
                    <strong>Visitor Data:</strong> Your hosted website may collect data from
                    your own visitors (e.g., through contact forms, analytics, or e-commerce
                    functionality). You are the data controller for any personal data collected
                    through your website, and you are responsible for ensuring your own
                    compliance with applicable privacy laws.
                  </li>
                  <li>
                    <strong>Backups:</strong> We perform regular automated backups of your
                    website data. Backup frequency depends on your subscription plan. Backups
                    are encrypted and stored securely for disaster recovery purposes.
                  </li>
                  <li>
                    <strong>Security:</strong> We implement industry-standard security measures
                    including SSL/TLS encryption, firewalls, malware scanning, and automatic
                    security updates to protect your hosted website.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 5. Cookies & Tracking Technologies */}
              {/* --------------------------------------------------------- */}
              <Section id="cookies" number="5" title="Cookies and Tracking Technologies">
                <p>
                  We use cookies and similar tracking technologies to collect and track
                  information about your activity on our Services and to hold certain
                  information. The types of cookies we use include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> These cookies are necessary for the
                    Services to function properly. They enable core functionality such as
                    authentication, session management, and security. You cannot opt out of
                    essential cookies as they are required for the Services to operate.
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> We use analytics cookies to understand
                    how visitors interact with our Services, which pages are visited most
                    frequently, and how users navigate through the site. This data helps us
                    improve user experience and site performance.
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> These cookies remember your settings
                    and preferences, such as language selection and display configurations, to
                    provide a more personalized experience.
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> With your consent, we may use marketing
                    cookies to deliver relevant advertisements and measure the effectiveness of
                    our advertising campaigns. You can opt out of marketing cookies at any time
                    through your browser settings or our cookie preferences center.
                  </li>
                </ul>
                <p>
                  Most web browsers are set to accept cookies by default. You can usually
                  choose to set your browser to remove or reject cookies. Please note that
                  removing or rejecting cookies may affect the availability and functionality
                  of our Services.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 6. Third-Party Services */}
              {/* --------------------------------------------------------- */}
              <Section id="third-party" number="6" title="Third-Party Services">
                <p>
                  We use the following categories of third-party services to operate and
                  improve our platform. Each third-party provider is bound by their own privacy
                  policy and our contractual data processing agreements:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Payment Processing:</strong> Stripe processes all payment
                    transactions. Your payment information is transmitted directly to Stripe
                    and is subject to Stripe&apos;s privacy policy.
                  </li>
                  <li>
                    <strong>AI Services:</strong> OpenAI and similar providers process your
                    business information to generate website content. Data is transmitted
                    securely and is not used to train third-party models.
                  </li>
                  <li>
                    <strong>Authentication:</strong> We may use third-party authentication
                    providers (such as Google OAuth) to facilitate account creation and login.
                  </li>
                  <li>
                    <strong>Cloud Infrastructure:</strong> Our Services are hosted on cloud
                    infrastructure providers that maintain their own security certifications and
                    compliance standards.
                  </li>
                  <li>
                    <strong>Analytics:</strong> We use analytics services to understand usage
                    patterns and improve our Services. These services may collect anonymized
                    usage data.
                  </li>
                  <li>
                    <strong>Email Communications:</strong> We use third-party email service
                    providers to send transactional emails (account confirmations, billing
                    receipts) and, with your consent, marketing communications.
                  </li>
                  <li>
                    <strong>Domain Registration:</strong> If you register a domain through
                    Xusmo, we work with accredited domain registrars who may collect
                    information required for domain registration (including WHOIS data).
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 7. Data Retention */}
              {/* --------------------------------------------------------- */}
              <Section id="retention" number="7" title="Data Retention">
                <p>
                  We retain your personal information for as long as necessary to fulfill the
                  purposes for which it was collected, including to satisfy legal, accounting,
                  or reporting requirements. Specific retention periods include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Account Data:</strong> We retain your account information for the
                    duration of your account. If you delete your account, we will delete or
                    anonymize your personal information within 30 days, except where retention
                    is required by law.
                  </li>
                  <li>
                    <strong>Interview Data:</strong> Business information collected during the
                    interview process is retained as long as your account is active or as needed
                    to maintain your website.
                  </li>
                  <li>
                    <strong>Website Data:</strong> Your WordPress website data is retained for
                    the duration of your hosting subscription. Upon cancellation, your website
                    data is retained for 30 days to allow for reactivation or export, after
                    which it is permanently deleted.
                  </li>
                  <li>
                    <strong>Billing Records:</strong> Payment and billing records are retained
                    for 7 years in accordance with accounting and tax requirements.
                  </li>
                  <li>
                    <strong>Support Communications:</strong> Support tickets and communications
                    are retained for 3 years after resolution for quality assurance and dispute
                    resolution purposes.
                  </li>
                  <li>
                    <strong>Analytics Data:</strong> Aggregated, anonymized analytics data may
                    be retained indefinitely to improve our Services.
                  </li>
                </ul>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 8. Your Rights */}
              {/* --------------------------------------------------------- */}
              <Section id="rights" number="8" title="Your Rights">
                <p>
                  Depending on your location, you may have certain rights regarding your
                  personal information under applicable data protection laws, including the
                  General Data Protection Regulation (GDPR), the California Consumer Privacy
                  Act (CCPA), and other applicable legislation. These rights may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Right of Access:</strong> You may request a copy of the personal
                    information we hold about you.
                  </li>
                  <li>
                    <strong>Right to Rectification:</strong> You may request that we correct
                    any inaccurate or incomplete personal information.
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> You may request that we delete your
                    personal information, subject to certain legal exceptions.
                  </li>
                  <li>
                    <strong>Right to Restrict Processing:</strong> You may request that we
                    limit how we use your personal information.
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> You may request a machine-readable
                    copy of your personal information to transfer to another service.
                  </li>
                  <li>
                    <strong>Right to Object:</strong> You may object to the processing of your
                    personal information for certain purposes, including direct marketing.
                  </li>
                  <li>
                    <strong>Right to Withdraw Consent:</strong> Where processing is based on
                    your consent, you may withdraw that consent at any time without affecting
                    the lawfulness of prior processing.
                  </li>
                  <li>
                    <strong>Right to Non-Discrimination:</strong> We will not discriminate
                    against you for exercising any of your privacy rights.
                  </li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us using the information
                  provided in the Contact section below. We will respond to your request within
                  30 days (or such shorter period as required by applicable law). We may require
                  verification of your identity before processing your request.
                </p>
                <p>
                  Additionally, you have the right to export your WordPress website data at
                  any time through your account portal. We provide standard WordPress export
                  functionality, allowing you to download your complete site including content,
                  media, themes, and plugins.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 9. Data Security */}
              {/* --------------------------------------------------------- */}
              <Section id="security" number="9" title="Data Security">
                <p>
                  We implement appropriate technical and organizational measures to protect
                  your personal information against unauthorized access, alteration, disclosure,
                  or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit using TLS 1.2 or higher</li>
                  <li>Encryption of sensitive data at rest</li>
                  <li>Regular security assessments and penetration testing</li>
                  <li>Access controls and authentication requirements for employees</li>
                  <li>Secure software development practices</li>
                  <li>Incident response procedures</li>
                </ul>
                <p>
                  While we strive to protect your personal information, no method of
                  transmission over the Internet or method of electronic storage is 100%
                  secure. We cannot guarantee absolute security of your data.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 10. Children's Privacy */}
              {/* --------------------------------------------------------- */}
              <Section id="children" number="10" title="Children&apos;s Privacy">
                <p>
                  Our Services are not intended for individuals under the age of 18. We do not
                  knowingly collect personal information from children under 18. If we learn
                  that we have collected personal information from a child under 18, we will
                  take steps to delete that information as quickly as possible. If you believe
                  we have inadvertently collected information from a child under 18, please
                  contact us immediately.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 11. International Transfers */}
              {/* --------------------------------------------------------- */}
              <Section id="international" number="11" title="International Data Transfers">
                <p>
                  Our Services are operated in the United States. If you are located outside
                  the United States, please be aware that any information you provide to us
                  will be transferred to and processed in the United States. By using our
                  Services, you consent to this transfer. We take appropriate safeguards to
                  ensure that your personal information is treated securely and in accordance
                  with this Privacy Policy, including the use of Standard Contractual Clauses
                  where required by applicable law.
                </p>
              </Section>

              {/* --------------------------------------------------------- */}
              {/* 12. Contact Information */}
              {/* --------------------------------------------------------- */}
              <Section id="contact" number="12" title="Contact Information">
                <p>
                  If you have any questions about this Privacy Policy, wish to exercise your
                  rights, or have concerns about our data practices, you may contact us at:
                </p>
                <div className="mt-4 rounded-xl border border-surface-border bg-surface-white p-6">
                  <p className="font-semibold text-primary-950">Xusmo</p>
                  <p className="mt-1">Email: privacy@xusmo.ai</p>
                  <p>Website: xusmo.ai/contact</p>
                </div>
                <p className="mt-4">
                  We aim to respond to all legitimate requests within 30 days. Occasionally, it
                  may take us longer if your request is particularly complex or you have made a
                  number of requests. In this case, we will notify you and keep you updated on
                  the progress of your request.
                </p>
              </Section>
            </div>
          </AnimatedSection>
        </Container>
      </div>
    </MarketingLayout>
  );
}

// =============================================================================
// Pattern Hydrator — Loads pattern PHP files and performs content substitution.
// Reads .php pattern files, strips the PHP header, and replaces placeholder
// text with real content while preserving Gutenberg block JSON attributes.
// =============================================================================

import { readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { PatternSlug } from "./registry";

// Resolve patterns directory relative to this file (packages/gutenberg/src/patterns/)
const __dirname = dirname(fileURLToPath(import.meta.url));
const PATTERNS_DIR = join(__dirname, "patterns");

// Cache loaded pattern templates
const patternCache = new Map<string, string>();

/**
 * Load a pattern file, strip PHP header, return raw Gutenberg block HTML.
 */
export async function loadPattern(slug: PatternSlug): Promise<string> {
  if (patternCache.has(slug)) {
    return patternCache.get(slug)!;
  }

  const filePath = join(PATTERNS_DIR, `${slug}.php`);
  const raw = await readFile(filePath, "utf-8");

  // Strip PHP header block (<?php ... ?>)
  const stripped = raw.replace(/^<\?php[\s\S]*?\?>\s*/m, "").trim();

  patternCache.set(slug, stripped);
  return stripped;
}

/**
 * Content slots that the LLM fills in for each pattern type.
 * Maps pattern slug → named slots with their placeholder text from the template.
 */
export interface PatternSlots {
  [key: string]: string;
}

// Placeholder text found in each pattern template → maps to slot names
const PATTERN_PLACEHOLDERS: Record<PatternSlug, Record<string, string>> = {
  "hero-split-screen": {
    headline: "Grow Your Business With Confidence",
    description:
      "Our proven strategies and dedicated team will help you reach new heights. Let us partner with you to build something amazing.",
    cta_primary: "Get a Free Quote",
    cta_secondary: "Our Services",
    stat_1_number: "500+",
    stat_1_label: "Happy Clients",
    stat_2_number: "10+",
    stat_2_label: "Years Experience",
  },
  "hero-image-bg": {
    headline: "Welcome to Our Business",
    description:
      "We deliver exceptional results with a commitment to quality and customer satisfaction. Discover how we can help you achieve your goals.",
    cta_primary: "Get Started",
    cta_secondary: "Learn More",
  },
  "services-grid": {
    section_title: "Our Services",
    section_subtitle:
      "Everything you need to succeed, all in one place.",
    service_1_name: "Service One",
    service_1_desc:
      "Professional service delivery with attention to detail and a focus on exceeding your expectations every time.",
    service_2_name: "Service Two",
    service_2_desc:
      "Customized solutions designed to meet your unique needs with reliability and consistent high performance.",
    service_3_name: "Service Three",
    service_3_desc:
      "Dedicated support and expert guidance to help you navigate challenges and achieve lasting success.",
  },
  "trust-bar": {
    trust_1: "4.9/5 from 200+ reviews",
    trust_2: "Trusted by 500+ clients",
    trust_3: "Licensed &amp; Insured",
    trust_4: "10+ Years Experience",
  },
  "testimonials-carousel": {
    section_title: "What Our Clients Say",
    section_subtitle: "Real stories from real customers who trust us.",
    quote_1:
      "Absolutely outstanding service from start to finish. The team went above and beyond to deliver exactly what we needed. Highly recommended!",
    name_1: "Sarah Johnson",
    title_1: "Business Owner",
    quote_2:
      "Professional, reliable, and incredibly talented. They transformed our vision into reality and exceeded all expectations. A truly exceptional team.",
    name_2: "Michael Chen",
    title_2: "Marketing Director",
    quote_3:
      "From the initial consultation to the final result, every step was handled with care and expertise. I would not hesitate to recommend them to anyone.",
    name_3: "Emily Rodriguez",
    title_3: "Homeowner",
  },
  "faq-accordion": {
    section_title: "Frequently Asked Questions",
    section_subtitle: "Find answers to common questions about our services.",
    faq_1_q: "What services do you offer?",
    faq_1_a:
      "We offer a comprehensive range of services tailored to meet your specific needs. Contact us for a detailed consultation to discuss how we can best serve you.",
    faq_2_q: "How much does it cost?",
    faq_2_a:
      "Our pricing varies based on the scope and complexity of each project. We provide free estimates and transparent pricing with no hidden fees.",
    faq_3_q: "How long does it take?",
    faq_3_a:
      "Timelines depend on the specific project requirements. Most standard projects are completed within 2-4 weeks, but we will provide a detailed timeline during the planning phase.",
    faq_4_q: "Do you offer a guarantee?",
    faq_4_a:
      "Yes, we stand behind our work with a satisfaction guarantee. If you are not completely happy with the results, we will work with you to make it right.",
    faq_5_q: "How do I get started?",
    faq_5_a:
      "Getting started is easy. Simply reach out through our contact form, give us a call, or send us an email. We will schedule a free consultation to discuss your needs.",
  },
  "cta-banner": {
    headline: "Ready to Get Started?",
    description:
      "Take the first step today. Contact us for a free consultation and discover how we can help your business thrive.",
    cta_text: "Contact Us Today",
  },
  "cta-split": {
    headline: "We Bring Your Vision to Life",
    description:
      "With years of experience and a dedication to excellence, we offer solutions that truly make a difference. Our team is ready to help you achieve remarkable results.",
    cta_text: "Get Started Today",
  },
  "contact-form-section": {
    headline: "Get in Touch",
    description: "We would love to hear from you. Reach out today.",
    contact_address: "123 Main Street, Suite 100<br>City, State 12345",
    contact_phone: "(555) 123-4567",
    contact_email: "hello@example.com",
    contact_hours: "Mon - Fri: 9:00 AM - 5:00 PM<br>Sat: 10:00 AM - 2:00 PM<br>Sun: Closed",
  },
  "hours-widget": {
    headline: "Business Hours",
  },
  "menu-grid": {
    section_title: "Our Menu",
    section_subtitle: "Crafted with care using the finest ingredients.",
  },
  "gallery-masonry": {
    section_title: "Our Gallery",
    section_subtitle: "A showcase of our finest work and projects.",
  },
  "pricing-table": {
    section_title: "Pricing Plans",
    section_subtitle: "Choose the plan that fits your needs.",
  },
  "team-grid": {
    section_title: "Meet Our Team",
    section_subtitle: "The people who make it all happen.",
    member_1_name: "Jane Smith",
    member_1_role: "Founder &amp; CEO",
    member_2_name: "John Davis",
    member_2_role: "Operations Director",
    member_3_name: "Maria Garcia",
    member_3_role: "Lead Designer",
    member_4_name: "Alex Turner",
    member_4_role: "Marketing Manager",
  },
  "portfolio-grid": {
    section_title: "Our Work",
    section_subtitle: "Explore our recent projects and see what we can do.",
  },
  "map-embed": {
    headline: "Find Us",
    location_text: "Visit our location or get directions below.",
  },
  "booking-cta": {
    headline: "Book Your Appointment Today",
    description:
      "Schedule a consultation with our team of experts. We offer flexible scheduling to fit your busy lifestyle.",
    cta_text: "Book Now",
  },
  "stats-counter": {
    stat_1_number: "500+",
    stat_1_label: "Happy Clients",
    stat_2_number: "1,200+",
    stat_2_label: "Projects Completed",
    stat_3_number: "10+",
    stat_3_label: "Years Experience",
    stat_4_number: "4.9",
    stat_4_label: "Average Rating",
  },
  "logo-cloud": {
    section_title: "Trusted By Industry Leaders",
  },
  "blog-preview": {
    section_title: "Latest from Our Blog",
    section_subtitle: "Stay up to date with our news and insights.",
  },
  // Design-package variants
  "hero-centered-minimal": {
    headline: "Your Business, Elevated",
    description:
      "Clean, modern, and focused. We bring clarity to your brand and deliver results that speak for themselves.",
    cta_primary: "Get Started",
  },
  "hero-video-bg": {
    headline: "Experience the Difference",
    description:
      "See what sets us apart. Our commitment to excellence is visible in everything we do.",
    cta_primary: "Watch Our Story",
    cta_secondary: "Learn More",
  },
  "hero-asymmetric": {
    headline: "Bold Ideas, Beautiful Results",
    description:
      "We combine creativity with strategy to deliver solutions that stand out and drive growth.",
    cta_primary: "Start Your Project",
  },
  "hero-cards": {
    headline: "Everything You Need in One Place",
    description:
      "Discover our comprehensive suite of services designed to help your business thrive.",
    cta_primary: "Explore Services",
    card_1_title: "Quality First",
    card_1_desc: "Premium quality in every detail.",
    card_2_title: "Fast Delivery",
    card_2_desc: "On time, every time.",
    card_3_title: "Expert Support",
    card_3_desc: "Help when you need it most.",
  },
  "services-alternating": {
    section_title: "What We Offer",
    service_1_name: "Service One",
    service_1_desc:
      "Professional service delivery with attention to detail and a focus on exceeding your expectations every time.",
    service_2_name: "Service Two",
    service_2_desc:
      "Customized solutions designed to meet your unique needs with reliability and consistent high performance.",
    service_3_name: "Service Three",
    service_3_desc:
      "Dedicated support and expert guidance to help you navigate challenges and achieve lasting success.",
  },
  "services-icons": {
    section_title: "Our Services",
    section_subtitle:
      "Everything you need to succeed, all in one place.",
    service_1_name: "Service One",
    service_1_desc:
      "Professional service delivery with attention to detail and a focus on exceeding your expectations every time.",
    service_2_name: "Service Two",
    service_2_desc:
      "Customized solutions designed to meet your unique needs with reliability and consistent high performance.",
    service_3_name: "Service Three",
    service_3_desc:
      "Dedicated support and expert guidance to help you navigate challenges and achieve lasting success.",
    service_4_name: "Service Four",
    service_4_desc:
      "Comprehensive solutions that cover all aspects of your needs with professionalism and care.",
  },
  "testimonials-cards": {
    section_title: "What Our Clients Say",
    section_subtitle: "Real stories from real customers who trust us.",
    quote_1:
      "Absolutely outstanding service from start to finish. The team went above and beyond to deliver exactly what we needed.",
    name_1: "Sarah Johnson",
    title_1: "Business Owner",
    quote_2:
      "Professional, reliable, and incredibly talented. They transformed our vision into reality.",
    name_2: "Michael Chen",
    title_2: "Marketing Director",
    quote_3:
      "From the initial consultation to the final result, every step was handled with care and expertise.",
    name_3: "Emily Rodriguez",
    title_3: "Homeowner",
  },
  "testimonials-single": {
    quote:
      "This team completely transformed our business. Their attention to detail, creative vision, and dedication to our success made all the difference. I cannot recommend them highly enough.",
    name: "Sarah Johnson",
    title: "CEO, Example Company",
  },
  "cta-gradient": {
    headline: "Ready to Transform Your Business?",
    description:
      "Join hundreds of satisfied customers who have taken their business to the next level with our help.",
    cta_text: "Get Started Today",
  },
  "cta-minimal": {
    headline: "Let's Work Together",
    cta_text: "Contact Us",
  },
  "features-checklist": {
    section_title: "Why Choose Us",
    feature_1: "Licensed and insured professionals",
    feature_2: "Over 10 years of industry experience",
    feature_3: "100% satisfaction guarantee",
    feature_4: "Transparent pricing with no hidden fees",
    feature_5: "Fast response times and flexible scheduling",
    feature_6: "Locally owned and operated",
  },
  "features-columns": {
    section_title: "What Sets Us Apart",
    section_subtitle: "The qualities that make us your best choice.",
    feature_1_title: "Quality Craftsmanship",
    feature_1_desc: "Every project receives our full attention to detail and highest standards.",
    feature_2_title: "Reliable Service",
    feature_2_desc: "We show up on time and deliver on our promises, every single time.",
    feature_3_title: "Expert Team",
    feature_3_desc: "Our skilled professionals bring years of experience to every job.",
    feature_4_title: "Customer First",
    feature_4_desc: "Your satisfaction is our top priority from start to finish.",
  },
  // ── React mount-point patterns ──────────────────────────────────────────
  // dark-luxury
  "hero-cinematic": {
    headline: "Transform Your Vision Into Reality",
    description: "We craft exceptional experiences with meticulous attention to detail and an unwavering commitment to excellence.",
    cta_primary: "Discover More",
    stat_1_number: "500+",
    stat_1_label: "Happy Clients",
    stat_2_number: "10+",
    stat_2_label: "Years Experience",
  },
  "services-overlay-cards": {
    section_title: "Our Services",
    section_subtitle: "Crafted with care and delivered with excellence.",
    service_1_name: "Premium Consulting",
    service_1_desc: "Strategic guidance tailored to elevate your business to new heights.",
    service_2_name: "Creative Design",
    service_2_desc: "Bespoke visual solutions that capture the essence of your brand.",
    service_3_name: "Expert Execution",
    service_3_desc: "Flawless delivery that transforms your vision into reality.",
  },
  "testimonial-editorial": {
    quote: "An extraordinary experience from start to finish. The attention to detail and commitment to excellence exceeded all expectations.",
    name: "Alexandra Bennett",
    title: "Creative Director",
  },
  "cta-borderline": {
    headline: "Ready to Begin?",
    description: "Let us craft something extraordinary together.",
    cta_text: "Get in Touch",
  },
  // bold-startup
  "hero-gradient-blob": {
    headline: "Build Something Amazing Today",
    description: "We help ambitious businesses grow with cutting-edge solutions and creative strategies.",
    cta_primary: "Get Started Free",
    cta_secondary: "Watch Demo",
    stat_1_number: "500+",
    stat_1_label: "Happy Clients",
    stat_2_number: "10+",
    stat_2_label: "Years Experience",
  },
  "features-rounded-cards": {
    section_title: "Why Teams Choose Us",
    section_subtitle: "Everything you need to grow faster.",
    feature_1_title: "Lightning Fast",
    feature_1_desc: "Optimized for speed so you never keep your customers waiting.",
    feature_2_title: "Reliable &amp; Secure",
    feature_2_desc: "Enterprise-grade security with 99.9% uptime guarantee.",
    feature_3_title: "Easy to Use",
    feature_3_desc: "Intuitive interface that your whole team will love from day one.",
    feature_4_title: "24/7 Support",
    feature_4_desc: "Our team is always here to help whenever you need us.",
  },
  "testimonials-avatar-cards": {
    section_title: "Loved by Thousands",
    section_subtitle: "See what our customers are saying.",
    quote_1: "This completely transformed how we work. Incredible product!",
    name_1: "Sarah Chen",
    title_1: "Startup Founder",
    quote_2: "The best decision we made for our business this year.",
    name_2: "Marcus Johnson",
    title_2: "Head of Growth",
    quote_3: "Outstanding support and an even better product.",
    name_3: "Emily Rodriguez",
    title_3: "Product Manager",
  },
  "cta-mesh-banner": {
    headline: "Ready to Get Started?",
    description: "Join thousands of happy customers building something great.",
    cta_text: "Start Free Trial",
  },
  // elegant-studio
  "hero-asymmetric-minimal": {
    headline: "Crafted With Intention",
    description: "A thoughtful approach to design that values simplicity, purpose, and timeless beauty in every detail.",
    cta_primary: "View Our Work",
    stat_1_number: "500+",
    stat_1_label: "Projects Completed",
    stat_2_number: "10+",
    stat_2_label: "Years of Practice",
  },
  "services-alternating-rows": {
    section_title: "What We Do",
    section_subtitle: "Services designed with care and delivered with precision.",
    service_1_name: "Brand Strategy",
    service_1_desc: "Defining your unique position in the market with clarity and purpose.",
    service_2_name: "Visual Identity",
    service_2_desc: "Crafting cohesive visual systems that tell your story beautifully.",
    service_3_name: "Digital Experience",
    service_3_desc: "Building thoughtful digital touchpoints that connect and inspire.",
  },
  "testimonial-centered": {
    quote: "Their thoughtful approach transformed our brand into something we are truly proud of. Every detail was considered with care.",
    name: "Catherine Mercer",
    title: "Studio Director",
  },
  "cta-underline-text": {
    headline: "Let&#39;s Create Together",
    cta_text: "Start a Conversation",
  },
  // industrial
  "hero-uppercase": {
    headline: "Built to Perform",
    description: "Engineered solutions that deliver results. No compromises, no shortcuts.",
    cta_primary: "Get Started",
    stat_1_number: "500+",
    stat_1_label: "Projects Delivered",
    stat_2_number: "99.9%",
    stat_2_label: "Uptime",
  },
  "features-numbered-grid": {
    section_title: "Our Capabilities",
    section_subtitle: "Precision-engineered solutions for every challenge.",
    feature_1_title: "Performance First",
    feature_1_desc: "Every solution optimized for maximum speed and efficiency.",
    feature_2_title: "Rock Solid",
    feature_2_desc: "Built on battle-tested foundations that never let you down.",
    feature_3_title: "Scalable Systems",
    feature_3_desc: "Architecture that grows with your business without breaking.",
    feature_4_title: "Data Driven",
    feature_4_desc: "Every decision backed by analytics and real-world metrics.",
  },
  "stats-proof": {
    stat_1_number: "500+",
    stat_1_label: "Projects Delivered",
    stat_2_number: "99.9%",
    stat_2_label: "Client Satisfaction",
    stat_3_number: "50+",
    stat_3_label: "Team Members",
    stat_4_number: "24/7",
    stat_4_label: "Support Available",
  },
  "cta-bright-border": {
    headline: "Ready to Build?",
    description: "Let&#39;s engineer something remarkable together.",
    cta_text: "Launch Project",
  },
  // warm-friendly
  "hero-warm-split": {
    headline: "Welcome to a Better Experience",
    description: "We believe in creating warm, lasting relationships with every customer we serve.",
    cta_primary: "Get Started",
    cta_secondary: "Learn More",
    stat_1_number: "500+",
    stat_1_label: "Happy Families",
    stat_2_number: "10+",
    stat_2_label: "Years Serving You",
  },
  "services-warm-circles": {
    section_title: "How We Help",
    section_subtitle: "Simple, friendly, and always here for you.",
    service_1_name: "Personal Care",
    service_1_desc: "Every customer gets the individual attention they deserve.",
    service_2_name: "Community Focus",
    service_2_desc: "We are proud to be part of the neighborhoods we serve.",
    service_3_name: "Quality Promise",
    service_3_desc: "Only the best materials and practices, guaranteed.",
  },
  "testimonials-warm-cards": {
    section_title: "What Our Customers Say",
    section_subtitle: "Real stories from real people.",
    quote_1: "They made us feel like family from the very first visit.",
    name_1: "Maria Gonzalez",
    title_1: "Local Resident",
    quote_2: "Reliable, friendly, and always go the extra mile.",
    name_2: "David Thompson",
    title_2: "Small Business Owner",
    quote_3: "I recommend them to everyone I know. Truly wonderful.",
    name_3: "Jennifer Park",
    title_3: "Community Member",
  },
  "cta-warm-gradient": {
    headline: "Ready to Join Our Family?",
    description: "We would love to welcome you and show you what makes us special.",
    cta_text: "Get in Touch",
  },
  // ── E-commerce patterns ────────────────────────────────────────────────
  "shop-hero": {
    headline: "Browse Our Collection",
    description:
      "Discover quality products curated for you. Free shipping on orders over $50.",
    cta_text: "Shop Now",
  },
  "product-grid": {
    section_title: "Our Products",
    section_subtitle: "Browse our curated selection of quality products.",
  },
  "product-featured": {
    section_title: "Featured Products",
    section_subtitle: "Handpicked favorites our customers love.",
  },
  "product-categories": {
    section_title: "Shop by Category",
    section_subtitle: "Find exactly what you need in our organized categories.",
  },
};

/**
 * Hydrate a pattern template by replacing placeholder text with real content.
 * Uses simple string replacement to preserve block JSON attributes intact.
 * Auto-detects React mount-point patterns and uses JSON-safe escaping.
 */
export function hydratePatternContent(
  template: string,
  slug: PatternSlug,
  slots: PatternSlots
): string {
  let result = template;
  const placeholders = PATTERN_PLACEHOLDERS[slug];

  if (!placeholders) return result;

  // React mount-point patterns use data-xusmo-props JSON — need JSON escaping
  const isReactPattern = template.includes("data-xusmo-component");
  const esc = isReactPattern ? escJsonAttr : escHtml;

  // Replace each placeholder with its slot value (if provided)
  for (const [slotName, placeholderText] of Object.entries(placeholders)) {
    if (slots[slotName]) {
      // Escape special regex characters in the placeholder
      const escaped = placeholderText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "g"), esc(slots[slotName]));
    }
  }

  return result;
}

/**
 * Load and hydrate a pattern in one step.
 */
export async function hydratePattern(
  slug: PatternSlug,
  slots: PatternSlots
): Promise<string> {
  const template = await loadPattern(slug);
  return hydratePatternContent(template, slug, slots);
}

/**
 * Minimal HTML entity escaping for content injected into block templates.
 * We only escape characters that would break HTML structure.
 */
function escHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escaping for content injected into JSON attribute values (data-xusmo-props).
 * The JSON sits inside single-quoted HTML attributes, so we must escape
 * characters that break JSON strings: backslash, double-quote, newlines.
 * We do NOT HTML-encode &/</>  — React handles rendering safely.
 */
function escJsonAttr(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/'/g, "&#39;"); // single-quote would break the HTML attribute boundary
}

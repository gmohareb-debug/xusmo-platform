// =============================================================================
// Interview Engine — Core Questions
// Defines the 8-stage interview flow:
//   Stage 1: BASICS — business info (triggers classification)
//   Stage 2: GOALS — website objectives + target audience
//   Stage 3: SERVICES — industry-specific (dynamic from IndustryDefault)
//   Stage 4: STORY — founding story, team, differentiator
//   Stage 5: CONTENT — testimonials, FAQs, portfolio, social media
//   Stage 6: BRANDING — visual preferences
//   Stage 7: PAGES — page selection + custom requests
//   Stage 8: CONFIRM — review & submit
// Usage: import { getInterviewQuestions } from "@/lib/interview/questions";
// =============================================================================

import type { ClassificationResult } from "@/lib/classification/classify";
import type { Archetype } from "@/lib/classification/archetypes";
import type { IndustryDefault, SiteTrack } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QuestionType =
  | "text"
  | "textarea"
  | "select"
  | "multi_select"
  | "boolean"
  | "tel"
  | "email"
  | "url"
  | "repeater";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface RepeaterField {
  id: string;
  label: string;
  type: "text" | "textarea";
  placeholder?: string;
  required?: boolean;
}

export interface RepeaterConfig {
  minItems: number;
  maxItems: number;
  fields: RepeaterField[];
  addLabel?: string;
}

export interface InterviewQuestion {
  id: string;
  stage: number;
  question: string;
  type: QuestionType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: QuestionOption[];
  repeaterConfig?: RepeaterConfig;
  showWhen?: {
    archetype?: Archetype[];
    answerId?: string;
    answerValue?: unknown;
  };
}

// ---------------------------------------------------------------------------
// Stage 1: BASICS (always asked)
// ---------------------------------------------------------------------------

const stage1Questions: InterviewQuestion[] = [
  {
    id: "business_name",
    stage: 1,
    question: "What's the name of your business?",
    type: "text",
    required: true,
    placeholder: "e.g. Johnson Plumbing, Bella Salon...",
  },
  {
    id: "business_description",
    stage: 1,
    question: "Briefly describe what your business does.",
    type: "textarea",
    required: true,
    placeholder: "e.g. We're a family-owned plumbing company serving the Dallas area...",
    helpText: "The more detail you give, the better we can tailor your site.",
  },
  {
    id: "years_in_business",
    stage: 1,
    question: "How long have you been in business?",
    type: "select",
    required: true,
    options: [
      { value: "just_starting", label: "Just starting" },
      { value: "less_than_1", label: "Less than 1 year" },
      { value: "1_to_5", label: "1-5 years" },
      { value: "5_to_10", label: "5-10 years" },
      { value: "10_plus", label: "10+ years" },
    ],
  },
  {
    id: "location",
    stage: 1,
    question: "Where is your business located? (City, State/Province)",
    type: "text",
    required: true,
    placeholder: "e.g. Austin, TX",
  },
  {
    id: "phone",
    stage: 1,
    question: "What's your business phone number?",
    type: "tel",
    required: false,
    placeholder: "(555) 123-4567",
  },
  {
    id: "email",
    stage: 1,
    question: "What's your business email?",
    type: "email",
    required: true,
    placeholder: "hello@yourbusiness.com",
  },
];

// ---------------------------------------------------------------------------
// Stage 2: GOALS (always asked — track-aware)
// ---------------------------------------------------------------------------

const stage2WebsiteQuestions: InterviewQuestion[] = [
  {
    id: "primary_goal",
    stage: 2,
    question: "What's the #1 thing you want your website to do?",
    type: "select",
    required: true,
    options: [
      { value: "phone_calls", label: "Get phone calls" },
      { value: "form_leads", label: "Get form submissions/leads" },
      { value: "book_appointments", label: "Book appointments online" },
      { value: "showcase_work", label: "Showcase my work/portfolio" },
      { value: "sell_products", label: "Sell products online" },
      { value: "provide_info", label: "Provide information" },
    ],
  },
  {
    id: "target_audience",
    stage: 2,
    question: "Who is your ideal customer or client?",
    type: "textarea",
    required: true,
    placeholder: "e.g. Homeowners in Austin aged 30-60 who need emergency plumbing...",
    helpText: "Think about age, location, income, and what problems they're trying to solve.",
  },
  {
    id: "unique_selling_point",
    stage: 2,
    question: "What makes you different from your competitors?",
    type: "textarea",
    required: true,
    placeholder: "e.g. 24/7 emergency service, family-owned for 30 years, best prices...",
  },
  {
    id: "secondary_goals",
    stage: 2,
    question: "What else should your website do? (Select all that apply)",
    type: "multi_select",
    required: false,
    options: [
      { value: "build_trust", label: "Build trust & credibility" },
      { value: "show_reviews", label: "Show reviews & testimonials" },
      { value: "educate", label: "Educate visitors about my services" },
      { value: "recruit", label: "Recruit employees/talent" },
      { value: "sell_online", label: "Sell products/services online" },
      { value: "collect_emails", label: "Collect email subscribers" },
    ],
  },
  {
    id: "has_website",
    stage: 2,
    question: "Do you currently have a website?",
    type: "select",
    required: true,
    options: [
      { value: "no", label: "No" },
      { value: "yes_new", label: "Yes, but I want a new one" },
      { value: "yes_update", label: "Yes, but it needs updating" },
    ],
  },
  {
    id: "existing_website_url",
    stage: 2,
    question: "What's your current website URL?",
    type: "url",
    required: false,
    placeholder: "https://www.yourbusiness.com",
    showWhen: { answerId: "has_website", answerValue: "yes_new" },
  },
];

const stage2EcommerceQuestions: InterviewQuestion[] = [
  {
    id: "primary_goal",
    stage: 2,
    question: "What type of products will you sell?",
    type: "select",
    required: true,
    options: [
      { value: "physical_products", label: "Physical products" },
      { value: "digital_products", label: "Digital products / downloads" },
      { value: "services_online", label: "Services sold online" },
      { value: "subscriptions", label: "Subscription / recurring" },
      { value: "mixed", label: "Mix of physical & digital" },
    ],
  },
  {
    id: "product_count_estimate",
    stage: 2,
    question: "How many products do you plan to sell?",
    type: "select",
    required: true,
    options: [
      { value: "1_10", label: "1-10 products" },
      { value: "11_50", label: "11-50 products" },
      { value: "51_200", label: "51-200 products" },
      { value: "200_plus", label: "200+ products" },
    ],
  },
  {
    id: "target_audience",
    stage: 2,
    question: "Who is your ideal customer?",
    type: "textarea",
    required: true,
    placeholder: "e.g. Women aged 25-40 who shop for handmade jewelry online...",
    helpText: "Think about demographics, interests, and shopping habits.",
  },
  {
    id: "unique_selling_point",
    stage: 2,
    question: "What makes your store stand out from competitors?",
    type: "textarea",
    required: true,
    placeholder: "e.g. Handmade, free shipping, ethically sourced, unique designs...",
  },
  {
    id: "payment_preference",
    stage: 2,
    question: "Which payment methods do you need? (Select all that apply)",
    type: "multi_select",
    required: true,
    options: [
      { value: "credit_debit", label: "Credit / Debit Cards" },
      { value: "paypal", label: "PayPal" },
      { value: "apple_google_pay", label: "Apple Pay / Google Pay" },
      { value: "bank_transfer", label: "Bank Transfer" },
      { value: "cod", label: "Cash on Delivery" },
    ],
  },
  {
    id: "has_website",
    stage: 2,
    question: "Do you currently sell online?",
    type: "select",
    required: true,
    options: [
      { value: "no", label: "No, this is my first online store" },
      { value: "yes_new", label: "Yes, but I want a new store" },
      { value: "marketplace", label: "I sell on marketplaces (Etsy, Amazon, etc.)" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Stage 3: SERVICES / PRODUCTS (dynamic — track-aware)
// ---------------------------------------------------------------------------

function buildStage3EcommerceQuestions(): InterviewQuestion[] {
  return [
    {
      id: "product_categories",
      stage: 3,
      question: "What product categories will your store have?",
      type: "textarea",
      required: true,
      placeholder: "e.g. T-Shirts, Hoodies, Accessories, Limited Editions...",
      helpText: "List the main categories. We'll set up your shop pages accordingly.",
    },
    {
      id: "sample_products",
      stage: 3,
      question: "Add a few sample products so we can set up your store.",
      type: "repeater",
      required: false,
      helpText: "These help us configure your store layout and design.",
      repeaterConfig: {
        minItems: 0,
        maxItems: 10,
        addLabel: "Add product",
        fields: [
          { id: "name", label: "Product name", type: "text", placeholder: "Classic Logo Tee", required: true },
          { id: "price", label: "Price", type: "text", placeholder: "$29.99" },
          { id: "description", label: "Short description", type: "textarea", placeholder: "100% cotton, available in S-XXL" },
        ],
      },
    },
    {
      id: "shipping_model",
      stage: 3,
      question: "How do you handle shipping?",
      type: "select",
      required: true,
      options: [
        { value: "free_shipping", label: "Free shipping" },
        { value: "flat_rate", label: "Flat rate shipping" },
        { value: "weight_based", label: "Weight-based shipping" },
        { value: "local_pickup", label: "Local pickup only" },
        { value: "digital", label: "Digital products (no shipping)" },
      ],
    },
    {
      id: "pricing_model",
      stage: 3,
      question: "How is your pricing structured?",
      type: "select",
      required: false,
      options: [
        { value: "fixed", label: "Fixed prices" },
        { value: "variable", label: "Variable pricing (e.g. sizes, colors)" },
        { value: "subscription", label: "Subscription-based" },
        { value: "name_your_price", label: "Name your price / donations" },
      ],
    },
    {
      id: "additional_services",
      stage: 3,
      question: "Any other details about your products or store?",
      type: "textarea",
      required: false,
      placeholder: "e.g. Custom orders available, wholesale pricing, gift wrapping...",
    },
  ];
}

function buildStage3Questions(
  industryDefaults?: IndustryDefault | null
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [];

  if (industryDefaults) {
    // Dynamic services multi-select from IndustryDefault.defaultServices
    const services = industryDefaults.defaultServices as Array<{
      name: string;
      description: string;
    }>;
    if (services.length > 0) {
      questions.push({
        id: "selected_services",
        stage: 3,
        question: "Which of these services do you offer? (Select all that apply)",
        type: "multi_select",
        required: true,
        options: services.map((s) => ({
          value: s.name.toLowerCase().replace(/\s+/g, "_"),
          label: s.name,
        })),
      });
    }

    // Dynamic industry-specific questions from IndustryDefault.defaultQuestions
    const defaultQuestions = industryDefaults.defaultQuestions as Array<{
      question: string;
      fieldType: string;
      options: string[] | null;
      required: boolean;
    }>;
    for (let i = 0; i < defaultQuestions.length; i++) {
      const dq = defaultQuestions[i];

      let qType: QuestionType = "text";
      let qOptions: QuestionOption[] | undefined;

      if (dq.fieldType === "boolean") {
        qType = "select";
        qOptions = [
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ];
      } else if (dq.fieldType === "multiselect" && dq.options) {
        qType = "multi_select";
        qOptions = dq.options.map((o) => ({
          value: o.toLowerCase().replace(/\s+/g, "_"),
          label: o,
        }));
      } else if (dq.fieldType === "select" && dq.options) {
        qType = "select";
        qOptions = dq.options.map((o) => ({
          value: o.toLowerCase().replace(/\s+/g, "_"),
          label: o,
        }));
      } else if (dq.fieldType === "textarea") {
        qType = "textarea";
      }

      questions.push({
        id: `industry_q_${i}`,
        stage: 3,
        question: dq.question,
        type: qType,
        required: dq.required ?? false,
        options: qOptions,
      });
    }
  }

  // Service descriptions
  questions.push({
    id: "service_descriptions",
    stage: 3,
    question: "Describe your main services or products in a bit more detail.",
    type: "textarea",
    required: false,
    placeholder: "e.g. Our drain cleaning service uses hydro-jetting technology...",
    helpText: "This helps us write compelling content for your service pages.",
  });

  // Pricing model
  questions.push({
    id: "pricing_model",
    stage: 3,
    question: "How do you handle pricing?",
    type: "select",
    required: false,
    options: [
      { value: "fixed", label: "Fixed prices / menu" },
      { value: "quote", label: "Free quotes / estimates" },
      { value: "hourly", label: "Hourly rates" },
      { value: "packages", label: "Service packages / tiers" },
      { value: "custom", label: "Custom pricing per project" },
      { value: "not_shown", label: "I don't show pricing on my site" },
    ],
  });

  // Catch-all
  questions.push({
    id: "additional_services",
    stage: 3,
    question: "Is there anything else you'd like to mention about your services?",
    type: "textarea",
    required: false,
    placeholder: "Any specialties, certifications, or unique aspects of your business...",
  });

  return questions;
}

// ---------------------------------------------------------------------------
// Stage 4: STORY (always asked)
// ---------------------------------------------------------------------------

function buildStage4Questions(
  classificationResult?: ClassificationResult | null
): InterviewQuestion[] {
  const questions: InterviewQuestion[] = [
    {
      id: "founding_story",
      stage: 4,
      question: "Tell us the story behind your business. How did it start?",
      type: "textarea",
      required: false,
      placeholder: "e.g. I started this company in my garage 15 years ago after...",
      helpText: "This is for your About page — visitors love a good origin story.",
    },
    {
      id: "differentiator",
      stage: 4,
      question: "What's the one thing you want visitors to remember about your business?",
      type: "textarea",
      required: true,
      placeholder: "e.g. We never charge overtime, guaranteed same-day response...",
    },
    {
      id: "team_size",
      stage: 4,
      question: "How many people are on your team?",
      type: "select",
      required: true,
      options: [
        { value: "solo", label: "Just me" },
        { value: "2_5", label: "2-5 people" },
        { value: "6_20", label: "6-20 people" },
        { value: "21_50", label: "21-50 people" },
        { value: "50_plus", label: "50+ people" },
      ],
    },
    {
      id: "team_members",
      stage: 4,
      question: "Would you like to feature key team members on your site?",
      type: "repeater",
      required: false,
      helpText: "Add anyone you'd like on your About or Team page.",
      repeaterConfig: {
        minItems: 0,
        maxItems: 10,
        addLabel: "Add team member",
        fields: [
          { id: "name", label: "Name", type: "text", placeholder: "John Smith", required: true },
          { id: "role", label: "Role/Title", type: "text", placeholder: "Lead Technician" },
          { id: "bio", label: "Short bio", type: "textarea", placeholder: "15 years of experience in..." },
        ],
      },
    },
    {
      id: "certifications",
      stage: 4,
      question: "Do you have any licenses, certifications, or awards worth mentioning?",
      type: "textarea",
      required: false,
      placeholder: "e.g. Licensed & Insured, BBB A+ Rating, EPA Certified...",
    },
  ];

  // Add service area question for SERVICE archetype
  const archetype = classificationResult?.archetype?.type;
  if (!archetype || archetype === "SERVICE") {
    questions.push({
      id: "service_areas",
      stage: 4,
      question: "What areas do you serve?",
      type: "textarea",
      required: false,
      placeholder: "e.g. Austin, Round Rock, Cedar Park, and surrounding areas...",
      showWhen: { archetype: ["SERVICE"] },
    });
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Stage 5: CONTENT (always asked)
// ---------------------------------------------------------------------------

function buildStage5Questions(
  classificationResult?: ClassificationResult | null,
  track?: SiteTrack | null
): InterviewQuestion[] {
  const archetype = classificationResult?.archetype?.type;

  const questions: InterviewQuestion[] = [
    {
      id: "testimonials",
      stage: 5,
      question: "Do you have any customer testimonials or reviews to feature?",
      type: "repeater",
      required: false,
      helpText: "Real testimonials dramatically increase trust and conversions.",
      repeaterConfig: {
        minItems: 0,
        maxItems: 10,
        addLabel: "Add testimonial",
        fields: [
          { id: "quote", label: "What they said", type: "textarea", placeholder: "They were professional and...", required: true },
          { id: "name", label: "Customer name", type: "text", placeholder: "Jane D.", required: true },
          { id: "title", label: "Title/Company (optional)", type: "text", placeholder: "Homeowner" },
        ],
      },
    },
    {
      id: "business_hours",
      stage: 5,
      question: "What are your business hours?",
      type: "textarea",
      required: false,
      placeholder: "e.g. Mon-Fri: 8am-6pm, Sat: 9am-2pm, Sun: Closed",
    },
    {
      id: "social_facebook",
      stage: 5,
      question: "Do you have a Facebook page?",
      type: "url",
      required: false,
      placeholder: "https://facebook.com/yourbusiness",
    },
    {
      id: "social_instagram",
      stage: 5,
      question: "Do you have an Instagram account?",
      type: "url",
      required: false,
      placeholder: "https://instagram.com/yourbusiness",
    },
    {
      id: "custom_faqs",
      stage: 5,
      question: "What questions do your customers frequently ask?",
      type: "repeater",
      required: false,
      helpText: "FAQ sections help with SEO and answer visitor questions upfront.",
      repeaterConfig: {
        minItems: 0,
        maxItems: 15,
        addLabel: "Add FAQ",
        fields: [
          { id: "question", label: "Question", type: "text", placeholder: "How much does it cost?", required: true },
          { id: "answer", label: "Answer", type: "textarea", placeholder: "Pricing depends on...", required: true },
        ],
      },
    },
  ];

  // Portfolio items — only for PORTFOLIO archetype
  if (!archetype || archetype === "PORTFOLIO") {
    questions.push({
      id: "portfolio_items",
      stage: 5,
      question: "Add some portfolio projects or work samples.",
      type: "repeater",
      required: false,
      helpText: "Showcase your best work. We'll create a beautiful gallery.",
      showWhen: { archetype: ["PORTFOLIO"] },
      repeaterConfig: {
        minItems: 0,
        maxItems: 20,
        addLabel: "Add project",
        fields: [
          { id: "title", label: "Project title", type: "text", placeholder: "Modern Kitchen Renovation", required: true },
          { id: "category", label: "Category", type: "text", placeholder: "Residential" },
          { id: "description", label: "Description", type: "textarea", placeholder: "A complete kitchen overhaul with custom cabinets..." },
        ],
      },
    });
  }

  // Menu / schedule items for VENUE
  if (archetype === "VENUE") {
    questions.push({
      id: "venue_highlights",
      stage: 5,
      question: "What are your main offerings or highlights?",
      type: "textarea",
      required: false,
      placeholder: "e.g. Signature dishes, popular events, special features...",
      showWhen: { archetype: ["VENUE"] },
    });
  }

  // E-commerce-specific content questions
  if (track === "ECOMMERCE") {
    questions.push(
      {
        id: "return_policy",
        stage: 5,
        question: "What is your return / refund policy?",
        type: "textarea",
        required: false,
        placeholder: "e.g. 30-day returns, no questions asked, buyer pays return shipping...",
        helpText: "We'll create a Policies page with this information.",
      },
      {
        id: "shipping_info",
        stage: 5,
        question: "Any shipping details customers should know?",
        type: "textarea",
        required: false,
        placeholder: "e.g. Ships within 2 business days, free shipping over $50...",
      }
    );
  }

  return questions;
}

// ---------------------------------------------------------------------------
// Stage 6: BRANDING (always asked)
// ---------------------------------------------------------------------------

function buildStage6Questions(
  industryDefaults?: IndustryDefault | null
): InterviewQuestion[] {
  const toneOptions: QuestionOption[] = [
    { value: "professional", label: "Professional & Trustworthy" },
    { value: "warm", label: "Warm & Friendly" },
    { value: "bold", label: "Bold & Energetic" },
    { value: "elegant", label: "Elegant & Refined" },
    { value: "casual", label: "Casual & Approachable" },
  ];

  if (industryDefaults?.tone) {
    const suggestedTone = industryDefaults.tone as string;
    const existing = toneOptions.find(
      (o) => o.value === suggestedTone.toLowerCase()
    );
    if (!existing) {
      toneOptions.unshift({
        value: suggestedTone.toLowerCase(),
        label: `${suggestedTone} (Suggested for your industry)`,
      });
    }
  }

  return [
    {
      id: "has_logo",
      stage: 6,
      question: "Do you have a logo?",
      type: "select",
      required: true,
      options: [
        { value: "yes_upload", label: "Yes, I'll upload it" },
        { value: "no_text", label: "No, use a text logo for now" },
      ],
    },
    {
      id: "color_preference",
      stage: 6,
      question: "What colors represent your brand?",
      type: "select",
      required: true,
      options: [
        { value: "industry_default", label: "Use suggested colors for my industry" },
        { value: "custom", label: "I have specific colors" },
        { value: "surprise", label: "I'm not sure — surprise me" },
      ],
    },
    {
      id: "tone",
      stage: 6,
      question: "What tone should your website have?",
      type: "select",
      required: true,
      options: toneOptions,
    },
    {
      id: "style_preference",
      stage: 6,
      question: "What visual style do you prefer?",
      type: "select",
      required: false,
      options: [
        { value: "modern_clean", label: "Modern & Clean" },
        { value: "classic_traditional", label: "Classic & Traditional" },
        { value: "bold_colorful", label: "Bold & Colorful" },
        { value: "minimal_elegant", label: "Minimal & Elegant" },
        { value: "warm_organic", label: "Warm & Organic" },
      ],
    },
  ];
}

// ---------------------------------------------------------------------------
// Stage 7: PAGES (always asked)
// ---------------------------------------------------------------------------

function buildStage7Questions(
  classificationResult?: ClassificationResult | null
): InterviewQuestion[] {
  const archetype = classificationResult?.archetype?.type as Archetype | undefined;

  // Build page options from archetype metadata
  const archetypePages: Record<Archetype, Array<{ value: string; label: string }>> = {
    SERVICE: [
      { value: "home", label: "Home" },
      { value: "services", label: "Services" },
      { value: "about", label: "About Us" },
      { value: "contact", label: "Contact" },
      { value: "gallery", label: "Gallery / Photos" },
      { value: "faq", label: "FAQ" },
      { value: "testimonials", label: "Testimonials" },
      { value: "service_areas", label: "Service Areas" },
      { value: "blog", label: "Blog" },
    ],
    VENUE: [
      { value: "home", label: "Home" },
      { value: "menu", label: "Menu / Offerings" },
      { value: "about", label: "About Us" },
      { value: "contact", label: "Contact & Hours" },
      { value: "gallery", label: "Gallery / Photos" },
      { value: "events", label: "Events" },
      { value: "booking", label: "Reservations / Booking" },
      { value: "reviews", label: "Reviews" },
    ],
    PORTFOLIO: [
      { value: "home", label: "Home" },
      { value: "portfolio", label: "Portfolio / Work" },
      { value: "about", label: "About Me" },
      { value: "contact", label: "Contact" },
      { value: "services", label: "Services" },
      { value: "testimonials", label: "Testimonials" },
      { value: "case_studies", label: "Case Studies" },
      { value: "pricing", label: "Pricing" },
      { value: "blog", label: "Blog" },
    ],
    COMMERCE: [
      { value: "home", label: "Home" },
      { value: "shop", label: "Shop" },
      { value: "about", label: "About Us" },
      { value: "contact", label: "Contact" },
      { value: "faq", label: "FAQ" },
      { value: "categories", label: "Categories" },
      { value: "policies", label: "Policies / Shipping" },
      { value: "blog", label: "Blog" },
    ],
  };

  const pageOptions = archetypePages[archetype ?? "SERVICE"];

  return [
    {
      id: "requested_pages",
      stage: 7,
      question: "Which pages should your website have? (Select all that apply)",
      type: "multi_select",
      required: true,
      helpText: "Home and Contact are included by default. Select any others you want.",
      options: pageOptions,
    },
    {
      id: "additional_page_requests",
      stage: 7,
      question: "Any custom pages or specific features you need?",
      type: "textarea",
      required: false,
      placeholder: "e.g. I need a pricing calculator page, or a page for each service location...",
    },
  ];
}

// ---------------------------------------------------------------------------
// Stage 8: CONFIRM (always asked)
// ---------------------------------------------------------------------------

const stage8Questions: InterviewQuestion[] = [
  {
    id: "confirm",
    stage: 8,
    question: "Does this look right?",
    type: "boolean",
    required: true,
  },
  {
    id: "final_notes",
    stage: 8,
    question: "Any final notes or special requests?",
    type: "textarea",
    required: false,
    placeholder: "Anything we missed? Special requests, deadlines, specific pages...",
  },
];

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function getInterviewQuestions(
  stage: number,
  classificationResult?: ClassificationResult | null,
  industryDefaults?: IndustryDefault | null,
  track?: SiteTrack | null
): InterviewQuestion[] {
  const isEcommerce = track === "ECOMMERCE";
  switch (stage) {
    case 1:
      return stage1Questions;
    case 2:
      return isEcommerce ? stage2EcommerceQuestions : stage2WebsiteQuestions;
    case 3:
      return isEcommerce
        ? buildStage3EcommerceQuestions()
        : buildStage3Questions(industryDefaults);
    case 4:
      return buildStage4Questions(classificationResult);
    case 5:
      return buildStage5Questions(classificationResult, track);
    case 6:
      return buildStage6Questions(industryDefaults);
    case 7:
      return buildStage7Questions(classificationResult);
    case 8:
      return stage8Questions;
    default:
      return [];
  }
}

export const TOTAL_STAGES = 8;

export function getStageLabels(track?: SiteTrack | null): Record<number, string> {
  if (track === "ECOMMERCE") {
    return {
      1: "Basics",
      2: "Store Goals",
      3: "Products",
      4: "Story",
      5: "Content",
      6: "Branding",
      7: "Pages",
      8: "Confirm",
    };
  }
  return {
    1: "Basics",
    2: "Goals",
    3: "Services",
    4: "Story",
    5: "Content",
    6: "Branding",
    7: "Pages",
    8: "Confirm",
  };
}

/** @deprecated Use getStageLabels(track) instead */
export const STAGE_LABELS: Record<number, string> = {
  1: "Basics",
  2: "Goals",
  3: "Services",
  4: "Story",
  5: "Content",
  6: "Branding",
  7: "Pages",
  8: "Confirm",
};

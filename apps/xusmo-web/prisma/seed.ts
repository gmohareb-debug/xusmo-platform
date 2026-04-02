// =============================================================================
// XUSMO — Industry Defaults Seed
// Seeds the IndustryDefault table with curated defaults for 30 industries.
// Run: npx tsx prisma/seed.ts
// =============================================================================

import path from "node:path";
import dotenv from "dotenv";

// Load .env.local first, fall back to .env
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { PrismaClient, Archetype } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedThemePool } from "./seeds/theme-pool";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// -----------------------------------------------------------------------------
// Industry definitions
// -----------------------------------------------------------------------------

const industries = [
  // ===========================================================================
  // SERVICE ARCHETYPE (1-12)
  // ===========================================================================

  // 1. Plumbing
  {
    industryCode: "plumbing",
    displayName: "Plumbing",
    category: "trades",
    subNiches: ["residential_plumbing", "commercial_plumbing", "emergency_plumbing", "drain_cleaning"],
    archetype: Archetype.SERVICE,
    keywords: ["plumber", "plumbing", "drain", "pipe", "water heater", "leak repair", "sewer", "faucet", "toilet", "garbage disposal"],
    defaultFeatures: ["emergency_call", "service_area_map", "quote_form", "testimonials", "trust_badges", "click_to_call"],
    defaultServices: [
      { name: "Drain Cleaning", description: "Professional drain cleaning and clog removal for sinks, showers, and main sewer lines." },
      { name: "Water Heater Repair & Installation", description: "Repair, replacement, and new installation of tank and tankless water heaters." },
      { name: "Leak Detection & Repair", description: "Advanced leak detection and fast repair for pipes, fixtures, and slabs." },
      { name: "Sewer Line Services", description: "Sewer line inspection, repair, and replacement using trenchless technology." },
      { name: "Fixture Installation", description: "Installation and repair of faucets, toilets, sinks, and garbage disposals." },
    ],
    sampleTaglines: [
      "Fast, Reliable Plumbing in {City}",
      "{Business Name} — Your Trusted {City} Plumber for {Years}+ Years",
      "24/7 Emergency Plumbing. Call {Business Name} Today.",
    ],
    sampleAbout: "{Business Name} has proudly served {City} and surrounding communities for over {Years} years. As a licensed and insured plumbing company, we handle everything from routine drain cleaning to complex sewer line repairs. Our team of certified plumbers arrives on time, diagnoses the problem quickly, and provides upfront pricing with no hidden fees. Whether it's a midnight emergency or a planned renovation, {Business Name} is the name {City} trusts.",
    defaultQuestions: [
      { question: "Do you offer 24/7 emergency services?", fieldType: "boolean", options: null, required: true },
      { question: "What areas do you serve?", fieldType: "text", options: null, required: true },
      { question: "Are you licensed and insured?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer free estimates?", fieldType: "boolean", options: null, required: false },
      { question: "What types of plumbing do you specialize in?", fieldType: "multiselect", options: ["Residential", "Commercial", "New Construction", "Remodeling"], required: true },
    ],
    defaultHours: { mon: "7:00 AM - 6:00 PM", tue: "7:00 AM - 6:00 PM", wed: "7:00 AM - 6:00 PM", thu: "7:00 AM - 6:00 PM", fri: "7:00 AM - 6:00 PM", sat: "8:00 AM - 2:00 PM", sun: "Emergency Only" },
    commonTrustSignals: ["Licensed & Insured", "24/7 Emergency Service", "Free Estimates", "Upfront Pricing", "Satisfaction Guaranteed"],
    faqLibrary: [
      { question: "How quickly can you respond to an emergency?", answer: "We offer 24/7 emergency service and typically arrive within 60 minutes in our service area." },
      { question: "Do you provide free estimates?", answer: "Yes, we provide free on-site estimates for all non-emergency work. We believe in upfront, transparent pricing." },
      { question: "Are your plumbers licensed?", answer: "Absolutely. All of our plumbers are fully licensed, insured, and undergo continuous training to stay current with industry standards." },
    ],
    primaryColors: ["#1e40af", "#ffffff", "#64748b"],
    imageryThemes: ["technicians_at_work", "tools_and_pipes", "residential_homes", "clean_bathrooms"],
    tone: "professional, reliable, urgent",
    fontPreference: "clean sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_grid", "service_area_map", "emergency_cta", "license_badges"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "Plumber",
    seoKeywords: ["plumber near me", "emergency plumber {City}", "drain cleaning {City}", "water heater repair {City}", "{City} plumbing company"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "service-areas", "gallery", "faq", "reviews"],
    conversionPriority: "phone_calls",
  },

  // 2. HVAC
  {
    industryCode: "hvac",
    displayName: "HVAC",
    category: "trades",
    subNiches: ["residential_hvac", "commercial_hvac", "ac_repair", "heating_repair", "duct_cleaning"],
    archetype: Archetype.SERVICE,
    keywords: ["hvac", "air conditioning", "heating", "furnace", "ac repair", "duct cleaning", "heat pump", "thermostat", "ventilation", "coolant"],
    defaultFeatures: ["emergency_call", "service_area_map", "quote_form", "testimonials", "trust_badges", "click_to_call", "seasonal_promotions"],
    defaultServices: [
      { name: "AC Repair & Maintenance", description: "Fast, reliable air conditioning repair and seasonal tune-ups to keep you cool all summer." },
      { name: "Heating System Repair", description: "Furnace and heat pump diagnostics, repair, and maintenance for year-round comfort." },
      { name: "HVAC Installation", description: "Expert installation of new central air, heat pumps, mini-splits, and furnaces with top-brand equipment." },
      { name: "Duct Cleaning & Sealing", description: "Professional ductwork cleaning, sealing, and insulation to improve air quality and efficiency." },
      { name: "Thermostat & Indoor Air Quality", description: "Smart thermostat installation and indoor air quality solutions including purifiers and humidifiers." },
    ],
    sampleTaglines: [
      "Keeping {City} Comfortable Year-Round",
      "{Business Name} — Trusted HVAC Experts in {City} for {Years}+ Years",
      "Fast AC Repair & Heating Service in {City}. Call Today!",
    ],
    sampleAbout: "{Business Name} has been {City}'s trusted HVAC contractor for over {Years} years. We specialize in heating and cooling installation, repair, and maintenance for homes and businesses. Our NATE-certified technicians deliver fast, honest service with upfront pricing. From emergency AC repair on the hottest day of summer to furnace tune-ups before winter, {Business Name} keeps your family comfortable all year long.",
    defaultQuestions: [
      { question: "Do you offer emergency HVAC service?", fieldType: "boolean", options: null, required: true },
      { question: "What brands do you install and service?", fieldType: "text", options: null, required: false },
      { question: "Do you offer maintenance plans?", fieldType: "boolean", options: null, required: true },
      { question: "What types of systems do you work on?", fieldType: "multiselect", options: ["Central Air", "Heat Pumps", "Furnaces", "Mini-Splits", "Ductless Systems"], required: true },
    ],
    defaultHours: { mon: "7:00 AM - 6:00 PM", tue: "7:00 AM - 6:00 PM", wed: "7:00 AM - 6:00 PM", thu: "7:00 AM - 6:00 PM", fri: "7:00 AM - 6:00 PM", sat: "8:00 AM - 2:00 PM", sun: "Emergency Only" },
    commonTrustSignals: ["NATE Certified", "Licensed & Insured", "24/7 Emergency Service", "Free Estimates", "Financing Available"],
    faqLibrary: [
      { question: "How often should I service my HVAC system?", answer: "We recommend a professional tune-up twice a year — once in spring for AC and once in fall for heating. Regular maintenance extends equipment life and prevents costly breakdowns." },
      { question: "What size system do I need for my home?", answer: "System sizing depends on your home's square footage, insulation, windows, and climate. We perform a Manual J load calculation to recommend the perfect size." },
      { question: "Do you offer financing?", answer: "Yes! We offer flexible financing options with approved credit so you can get the comfort you need now and pay over time." },
    ],
    primaryColors: ["#0369a1", "#f8fafc", "#475569"],
    imageryThemes: ["hvac_units", "comfortable_homes", "technicians", "thermostats"],
    tone: "professional, knowledgeable, trustworthy",
    fontPreference: "clean sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_grid", "service_area_map", "emergency_cta", "license_badges"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "HVACBusiness",
    seoKeywords: ["hvac near me", "ac repair {City}", "furnace repair {City}", "hvac installation {City}", "heating and cooling {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "service-areas", "gallery", "faq", "reviews", "financing"],
    conversionPriority: "phone_calls",
  },

  // 3. Electrical
  {
    industryCode: "electrical",
    displayName: "Electrical",
    category: "trades",
    subNiches: ["residential_electrical", "commercial_electrical", "ev_charger_installation", "panel_upgrades", "lighting"],
    archetype: Archetype.SERVICE,
    keywords: ["electrician", "electrical", "wiring", "panel", "outlet", "circuit breaker", "lighting", "ev charger", "generator", "electrical repair"],
    defaultFeatures: ["emergency_call", "service_area_map", "quote_form", "testimonials", "trust_badges", "click_to_call"],
    defaultServices: [
      { name: "Electrical Repair", description: "Troubleshooting and repair of outlets, switches, circuit breakers, and wiring issues." },
      { name: "Panel Upgrades", description: "Electrical panel upgrades and replacements to meet modern power demands safely." },
      { name: "Lighting Installation", description: "Indoor and outdoor lighting design, installation, and retrofit to LED." },
      { name: "EV Charger Installation", description: "Level 2 electric vehicle charger installation for residential and commercial properties." },
      { name: "Generator Installation", description: "Whole-home and commercial standby generator installation and maintenance." },
      { name: "Ceiling Fan Installation", description: "Expert ceiling fan installation, replacement, and wiring for any room." },
    ],
    sampleTaglines: [
      "Licensed Electricians Serving {City} & Beyond",
      "{Business Name} — Safe, Reliable Electrical Work for {Years}+ Years",
      "From Outlets to Panels — {City}'s Trusted Electrician",
    ],
    sampleAbout: "{Business Name} is a fully licensed and insured electrical contractor serving {City} and surrounding areas for over {Years} years. Our master electricians handle everything from simple outlet repairs to full commercial wiring projects. Safety is our top priority — every job is completed to code and inspected for quality. Whether you need an EV charger installed, a panel upgraded, or emergency electrical repair, {Business Name} delivers expert workmanship you can count on.",
    defaultQuestions: [
      { question: "Do you offer emergency electrical service?", fieldType: "boolean", options: null, required: true },
      { question: "What types of electrical work do you perform?", fieldType: "multiselect", options: ["Residential", "Commercial", "Industrial", "New Construction"], required: true },
      { question: "Are you a licensed master electrician?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer free estimates?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "7:00 AM - 5:00 PM", tue: "7:00 AM - 5:00 PM", wed: "7:00 AM - 5:00 PM", thu: "7:00 AM - 5:00 PM", fri: "7:00 AM - 5:00 PM", sat: "8:00 AM - 1:00 PM", sun: "Closed" },
    commonTrustSignals: ["Licensed Master Electrician", "Fully Insured", "Code-Compliant Work", "Free Estimates", "Satisfaction Guaranteed"],
    faqLibrary: [
      { question: "How do I know if I need a panel upgrade?", answer: "Signs include frequently tripping breakers, flickering lights, a panel over 25 years old, or planning to add major appliances like an EV charger. We offer free panel assessments." },
      { question: "Is it safe to do my own electrical work?", answer: "We strongly advise against DIY electrical work. Improper wiring is a leading cause of house fires. All electrical work should be performed by a licensed electrician and inspected." },
    ],
    primaryColors: ["#eab308", "#1e293b", "#f8fafc"],
    imageryThemes: ["electricians_working", "wiring_panels", "modern_lighting", "residential_exteriors"],
    tone: "professional, safety-focused, dependable",
    fontPreference: "clean sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_grid", "service_area_map", "emergency_cta", "license_badges"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "Electrician",
    seoKeywords: ["electrician near me", "electrical repair {City}", "panel upgrade {City}", "ev charger installation {City}", "licensed electrician {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "service-areas", "gallery", "faq", "reviews"],
    conversionPriority: "phone_calls",
  },

  // 4. Roofing
  {
    industryCode: "roofing",
    displayName: "Roofing",
    category: "trades",
    subNiches: ["residential_roofing", "commercial_roofing", "storm_damage", "roof_repair", "gutter_installation"],
    archetype: Archetype.SERVICE,
    keywords: ["roofer", "roofing", "roof repair", "roof replacement", "shingles", "storm damage", "leak", "gutter", "flashing", "roof inspection"],
    defaultFeatures: ["quote_form", "before_after_gallery", "service_area_map", "testimonials", "trust_badges", "click_to_call", "financing_cta"],
    defaultServices: [
      { name: "Roof Repair", description: "Fast, reliable roof repairs for leaks, missing shingles, storm damage, and flashing issues." },
      { name: "Roof Replacement", description: "Complete roof tear-off and replacement with premium materials and manufacturer warranties." },
      { name: "Storm Damage Restoration", description: "Emergency storm damage assessment and restoration. We work directly with your insurance company." },
      { name: "Gutter Installation & Repair", description: "Seamless gutter installation, repair, and leaf guard systems to protect your home." },
      { name: "Roof Inspection", description: "Comprehensive roof inspections for home buyers, sellers, and routine maintenance." },
    ],
    sampleTaglines: [
      "Protecting {City} Homes — One Roof at a Time",
      "{Business Name} — {City}'s Most Trusted Roofing Contractor for {Years}+ Years",
      "Storm Damage? Free Inspection. Call {Business Name} Now.",
    ],
    sampleAbout: "For over {Years} years, {Business Name} has been {City}'s go-to roofing contractor. We specialize in roof repair, replacement, and storm damage restoration for residential and commercial properties. As a locally owned and operated company, we take pride in treating every roof like it's our own. We use only premium materials, offer industry-leading warranties, and work directly with insurance companies to make the claims process stress-free. Trust {Business Name} to keep a solid roof over your head.",
    defaultQuestions: [
      { question: "What roofing services do you need?", fieldType: "select", options: ["Repair", "Full Replacement", "Storm Damage", "Inspection", "Gutters"], required: true },
      { question: "Do you work with insurance companies?", fieldType: "boolean", options: null, required: true },
      { question: "What roofing materials do you offer?", fieldType: "multiselect", options: ["Asphalt Shingles", "Metal", "Tile", "Flat/TPO", "Cedar Shake"], required: true },
      { question: "Do you offer financing?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "7:00 AM - 5:00 PM", tue: "7:00 AM - 5:00 PM", wed: "7:00 AM - 5:00 PM", thu: "7:00 AM - 5:00 PM", fri: "7:00 AM - 5:00 PM", sat: "8:00 AM - 12:00 PM", sun: "Closed" },
    commonTrustSignals: ["Licensed & Insured", "Free Inspections", "Manufacturer Certified", "Insurance Claims Assistance", "Workmanship Warranty"],
    faqLibrary: [
      { question: "How long does a roof replacement take?", answer: "Most residential roof replacements are completed in 1-3 days, depending on the size of the roof and weather conditions." },
      { question: "Will you work with my insurance company?", answer: "Yes! We work directly with all major insurance carriers. We'll handle the paperwork and meet with your adjuster to ensure your claim is properly documented." },
      { question: "How do I know if I need a repair or a full replacement?", answer: "We offer free inspections. Generally, if your roof is under 15 years old with localized damage, a repair is sufficient. If it's older with widespread issues, replacement is usually more cost-effective." },
    ],
    primaryColors: ["#92400e", "#fef3c7", "#1e293b"],
    imageryThemes: ["roofing_crews", "completed_roofs", "before_after", "storm_damage", "residential_homes"],
    tone: "dependable, straightforward, protective",
    fontPreference: "strong sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_grid", "gallery", "quote_form", "license_badges"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "RoofingContractor",
    seoKeywords: ["roofer near me", "roof repair {City}", "roof replacement {City}", "storm damage roofing {City}", "roofing contractor {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "gallery", "service-areas", "faq", "reviews", "financing"],
    conversionPriority: "phone_calls",
  },

  // 5. Landscaping
  {
    industryCode: "landscaping",
    displayName: "Landscaping",
    category: "trades",
    subNiches: ["residential_landscaping", "commercial_landscaping", "lawn_care", "hardscaping", "irrigation", "tree_service"],
    archetype: Archetype.SERVICE,
    keywords: ["landscaping", "landscaper", "lawn care", "hardscaping", "patio", "retaining wall", "irrigation", "tree trimming", "sod", "mulch", "garden design"],
    defaultFeatures: ["quote_form", "before_after_gallery", "service_area_map", "testimonials", "seasonal_promotions", "click_to_call"],
    defaultServices: [
      { name: "Landscape Design & Installation", description: "Custom landscape design and installation including plantings, flower beds, and garden features." },
      { name: "Lawn Care & Maintenance", description: "Weekly mowing, edging, fertilization, weed control, and seasonal clean-ups." },
      { name: "Hardscaping", description: "Patios, walkways, retaining walls, fire pits, and outdoor living spaces built to last." },
      { name: "Irrigation Systems", description: "Sprinkler system design, installation, repair, and winterization." },
      { name: "Tree & Shrub Care", description: "Tree trimming, pruning, removal, and shrub maintenance for a healthy, beautiful yard." },
    ],
    sampleTaglines: [
      "Transforming {City} Yards Into Outdoor Living Spaces",
      "{Business Name} — {City}'s Premier Landscaping Company for {Years}+ Years",
      "From Lawn Care to Dream Patios. Get a Free Quote Today!",
    ],
    sampleAbout: "{Business Name} has been transforming properties across {City} for over {Years} years. From routine lawn maintenance to complete landscape overhauls and custom hardscaping, our team brings creativity and craftsmanship to every project. We believe your outdoor space should be an extension of your home — a place to relax, entertain, and enjoy. Let {Business Name} bring your vision to life with a free design consultation.",
    defaultQuestions: [
      { question: "What landscaping services are you looking for?", fieldType: "multiselect", options: ["Lawn Care", "Landscape Design", "Hardscaping", "Irrigation", "Tree Service", "Clean-up"], required: true },
      { question: "Is this for residential or commercial property?", fieldType: "select", options: ["Residential", "Commercial", "Both"], required: true },
      { question: "Do you offer recurring maintenance plans?", fieldType: "boolean", options: null, required: true },
      { question: "What is your approximate yard/property size?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "7:00 AM - 5:00 PM", tue: "7:00 AM - 5:00 PM", wed: "7:00 AM - 5:00 PM", thu: "7:00 AM - 5:00 PM", fri: "7:00 AM - 5:00 PM", sat: "8:00 AM - 2:00 PM", sun: "Closed" },
    commonTrustSignals: ["Licensed & Insured", "Free Design Consultations", "Locally Owned & Operated", "Satisfaction Guaranteed"],
    faqLibrary: [
      { question: "When is the best time to start a landscaping project?", answer: "Spring and fall are ideal for planting. Hardscaping can be done year-round in most climates. We recommend booking early as our schedule fills quickly during peak seasons." },
      { question: "Do you offer maintenance after installation?", answer: "Yes! We offer weekly, bi-weekly, and monthly maintenance plans to keep your landscape looking its best year-round." },
    ],
    primaryColors: ["#15803d", "#f0fdf4", "#365314"],
    imageryThemes: ["lush_gardens", "patios_and_hardscapes", "lawn_care", "before_after", "outdoor_living"],
    tone: "creative, nature-focused, approachable",
    fontPreference: "clean sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["services_grid", "gallery", "quote_form", "service_area_map"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "LandscapingBusiness",
    seoKeywords: ["landscaping near me", "landscaper {City}", "lawn care {City}", "hardscaping {City}", "patio installation {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "gallery", "service-areas", "faq", "reviews"],
    conversionPriority: "quote_requests",
  },

  // 6. Cleaning Service
  {
    industryCode: "cleaning_service",
    displayName: "Cleaning Service",
    category: "home_services",
    subNiches: ["residential_cleaning", "commercial_cleaning", "deep_cleaning", "move_in_move_out", "office_cleaning", "post_construction"],
    archetype: Archetype.SERVICE,
    keywords: ["cleaning service", "house cleaning", "maid service", "office cleaning", "deep cleaning", "janitorial", "commercial cleaning", "move out cleaning", "carpet cleaning"],
    defaultFeatures: ["online_booking", "quote_form", "testimonials", "trust_badges", "click_to_call", "checklist_display", "recurring_service_cta"],
    defaultServices: [
      { name: "Residential Cleaning", description: "Thorough house cleaning including dusting, vacuuming, mopping, kitchen, and bathroom sanitization." },
      { name: "Deep Cleaning", description: "Intensive top-to-bottom cleaning for homes that need extra attention — baseboards, appliances, and more." },
      { name: "Move-In/Move-Out Cleaning", description: "Comprehensive cleaning for tenants, homeowners, and property managers during transitions." },
      { name: "Commercial & Office Cleaning", description: "Reliable janitorial services for offices, retail spaces, and commercial properties." },
      { name: "Recurring Maintenance Cleaning", description: "Scheduled weekly, bi-weekly, or monthly cleaning to keep your space consistently spotless." },
    ],
    sampleTaglines: [
      "A Spotless Home in {City} — Guaranteed",
      "{Business Name} — Trusted Cleaning Professionals for {Years}+ Years",
      "Book Online in 60 Seconds. {City}'s Top-Rated Cleaning Service.",
    ],
    sampleAbout: "{Business Name} has been making homes and offices sparkle across {City} for over {Years} years. Our bonded and insured cleaning professionals use eco-friendly products and follow detailed checklists to ensure nothing is missed. Whether you need a one-time deep clean or recurring weekly service, we make booking easy and deliver results you can see and feel. Join thousands of happy customers who trust {Business Name} to keep their spaces spotless.",
    defaultQuestions: [
      { question: "What type of cleaning do you need?", fieldType: "select", options: ["Residential", "Commercial", "Deep Cleaning", "Move-In/Move-Out", "Post-Construction"], required: true },
      { question: "How often do you need cleaning?", fieldType: "select", options: ["One-Time", "Weekly", "Bi-Weekly", "Monthly"], required: true },
      { question: "How many bedrooms/bathrooms?", fieldType: "text", options: null, required: false },
      { question: "Do you use eco-friendly products?", fieldType: "boolean", options: null, required: false },
      { question: "Do you offer online booking?", fieldType: "boolean", options: null, required: true },
    ],
    defaultHours: { mon: "7:00 AM - 6:00 PM", tue: "7:00 AM - 6:00 PM", wed: "7:00 AM - 6:00 PM", thu: "7:00 AM - 6:00 PM", fri: "7:00 AM - 6:00 PM", sat: "8:00 AM - 4:00 PM", sun: "Closed" },
    commonTrustSignals: ["Bonded & Insured", "Background-Checked Staff", "Eco-Friendly Products", "Satisfaction Guaranteed", "Online Booking"],
    faqLibrary: [
      { question: "What's included in a standard cleaning?", answer: "Our standard clean covers all rooms: dusting, vacuuming, mopping, kitchen counters and appliances, bathroom sanitization, trash removal, and general tidying. Check our detailed checklist on the Services page." },
      { question: "Do I need to provide cleaning supplies?", answer: "No! We bring all our own professional-grade, eco-friendly supplies and equipment. If you have preferred products, we're happy to use those too." },
      { question: "Are your cleaners background-checked?", answer: "Absolutely. Every team member undergoes a thorough background check and is fully bonded and insured for your peace of mind." },
    ],
    primaryColors: ["#0891b2", "#ecfeff", "#155e75"],
    imageryThemes: ["clean_interiors", "cleaning_professionals", "sparkling_kitchens", "organized_spaces"],
    tone: "friendly, trustworthy, professional",
    fontPreference: "rounded sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "quote_form", "service_area_map", "testimonials"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "HousekeepingService",
    seoKeywords: ["cleaning service near me", "house cleaning {City}", "maid service {City}", "office cleaning {City}", "deep cleaning {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "pricing", "checklist", "faq", "reviews", "booking"],
    conversionPriority: "online_bookings",
  },

  // 7. Painting
  {
    industryCode: "painting",
    displayName: "Painting",
    category: "trades",
    subNiches: ["residential_painting", "commercial_painting", "interior_painting", "exterior_painting", "cabinet_painting", "staining"],
    archetype: Archetype.SERVICE,
    keywords: ["painter", "painting", "house painting", "interior painting", "exterior painting", "cabinet painting", "staining", "drywall repair", "color consultation", "commercial painting"],
    defaultFeatures: ["quote_form", "before_after_gallery", "color_visualizer_link", "testimonials", "trust_badges", "click_to_call", "service_area_map"],
    defaultServices: [
      { name: "Interior Painting", description: "Expert interior painting for walls, ceilings, trim, and accent walls with premium paints and flawless finishes." },
      { name: "Exterior Painting", description: "Weather-resistant exterior painting and staining to protect and beautify your home or business." },
      { name: "Cabinet Refinishing", description: "Transform your kitchen with professional cabinet painting and refinishing at a fraction of replacement cost." },
      { name: "Commercial Painting", description: "Minimize disruption with after-hours commercial painting for offices, retail, and multi-family properties." },
      { name: "Drywall Repair & Prep", description: "Complete drywall patching, texture matching, and surface preparation for a perfect paint job." },
    ],
    sampleTaglines: [
      "Quality Painting That Transforms {City} Homes",
      "{Business Name} — {City}'s Trusted Painters for {Years}+ Years",
      "Free Color Consultation & Estimate. Call {Business Name} Today!",
    ],
    sampleAbout: "{Business Name} has been bringing color and life to homes and businesses across {City} for over {Years} years. Our skilled painters take pride in meticulous prep work, clean lines, and lasting finishes. We use only premium paints from trusted brands and offer free color consultations to help you find the perfect palette. From a single accent wall to a full exterior repaint, {Business Name} delivers results that speak for themselves.",
    defaultQuestions: [
      { question: "What type of painting do you need?", fieldType: "select", options: ["Interior", "Exterior", "Both", "Cabinets", "Commercial"], required: true },
      { question: "How many rooms or what square footage?", fieldType: "text", options: null, required: false },
      { question: "Do you offer color consultations?", fieldType: "boolean", options: null, required: false },
      { question: "What paint brands do you use?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "7:00 AM - 5:00 PM", tue: "7:00 AM - 5:00 PM", wed: "7:00 AM - 5:00 PM", thu: "7:00 AM - 5:00 PM", fri: "7:00 AM - 5:00 PM", sat: "8:00 AM - 1:00 PM", sun: "Closed" },
    commonTrustSignals: ["Licensed & Insured", "Free Estimates", "Premium Paints Only", "Clean & Respectful Crews", "Satisfaction Guaranteed"],
    faqLibrary: [
      { question: "How long does it take to paint a room?", answer: "A typical bedroom takes 1 day including prep and two coats. Larger rooms or rooms needing extensive prep may take 2 days. We always provide a timeline upfront." },
      { question: "Do I need to move my furniture?", answer: "No — we carefully move and cover all furniture and protect your floors with drop cloths. We leave your space clean and tidy when we're done." },
      { question: "What brands of paint do you use?", answer: "We use premium paints from Sherwin-Williams, Benjamin Moore, and other top brands. We're happy to accommodate specific brand requests." },
    ],
    primaryColors: ["#7c3aed", "#faf5ff", "#4c1d95"],
    imageryThemes: ["freshly_painted_rooms", "painters_at_work", "before_after", "color_swatches", "beautiful_homes"],
    tone: "creative, detail-oriented, clean",
    fontPreference: "clean sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["services_grid", "gallery", "quote_form", "service_area_map"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "HousePainter",
    seoKeywords: ["painter near me", "house painting {City}", "interior painter {City}", "exterior painting {City}", "cabinet painting {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "gallery", "service-areas", "faq", "reviews"],
    conversionPriority: "quote_requests",
  },

  // 8. Law Firm (regulated)
  {
    industryCode: "law_firm",
    displayName: "Law Firm",
    category: "professional_services",
    subNiches: ["personal_injury", "family_law", "criminal_defense", "estate_planning", "business_law", "immigration", "real_estate_law"],
    archetype: Archetype.SERVICE,
    keywords: ["lawyer", "attorney", "law firm", "legal services", "personal injury", "family law", "criminal defense", "estate planning", "legal consultation", "litigation"],
    defaultFeatures: ["consultation_form", "practice_areas", "attorney_profiles", "case_results", "testimonials", "trust_badges", "click_to_call", "live_chat"],
    defaultServices: [
      { name: "Personal Injury", description: "Aggressive representation for auto accidents, slip and fall, medical malpractice, and wrongful death cases. No fee unless we win." },
      { name: "Family Law", description: "Compassionate legal guidance for divorce, child custody, support, adoption, and prenuptial agreements." },
      { name: "Criminal Defense", description: "Experienced defense attorneys for misdemeanors, felonies, DUI, drug charges, and white-collar crimes." },
      { name: "Estate Planning", description: "Wills, trusts, powers of attorney, and probate administration to protect your family's future." },
      { name: "Business Law", description: "Entity formation, contracts, employment law, and business litigation for companies of all sizes." },
    ],
    sampleTaglines: [
      "Experienced Legal Counsel in {City}",
      "{Business Name} — Trusted Attorneys Serving {City} for {Years}+ Years",
      "Your Rights. Our Fight. Schedule a Free Consultation.",
    ],
    sampleAbout: "Founded {Years} years ago, {Business Name} is a respected law firm serving clients throughout {City} and the surrounding region. Our attorneys bring decades of combined experience to every case, providing strategic, personalized legal counsel tailored to each client's unique situation. We are committed to achieving the best possible outcomes through diligent preparation, skilled negotiation, and, when necessary, aggressive courtroom advocacy. At {Business Name}, every client is treated with the dignity, respect, and attention their case deserves.",
    defaultQuestions: [
      { question: "What practice areas do you focus on?", fieldType: "multiselect", options: ["Personal Injury", "Family Law", "Criminal Defense", "Estate Planning", "Business Law", "Immigration", "Real Estate"], required: true },
      { question: "Do you offer free initial consultations?", fieldType: "boolean", options: null, required: true },
      { question: "How many attorneys are at your firm?", fieldType: "text", options: null, required: false },
      { question: "Do you handle cases on a contingency basis?", fieldType: "boolean", options: null, required: false },
      { question: "What jurisdictions do you practice in?", fieldType: "text", options: null, required: true },
    ],
    defaultHours: { mon: "8:30 AM - 5:30 PM", tue: "8:30 AM - 5:30 PM", wed: "8:30 AM - 5:30 PM", thu: "8:30 AM - 5:30 PM", fri: "8:30 AM - 5:30 PM", sat: "By Appointment", sun: "Closed" },
    commonTrustSignals: ["Free Consultation", "No Fee Unless We Win", "Bar Association Member", "Super Lawyers Rated", "AV Martindale-Hubbell Rating"],
    faqLibrary: [
      { question: "How much does a consultation cost?", answer: "We offer free initial consultations for most practice areas. This allows us to evaluate your case and discuss your legal options with no obligation." },
      { question: "How long will my case take?", answer: "Every case is unique. Simple matters may resolve in weeks, while complex litigation can take months or years. We provide realistic timelines during your consultation and keep you informed at every stage." },
      { question: "Do I have to go to court?", answer: "Not necessarily. Many cases are resolved through negotiation or mediation. However, if a fair settlement cannot be reached, we are fully prepared to advocate for you in court." },
    ],
    primaryColors: ["#1e3a5f", "#c9a84c", "#f8f6f0"],
    imageryThemes: ["law_office", "courthouse", "attorney_portraits", "legal_books", "scales_of_justice"],
    tone: "authoritative, trustworthy, empathetic",
    fontPreference: "serif",
    layoutDensity: "text-rich",
    requiredSections: ["practice_areas", "attorney_bios", "consultation_form", "legal_disclaimer"],
    isRegulated: true,
    defaultDisclaimers: [
      "This website is for informational purposes only and does not constitute legal advice.",
      "No attorney-client relationship is formed by your use of this website or by submitting a contact form.",
      "Past results do not guarantee future outcomes. Each case is unique.",
      "Licensed to practice in the state jurisdiction(s) listed. Contact us for specific jurisdictional inquiries.",
    ],
    schemaType: "LegalService",
    seoKeywords: ["lawyer near me", "attorney {City}", "law firm {City}", "personal injury lawyer {City}", "family lawyer {City}"],
    requiredPages: ["home", "practice-areas", "contact"],
    optionalPages: ["about", "attorneys", "case-results", "testimonials", "faq", "blog"],
    conversionPriority: "consultation_requests",
  },

  // 9. Dental Clinic (regulated)
  {
    industryCode: "dental_clinic",
    displayName: "Dental Clinic",
    category: "healthcare",
    subNiches: ["general_dentistry", "cosmetic_dentistry", "pediatric_dentistry", "orthodontics", "oral_surgery", "emergency_dental"],
    archetype: Archetype.SERVICE,
    keywords: ["dentist", "dental", "teeth cleaning", "dental implants", "cosmetic dentistry", "braces", "teeth whitening", "dental clinic", "oral health", "root canal"],
    defaultFeatures: ["appointment_booking", "new_patient_form", "insurance_checker", "testimonials", "trust_badges", "click_to_call", "before_after_gallery", "team_profiles"],
    defaultServices: [
      { name: "General Dentistry", description: "Comprehensive dental exams, cleanings, fillings, and preventive care for the whole family." },
      { name: "Cosmetic Dentistry", description: "Teeth whitening, veneers, bonding, and smile makeovers to give you the confidence to shine." },
      { name: "Dental Implants", description: "Permanent tooth replacement with state-of-the-art dental implants that look and feel natural." },
      { name: "Orthodontics", description: "Traditional braces, Invisalign, and clear aligners for straighter, healthier smiles at any age." },
      { name: "Emergency Dental Care", description: "Same-day appointments for dental emergencies including toothaches, broken teeth, and infections." },
    ],
    sampleTaglines: [
      "Gentle, Caring Dentistry in {City}",
      "{Business Name} — Helping {City} Smile for {Years}+ Years",
      "Your Smile Is Our Passion. Book Your Visit Today!",
    ],
    sampleAbout: "At {Business Name}, we've been creating healthy, beautiful smiles across {City} for over {Years} years. Our warm, patient-focused approach makes dental visits comfortable for patients of all ages. Using the latest technology — including digital X-rays, intraoral cameras, and same-day crowns — our team delivers exceptional care in a relaxing environment. We accept most insurance plans and offer flexible financing because everyone deserves a smile they love.",
    defaultQuestions: [
      { question: "What dental services do you offer?", fieldType: "multiselect", options: ["General/Preventive", "Cosmetic", "Implants", "Orthodontics", "Pediatric", "Emergency"], required: true },
      { question: "Do you accept dental insurance?", fieldType: "boolean", options: null, required: true },
      { question: "Are you accepting new patients?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer sedation or anxiety-free options?", fieldType: "boolean", options: null, required: false },
      { question: "How many dentists are at your practice?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "8:00 AM - 5:00 PM", tue: "8:00 AM - 5:00 PM", wed: "8:00 AM - 5:00 PM", thu: "8:00 AM - 5:00 PM", fri: "8:00 AM - 3:00 PM", sat: "Closed", sun: "Closed" },
    commonTrustSignals: ["Accepting New Patients", "Most Insurance Accepted", "ADA Member", "State-of-the-Art Technology", "Gentle & Caring Team"],
    faqLibrary: [
      { question: "How often should I visit the dentist?", answer: "We recommend a check-up and professional cleaning every six months. Patients with gum disease or other conditions may need more frequent visits." },
      { question: "Do you accept my insurance?", answer: "We accept most major dental insurance plans. Contact our office with your insurance information and we'll verify your coverage before your appointment." },
      { question: "What if I'm nervous about visiting the dentist?", answer: "You're not alone — dental anxiety is very common. We offer a gentle, judgment-free environment and sedation options to ensure your comfort throughout every visit." },
    ],
    primaryColors: ["#0ea5e9", "#f0f9ff", "#0c4a6e"],
    imageryThemes: ["smiling_patients", "dental_office", "dental_team", "modern_equipment", "family_dentistry"],
    tone: "warm, reassuring, professional",
    fontPreference: "rounded sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "appointment_cta", "insurance_info", "hours_display"],
    isRegulated: true,
    defaultDisclaimers: [
      "This website is for informational purposes only and does not constitute medical advice.",
      "Individual results may vary. Consult with our dental professionals for personalized treatment recommendations.",
      "Images shown may include stock photography and do not represent guaranteed outcomes.",
    ],
    schemaType: "Dentist",
    seoKeywords: ["dentist near me", "dental clinic {City}", "teeth cleaning {City}", "cosmetic dentist {City}", "emergency dentist {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "team", "new-patients", "gallery", "faq", "reviews", "insurance"],
    conversionPriority: "appointment_bookings",
  },

  // 10. Tutoring
  {
    industryCode: "tutoring",
    displayName: "Tutoring",
    category: "education",
    subNiches: ["academic_tutoring", "test_prep", "language_tutoring", "stem_tutoring", "online_tutoring", "college_prep"],
    archetype: Archetype.SERVICE,
    keywords: ["tutor", "tutoring", "math tutor", "test prep", "SAT prep", "ACT prep", "homework help", "online tutoring", "reading tutor", "science tutor"],
    defaultFeatures: ["booking_form", "subject_list", "tutor_profiles", "testimonials", "pricing_table", "click_to_call", "free_assessment_cta"],
    defaultServices: [
      { name: "Math Tutoring", description: "One-on-one math tutoring from elementary arithmetic through calculus, statistics, and beyond." },
      { name: "Test Prep (SAT/ACT/GRE)", description: "Structured test preparation with proven strategies, practice tests, and score improvement guarantees." },
      { name: "Reading & Writing", description: "Reading comprehension, essay writing, grammar, and vocabulary building for all grade levels." },
      { name: "Science Tutoring", description: "Expert tutoring in biology, chemistry, physics, and environmental science." },
      { name: "Online Tutoring", description: "Flexible online sessions via video with screen sharing, digital whiteboards, and recorded lessons." },
    ],
    sampleTaglines: [
      "Helping {City} Students Reach Their Full Potential",
      "{Business Name} — Expert Tutors, Proven Results for {Years}+ Years",
      "Better Grades Start Here. Book a Free Assessment!",
    ],
    sampleAbout: "{Business Name} has been helping students in {City} achieve academic success for over {Years} years. Our experienced tutors create personalized learning plans that target each student's unique strengths and challenges. Whether your child needs help catching up, staying on track, or getting ahead, our one-on-one and small-group sessions deliver measurable results. We offer both in-person and online options so learning fits your family's schedule.",
    defaultQuestions: [
      { question: "What subjects do you offer?", fieldType: "multiselect", options: ["Math", "Science", "Reading/Writing", "Test Prep", "Languages", "Computer Science"], required: true },
      { question: "What grade levels do you serve?", fieldType: "multiselect", options: ["Elementary (K-5)", "Middle School (6-8)", "High School (9-12)", "College", "Adult"], required: true },
      { question: "Do you offer online tutoring?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer a free initial assessment?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "3:00 PM - 8:00 PM", tue: "3:00 PM - 8:00 PM", wed: "3:00 PM - 8:00 PM", thu: "3:00 PM - 8:00 PM", fri: "3:00 PM - 7:00 PM", sat: "9:00 AM - 3:00 PM", sun: "Closed" },
    commonTrustSignals: ["Free Assessment", "Certified Teachers", "Proven Score Improvement", "Personalized Learning Plans", "Flexible Scheduling"],
    faqLibrary: [
      { question: "How do you match students with tutors?", answer: "We consider the student's subject needs, learning style, grade level, and personality to pair them with the best-fit tutor. We're happy to reassign if the match isn't perfect." },
      { question: "How many sessions per week do you recommend?", answer: "Most students see the best results with 1-2 sessions per week. For test prep or intensive catch-up, we may recommend 2-3 sessions during critical periods." },
    ],
    primaryColors: ["#f59e0b", "#fffbeb", "#78350f"],
    imageryThemes: ["students_learning", "tutor_sessions", "books_and_study", "happy_students", "classroom"],
    tone: "encouraging, supportive, knowledgeable",
    fontPreference: "friendly sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["class_schedule", "instructor_bios", "enrollment_form", "testimonials"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "EducationalOrganization",
    seoKeywords: ["tutor near me", "tutoring {City}", "math tutor {City}", "SAT prep {City}", "online tutoring {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "tutors", "pricing", "faq", "reviews", "resources"],
    conversionPriority: "consultation_requests",
  },

  // 11. Consulting
  {
    industryCode: "consulting",
    displayName: "Consulting",
    category: "professional_services",
    subNiches: ["management_consulting", "it_consulting", "marketing_consulting", "hr_consulting", "strategy_consulting", "operations_consulting"],
    archetype: Archetype.SERVICE,
    keywords: ["consultant", "consulting", "business consulting", "management consulting", "strategy", "advisory", "business growth", "operational efficiency", "digital transformation", "change management"],
    defaultFeatures: ["consultation_form", "case_studies", "testimonials", "thought_leadership", "trust_badges", "team_profiles", "results_metrics"],
    defaultServices: [
      { name: "Strategy Consulting", description: "Strategic planning, market analysis, and growth roadmaps that align your business goals with actionable initiatives." },
      { name: "Operational Efficiency", description: "Process optimization, workflow redesign, and productivity improvement to reduce costs and increase output." },
      { name: "Digital Transformation", description: "Technology strategy, system selection, and implementation guidance to modernize your operations." },
      { name: "Change Management", description: "Organizational change planning, stakeholder alignment, and adoption strategies for smooth transitions." },
      { name: "Leadership & Team Development", description: "Executive coaching, team workshops, and leadership development programs that build high-performing organizations." },
    ],
    sampleTaglines: [
      "Strategic Consulting for {City} Businesses",
      "{Business Name} — Driving Growth & Results for {Years}+ Years",
      "Expert Guidance. Measurable Impact. Let's Talk Strategy.",
    ],
    sampleAbout: "For over {Years} years, {Business Name} has partnered with businesses across {City} to solve complex challenges and unlock growth. Our consultants bring deep industry expertise and a results-driven methodology to every engagement. We don't believe in one-size-fits-all — every strategy is custom-built for your unique market, team, and goals. From startups seeking direction to established companies pursuing transformation, {Business Name} delivers the clarity and frameworks you need to move forward with confidence.",
    defaultQuestions: [
      { question: "What areas of consulting do you focus on?", fieldType: "multiselect", options: ["Strategy", "Operations", "Marketing", "Technology", "HR/People", "Finance"], required: true },
      { question: "What types of clients do you serve?", fieldType: "multiselect", options: ["Startups", "Small Business", "Mid-Market", "Enterprise", "Non-Profit"], required: true },
      { question: "Do you offer a free discovery call?", fieldType: "boolean", options: null, required: true },
      { question: "What industries have you worked in?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "9:00 AM - 5:00 PM", tue: "9:00 AM - 5:00 PM", wed: "9:00 AM - 5:00 PM", thu: "9:00 AM - 5:00 PM", fri: "9:00 AM - 5:00 PM", sat: "Closed", sun: "Closed" },
    commonTrustSignals: ["Free Discovery Call", "Proven Track Record", "Industry-Specific Expertise", "Measurable ROI", "Confidential & Professional"],
    faqLibrary: [
      { question: "How long does a typical engagement last?", answer: "Engagements range from focused 2-4 week assessments to ongoing advisory relationships spanning 6-12 months. We scope every project based on your specific needs and budget." },
      { question: "What makes your approach different?", answer: "We combine deep industry knowledge with a practical, implementation-focused methodology. We don't just deliver a report — we work alongside your team to execute the strategy and measure results." },
    ],
    primaryColors: ["#1e293b", "#3b82f6", "#f1f5f9"],
    imageryThemes: ["business_meetings", "strategy_sessions", "professional_office", "data_charts", "handshakes"],
    tone: "authoritative, strategic, results-driven",
    fontPreference: "modern sans-serif",
    layoutDensity: "text-rich",
    requiredSections: ["services_list", "consultation_form", "credentials_badges", "case_studies"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "ConsultingBusiness",
    seoKeywords: ["business consultant near me", "consulting firm {City}", "management consulting {City}", "strategy consultant {City}", "business advisor {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "team", "case-studies", "insights", "faq"],
    conversionPriority: "consultation_requests",
  },

  // 12. Accounting (regulated)
  {
    industryCode: "accounting",
    displayName: "Accounting",
    category: "professional_services",
    subNiches: ["tax_preparation", "bookkeeping", "small_business_accounting", "payroll", "audit", "financial_planning", "cpa_services"],
    archetype: Archetype.SERVICE,
    keywords: ["accountant", "accounting", "CPA", "tax preparation", "bookkeeping", "payroll", "tax planning", "audit", "financial statements", "small business accounting"],
    defaultFeatures: ["consultation_form", "service_list", "client_portal_link", "testimonials", "trust_badges", "team_profiles", "tax_deadline_banner"],
    defaultServices: [
      { name: "Tax Preparation & Planning", description: "Individual and business tax preparation with proactive planning strategies to minimize your tax burden legally." },
      { name: "Bookkeeping", description: "Monthly bookkeeping, bank reconciliation, and financial reporting so you always know where your business stands." },
      { name: "Payroll Services", description: "Full-service payroll processing, tax filings, W-2s, 1099s, and compliance management." },
      { name: "Small Business Accounting", description: "Complete accounting solutions for small businesses including setup, reporting, budgeting, and CFO advisory." },
      { name: "Audit & Assurance", description: "Financial audits, reviews, and compilations performed with thoroughness and integrity." },
    ],
    sampleTaglines: [
      "Trusted Accounting & Tax Services in {City}",
      "{Business Name} — Your {City} CPA Firm for {Years}+ Years",
      "Tax Season or Year-Round — We've Got Your Numbers Covered.",
    ],
    sampleAbout: "{Business Name} is a full-service accounting firm that has served individuals and businesses across {City} for over {Years} years. Our team of Certified Public Accountants brings expertise, accuracy, and a personal touch to every engagement. We go beyond compliance — we're proactive advisors who help you make smarter financial decisions, reduce your tax liability, and grow your business. From tax season to year-round bookkeeping, {Business Name} is the financial partner you can rely on.",
    defaultQuestions: [
      { question: "What accounting services do you need?", fieldType: "multiselect", options: ["Tax Preparation", "Bookkeeping", "Payroll", "Small Business Accounting", "Audit", "Financial Planning"], required: true },
      { question: "Are you a CPA firm?", fieldType: "boolean", options: null, required: true },
      { question: "Do you serve individuals, businesses, or both?", fieldType: "select", options: ["Individuals", "Businesses", "Both"], required: true },
      { question: "Do you offer a free initial consultation?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer a client portal for document sharing?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "8:30 AM - 5:30 PM", tue: "8:30 AM - 5:30 PM", wed: "8:30 AM - 5:30 PM", thu: "8:30 AM - 5:30 PM", fri: "8:30 AM - 5:00 PM", sat: "By Appointment (Tax Season)", sun: "Closed" },
    commonTrustSignals: ["Certified Public Accountants", "IRS Enrolled Agents", "QuickBooks ProAdvisor", "Free Initial Consultation", "Secure Client Portal"],
    faqLibrary: [
      { question: "When should I file my taxes?", answer: "Individual tax returns are due April 15. Business returns vary by entity type — S-Corps and partnerships are due March 15, while C-Corps are due April 15. We can file extensions if needed." },
      { question: "How much does tax preparation cost?", answer: "Fees depend on the complexity of your return. Simple individual returns start at a competitive rate, while business returns are quoted based on scope. We provide a clear quote before beginning any work." },
      { question: "Can you help me catch up on back taxes?", answer: "Absolutely. We help clients resolve back taxes, respond to IRS notices, and set up payment plans. The sooner you act, the more options you'll have." },
    ],
    primaryColors: ["#166534", "#f0fdf4", "#14532d"],
    imageryThemes: ["professional_office", "financial_documents", "calculators", "team_portraits", "client_meetings"],
    tone: "professional, precise, trustworthy",
    fontPreference: "clean sans-serif",
    layoutDensity: "text-rich",
    requiredSections: ["services_list", "consultation_form", "credentials_badges"],
    isRegulated: true,
    defaultDisclaimers: [
      "This website is for informational purposes only and does not constitute financial, tax, or legal advice.",
      "Consult with a qualified CPA or tax professional regarding your specific financial situation.",
      "Tax laws and regulations change frequently. Information on this site may not reflect the most current updates.",
    ],
    schemaType: "AccountingService",
    seoKeywords: ["accountant near me", "CPA {City}", "tax preparation {City}", "bookkeeping {City}", "small business accountant {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "team", "resources", "faq", "reviews", "client-portal"],
    conversionPriority: "consultation_requests",
  },

  // ===========================================================================
  // VENUE ARCHETYPE (13-20)
  // ===========================================================================

  // 13. Restaurant / Café
  {
    industryCode: "restaurant",
    displayName: "Restaurant / Café",
    category: "food_beverage",
    subNiches: ["fine_dining", "casual_dining", "cafe", "fast_casual", "bakery", "food_truck", "brunch_spot"],
    archetype: Archetype.VENUE,
    keywords: ["restaurant", "cafe", "dining", "food", "menu", "catering", "brunch", "dinner", "takeout", "delivery", "reservations"],
    defaultFeatures: ["menu_display", "reservation_widget", "hours_display", "gallery", "testimonials", "click_to_call", "online_ordering_link", "events_section"],
    defaultServices: [
      { name: "Dine-In", description: "A welcoming atmosphere with carefully crafted dishes made from fresh, locally sourced ingredients." },
      { name: "Takeout & Delivery", description: "Enjoy our full menu from the comfort of home. Order online or by phone for pickup or delivery." },
      { name: "Catering", description: "Full-service catering for corporate events, weddings, private parties, and special occasions." },
      { name: "Private Events", description: "Host your next celebration in our private dining room with customized menus and dedicated service." },
      { name: "Weekend Brunch", description: "Join us every Saturday and Sunday for our signature brunch featuring house-made pastries and craft cocktails." },
    ],
    sampleTaglines: [
      "A Taste of {City} — Fresh, Local, Unforgettable",
      "{Business Name} — {City}'s Favorite Table for {Years}+ Years",
      "Farm-to-Table Dining in the Heart of {City}",
    ],
    sampleAbout: "Welcome to {Business Name}, a {City} dining destination for over {Years} years. Our chef-driven menu celebrates fresh, seasonal ingredients sourced from local farms and purveyors. Whether you're joining us for a relaxed weeknight dinner, a celebratory brunch, or a catered event, every dish is crafted with passion and served with warmth. At {Business Name}, we believe great food brings people together — and we can't wait to welcome you to our table.",
    defaultQuestions: [
      { question: "What type of cuisine do you serve?", fieldType: "text", options: null, required: true },
      { question: "Do you take reservations?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer takeout, delivery, or both?", fieldType: "multiselect", options: ["Dine-In Only", "Takeout", "Delivery", "Online Ordering"], required: true },
      { question: "Do you offer catering or private events?", fieldType: "multiselect", options: ["Catering", "Private Dining", "Event Space", "None"], required: false },
      { question: "Do you have a liquor license?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "11:00 AM - 10:00 PM", tue: "11:00 AM - 10:00 PM", wed: "11:00 AM - 10:00 PM", thu: "11:00 AM - 10:00 PM", fri: "11:00 AM - 11:00 PM", sat: "10:00 AM - 11:00 PM", sun: "10:00 AM - 9:00 PM" },
    commonTrustSignals: ["Locally Owned", "Farm-to-Table Ingredients", "Top Rated on Yelp/Google", "Award-Winning Chef", "Private Event Space"],
    faqLibrary: [
      { question: "Do you accommodate dietary restrictions?", answer: "Absolutely. We offer vegetarian, vegan, gluten-free, and allergy-friendly options. Please inform your server of any dietary needs and our kitchen will be happy to accommodate." },
      { question: "Can I make a reservation for a large group?", answer: "Yes! We welcome large parties and can accommodate groups in our main dining room or private event space. Please call ahead or use our online reservation system for parties of 8 or more." },
      { question: "Do you offer gift cards?", answer: "Yes, gift cards are available in any denomination at the restaurant or online. They make the perfect gift for any occasion." },
    ],
    primaryColors: ["#7f1d1d", "#fef2f2", "#451a03"],
    imageryThemes: ["plated_dishes", "restaurant_interior", "chef_cooking", "diners_enjoying", "ingredients"],
    tone: "warm, inviting, passionate",
    fontPreference: "elegant serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["hours_display", "menu_or_schedule", "reservation_cta", "location_map"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "Restaurant",
    seoKeywords: ["restaurant near me", "best restaurants {City}", "dining {City}", "catering {City}", "{cuisine type} restaurant {City}"],
    requiredPages: ["home", "menu", "contact"],
    optionalPages: ["about", "gallery", "events", "catering", "reservations", "reviews"],
    conversionPriority: "reservations",
  },

  // 14. Gym / Fitness Studio
  {
    industryCode: "gym",
    displayName: "Gym / Fitness Studio",
    category: "fitness",
    subNiches: ["personal_training", "crossfit", "boutique_fitness", "boxing_gym", "martial_arts", "group_fitness", "24_hour_gym"],
    archetype: Archetype.VENUE,
    keywords: ["gym", "fitness", "personal training", "workout", "exercise", "crossfit", "group classes", "strength training", "cardio", "membership"],
    defaultFeatures: ["class_schedule", "membership_pricing", "free_trial_cta", "testimonials", "trainer_profiles", "gallery", "hours_display", "click_to_call"],
    defaultServices: [
      { name: "Personal Training", description: "One-on-one coaching with certified trainers who build custom programs for your goals, fitness level, and schedule." },
      { name: "Group Fitness Classes", description: "High-energy group classes including HIIT, spin, strength, boxing, and more — all skill levels welcome." },
      { name: "Strength & Conditioning", description: "Full weight room with free weights, machines, and functional training equipment for every fitness goal." },
      { name: "Nutrition Coaching", description: "Personalized nutrition plans and accountability coaching to complement your training and accelerate results." },
      { name: "Membership Plans", description: "Flexible month-to-month and annual memberships with no hidden fees and full facility access." },
    ],
    sampleTaglines: [
      "Train Hard. Get Results. Welcome to {Business Name}.",
      "{Business Name} — {City}'s Premier Fitness Destination for {Years}+ Years",
      "Your First Class Is Free. No Commitment. No Excuses.",
    ],
    sampleAbout: "{Business Name} has been helping {City} get stronger, faster, and healthier for over {Years} years. Our state-of-the-art facility features top-tier equipment, expert certified trainers, and a motivating community that pushes you to be your best. Whether you're a complete beginner or a seasoned athlete, our diverse class schedule, personal training options, and welcoming atmosphere will help you crush your goals. Come see why {Business Name} is {City}'s most-loved gym.",
    defaultQuestions: [
      { question: "What type of fitness facility are you?", fieldType: "select", options: ["Full Gym", "Boutique Studio", "CrossFit Box", "Personal Training Studio", "Martial Arts"], required: true },
      { question: "Do you offer group fitness classes?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer a free trial or first-class-free?", fieldType: "boolean", options: null, required: true },
      { question: "What membership options do you offer?", fieldType: "multiselect", options: ["Monthly", "Annual", "Class Packs", "Drop-In", "Family Plans"], required: true },
      { question: "Do you offer personal training?", fieldType: "boolean", options: null, required: true },
    ],
    defaultHours: { mon: "5:00 AM - 10:00 PM", tue: "5:00 AM - 10:00 PM", wed: "5:00 AM - 10:00 PM", thu: "5:00 AM - 10:00 PM", fri: "5:00 AM - 9:00 PM", sat: "7:00 AM - 6:00 PM", sun: "8:00 AM - 4:00 PM" },
    commonTrustSignals: ["Free First Class", "Certified Trainers", "No Long-Term Contracts", "Top-Rated on Google", "Locally Owned"],
    faqLibrary: [
      { question: "Do I need to be in shape to start?", answer: "Not at all! Our programs are designed for all fitness levels. Our trainers modify every workout to match your current ability and progress at your pace." },
      { question: "What should I bring to my first visit?", answer: "Just bring comfortable workout clothes, athletic shoes, a water bottle, and a towel. We provide everything else. Your first class is on us!" },
      { question: "Can I cancel my membership anytime?", answer: "Yes. Our month-to-month memberships have no long-term contracts. You can cancel anytime with 30 days' notice — no fees, no hassle." },
    ],
    primaryColors: ["#1e1e1e", "#dc2626", "#f8fafc"],
    imageryThemes: ["gym_interior", "people_working_out", "trainers_coaching", "weights_equipment", "group_classes"],
    tone: "bold, energetic, motivating",
    fontPreference: "strong sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["class_schedule", "membership_tiers", "trial_pass_cta"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "ExerciseGym",
    seoKeywords: ["gym near me", "fitness studio {City}", "personal trainer {City}", "group fitness classes {City}", "best gym {City}"],
    requiredPages: ["home", "classes", "contact"],
    optionalPages: ["about", "trainers", "membership", "schedule", "gallery", "faq", "reviews"],
    conversionPriority: "free_trial_signups",
  },

  // 15. Salon / Barbershop
  {
    industryCode: "salon",
    displayName: "Salon / Barbershop",
    category: "beauty",
    subNiches: ["hair_salon", "barbershop", "nail_salon", "beauty_salon", "braiding_salon", "color_specialist"],
    archetype: Archetype.VENUE,
    keywords: ["salon", "hair salon", "barbershop", "haircut", "hair color", "highlights", "blowout", "barber", "nails", "beauty", "stylist"],
    defaultFeatures: ["booking_widget", "service_menu_pricing", "stylist_profiles", "gallery", "testimonials", "hours_display", "click_to_call", "instagram_feed"],
    defaultServices: [
      { name: "Haircuts & Styling", description: "Precision haircuts, blowouts, and styling for all hair types — from classic looks to the latest trends." },
      { name: "Color Services", description: "Full color, highlights, balayage, ombre, and corrective color by certified colorists." },
      { name: "Treatments & Conditioning", description: "Deep conditioning, keratin treatments, and scalp therapies to restore health and shine." },
      { name: "Bridal & Special Occasion", description: "Gorgeous updos, styling, and makeup for weddings, prom, and special events." },
      { name: "Men's Grooming", description: "Expert men's cuts, fades, beard trims, and hot towel shaves in a relaxed atmosphere." },
    ],
    sampleTaglines: [
      "Where {City} Goes for Great Hair",
      "{Business Name} — {City}'s Favorite Salon for {Years}+ Years",
      "Book Your Next Look. Walk-Ins Welcome!",
    ],
    sampleAbout: "{Business Name} has been the go-to salon in {City} for over {Years} years. Our team of talented stylists and colorists stays ahead of the latest trends while mastering timeless techniques. From your first consultation to the final reveal, we listen carefully and deliver looks that make you feel confident and beautiful. Our welcoming, stylish space is designed for relaxation — because a great haircut should always feel like a treat. Walk-ins are welcome, but booking ahead guarantees your favorite stylist.",
    defaultQuestions: [
      { question: "What services do you offer?", fieldType: "multiselect", options: ["Haircuts", "Color", "Highlights/Balayage", "Treatments", "Bridal/Events", "Men's Grooming", "Nails", "Waxing"], required: true },
      { question: "Do you accept walk-ins?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer online booking?", fieldType: "boolean", options: null, required: true },
      { question: "How many stylists are at your salon?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "Closed", tue: "9:00 AM - 7:00 PM", wed: "9:00 AM - 7:00 PM", thu: "9:00 AM - 8:00 PM", fri: "9:00 AM - 8:00 PM", sat: "9:00 AM - 5:00 PM", sun: "10:00 AM - 4:00 PM" },
    commonTrustSignals: ["Online Booking Available", "Award-Winning Stylists", "Walk-Ins Welcome", "Top-Rated on Google", "Eco-Friendly Products"],
    faqLibrary: [
      { question: "Should I book ahead or can I walk in?", answer: "Walk-ins are always welcome based on availability, but we recommend booking ahead — especially for color services or weekend appointments — to guarantee your preferred stylist and time." },
      { question: "How do I choose the right stylist?", answer: "Check out our stylist profiles and portfolios on our website. Each stylist has specialties and a unique style. If you're unsure, our front desk team will match you with the perfect fit." },
      { question: "What products do you use?", answer: "We use professional-grade, salon-exclusive products that are gentle on your hair and the environment. Ask your stylist for product recommendations for your hair type." },
    ],
    primaryColors: ["#831843", "#fdf2f8", "#1e1b4b"],
    imageryThemes: ["salon_interior", "stylists_working", "hair_transformations", "happy_clients", "products"],
    tone: "trendy, welcoming, confident",
    fontPreference: "elegant sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["services_list", "booking_cta", "gallery", "hours_display"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "HairSalon",
    seoKeywords: ["hair salon near me", "barbershop {City}", "haircut {City}", "balayage {City}", "best salon {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "stylists", "gallery", "booking", "reviews", "products"],
    conversionPriority: "online_bookings",
  },

  // 16. Spa / Wellness Center
  {
    industryCode: "spa",
    displayName: "Spa / Wellness Center",
    category: "wellness",
    subNiches: ["day_spa", "medical_spa", "massage_therapy", "skin_care", "wellness_center", "float_therapy"],
    archetype: Archetype.VENUE,
    keywords: ["spa", "massage", "facial", "wellness", "day spa", "body treatment", "relaxation", "skincare", "med spa", "aromatherapy", "hot stone massage"],
    defaultFeatures: ["booking_widget", "service_menu_pricing", "gift_card_cta", "gallery", "testimonials", "hours_display", "packages_display", "team_profiles"],
    defaultServices: [
      { name: "Massage Therapy", description: "Swedish, deep tissue, hot stone, and sports massage by licensed therapists to melt away tension and restore balance." },
      { name: "Facials & Skin Care", description: "Customized facials, chemical peels, microdermabrasion, and advanced skincare treatments for radiant, healthy skin." },
      { name: "Body Treatments", description: "Body wraps, scrubs, and hydrotherapy to detoxify, hydrate, and rejuvenate from head to toe." },
      { name: "Couples & Group Packages", description: "Romantic couples massages and spa day packages — perfect for celebrations, date nights, or self-care with friends." },
      { name: "Wellness Programs", description: "Holistic wellness packages combining massage, skincare, nutrition, and mindfulness for total well-being." },
    ],
    sampleTaglines: [
      "Your Escape in the Heart of {City}",
      "{Business Name} — {City}'s Premier Spa & Wellness Destination for {Years}+ Years",
      "Relax. Restore. Renew. Book Your Spa Day Today.",
    ],
    sampleAbout: "Step into {Business Name} and leave the stress of daily life behind. For over {Years} years, we've been {City}'s sanctuary for relaxation and renewal. Our licensed therapists and estheticians craft personalized treatments in a serene, tranquil environment designed to restore your body and mind. From signature massages and rejuvenating facials to indulgent body treatments and couples packages, every visit is tailored to your needs. Gift cards are available — give the gift of wellness.",
    defaultQuestions: [
      { question: "What spa services do you offer?", fieldType: "multiselect", options: ["Massage", "Facials", "Body Treatments", "Waxing", "Couples Packages", "Med Spa/Injectables"], required: true },
      { question: "Do you offer online booking?", fieldType: "boolean", options: null, required: true },
      { question: "Do you sell gift cards?", fieldType: "boolean", options: null, required: true },
      { question: "Are you a day spa or medical spa?", fieldType: "select", options: ["Day Spa", "Medical Spa", "Both"], required: true },
    ],
    defaultHours: { mon: "9:00 AM - 7:00 PM", tue: "9:00 AM - 7:00 PM", wed: "9:00 AM - 7:00 PM", thu: "9:00 AM - 8:00 PM", fri: "9:00 AM - 8:00 PM", sat: "9:00 AM - 6:00 PM", sun: "10:00 AM - 5:00 PM" },
    commonTrustSignals: ["Licensed Therapists", "Organic & Natural Products", "Gift Cards Available", "Top-Rated on Google", "Tranquil Private Rooms"],
    faqLibrary: [
      { question: "What should I expect during my first visit?", answer: "Arrive 15 minutes early to complete a brief wellness form. Your therapist will discuss your goals and any concerns before your treatment. We provide robes, slippers, and access to our relaxation lounge." },
      { question: "How far in advance should I book?", answer: "We recommend booking 1-2 weeks in advance, especially for weekend and couples appointments. Last-minute availability may be limited but we'll always do our best to accommodate you." },
      { question: "Do you offer gift cards?", answer: "Yes! Gift cards are available in any amount — in-store or online. They're perfect for birthdays, holidays, or just because. Gift cards never expire." },
    ],
    primaryColors: ["#5b21b6", "#f5f3ff", "#7e6b4f"],
    imageryThemes: ["spa_interior", "massage_treatment", "candles_stones", "serene_environment", "skincare_products"],
    tone: "serene, luxurious, nurturing",
    fontPreference: "elegant serif",
    layoutDensity: "spacious",
    requiredSections: ["services_list", "booking_cta", "gallery", "hours_display"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "DaySpa",
    seoKeywords: ["spa near me", "massage {City}", "day spa {City}", "facial {City}", "couples massage {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "team", "gallery", "packages", "gift-cards", "booking", "reviews"],
    conversionPriority: "online_bookings",
  },

  // 17. Yoga / Pilates Studio
  {
    industryCode: "yoga_studio",
    displayName: "Yoga / Pilates Studio",
    category: "fitness",
    subNiches: ["vinyasa_yoga", "hot_yoga", "restorative_yoga", "pilates_reformer", "aerial_yoga", "prenatal_yoga", "meditation"],
    archetype: Archetype.VENUE,
    keywords: ["yoga", "pilates", "yoga studio", "meditation", "hot yoga", "vinyasa", "reformer pilates", "barre", "mindfulness", "flexibility", "wellness"],
    defaultFeatures: ["class_schedule", "booking_widget", "pricing_packages", "instructor_profiles", "testimonials", "hours_display", "free_class_cta", "workshop_calendar"],
    defaultServices: [
      { name: "Yoga Classes", description: "Vinyasa, hatha, yin, restorative, and power yoga classes for all levels — from first-timers to advanced practitioners." },
      { name: "Pilates", description: "Mat and reformer Pilates classes that build core strength, improve posture, and enhance flexibility." },
      { name: "Hot Yoga", description: "Heated classes that deepen stretches, promote detoxification, and challenge your practice in a whole new way." },
      { name: "Meditation & Breathwork", description: "Guided meditation and pranayama sessions to calm the mind, reduce stress, and cultivate inner peace." },
      { name: "Workshops & Teacher Training", description: "Immersive workshops and yoga teacher training programs for those ready to deepen their practice or share it with others." },
    ],
    sampleTaglines: [
      "Find Your Flow in {City}",
      "{Business Name} — {City}'s Mindful Movement Studio for {Years}+ Years",
      "Your First Class Is Free. Unroll Your Mat Today.",
    ],
    sampleAbout: "At {Business Name}, we've been creating space for mindful movement in {City} for over {Years} years. Our studio welcomes all bodies, all levels, and all intentions. Whether you're stepping onto the mat for the first time or deepening a decades-long practice, our experienced instructors guide you with warmth, expertise, and attention to alignment. Beyond the physical, we cultivate a community rooted in connection, compassion, and personal growth. Your first class is always free — come experience the {Business Name} difference.",
    defaultQuestions: [
      { question: "What styles of yoga or pilates do you offer?", fieldType: "multiselect", options: ["Vinyasa", "Hot Yoga", "Yin/Restorative", "Pilates Mat", "Pilates Reformer", "Barre", "Meditation"], required: true },
      { question: "Do you offer a free introductory class?", fieldType: "boolean", options: null, required: true },
      { question: "What pricing options do you offer?", fieldType: "multiselect", options: ["Drop-In", "Class Packs", "Monthly Unlimited", "Annual Membership"], required: true },
      { question: "Do you offer teacher training?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "6:00 AM - 9:00 PM", tue: "6:00 AM - 9:00 PM", wed: "6:00 AM - 9:00 PM", thu: "6:00 AM - 9:00 PM", fri: "6:00 AM - 8:00 PM", sat: "7:00 AM - 5:00 PM", sun: "8:00 AM - 4:00 PM" },
    commonTrustSignals: ["First Class Free", "Certified Instructors (RYT 200/500)", "All Levels Welcome", "Top-Rated Studio", "Community-Focused"],
    faqLibrary: [
      { question: "I've never done yoga before. Can I still come?", answer: "Absolutely! We offer beginner-friendly classes and our instructors provide modifications for every pose. Everyone starts somewhere — our studio is a judgment-free zone." },
      { question: "What should I wear and bring?", answer: "Wear comfortable, stretchy clothing. We provide mats, blocks, and straps, but you're welcome to bring your own. Just bring a water bottle and an open mind!" },
      { question: "Do I need to sign up for classes in advance?", answer: "We recommend reserving your spot online as popular classes fill up, but walk-ins are welcome on a space-available basis." },
    ],
    primaryColors: ["#4f7942", "#f0fdf4", "#e8dcc8"],
    imageryThemes: ["yoga_poses", "studio_interior", "meditation", "community_class", "peaceful_environment"],
    tone: "mindful, welcoming, peaceful",
    fontPreference: "soft sans-serif",
    layoutDensity: "spacious",
    requiredSections: ["class_schedule", "booking_cta", "instructor_bios", "hours_display"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "ExerciseGym",
    seoKeywords: ["yoga near me", "yoga studio {City}", "pilates {City}", "hot yoga {City}", "meditation classes {City}"],
    requiredPages: ["home", "schedule", "contact"],
    optionalPages: ["about", "instructors", "pricing", "workshops", "gallery", "faq", "reviews"],
    conversionPriority: "class_signups",
  },

  // 18. Bar / Nightclub
  {
    industryCode: "bar",
    displayName: "Bar / Nightclub",
    category: "nightlife",
    subNiches: ["cocktail_bar", "sports_bar", "wine_bar", "nightclub", "brewpub", "lounge", "dive_bar"],
    archetype: Archetype.VENUE,
    keywords: ["bar", "nightclub", "cocktails", "craft beer", "happy hour", "lounge", "live music", "nightlife", "drinks", "wine bar", "sports bar"],
    defaultFeatures: ["menu_display", "events_calendar", "hours_display", "gallery", "reservation_widget", "instagram_feed", "age_gate", "happy_hour_banner"],
    defaultServices: [
      { name: "Craft Cocktails", description: "Handcrafted cocktails made with premium spirits, fresh ingredients, and house-made syrups and bitters." },
      { name: "Draft & Bottle Selection", description: "Rotating taps of local and imported craft beers alongside a curated bottle and can list." },
      { name: "Happy Hour", description: "Daily happy hour specials with discounted drinks and bar bites — the best deal in {City}." },
      { name: "Live Entertainment", description: "Live music, DJ nights, trivia, and special events that keep {City}'s nightlife buzzing." },
      { name: "Private Events & Buyouts", description: "Host your next event in our space — from intimate gatherings to full venue buyouts with custom drink packages." },
    ],
    sampleTaglines: [
      "Where {City} Comes to Unwind",
      "{Business Name} — Craft Drinks & Good Times for {Years}+ Years",
      "Happy Hour Starts Now. See You at the Bar.",
    ],
    sampleAbout: "{Business Name} has been a cornerstone of {City}'s nightlife scene for over {Years} years. Our talented bartenders craft inventive cocktails and pour local favorites in an atmosphere that's equal parts sophisticated and laid-back. Whether you're stopping by for after-work happy hour, catching live music on the weekend, or hosting a private event, {Business Name} is the kind of place where every night feels like the best night. Pull up a stool — your drink is waiting.",
    defaultQuestions: [
      { question: "What type of bar are you?", fieldType: "select", options: ["Cocktail Bar", "Sports Bar", "Wine Bar", "Brewpub", "Nightclub/Lounge", "Dive Bar"], required: true },
      { question: "Do you serve food?", fieldType: "select", options: ["Full Menu", "Bar Bites/Snacks", "No Food"], required: true },
      { question: "Do you host live entertainment or events?", fieldType: "multiselect", options: ["Live Music", "DJs", "Trivia", "Karaoke", "Comedy", "None"], required: false },
      { question: "Do you offer happy hour specials?", fieldType: "boolean", options: null, required: true },
      { question: "Do you accept reservations or VIP bookings?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "4:00 PM - 12:00 AM", tue: "4:00 PM - 12:00 AM", wed: "4:00 PM - 12:00 AM", thu: "4:00 PM - 1:00 AM", fri: "4:00 PM - 2:00 AM", sat: "2:00 PM - 2:00 AM", sun: "2:00 PM - 10:00 PM" },
    commonTrustSignals: ["Locally Owned", "Award-Winning Cocktails", "Live Entertainment Weekly", "Featured in Local Press", "21+ Venue"],
    faqLibrary: [
      { question: "What are your happy hour specials?", answer: "Happy hour runs Monday–Friday from 4–7 PM with $2 off all drafts, $3 off featured cocktails, and half-price bar bites. Follow us on social media for weekly rotating specials." },
      { question: "Can I book your space for a private event?", answer: "Absolutely! We host birthday parties, corporate events, holiday gatherings, and more. We offer custom drink packages and full venue buyouts. Contact us for details and availability." },
      { question: "Is there a cover charge?", answer: "Most nights are free entry. Special events, live music nights, and holiday parties may have a cover. Check our events calendar for details." },
    ],
    primaryColors: ["#171717", "#d4af37", "#292524"],
    imageryThemes: ["bar_interior", "cocktails", "nightlife_atmosphere", "live_music", "bartender_pouring"],
    tone: "cool, social, energetic",
    fontPreference: "display sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["menu_or_schedule", "hours_display", "location_map", "events_section"],
    isRegulated: false,
    defaultDisclaimers: ["Must be 21+ to enter. Please drink responsibly."],
    schemaType: "BarOrPub",
    seoKeywords: ["bar near me", "best bars {City}", "cocktail bar {City}", "happy hour {City}", "nightlife {City}"],
    requiredPages: ["home", "menu", "contact"],
    optionalPages: ["about", "events", "gallery", "happy-hour", "private-events", "reviews"],
    conversionPriority: "reservations",
  },

  // 19. Retail Store
  {
    industryCode: "retail_store",
    displayName: "Retail Store",
    category: "retail",
    subNiches: ["boutique", "gift_shop", "home_decor", "clothing_store", "bookstore", "specialty_shop", "pet_store"],
    archetype: Archetype.VENUE,
    keywords: ["retail", "shop", "store", "boutique", "gift shop", "shopping", "clothing", "home decor", "specialty", "local shop"],
    defaultFeatures: ["product_showcase", "hours_display", "online_shop_link", "gallery", "testimonials", "newsletter_signup", "click_to_call", "instagram_feed"],
    defaultServices: [
      { name: "In-Store Shopping", description: "Browse our curated selection of unique products in a welcoming, beautifully designed retail space." },
      { name: "Online Shopping", description: "Shop our full collection online with convenient shipping and local pickup options." },
      { name: "Gift Wrapping & Registry", description: "Complimentary gift wrapping and gift registry services for birthdays, weddings, and special occasions." },
      { name: "Personal Shopping", description: "One-on-one personal shopping appointments to help you find the perfect items for any occasion." },
      { name: "Local Delivery", description: "Same-day local delivery available for orders in {City} — perfect for last-minute gifts and special surprises." },
    ],
    sampleTaglines: [
      "Curated Finds for Everyday Living in {City}",
      "{Business Name} — {City}'s Favorite Local Shop for {Years}+ Years",
      "Discover Something Unique. Shop {Business Name} Today.",
    ],
    sampleAbout: "{Business Name} is a locally owned shop in the heart of {City}, proudly serving our community for over {Years} years. We hand-select every item in our store with care — from unique gifts and home goods to locally made products you won't find anywhere else. Shopping with us means supporting local makers, sustainable brands, and a neighborhood business that genuinely cares. Stop by, say hello, and discover something you'll love.",
    defaultQuestions: [
      { question: "What type of products do you sell?", fieldType: "text", options: null, required: true },
      { question: "Do you have an online store?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer gift cards?", fieldType: "boolean", options: null, required: false },
      { question: "Do you carry local or handmade products?", fieldType: "boolean", options: null, required: false },
      { question: "Do you offer shipping or local delivery?", fieldType: "multiselect", options: ["In-Store Only", "Local Delivery", "National Shipping", "Curbside Pickup"], required: true },
    ],
    defaultHours: { mon: "10:00 AM - 6:00 PM", tue: "10:00 AM - 6:00 PM", wed: "10:00 AM - 6:00 PM", thu: "10:00 AM - 7:00 PM", fri: "10:00 AM - 7:00 PM", sat: "10:00 AM - 6:00 PM", sun: "11:00 AM - 5:00 PM" },
    commonTrustSignals: ["Locally Owned & Operated", "Unique Curated Selection", "Gift Cards Available", "Free Gift Wrapping", "Shop Local Champion"],
    faqLibrary: [
      { question: "Do you offer gift cards?", answer: "Yes! Gift cards are available in any denomination, in-store and online. They never expire and make the perfect gift when you want someone to choose their own treasure." },
      { question: "Can you ship orders?", answer: "We offer nationwide shipping on most items. Local delivery is also available for orders within {City}. Curbside pickup is available daily during store hours." },
      { question: "Do you accept returns or exchanges?", answer: "We accept returns and exchanges within 30 days with a receipt. Items must be in original condition with tags. Sale items are final sale." },
    ],
    primaryColors: ["#a16207", "#fefce8", "#292524"],
    imageryThemes: ["store_interior", "product_displays", "curated_shelves", "happy_shoppers", "storefront"],
    tone: "welcoming, curated, community-oriented",
    fontPreference: "clean sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["product_grid", "hours_display", "location_map", "about_bio"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "Store",
    seoKeywords: ["shop near me", "boutique {City}", "gift shop {City}", "local shop {City}", "unique gifts {City}"],
    requiredPages: ["home", "shop", "contact"],
    optionalPages: ["about", "gallery", "events", "blog", "faq", "reviews"],
    conversionPriority: "store_visits",
  },

  // 20. Event Venue
  {
    industryCode: "event_venue",
    displayName: "Event Venue",
    category: "events",
    subNiches: ["wedding_venue", "conference_center", "banquet_hall", "outdoor_venue", "party_venue", "corporate_events"],
    archetype: Archetype.VENUE,
    keywords: ["event venue", "wedding venue", "banquet hall", "conference center", "party venue", "event space", "reception hall", "corporate events", "private events"],
    defaultFeatures: ["inquiry_form", "gallery", "virtual_tour", "floor_plans", "testimonials", "capacity_info", "packages_display", "calendar_availability"],
    defaultServices: [
      { name: "Weddings & Receptions", description: "Stunning indoor and outdoor ceremony and reception spaces with full event coordination and catering partnerships." },
      { name: "Corporate Events", description: "Professional meeting rooms, conference spaces, and team-building venues with AV equipment and catering." },
      { name: "Private Parties", description: "Birthday celebrations, anniversaries, holiday parties, and milestone events in a beautifully appointed space." },
      { name: "Galas & Fundraisers", description: "Elegant large-scale event hosting for galas, charity events, and fundraisers with full-service support." },
      { name: "Event Planning Support", description: "On-site event coordinator, preferred vendor referrals, setup and breakdown assistance, and day-of support." },
    ],
    sampleTaglines: [
      "Where {City}'s Most Memorable Events Come to Life",
      "{Business Name} — {City}'s Premier Event Venue for {Years}+ Years",
      "Your Vision. Our Space. Let's Create Something Unforgettable.",
    ],
    sampleAbout: "For over {Years} years, {Business Name} has been the backdrop for {City}'s most cherished celebrations and important gatherings. Our versatile event spaces accommodate intimate gatherings of 20 to grand celebrations of 500, all with elegant finishes, modern amenities, and breathtaking views. Our dedicated event team works closely with you to bring your vision to life — from custom floor plans and lighting to catering and vendor coordination. Whether it's the wedding of your dreams or a high-profile corporate event, {Business Name} makes every moment extraordinary.",
    defaultQuestions: [
      { question: "What types of events do you host?", fieldType: "multiselect", options: ["Weddings", "Corporate Events", "Private Parties", "Galas/Fundraisers", "Conferences", "Holiday Parties"], required: true },
      { question: "What is your maximum guest capacity?", fieldType: "text", options: null, required: true },
      { question: "Do you offer in-house catering or allow outside caterers?", fieldType: "select", options: ["In-House Catering", "Outside Caterers Allowed", "Both Options", "Preferred Caterer List"], required: true },
      { question: "Do you have indoor, outdoor, or both spaces?", fieldType: "select", options: ["Indoor Only", "Outdoor Only", "Indoor & Outdoor"], required: true },
      { question: "Do you provide an on-site event coordinator?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "9:00 AM - 5:00 PM (Office)", tue: "9:00 AM - 5:00 PM (Office)", wed: "9:00 AM - 5:00 PM (Office)", thu: "9:00 AM - 5:00 PM (Office)", fri: "By Event Schedule", sat: "By Event Schedule", sun: "By Event Schedule" },
    commonTrustSignals: ["On-Site Event Coordinator", "5-Star Rated on The Knot/WeddingWire", "Flexible Floor Plans", "Preferred Vendor Network", "AV & Lighting Included"],
    faqLibrary: [
      { question: "How far in advance should I book?", answer: "We recommend booking 9-12 months in advance for weddings and 3-6 months for corporate events or parties. Popular dates fill up quickly, so earlier is always better." },
      { question: "Can I bring my own vendors?", answer: "We offer flexibility — you can choose from our preferred vendor list or bring your own licensed and insured vendors. Our event coordinator can recommend trusted partners for every need." },
      { question: "Do you offer tours of the venue?", answer: "Yes! We offer private tours by appointment so you can see the space, discuss your vision, and ask questions. Virtual tours are also available on our website for those planning from out of town." },
    ],
    primaryColors: ["#1e293b", "#c9a84c", "#faf5ff"],
    imageryThemes: ["event_space", "wedding_setup", "decorated_venue", "guests_celebrating", "outdoor_ceremony"],
    tone: "elegant, memorable, professional",
    fontPreference: "classic serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["services_list", "contact_form", "about_bio"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "EventVenue",
    seoKeywords: ["event venue near me", "wedding venue {City}", "banquet hall {City}", "party venue {City}", "corporate event space {City}"],
    requiredPages: ["home", "spaces", "contact"],
    optionalPages: ["about", "gallery", "weddings", "corporate", "packages", "faq", "reviews", "virtual-tour"],
    conversionPriority: "inquiry_submissions",
  },

  // ===========================================================================
  // PORTFOLIO ARCHETYPE (21-25)
  // ===========================================================================

  // 21. Photography
  {
    industryCode: "photography",
    displayName: "Photography",
    category: "creative",
    subNiches: ["wedding_photography", "portrait_photography", "commercial_photography", "event_photography", "newborn_photography", "real_estate_photography"],
    archetype: Archetype.PORTFOLIO,
    keywords: ["photographer", "photography", "wedding photographer", "portrait", "headshots", "event photography", "photo session", "family photos", "engagement photos"],
    defaultFeatures: ["portfolio_grid", "lightbox_gallery", "booking_form", "testimonials", "pricing_packages", "instagram_feed", "contact_form"],
    defaultServices: [
      { name: "Wedding Photography", description: "Full-day wedding coverage capturing every moment — from getting ready to the last dance — with a cinematic eye." },
      { name: "Portrait Sessions", description: "Professional portraits for families, seniors, couples, and individuals in studio or on location." },
      { name: "Commercial Photography", description: "Product photography, brand imagery, headshots, and visual content for businesses and marketing." },
      { name: "Event Photography", description: "Corporate events, parties, galas, and milestone celebrations documented with candid and posed shots." },
      { name: "Photo Editing & Retouching", description: "Professional post-processing, color grading, and retouching delivered in an online gallery within two weeks." },
    ],
    sampleTaglines: [
      "Capturing {City}'s Most Beautiful Moments",
      "{Business Name} — {City} Photographer for {Years}+ Years",
      "Your Story. Beautifully Told. Book Your Session Today.",
    ],
    sampleAbout: "{Business Name} is a {City}-based photography studio with over {Years} years of experience capturing life's most important moments. Our style blends natural light, authentic emotion, and artistic composition to create images you'll treasure forever. Whether it's your wedding day, a family milestone, or a brand campaign, we approach every session with creativity, professionalism, and a genuine love for storytelling through the lens.",
    defaultQuestions: [
      { question: "What types of photography do you specialize in?", fieldType: "multiselect", options: ["Weddings", "Portraits", "Events", "Commercial/Product", "Newborn/Maternity", "Real Estate"], required: true },
      { question: "Do you offer packages or a la carte pricing?", fieldType: "select", options: ["Packages Only", "A La Carte Only", "Both"], required: true },
      { question: "Do you travel for shoots?", fieldType: "boolean", options: null, required: false },
      { question: "What is your typical turnaround time?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "By Appointment", tue: "By Appointment", wed: "By Appointment", thu: "By Appointment", fri: "By Appointment", sat: "By Appointment", sun: "By Appointment" },
    commonTrustSignals: ["Published Photographer", "5-Star Rated", "Fast Turnaround", "Online Gallery Delivery", "Second Shooter Available"],
    faqLibrary: [
      { question: "How far in advance should I book?", answer: "For weddings, we recommend 6-12 months in advance. Portrait and event sessions can usually be booked 2-4 weeks out. Contact us to check availability for your date." },
      { question: "How many photos will I receive?", answer: "It depends on the session type and duration. A typical portrait session yields 40-60 edited images. Full wedding coverage includes 400-800+ images delivered in an online gallery." },
      { question: "Do you provide raw/unedited files?", answer: "We deliver professionally edited images only. Every photo is individually color-corrected and polished to reflect our signature style. Raw files are not included." },
    ],
    primaryColors: ["#292524", "#fafaf9", "#78716c"],
    imageryThemes: ["portfolio_shots", "behind_the_scenes", "camera_equipment", "beautiful_portraits", "wedding_moments"],
    tone: "artistic, personal, authentic",
    fontPreference: "minimal sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["portfolio_grid", "inquiry_form", "about_bio"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "Photographer",
    seoKeywords: ["photographer near me", "wedding photographer {City}", "portrait photographer {City}", "family photographer {City}", "headshots {City}"],
    requiredPages: ["home", "portfolio", "contact"],
    optionalPages: ["about", "pricing", "weddings", "portraits", "blog", "reviews"],
    conversionPriority: "form_submissions",
  },

  // 22. Real Estate Agent (regulated)
  {
    industryCode: "real_estate",
    displayName: "Real Estate Agent",
    category: "professional",
    subNiches: ["residential_sales", "buyers_agent", "luxury_real_estate", "commercial_real_estate", "property_management", "first_time_buyers"],
    archetype: Archetype.PORTFOLIO,
    keywords: ["real estate agent", "realtor", "homes for sale", "buy a home", "sell my house", "real estate", "property", "listing agent", "buyers agent", "MLS"],
    defaultFeatures: ["listings_grid", "neighborhood_guides", "home_valuation_form", "testimonials", "contact_form", "click_to_call", "market_stats", "agent_profile"],
    defaultServices: [
      { name: "Home Selling", description: "Strategic pricing, professional staging, marketing, and expert negotiation to sell your home for top dollar." },
      { name: "Buyer Representation", description: "Dedicated buyer's agent guiding you from pre-approval to closing with personalized home searches and market insight." },
      { name: "Market Analysis", description: "Complimentary comparative market analysis to determine your home's current value in today's market." },
      { name: "First-Time Buyer Guidance", description: "Step-by-step guidance for first-time buyers including financing options, neighborhood tours, and inspection coordination." },
      { name: "Investment Properties", description: "Identifying and analyzing rental properties, multi-family units, and investment opportunities for long-term returns." },
    ],
    sampleTaglines: [
      "Your Trusted {City} Real Estate Expert",
      "{Business Name} — Helping {City} Families Find Home for {Years}+ Years",
      "Thinking of Buying or Selling? Let's Talk.",
    ],
    sampleAbout: "With over {Years} years of experience in the {City} real estate market, {Business Name} brings deep local knowledge, proven negotiation skills, and a client-first approach to every transaction. Whether you're buying your first home, upgrading, downsizing, or investing, I provide personalized guidance at every step. My track record speaks for itself — hundreds of successful closings, countless happy families, and a reputation built on trust, transparency, and results.",
    defaultQuestions: [
      { question: "Do you represent buyers, sellers, or both?", fieldType: "select", options: ["Buyers Only", "Sellers Only", "Both"], required: true },
      { question: "What areas do you specialize in?", fieldType: "text", options: null, required: true },
      { question: "Do you work with first-time home buyers?", fieldType: "boolean", options: null, required: false },
      { question: "Do you offer a free home valuation?", fieldType: "boolean", options: null, required: true },
      { question: "What is your average list-to-sale price ratio?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "9:00 AM - 6:00 PM", tue: "9:00 AM - 6:00 PM", wed: "9:00 AM - 6:00 PM", thu: "9:00 AM - 6:00 PM", fri: "9:00 AM - 6:00 PM", sat: "10:00 AM - 4:00 PM", sun: "By Appointment" },
    commonTrustSignals: ["Licensed Realtor", "Top Producer Award", "Hundreds of Homes Sold", "Free Home Valuation", "5-Star Google Reviews"],
    faqLibrary: [
      { question: "How much does it cost to work with a buyer's agent?", answer: "As a buyer, there is typically no cost to you — the seller's side covers the buyer's agent commission. I'll explain the full process during our initial consultation." },
      { question: "How long does it take to sell a home?", answer: "In {City}'s current market, well-priced homes typically sell within 15-45 days. Factors include pricing strategy, condition, location, and market conditions. I'll provide a realistic timeline for your specific property." },
      { question: "What's my home worth?", answer: "I offer complimentary market analyses. I'll evaluate recent comparable sales, current market conditions, and your home's unique features to provide an accurate valuation." },
    ],
    primaryColors: ["#1e3a5f", "#c9a84c", "#f8f6f0"],
    imageryThemes: ["luxury_homes", "neighborhoods", "agent_portrait", "open_houses", "keys_handover"],
    tone: "trustworthy, personable, knowledgeable",
    fontPreference: "classic serif",
    layoutDensity: "moderate",
    requiredSections: ["property_listings", "agent_bio", "contact_form", "neighborhood_info"],
    isRegulated: true,
    defaultDisclaimers: [
      "This website does not constitute an offer to buy or sell real estate.",
      "Information is deemed reliable but not guaranteed. Verify all details independently.",
      "Equal Housing Opportunity.",
    ],
    schemaType: "RealEstateAgent",
    seoKeywords: ["real estate agent near me", "realtor {City}", "homes for sale {City}", "sell my house {City}", "best realtor {City}"],
    requiredPages: ["home", "listings", "contact"],
    optionalPages: ["about", "buyers", "sellers", "neighborhoods", "testimonials", "blog", "home-valuation"],
    conversionPriority: "form_submissions",
  },

  // 23. Freelance Designer
  {
    industryCode: "freelance_design",
    displayName: "Freelance Designer",
    category: "creative",
    subNiches: ["graphic_design", "web_design", "ui_ux_design", "brand_identity", "illustration", "motion_graphics"],
    archetype: Archetype.PORTFOLIO,
    keywords: ["graphic designer", "web designer", "freelance designer", "logo design", "branding", "UI/UX", "visual design", "creative agency", "design portfolio"],
    defaultFeatures: ["portfolio_grid", "case_studies", "process_section", "testimonials", "contact_form", "client_logos", "services_list"],
    defaultServices: [
      { name: "Brand Identity", description: "Logo design, color palettes, typography, and brand guidelines that create a cohesive, memorable identity." },
      { name: "Web & UI Design", description: "Custom website designs and user interfaces that are beautiful, intuitive, and conversion-focused." },
      { name: "Print & Marketing Collateral", description: "Business cards, brochures, flyers, packaging, and promotional materials that make an impact." },
      { name: "Social Media Design", description: "Scroll-stopping social media graphics, templates, and content kits for consistent brand presence." },
      { name: "Illustration", description: "Custom illustrations, icons, and visual storytelling for brands, publications, and digital products." },
    ],
    sampleTaglines: [
      "Design That Makes {City} Brands Stand Out",
      "{Business Name} — Creative Design for {Years}+ Years",
      "Let's Build Something Beautiful Together.",
    ],
    sampleAbout: "I'm {Business Name}, a freelance designer based in {City} with {Years}+ years of experience helping brands look their best. From startups finding their visual voice to established businesses refreshing their identity, I bring strategic thinking and creative craft to every project. My process is collaborative, transparent, and focused on results — because great design isn't just about aesthetics, it's about solving problems and connecting with your audience.",
    defaultQuestions: [
      { question: "What design services do you offer?", fieldType: "multiselect", options: ["Branding/Logo", "Web Design", "Print Design", "Social Media", "UI/UX", "Illustration"], required: true },
      { question: "What is your typical project timeline?", fieldType: "text", options: null, required: false },
      { question: "Do you offer ongoing retainer packages?", fieldType: "boolean", options: null, required: false },
      { question: "What tools/software do you use?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "9:00 AM - 5:00 PM", tue: "9:00 AM - 5:00 PM", wed: "9:00 AM - 5:00 PM", thu: "9:00 AM - 5:00 PM", fri: "9:00 AM - 5:00 PM", sat: "Closed", sun: "Closed" },
    commonTrustSignals: ["Award-Winning Design", "Trusted by 50+ Brands", "Fast Turnaround", "Unlimited Revisions (within scope)", "100% Custom Work"],
    faqLibrary: [
      { question: "What does your design process look like?", answer: "I follow a proven 4-step process: Discovery (understanding your brand and goals), Concept (initial design directions), Refinement (feedback and iteration), and Delivery (final files in all formats you need)." },
      { question: "How much does a logo/branding project cost?", answer: "Every project is unique. After a free discovery call to understand your needs, I provide a clear, detailed proposal with fixed pricing — no surprises. Contact me for a custom quote." },
    ],
    primaryColors: ["#18181b", "#ef4444", "#fafafa"],
    imageryThemes: ["design_work", "portfolio_pieces", "workspace", "branding_mockups", "creative_process"],
    tone: "creative, confident, approachable",
    fontPreference: "modern sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["portfolio_grid", "about_bio", "inquiry_form"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "CreativeWork",
    seoKeywords: ["graphic designer near me", "freelance designer {City}", "logo designer {City}", "web designer {City}", "branding {City}"],
    requiredPages: ["home", "portfolio", "contact"],
    optionalPages: ["about", "services", "process", "case-studies", "blog"],
    conversionPriority: "form_submissions",
  },

  // 24. Coaching
  {
    industryCode: "coaching",
    displayName: "Coaching",
    category: "professional",
    subNiches: ["life_coaching", "business_coaching", "executive_coaching", "career_coaching", "health_coaching", "relationship_coaching"],
    archetype: Archetype.PORTFOLIO,
    keywords: ["life coach", "business coach", "executive coaching", "career coaching", "personal development", "coach", "mentor", "transformation", "mindset", "accountability"],
    defaultFeatures: ["booking_widget", "testimonials", "about_story", "programs_display", "free_call_cta", "podcast_link", "contact_form"],
    defaultServices: [
      { name: "1-on-1 Coaching", description: "Personalized coaching sessions focused on your specific goals, challenges, and growth — delivered via video or in person." },
      { name: "Group Coaching Programs", description: "Small-group programs combining accountability, peer support, and structured curriculum for transformative results." },
      { name: "Executive Coaching", description: "Leadership development, strategic thinking, and performance coaching for executives and senior leaders." },
      { name: "Workshops & Retreats", description: "Immersive workshops and retreats for teams and individuals ready for breakthrough growth." },
      { name: "Discovery Session", description: "A complimentary 30-minute call to explore your goals, assess fit, and outline a path forward." },
    ],
    sampleTaglines: [
      "Unlock Your Potential in {City}",
      "{Business Name} — Empowering Growth for {Years}+ Years",
      "Your Breakthrough Starts with One Conversation. Book a Free Call.",
    ],
    sampleAbout: "I'm {Business Name}, a certified coach based in {City} with over {Years} years of experience helping individuals and leaders create meaningful, lasting change. My coaching style is direct, compassionate, and action-oriented — because real transformation happens when insight meets implementation. Whether you're navigating a career transition, building a business, or seeking greater fulfillment, I'm here to help you get unstuck, gain clarity, and move forward with confidence.",
    defaultQuestions: [
      { question: "What type of coaching do you offer?", fieldType: "multiselect", options: ["Life Coaching", "Business Coaching", "Executive/Leadership", "Career", "Health/Wellness", "Relationship"], required: true },
      { question: "Do you offer a free discovery call?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer virtual or in-person sessions?", fieldType: "select", options: ["Virtual Only", "In-Person Only", "Both"], required: true },
      { question: "What certifications do you hold?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "9:00 AM - 6:00 PM", tue: "9:00 AM - 6:00 PM", wed: "9:00 AM - 6:00 PM", thu: "9:00 AM - 6:00 PM", fri: "9:00 AM - 5:00 PM", sat: "By Appointment", sun: "Closed" },
    commonTrustSignals: ["ICF Certified Coach", "Free Discovery Call", "Hundreds of Clients Served", "5-Star Testimonials", "Confidential & Judgment-Free"],
    faqLibrary: [
      { question: "What's the difference between coaching and therapy?", answer: "Coaching is future-focused — we work on goals, action plans, and accountability. Therapy addresses mental health, past trauma, and clinical issues. I may recommend a therapist if clinical concerns arise." },
      { question: "How many sessions will I need?", answer: "Most clients see meaningful progress in 6-12 sessions. I offer flexible packages and we'll set a timeline based on your goals during our free discovery call." },
    ],
    primaryColors: ["#7c3aed", "#f5f3ff", "#e8dcc8"],
    imageryThemes: ["coaching_session", "inspiring_portrait", "nature_growth", "notebook_goals", "confident_people"],
    tone: "empowering, authentic, warm",
    fontPreference: "soft sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "consultation_form", "testimonials", "about_bio"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "ProfessionalService",
    seoKeywords: ["life coach near me", "business coach {City}", "executive coach {City}", "career coaching {City}", "coaching {City}"],
    requiredPages: ["home", "about", "contact"],
    optionalPages: ["programs", "testimonials", "blog", "podcast", "resources", "booking"],
    conversionPriority: "form_submissions",
  },

  // 25. Architecture Firm
  {
    industryCode: "architecture",
    displayName: "Architecture Firm",
    category: "creative",
    subNiches: ["residential_architecture", "commercial_architecture", "interior_design", "sustainable_design", "renovation", "urban_planning"],
    archetype: Archetype.PORTFOLIO,
    keywords: ["architect", "architecture firm", "building design", "residential architect", "commercial architecture", "interior design", "renovation", "blueprints", "sustainable design"],
    defaultFeatures: ["portfolio_grid", "case_studies", "process_section", "team_profiles", "awards_section", "contact_form", "project_categories"],
    defaultServices: [
      { name: "Residential Design", description: "Custom home design, additions, and renovations that balance beauty, function, and your unique lifestyle." },
      { name: "Commercial Architecture", description: "Office buildings, retail spaces, restaurants, and mixed-use developments designed for impact and efficiency." },
      { name: "Interior Design", description: "Space planning, material selection, and interior architecture that transforms how you live and work." },
      { name: "Sustainable Design", description: "Energy-efficient, LEED-ready designs that minimize environmental impact without compromising aesthetics." },
      { name: "Feasibility & Planning", description: "Site analysis, zoning research, code review, and project feasibility studies before you break ground." },
    ],
    sampleTaglines: [
      "Designing {City}'s Future, One Building at a Time",
      "{Business Name} — Award-Winning Architecture for {Years}+ Years",
      "Where Vision Meets Structure. Let's Design Together.",
    ],
    sampleAbout: "{Business Name} is an architecture and design firm rooted in {City} with over {Years} years of experience shaping spaces that inspire. Our portfolio spans residences, commercial properties, cultural institutions, and sustainable developments. We believe great architecture starts with listening — understanding how you live, work, and dream — then translating that into spaces that elevate everyday life. Every project is a collaboration, and every detail matters.",
    defaultQuestions: [
      { question: "What type of architecture projects do you take on?", fieldType: "multiselect", options: ["Custom Homes", "Renovations/Additions", "Commercial", "Interior Design", "Sustainable/Green", "Multi-Family"], required: true },
      { question: "How large is your firm?", fieldType: "text", options: null, required: false },
      { question: "Do you handle permitting and code compliance?", fieldType: "boolean", options: null, required: true },
      { question: "What is your typical project timeline?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "9:00 AM - 5:00 PM", tue: "9:00 AM - 5:00 PM", wed: "9:00 AM - 5:00 PM", thu: "9:00 AM - 5:00 PM", fri: "9:00 AM - 5:00 PM", sat: "Closed", sun: "Closed" },
    commonTrustSignals: ["Licensed Architects", "AIA Member", "Award-Winning Designs", "Sustainable Design Expertise", "Full-Service Firm"],
    faqLibrary: [
      { question: "How much does an architect cost?", answer: "Architectural fees typically range from 5-15% of construction cost, depending on project scope and complexity. We provide a detailed proposal after an initial consultation so you know exactly what to expect." },
      { question: "Do I need an architect for a renovation?", answer: "For significant structural changes, additions, or projects requiring permits, an architect adds tremendous value in design quality, code compliance, and avoiding costly mistakes. We offer consultations to assess your project's needs." },
    ],
    primaryColors: ["#27272a", "#ffffff", "#a1a1aa"],
    imageryThemes: ["architectural_projects", "building_exteriors", "interior_spaces", "blueprints_plans", "construction_progress"],
    tone: "sophisticated, precise, visionary",
    fontPreference: "minimal sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["portfolio_grid", "about_bio", "inquiry_form", "awards_section"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "Architect",
    seoKeywords: ["architect near me", "architecture firm {City}", "residential architect {City}", "home designer {City}", "commercial architect {City}"],
    requiredPages: ["home", "portfolio", "contact"],
    optionalPages: ["about", "team", "services", "process", "awards", "blog"],
    conversionPriority: "form_submissions",
  },

  // ===========================================================================
  // GENERAL / CROSS-ARCHETYPE (26-30)
  // ===========================================================================

  // 26. Insurance Agency (regulated)
  {
    industryCode: "insurance",
    displayName: "Insurance Agency",
    category: "financial",
    subNiches: ["auto_insurance", "home_insurance", "life_insurance", "business_insurance", "health_insurance", "renters_insurance"],
    archetype: Archetype.SERVICE,
    keywords: ["insurance", "insurance agent", "auto insurance", "home insurance", "life insurance", "business insurance", "insurance quote", "insurance agency", "coverage", "policy"],
    defaultFeatures: ["quote_form", "coverage_types", "testimonials", "trust_badges", "click_to_call", "carrier_logos", "faq_section"],
    defaultServices: [
      { name: "Auto Insurance", description: "Competitive auto insurance rates from top carriers with comprehensive, collision, and liability options." },
      { name: "Home & Renters Insurance", description: "Protect your home, belongings, and liability with policies tailored to your property and needs." },
      { name: "Life Insurance", description: "Term and whole life insurance to protect your family's financial future — customized to your stage of life." },
      { name: "Business Insurance", description: "General liability, professional liability, workers' comp, and commercial property insurance for businesses of all sizes." },
      { name: "Insurance Reviews", description: "Free annual policy reviews to ensure you have the right coverage at the best possible rate." },
    ],
    sampleTaglines: [
      "Protecting What Matters Most in {City}",
      "{Business Name} — Your Trusted {City} Insurance Agency for {Years}+ Years",
      "Get a Free Quote in Minutes. Coverage You Can Count On.",
    ],
    sampleAbout: "For over {Years} years, {Business Name} has been helping families and businesses across {City} find the right insurance coverage at the right price. As an independent agency, we work with multiple top-rated carriers to compare options and find the best fit for your needs and budget. We don't just sell policies — we build relationships, answer questions, and advocate for you when you need to file a claim. Insurance is personal, and so is our service.",
    defaultQuestions: [
      { question: "What types of insurance do you offer?", fieldType: "multiselect", options: ["Auto", "Home", "Renters", "Life", "Business/Commercial", "Health", "Umbrella"], required: true },
      { question: "Are you an independent or captive agency?", fieldType: "select", options: ["Independent (multiple carriers)", "Captive (single carrier)"], required: true },
      { question: "Do you offer free quotes?", fieldType: "boolean", options: null, required: true },
      { question: "Do you help with claims?", fieldType: "boolean", options: null, required: false },
    ],
    defaultHours: { mon: "8:30 AM - 5:30 PM", tue: "8:30 AM - 5:30 PM", wed: "8:30 AM - 5:30 PM", thu: "8:30 AM - 5:30 PM", fri: "8:30 AM - 5:00 PM", sat: "By Appointment", sun: "Closed" },
    commonTrustSignals: ["Independent Agency", "Multiple Carrier Options", "Free Quotes", "Licensed Agents", "Claims Assistance"],
    faqLibrary: [
      { question: "Why use an independent insurance agent?", answer: "An independent agent works for YOU, not one insurance company. We compare rates and coverage from multiple carriers to find the best combination of price and protection for your specific situation." },
      { question: "How often should I review my insurance?", answer: "We recommend an annual review, or anytime you experience a major life event — buying a home, getting married, starting a business, or adding a new driver." },
      { question: "What happens if I need to file a claim?", answer: "Call us first! We'll guide you through the process, help you document the claim, and advocate on your behalf with the carrier to ensure a fair and timely resolution." },
    ],
    primaryColors: ["#1d4ed8", "#eff6ff", "#1e3a5f"],
    imageryThemes: ["families", "homes", "cars", "business_owners", "handshake_trust"],
    tone: "trustworthy, reassuring, knowledgeable",
    fontPreference: "clean sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "consultation_form", "credentials_badges", "legal_disclaimer"],
    isRegulated: true,
    defaultDisclaimers: [
      "This website provides general information about insurance products and does not constitute a binding offer of coverage.",
      "Coverage availability, terms, and pricing vary by carrier, state, and individual circumstances.",
      "Consult with a licensed insurance agent for personalized advice regarding your specific coverage needs.",
    ],
    schemaType: "InsuranceAgency",
    seoKeywords: ["insurance agent near me", "insurance agency {City}", "auto insurance {City}", "home insurance {City}", "life insurance {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "auto", "home", "life", "business", "faq", "reviews", "get-a-quote"],
    conversionPriority: "form_submissions",
  },

  // 27. Non-Profit / Charity
  {
    industryCode: "nonprofit",
    displayName: "Non-Profit / Charity",
    category: "nonprofit",
    subNiches: ["community_nonprofit", "animal_rescue", "education_nonprofit", "environmental", "food_bank", "youth_services", "arts_culture"],
    archetype: Archetype.SERVICE,
    keywords: ["nonprofit", "charity", "donate", "volunteer", "foundation", "community", "fundraising", "501c3", "giving", "social impact", "mission"],
    defaultFeatures: ["donation_button", "volunteer_form", "impact_stats", "events_calendar", "newsletter_signup", "testimonials", "gallery", "mission_statement"],
    defaultServices: [
      { name: "Programs & Services", description: "Direct community programs and services that create measurable impact for the people and causes we serve." },
      { name: "Volunteer Opportunities", description: "Meaningful volunteer roles for individuals, families, and corporate groups looking to make a difference." },
      { name: "Fundraising Events", description: "Annual galas, fun runs, auctions, and community events that bring supporters together and fund our mission." },
      { name: "Community Outreach", description: "Educational workshops, awareness campaigns, and partnerships that extend our reach and deepen our impact." },
      { name: "Corporate Partnerships", description: "Sponsorship and partnership opportunities for businesses that want to invest in the community and align with purpose." },
    ],
    sampleTaglines: [
      "Making a Difference in {City} — Together",
      "{Business Name} — Serving {City} with Heart for {Years}+ Years",
      "Every Dollar. Every Hour. Every Voice Matters. Join Us.",
    ],
    sampleAbout: "Founded {Years} years ago, {Business Name} is a 501(c)(3) nonprofit organization dedicated to making {City} a better place for everyone. Through our programs, dedicated volunteers, and generous donors, we've touched thousands of lives and created lasting change in our community. We believe that when people come together with compassion and purpose, extraordinary things happen. Join us — whether through a donation, your time, or simply spreading the word.",
    defaultQuestions: [
      { question: "What is your organization's mission area?", fieldType: "select", options: ["Community Services", "Education", "Environment", "Health", "Animal Welfare", "Arts & Culture", "Youth", "Other"], required: true },
      { question: "Do you accept online donations?", fieldType: "boolean", options: null, required: true },
      { question: "Do you have volunteer opportunities?", fieldType: "boolean", options: null, required: true },
      { question: "Are you a registered 501(c)(3)?", fieldType: "boolean", options: null, required: true },
    ],
    defaultHours: { mon: "9:00 AM - 5:00 PM", tue: "9:00 AM - 5:00 PM", wed: "9:00 AM - 5:00 PM", thu: "9:00 AM - 5:00 PM", fri: "9:00 AM - 5:00 PM", sat: "Varies by Event", sun: "Closed" },
    commonTrustSignals: ["501(c)(3) Tax-Exempt", "100% of Donations Go to Programs", "Transparent Financial Reporting", "Award-Winning Organization", "Community-Driven"],
    faqLibrary: [
      { question: "Is my donation tax-deductible?", answer: "Yes! {Business Name} is a registered 501(c)(3) organization. All donations are tax-deductible to the extent allowed by law. You'll receive a receipt for your records." },
      { question: "How can I volunteer?", answer: "We'd love to have you! Fill out our volunteer form and we'll match you with an opportunity that fits your interests and schedule. We welcome individuals, families, and corporate groups." },
      { question: "Where does my money go?", answer: "We are committed to transparency. The majority of every dollar goes directly to our programs and services. Our annual report and financial statements are available on our website." },
    ],
    primaryColors: ["#15803d", "#f0fdf4", "#fef3c7"],
    imageryThemes: ["volunteers", "community_events", "impact_stories", "people_helping", "happy_beneficiaries"],
    tone: "compassionate, inspiring, transparent",
    fontPreference: "friendly sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "contact_form", "about_bio"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "NGO",
    seoKeywords: ["nonprofit {City}", "charity {City}", "volunteer {City}", "donate {City}", "community organization {City}"],
    requiredPages: ["home", "about", "contact"],
    optionalPages: ["programs", "donate", "volunteer", "events", "impact", "news", "partners"],
    conversionPriority: "donations",
  },

  // 28. Pet Services
  {
    industryCode: "pet_services",
    displayName: "Pet Services",
    category: "personal_care",
    subNiches: ["dog_grooming", "pet_boarding", "dog_walking", "pet_sitting", "dog_training", "pet_daycare", "mobile_grooming"],
    archetype: Archetype.SERVICE,
    keywords: ["pet grooming", "dog grooming", "pet boarding", "dog walker", "pet sitting", "dog training", "pet daycare", "mobile grooming", "cat grooming", "pet care"],
    defaultFeatures: ["booking_widget", "service_menu_pricing", "gallery", "testimonials", "trust_badges", "click_to_call", "pet_parent_resources"],
    defaultServices: [
      { name: "Dog Grooming", description: "Full-service grooming including bath, haircut, nail trim, ear cleaning, and teeth brushing for all breeds and sizes." },
      { name: "Pet Boarding", description: "Safe, comfortable overnight boarding with supervised playtime, cozy sleeping areas, and plenty of love." },
      { name: "Dog Walking", description: "Scheduled daily walks for dogs of all sizes — solo or small group outings in your neighborhood." },
      { name: "Pet Daycare", description: "Supervised indoor and outdoor play, socialization, rest time, and enrichment activities for dogs." },
      { name: "Dog Training", description: "Obedience training, puppy classes, and behavior modification using positive reinforcement methods." },
    ],
    sampleTaglines: [
      "Where {City}'s Pets Are Family",
      "{Business Name} — Trusted Pet Care in {City} for {Years}+ Years",
      "Happy Pets, Happy Parents. Book Today!",
    ],
    sampleAbout: "At {Business Name}, we've been treating {City}'s pets like our own for over {Years} years. Our team of certified groomers, experienced pet care providers, and devoted animal lovers is passionate about keeping your furry family members happy, healthy, and looking their best. From a fresh grooming session to overnight boarding, every visit includes extra belly rubs and tail wags. We're bonded, insured, and pet first aid certified — because your pet's safety and comfort come first.",
    defaultQuestions: [
      { question: "What pet services do you offer?", fieldType: "multiselect", options: ["Grooming", "Boarding", "Dog Walking", "Daycare", "Training", "Pet Sitting", "Mobile Grooming"], required: true },
      { question: "What types of pets do you serve?", fieldType: "multiselect", options: ["Dogs", "Cats", "Small Animals", "All Pets"], required: true },
      { question: "Do you offer online booking?", fieldType: "boolean", options: null, required: true },
      { question: "Are you bonded and insured?", fieldType: "boolean", options: null, required: true },
    ],
    defaultHours: { mon: "7:00 AM - 6:00 PM", tue: "7:00 AM - 6:00 PM", wed: "7:00 AM - 6:00 PM", thu: "7:00 AM - 6:00 PM", fri: "7:00 AM - 6:00 PM", sat: "8:00 AM - 4:00 PM", sun: "9:00 AM - 2:00 PM" },
    commonTrustSignals: ["Bonded & Insured", "Pet First Aid Certified", "Certified Groomers", "Cage-Free Environment", "Vet-Recommended"],
    faqLibrary: [
      { question: "Is my pet safe during boarding?", answer: "Absolutely. Our facility is staffed 24/7 during boarding, and all play areas are supervised. We require up-to-date vaccinations and conduct temperament assessments. Your pet's safety is our top priority." },
      { question: "How often should I groom my dog?", answer: "It depends on the breed and coat type. Most dogs benefit from grooming every 4-8 weeks. We'll recommend a schedule that keeps your pup looking and feeling their best." },
    ],
    primaryColors: ["#ea580c", "#fff7ed", "#78350f"],
    imageryThemes: ["happy_pets", "grooming_sessions", "dogs_playing", "pet_portraits", "pet_care_team"],
    tone: "playful, caring, trustworthy",
    fontPreference: "rounded sans-serif",
    layoutDensity: "visual-heavy",
    requiredSections: ["services_list", "contact_form", "about_bio"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "PetStore",
    seoKeywords: ["pet grooming near me", "dog grooming {City}", "pet boarding {City}", "dog walker {City}", "pet daycare {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "gallery", "pricing", "faq", "reviews", "booking"],
    conversionPriority: "online_bookings",
  },

  // 29. Auto Repair
  {
    industryCode: "auto_repair",
    displayName: "Auto Repair",
    category: "trades",
    subNiches: ["general_auto_repair", "brake_service", "oil_change", "transmission", "auto_body", "tire_service", "diagnostics"],
    archetype: Archetype.SERVICE,
    keywords: ["auto repair", "mechanic", "car repair", "brake service", "oil change", "auto shop", "transmission repair", "check engine light", "car maintenance", "tire service"],
    defaultFeatures: ["quote_form", "service_menu", "testimonials", "trust_badges", "click_to_call", "coupon_display", "hours_display"],
    defaultServices: [
      { name: "General Auto Repair", description: "Comprehensive diagnostics and repair for all makes and models — engine, electrical, suspension, and more." },
      { name: "Brake Service", description: "Brake pad replacement, rotor resurfacing, brake fluid flush, and complete brake system inspection." },
      { name: "Oil Change & Maintenance", description: "Conventional and synthetic oil changes, filter replacements, and multi-point vehicle inspections." },
      { name: "Engine Diagnostics", description: "Computer diagnostics for check engine lights, performance issues, and emission system problems." },
      { name: "Tire Sales & Service", description: "New tire sales, mounting, balancing, rotation, alignment, and flat repair." },
    ],
    sampleTaglines: [
      "Honest Auto Repair {City} Trusts",
      "{Business Name} — Keeping {City} on the Road for {Years}+ Years",
      "Fair Prices. Expert Mechanics. No Surprises.",
    ],
    sampleAbout: "{Business Name} has been {City}'s trusted auto repair shop for over {Years} years. Our ASE-certified mechanics work on all makes and models, providing honest diagnostics, fair pricing, and quality repairs — every time. We know car trouble is stressful, so we explain every repair in plain language, provide upfront estimates, and never upsell services you don't need. From routine oil changes to major engine work, {Business Name} keeps {City} drivers safe on the road.",
    defaultQuestions: [
      { question: "What services do you offer?", fieldType: "multiselect", options: ["General Repair", "Brakes", "Oil Change", "Diagnostics", "Tires", "Transmission", "A/C", "Body Work"], required: true },
      { question: "Are your mechanics ASE certified?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer free estimates?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer a warranty on repairs?", fieldType: "boolean", options: null, required: false },
      { question: "What makes and models do you service?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "7:30 AM - 5:30 PM", tue: "7:30 AM - 5:30 PM", wed: "7:30 AM - 5:30 PM", thu: "7:30 AM - 5:30 PM", fri: "7:30 AM - 5:30 PM", sat: "8:00 AM - 1:00 PM", sun: "Closed" },
    commonTrustSignals: ["ASE Certified Mechanics", "Free Estimates", "12-Month/12K-Mile Warranty", "All Makes & Models", "No Upselling — Ever"],
    faqLibrary: [
      { question: "How do I know if I need a repair or just maintenance?", answer: "Warning lights, unusual sounds, vibrations, or fluid leaks usually signal a needed repair. We offer free inspections and will explain exactly what's needed — and what can wait — so you can make an informed decision." },
      { question: "Do you offer a warranty on parts and labor?", answer: "Yes! We stand behind our work with a 12-month / 12,000-mile warranty on parts and labor for most repairs. Ask us for details on specific services." },
      { question: "Can I wait while my car is being serviced?", answer: "Absolutely. We have a comfortable waiting area with WiFi, coffee, and TV. For longer repairs, we can arrange a drop-off and call you when your vehicle is ready." },
    ],
    primaryColors: ["#dc2626", "#1e1e1e", "#fafafa"],
    imageryThemes: ["mechanics_working", "auto_shop", "car_repair", "tools_equipment", "happy_customers"],
    tone: "honest, reliable, straightforward",
    fontPreference: "strong sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "hours_display", "location_map", "quote_form"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "AutoRepair",
    seoKeywords: ["auto repair near me", "mechanic {City}", "car repair {City}", "brake service {City}", "oil change {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "coupons", "gallery", "faq", "reviews"],
    conversionPriority: "phone_calls",
  },

  // 30. Moving Company
  {
    industryCode: "moving_company",
    displayName: "Moving Company",
    category: "trades",
    subNiches: ["local_moving", "long_distance_moving", "commercial_moving", "packing_services", "storage", "piano_moving", "senior_moving"],
    archetype: Archetype.SERVICE,
    keywords: ["moving company", "movers", "moving service", "local movers", "long distance moving", "packing services", "moving truck", "relocation", "storage", "moving estimate"],
    defaultFeatures: ["quote_form", "service_area_map", "testimonials", "trust_badges", "click_to_call", "pricing_calculator", "checklist_download"],
    defaultServices: [
      { name: "Local Moving", description: "Full-service local moves with careful packing, loading, transport, and unpacking — all within the {City} area." },
      { name: "Long-Distance Moving", description: "Interstate and cross-country moves with dedicated trucks, tracking, and guaranteed delivery windows." },
      { name: "Packing & Unpacking", description: "Professional packing with quality materials to protect your belongings. Unpacking services available at your new home." },
      { name: "Commercial Moving", description: "Office relocations, retail moves, and commercial moves with minimal downtime and after-hours scheduling." },
      { name: "Storage Solutions", description: "Short-term and long-term climate-controlled storage for when your move-in date doesn't align with your move-out." },
    ],
    sampleTaglines: [
      "Moving {City} — Carefully, Quickly, Affordably",
      "{Business Name} — {City}'s Trusted Movers for {Years}+ Years",
      "Free Estimate. No Hidden Fees. Let's Get You Moved!",
    ],
    sampleAbout: "{Business Name} has been helping {City} residents and businesses move with ease for over {Years} years. Our trained, background-checked moving crew handles your belongings with the same care we'd give our own. From a studio apartment to a corporate headquarters, we provide transparent pricing, on-time service, and a stress-free experience from start to finish. No hidden fees, no surprises — just honest, hardworking movers who get the job done right.",
    defaultQuestions: [
      { question: "What types of moves do you handle?", fieldType: "multiselect", options: ["Local", "Long-Distance", "Commercial/Office", "Packing Only", "Storage"], required: true },
      { question: "Do you offer free in-home estimates?", fieldType: "boolean", options: null, required: true },
      { question: "Are you licensed and insured?", fieldType: "boolean", options: null, required: true },
      { question: "Do you offer packing materials and services?", fieldType: "boolean", options: null, required: false },
      { question: "What is your availability for weekend moves?", fieldType: "text", options: null, required: false },
    ],
    defaultHours: { mon: "7:00 AM - 7:00 PM", tue: "7:00 AM - 7:00 PM", wed: "7:00 AM - 7:00 PM", thu: "7:00 AM - 7:00 PM", fri: "7:00 AM - 7:00 PM", sat: "7:00 AM - 5:00 PM", sun: "8:00 AM - 3:00 PM" },
    commonTrustSignals: ["Licensed & Insured", "Free In-Home Estimates", "No Hidden Fees", "Background-Checked Crew", "BBB Accredited"],
    faqLibrary: [
      { question: "How far in advance should I book my move?", answer: "We recommend booking 2-4 weeks in advance for local moves and 4-8 weeks for long-distance. End-of-month and summer dates fill up fast, so the earlier the better!" },
      { question: "Are my belongings insured during the move?", answer: "Yes. We carry full liability coverage, and basic valuation protection is included with every move. We also offer full-value replacement coverage for an additional fee." },
      { question: "Do you charge for stairs or heavy items?", answer: "We provide transparent, all-inclusive quotes after an in-home or virtual estimate. We'll factor in stairs, heavy items, and any special requirements so there are no surprises on moving day." },
    ],
    primaryColors: ["#2563eb", "#f97316", "#f8fafc"],
    imageryThemes: ["moving_truck", "movers_carrying", "happy_family_new_home", "packing_boxes", "moving_crew"],
    tone: "reliable, efficient, reassuring",
    fontPreference: "strong sans-serif",
    layoutDensity: "moderate",
    requiredSections: ["services_list", "quote_form", "service_area_map", "testimonials"],
    isRegulated: false,
    defaultDisclaimers: null,
    schemaType: "MovingCompany",
    seoKeywords: ["movers near me", "moving company {City}", "local movers {City}", "long distance movers {City}", "packing services {City}"],
    requiredPages: ["home", "services", "contact"],
    optionalPages: ["about", "service-areas", "packing", "storage", "faq", "reviews", "get-a-quote"],
    conversionPriority: "phone_calls",
  },
];

// -----------------------------------------------------------------------------
// Main seed function
// -----------------------------------------------------------------------------

async function main() {
  console.log("🌱 Xusmo Industry Seeder\n");
  console.log("=".repeat(50));

  let created = 0;
  let skipped = 0;
  const archetypeCounts: Record<string, number> = {};

  for (const industry of industries) {
    // Track archetype counts
    archetypeCounts[industry.archetype] = (archetypeCounts[industry.archetype] || 0) + 1;

    const existing = await prisma.industryDefault.findUnique({
      where: { industryCode: industry.industryCode },
    });

    if (existing) {
      // Update with any new fields (e.g. requiredSections, visual style)
      await prisma.industryDefault.update({
        where: { industryCode: industry.industryCode },
        data: industry,
      });
      console.log(`🔄 ${industry.displayName} — updated`);
      skipped++;
      continue;
    }

    await prisma.industryDefault.create({ data: industry });
    console.log(`✅ ${industry.displayName}`);
    created++;
  }

  console.log("\n" + "=".repeat(50));
  console.log(`\n📊 Seed Summary:`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total:   ${industries.length}\n`);

  console.log("📂 Archetype Breakdown:");
  for (const [archetype, count] of Object.entries(archetypeCounts).sort()) {
    console.log(`   ${archetype}: ${count}`);
  }

  console.log();
}

// =============================================================================
// Actor Seeding — Create demo users, tenants, and memberships for all 17 actors
// =============================================================================

async function seedActors() {
  console.log("\n" + "=".repeat(50));
  console.log("Seeding Actor System (17 actor types)...\n");

  // -------------------------------------------------------------------------
  // 1. Create Tenants
  // -------------------------------------------------------------------------
  const tenantAlpha = await prisma.tenant.upsert({
    where: { slug: "alpha-plumbing" },
    update: {},
    create: {
      id: "tenant-alpha",
      slug: "alpha-plumbing",
      domain: "alpha-plumbing.xusmo.io",
      planName: "growth",
      status: "ACTIVE",
      productLimit: 1000,
      storeLimit: 5,
      orderMonthlyLimit: 5000,
      siteLimit: 10,
      featureFlags: { ai_pricing: true, staging_area: true, auto_blogger: true },
    },
  });
  console.log(`  Tenant: ${tenantAlpha.slug} (${tenantAlpha.planName})`);

  const tenantBeta = await prisma.tenant.upsert({
    where: { slug: "beta-restaurant" },
    update: {},
    create: {
      id: "tenant-beta",
      slug: "beta-restaurant",
      domain: "beta-restaurant.xusmo.io",
      planName: "starter",
      status: "ACTIVE",
      productLimit: 100,
      storeLimit: 1,
      orderMonthlyLimit: 500,
      siteLimit: 3,
      featureFlags: {},
    },
  });
  console.log(`  Tenant: ${tenantBeta.slug} (${tenantBeta.planName})`);

  // -------------------------------------------------------------------------
  // 2. Create TenantSettings
  // -------------------------------------------------------------------------
  await prisma.tenantSettings.upsert({
    where: { tenantId: tenantAlpha.id },
    update: {},
    create: { tenantId: tenantAlpha.id, settings: {} },
  });
  await prisma.tenantSettings.upsert({
    where: { tenantId: tenantBeta.id },
    update: {},
    create: { tenantId: tenantBeta.id, settings: {} },
  });

  // -------------------------------------------------------------------------
  // 3. Create Users (one per actor type that uses Xusmo auth)
  // -------------------------------------------------------------------------
  const users = [
    // Platform tier
    { id: "user-platform-owner", name: "George (Super Admin)", email: "george@xusmo.io", role: "ADMIN" as const },
    { id: "user-platform-ops", name: "Omar (Platform Ops)", email: "ops@xusmo.io", role: "ADMIN" as const },
    { id: "user-platform-support", name: "Sara (Support)", email: "support@xusmo.io", role: "SUPPORT" as const },
    // Tenant A team
    { id: "user-tenant-owner", name: "Alice (Owner)", email: "owner@alphaplumbing.com", role: "CUSTOMER" as const },
    { id: "user-tenant-admin", name: "Andy (Admin)", email: "admin@alphaplumbing.com", role: "CUSTOMER" as const },
    { id: "user-catalog-mgr", name: "Carl (Catalog)", email: "catalog@alphaplumbing.com", role: "CUSTOMER" as const },
    { id: "user-ops-mgr", name: "Olivia (Ops)", email: "ops@alphaplumbing.com", role: "CUSTOMER" as const },
    // Developer
    { id: "user-dev", name: "Dana (Developer)", email: "dev@thirdparty.io", role: "CUSTOMER" as const },
    // Site team members
    { id: "user-site-manager", name: "Mike (Site Manager)", email: "manager@freelancer.com", role: "CUSTOMER" as const },
    { id: "user-site-editor", name: "Eve (Site Editor)", email: "editor@freelancer.com", role: "CUSTOMER" as const },
    { id: "user-site-viewer", name: "Vicky (Site Viewer)", email: "viewer@client.com", role: "CUSTOMER" as const },
    // Tenant B owner (for cross-tenant isolation testing)
    { id: "user-other-tenant", name: "Bob (Tenant B Owner)", email: "owner@betarestaurant.com", role: "CUSTOMER" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {},
      create: { id: u.id, name: u.name, email: u.email, role: u.role },
    });
  }
  console.log(`  Created/verified ${users.length} users`);

  // -------------------------------------------------------------------------
  // 4. Create TenantMemberships (RBAC roles)
  // -------------------------------------------------------------------------
  const memberships: Array<{ tenantId: string; userId: string; role: string }> = [
    // Platform tier → assigned to Tenant A (they can access any tenant)
    { tenantId: tenantAlpha.id, userId: "user-platform-owner", role: "PLATFORM_OWNER" },
    { tenantId: tenantAlpha.id, userId: "user-platform-ops", role: "PLATFORM_OPS" },
    { tenantId: tenantAlpha.id, userId: "user-platform-support", role: "PLATFORM_SUPPORT" },
    // Tenant A members
    { tenantId: tenantAlpha.id, userId: "user-tenant-owner", role: "TENANT_OWNER" },
    { tenantId: tenantAlpha.id, userId: "user-tenant-admin", role: "TENANT_ADMIN" },
    { tenantId: tenantAlpha.id, userId: "user-catalog-mgr", role: "TENANT_CATALOG" },
    { tenantId: tenantAlpha.id, userId: "user-ops-mgr", role: "TENANT_OPS" },
    // Developer
    { tenantId: tenantAlpha.id, userId: "user-dev", role: "DEV_APP_OWNER" },
    // Site team (also need tenant membership to access studio)
    { tenantId: tenantAlpha.id, userId: "user-site-manager", role: "TENANT_ADMIN" },
    { tenantId: tenantAlpha.id, userId: "user-site-editor", role: "TENANT_ADMIN" },
    { tenantId: tenantAlpha.id, userId: "user-site-viewer", role: "TENANT_ADMIN" },
    // Tenant B
    { tenantId: tenantBeta.id, userId: "user-other-tenant", role: "TENANT_OWNER" },
  ];

  for (const m of memberships) {
    await prisma.tenantMember.upsert({
      where: { tenantId_userId: { tenantId: m.tenantId, userId: m.userId } },
      update: {},
      create: { tenantId: m.tenantId, userId: m.userId, role: m.role as never },
    });
  }
  console.log(`  Created/verified ${memberships.length} tenant memberships`);

  // -------------------------------------------------------------------------
  // 5. Create Demo Sites
  // -------------------------------------------------------------------------
  const siteA1 = await prisma.site.upsert({
    where: { id: "site-a1" },
    update: {},
    create: {
      id: "site-a1",
      userId: "user-tenant-owner",
      tenantId: tenantAlpha.id,
      businessName: "Alpha Plumbing Co",
      archetype: "SERVICE",
      status: "LIVE",
      wpUrl: "https://alpha-plumbing.xusmo.io",
      tier: "PRO",
    },
  });

  const siteB1 = await prisma.site.upsert({
    where: { id: "site-b1" },
    update: {},
    create: {
      id: "site-b1",
      userId: "user-other-tenant",
      tenantId: tenantBeta.id,
      businessName: "Beta Italian Kitchen",
      archetype: "VENUE",
      status: "STAGING",
      tier: "BASIC",
    },
  });
  console.log(`  Created/verified 2 demo sites: ${siteA1.businessName}, ${siteB1.businessName}`);

  // -------------------------------------------------------------------------
  // 6. Create TeamMember entries (site-level roles)
  // -------------------------------------------------------------------------
  const teamMembers = [
    { siteId: siteA1.id, userId: "user-site-manager", inviteEmail: "manager@freelancer.com", role: "MANAGER" as const, status: "ACCEPTED" as const },
    { siteId: siteA1.id, userId: "user-site-editor", inviteEmail: "editor@freelancer.com", role: "EDITOR" as const, status: "ACCEPTED" as const },
    { siteId: siteA1.id, userId: "user-site-viewer", inviteEmail: "viewer@client.com", role: "VIEWER" as const, status: "ACCEPTED" as const },
  ];

  for (const tm of teamMembers) {
    const existing = await prisma.teamMember.findFirst({
      where: { siteId: tm.siteId, inviteEmail: tm.inviteEmail },
    });
    if (!existing) {
      await prisma.teamMember.create({
        data: {
          siteId: tm.siteId,
          userId: "user-tenant-owner",
          inviteEmail: tm.inviteEmail,
          inviteeUserId: tm.userId,
          role: tm.role,
          status: tm.status,
          acceptedAt: new Date(),
        },
      });
    }
  }
  console.log(`  Created/verified ${teamMembers.length} team memberships`);

  console.log("\n  Actor seeding complete!");
  console.log("  Summary:");
  console.log("    Platform actors: 3 (PLATFORM_OWNER, PLATFORM_OPS, PLATFORM_SUPPORT)");
  console.log("    Tenant A actors: 4 (TENANT_OWNER, TENANT_ADMIN, TENANT_CATALOG, TENANT_OPS)");
  console.log("    Developer:       1 (DEV_APP_OWNER)");
  console.log("    Site team:       3 (MANAGER, EDITOR, VIEWER)");
  console.log("    Tenant B:        1 (cross-tenant isolation testing)");
  console.log("    WP actors:       3 (admin, shop_manager, customer — WP-native, not seeded here)");
  console.log("    External:        3 (anonymous, share link, form submitter — no DB records)");
  console.log("    Total:          18 (17 unique + 1 cross-tenant test actor)\n");
}

main()
  .then(async () => {
    await seedActors();
    await seedThemePool();
    console.log("Seeding complete!\n");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("Seeding failed:", e);
    return prisma.$disconnect().then(() => process.exit(1));
  });

import { createRoot } from "react-dom/client";
// clean-corporate
import { HeroSplitScreen } from "./components/HeroSplitScreen";
import { FeaturesColumns } from "./components/FeaturesColumns";
import { TestimonialsCards } from "./components/TestimonialsCards";
import { CtaGradient } from "./components/CtaGradient";
// dark-luxury
import { HeroCinematic } from "./components/HeroCinematic";
import { ServicesOverlayCards } from "./components/ServicesOverlayCards";
import { TestimonialEditorial } from "./components/TestimonialEditorial";
import { CtaBorderline } from "./components/CtaBorderline";
// bold-startup
import { HeroGradientBlob } from "./components/HeroGradientBlob";
import { FeaturesRoundedCards } from "./components/FeaturesRoundedCards";
import { TestimonialsAvatarCards } from "./components/TestimonialsAvatarCards";
import { CtaMeshBanner } from "./components/CtaMeshBanner";
// elegant-studio
import { HeroAsymmetricMinimal } from "./components/HeroAsymmetricMinimal";
import { ServicesAlternatingRows } from "./components/ServicesAlternatingRows";
import { TestimonialCentered } from "./components/TestimonialCentered";
import { CtaUnderlineText } from "./components/CtaUnderlineText";
// industrial
import { HeroUppercase } from "./components/HeroUppercase";
import { FeaturesNumberedGrid } from "./components/FeaturesNumberedGrid";
import { StatsProof } from "./components/StatsProof";
import { CtaBrightBorder } from "./components/CtaBrightBorder";
// warm-friendly
import { HeroWarmSplit } from "./components/HeroWarmSplit";
import { ServicesWarmCircles } from "./components/ServicesWarmCircles";
import { TestimonialsWarmCards } from "./components/TestimonialsWarmCards";
import { CtaWarmGradient } from "./components/CtaWarmGradient";

// Map component names → anchor IDs for in-page navigation
const SECTION_IDS: Record<string, string> = {
  FeaturesColumns: "services",
  ServicesOverlayCards: "services",
  FeaturesRoundedCards: "services",
  ServicesAlternatingRows: "services",
  FeaturesNumberedGrid: "services",
  ServicesWarmCircles: "services",
  CtaGradient: "contact",
  CtaBorderline: "contact",
  CtaMeshBanner: "contact",
  CtaUnderlineText: "contact",
  CtaBrightBorder: "contact",
  CtaWarmGradient: "contact",
  TestimonialsCards: "testimonials",
  TestimonialEditorial: "testimonials",
  TestimonialsAvatarCards: "testimonials",
  TestimonialCentered: "testimonials",
  StatsProof: "testimonials",
  TestimonialsWarmCards: "testimonials",
};

const COMPONENTS: Record<string, React.ComponentType<Record<string, string>>> = {
  // clean-corporate
  HeroSplitScreen,
  FeaturesColumns,
  TestimonialsCards,
  CtaGradient,
  // dark-luxury
  HeroCinematic,
  ServicesOverlayCards,
  TestimonialEditorial,
  CtaBorderline,
  // bold-startup
  HeroGradientBlob,
  FeaturesRoundedCards,
  TestimonialsAvatarCards,
  CtaMeshBanner,
  // elegant-studio
  HeroAsymmetricMinimal,
  ServicesAlternatingRows,
  TestimonialCentered,
  CtaUnderlineText,
  // industrial
  HeroUppercase,
  FeaturesNumberedGrid,
  StatsProof,
  CtaBrightBorder,
  // warm-friendly
  HeroWarmSplit,
  ServicesWarmCircles,
  TestimonialsWarmCards,
  CtaWarmGradient,
};

function boot() {
  console.log("[xusmo] React bundle v2 — booting...");
  const mountPoints = document.querySelectorAll<HTMLElement>("[data-xusmo-component]");
  console.log(`[xusmo] Found ${mountPoints.length} mount points`);

  mountPoints.forEach((el) => {
    const componentName = el.getAttribute("data-xusmo-component");
    if (!componentName) return;

    const Component = COMPONENTS[componentName];
    if (!Component) {
      console.warn(`[xusmo] Unknown component: ${componentName}`);
      return;
    }

    let props: Record<string, string> = {};
    try {
      const raw = el.getAttribute("data-xusmo-props");
      if (raw) props = JSON.parse(raw);
    } catch (err) {
      console.warn(`[xusmo] Failed to parse props for ${componentName}:`, err);
    }

    // Set section ID for anchor navigation (e.g. #contact, #services)
    const sectionId = SECTION_IDS[componentName];
    if (sectionId) el.id = sectionId;

    console.log(`[xusmo] Mounting: ${componentName}`);
    const root = createRoot(el);
    root.render(<Component {...props} />);
  });

  console.log("[xusmo] All components mounted successfully");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

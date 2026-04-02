// =============================================================================
// ADA Accessibility Checker
// Performs static HTML analysis against common WCAG 2.1 guidelines.
// Returns a list of errors and warnings with rule references and suggestions.
// Usage: import { checkAccessibility } from "@/lib/compliance/ada-check";
// =============================================================================

export interface AccessibilityIssue {
  type: "error" | "warning";
  rule: string;
  description: string;
  suggestion: string;
}

export function checkAccessibility(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check images without alt text
  const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi);
  if (imgWithoutAlt) {
    issues.push({
      type: "error",
      rule: "WCAG 1.1.1",
      description: `${imgWithoutAlt.length} image(s) missing alt text`,
      suggestion: "Add descriptive alt text to all images",
    });
  }

  // Check heading hierarchy
  const headings = [...html.matchAll(/<h([1-6])/gi)].map((m) =>
    parseInt(m[1])
  );
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] > headings[i - 1] + 1) {
      issues.push({
        type: "warning",
        rule: "WCAG 1.3.1",
        description: `Heading level skipped: h${headings[i - 1]} to h${headings[i]}`,
        suggestion: "Use sequential heading levels (h1, h2, h3)",
      });
      break;
    }
  }

  // Check for small text sizes
  const smallText = html.match(/font-size:\s*(\d+)px/g);
  if (smallText) {
    const sizes = smallText.map((s) => parseInt(s.match(/\d+/)![0]));
    if (sizes.some((s) => s < 12)) {
      issues.push({
        type: "warning",
        rule: "WCAG 1.4.4",
        description: "Text smaller than 12px found",
        suggestion: "Minimum text size should be 14px for readability",
      });
    }
  }

  // Check for form inputs without labels
  const inputsWithoutLabels = html.match(
    /<input(?![^>]*aria-label)[^>]*(?!<\/label>)/gi
  );
  if (inputsWithoutLabels && inputsWithoutLabels.length > 0) {
    issues.push({
      type: "warning",
      rule: "WCAG 1.3.1",
      description: "Form inputs may be missing labels",
      suggestion: "Add labels or aria-label to all form inputs",
    });
  }

  // Check for empty links
  const emptyLinks = html.match(/<a[^>]*>[\s]*<\/a>/gi);
  if (emptyLinks) {
    issues.push({
      type: "error",
      rule: "WCAG 2.4.4",
      description: `${emptyLinks.length} empty link(s) found`,
      suggestion: "Add descriptive text to all links",
    });
  }

  // Check for lang attribute on html tag
  if (!html.match(/<html[^>]*lang=/i)) {
    issues.push({
      type: "warning",
      rule: "WCAG 3.1.1",
      description: "HTML lang attribute not set",
      suggestion: "Add lang attribute to <html> tag",
    });
  }

  return issues;
}

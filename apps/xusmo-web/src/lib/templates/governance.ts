// =============================================================================
// Template Governance — Golden Image versioning and quality checks
// =============================================================================

export interface TemplateVersion {
  id: string;
  name: string;
  version: string;
  archetype: string;
  lighthouseScore: number;
  mobileScore: number;
  coreWebVitals: "green" | "yellow" | "red";
  sitesUsing: number;
  status: "active" | "deprecated" | "testing";
  createdAt: string;
  updatedAt: string;
}

export interface QualityCheckResult {
  templateId: string;
  lighthouseScore: number;
  mobileResponsive: boolean;
  coreWebVitals: "green" | "yellow" | "red";
  accessibilityScore: number;
  passed: boolean;
  issues: string[];
}

/**
 * Get all template versions
 * MVP: Returns mock data
 */
export function getTemplateVersions(): TemplateVersion[] {
  return [
    {
      id: "tpl-service-v2",
      name: "Service Business",
      version: "2.1.0",
      archetype: "SERVICE",
      lighthouseScore: 95,
      mobileScore: 98,
      coreWebVitals: "green",
      sitesUsing: 45,
      status: "active",
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-03-01T00:00:00Z",
    },
    {
      id: "tpl-venue-v2",
      name: "Venue & Location",
      version: "2.0.3",
      archetype: "VENUE",
      lighthouseScore: 92,
      mobileScore: 96,
      coreWebVitals: "green",
      sitesUsing: 28,
      status: "active",
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-20T00:00:00Z",
    },
    {
      id: "tpl-portfolio-v2",
      name: "Portfolio & Professional",
      version: "2.0.1",
      archetype: "PORTFOLIO",
      lighthouseScore: 94,
      mobileScore: 97,
      coreWebVitals: "green",
      sitesUsing: 19,
      status: "active",
      createdAt: "2025-01-15T00:00:00Z",
      updatedAt: "2025-02-10T00:00:00Z",
    },
    {
      id: "tpl-service-v1",
      name: "Service Business (Legacy)",
      version: "1.5.0",
      archetype: "SERVICE",
      lighthouseScore: 82,
      mobileScore: 88,
      coreWebVitals: "yellow",
      sitesUsing: 12,
      status: "deprecated",
      createdAt: "2024-10-01T00:00:00Z",
      updatedAt: "2025-01-15T00:00:00Z",
    },
  ];
}

/**
 * Run quality checks on a template
 */
export async function runQualityChecks(
  _templateId: string
): Promise<QualityCheckResult> {
  // MVP placeholder
  return {
    templateId: _templateId,
    lighthouseScore: 94,
    mobileResponsive: true,
    coreWebVitals: "green",
    accessibilityScore: 91,
    passed: true,
    issues: [],
  };
}

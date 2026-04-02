// =============================================================================
// Data Flywheel — Defaults Enrichment Engine
// Feeds learnings from approved builds back into industry defaults
// =============================================================================

export interface EnrichmentSuggestion {
  id: string;
  type: "add_service" | "remove_service" | "update_questions" | "update_style";
  industryCode: string;
  industryName: string;
  value: string;
  occurrences: number;
  confidence: number; // 0-1
  status: "pending" | "applied" | "dismissed";
  createdAt: string;
}

export interface IndustryMaturity {
  industryCode: string;
  industryName: string;
  totalBuilds: number;
  approvedBuilds: number;
  avgRevisions: number;
  maturityScore: number; // 0-100
  revisionRate: number; // % of builds that had revisions
}

/**
 * Analyze approved builds and generate enrichment suggestions
 * MVP: Returns mock suggestions
 * Production: Queries actual build data from DB
 */
export function generateEnrichmentSuggestions(): EnrichmentSuggestion[] {
  // In production, this queries the DB for patterns
  return [
    {
      id: "sug-1",
      type: "add_service",
      industryCode: "plumbing",
      industryName: "Plumbing",
      value: "Water heater installation",
      occurrences: 5,
      confidence: 0.85,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sug-2",
      type: "add_service",
      industryCode: "restaurant",
      industryName: "Restaurant",
      value: "Online ordering",
      occurrences: 8,
      confidence: 0.92,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: "sug-3",
      type: "remove_service",
      industryCode: "photography",
      industryName: "Photography",
      value: "Film development",
      occurrences: 3,
      confidence: 0.7,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ];
}

/**
 * Calculate industry maturity scores
 */
export function calculateIndustryMaturity(): IndustryMaturity[] {
  // MVP mock data
  return [
    { industryCode: "plumbing", industryName: "Plumbing", totalBuilds: 24, approvedBuilds: 20, avgRevisions: 0.8, maturityScore: 85, revisionRate: 15 },
    { industryCode: "restaurant", industryName: "Restaurant", totalBuilds: 18, approvedBuilds: 15, avgRevisions: 1.2, maturityScore: 72, revisionRate: 22 },
    { industryCode: "photography", industryName: "Photography", totalBuilds: 12, approvedBuilds: 10, avgRevisions: 1.5, maturityScore: 60, revisionRate: 30 },
    { industryCode: "legal", industryName: "Legal", totalBuilds: 8, approvedBuilds: 6, avgRevisions: 2.0, maturityScore: 45, revisionRate: 40 },
    { industryCode: "fitness", industryName: "Fitness", totalBuilds: 15, approvedBuilds: 13, avgRevisions: 0.6, maturityScore: 78, revisionRate: 10 },
  ];
}

/**
 * Apply an enrichment suggestion to the defaults
 */
export async function applySuggestion(_suggestionId: string): Promise<boolean> {
  // In production: updates the IndustryDefault record in DB
  return true;
}

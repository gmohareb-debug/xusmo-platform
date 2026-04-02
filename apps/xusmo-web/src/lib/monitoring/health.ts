// =============================================================================
// Site Health Monitoring — Check site availability, response time, and status
// Provides a reusable health check function for both API routes and agents.
// Usage: import { checkSiteHealth, type HealthResult } from "@/lib/monitoring/health";
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HealthCheck {
  name: string;
  status: "pass" | "fail";
  detail?: string;
}

export interface HealthResult {
  status: "healthy" | "degraded" | "down";
  responseTime: number;
  checks: HealthCheck[];
  score: number; // 0-100
}

// ---------------------------------------------------------------------------
// checkSiteHealth — probe a WordPress site's URL and report status
// ---------------------------------------------------------------------------

export async function checkSiteHealth(wpUrl: string): Promise<HealthResult> {
  const checks: HealthCheck[] = [];
  const start = Date.now();
  let status: HealthResult["status"] = "healthy";
  let score = 100;

  // Check 1: Homepage response
  try {
    const res = await fetch(wpUrl, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "Xusmo-HealthCheck/1.0" },
    });
    checks.push({
      name: "Homepage",
      status: res.ok ? "pass" : "fail",
      detail: `HTTP ${res.status}`,
    });
    if (!res.ok) {
      status = "degraded";
      score -= 30;
    }
  } catch {
    checks.push({
      name: "Homepage",
      status: "fail",
      detail: "Timeout or unreachable",
    });
    status = "down";
    score -= 50;
  }

  const responseTime = Date.now() - start;

  // Check 2: Response time
  if (responseTime < 1000) {
    checks.push({
      name: "Response Time",
      status: "pass",
      detail: `${responseTime}ms (excellent)`,
    });
  } else if (responseTime < 3000) {
    checks.push({
      name: "Response Time",
      status: "pass",
      detail: `${responseTime}ms (acceptable)`,
    });
    score -= 10;
  } else {
    checks.push({
      name: "Response Time",
      status: "fail",
      detail: `${responseTime}ms (slow)`,
    });
    if (status === "healthy") status = "degraded";
    score -= 25;
  }

  // Check 3: SSL (check if URL is HTTPS)
  const isHttps = wpUrl.startsWith("https://");
  checks.push({
    name: "SSL/HTTPS",
    status: isHttps ? "pass" : "fail",
    detail: isHttps ? "HTTPS active" : "No HTTPS detected",
  });
  if (!isHttps) {
    score -= 15;
    if (status === "healthy") status = "degraded";
  }

  // Check 4: robots.txt availability (basic SEO check)
  if (status !== "down") {
    try {
      const robotsUrl = `${wpUrl.replace(/\/$/, "")}/robots.txt`;
      const robotsRes = await fetch(robotsUrl, {
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "Xusmo-HealthCheck/1.0" },
      });
      checks.push({
        name: "robots.txt",
        status: robotsRes.ok ? "pass" : "fail",
        detail: robotsRes.ok ? "Found" : `HTTP ${robotsRes.status}`,
      });
      if (!robotsRes.ok) score -= 5;
    } catch {
      checks.push({
        name: "robots.txt",
        status: "fail",
        detail: "Unreachable",
      });
      score -= 5;
    }
  }

  return {
    status,
    responseTime,
    checks,
    score: Math.max(0, score),
  };
}

// ---------------------------------------------------------------------------
// Quick ping — lightweight check for monitoring dashboards
// ---------------------------------------------------------------------------

export async function pingSite(
  wpUrl: string
): Promise<{ reachable: boolean; responseTime: number }> {
  const start = Date.now();
  try {
    await fetch(wpUrl, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Xusmo-Ping/1.0" },
    });
    return { reachable: true, responseTime: Date.now() - start };
  } catch {
    return { reachable: false, responseTime: Date.now() - start };
  }
}

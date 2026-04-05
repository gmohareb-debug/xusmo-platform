// =============================================================================
// Domain Management — Cloudflare Registrar API
// Handles domain search, purchase, DNS, and SSL configuration.
// Mock mode when CLOUDFLARE_API_TOKEN is not set (local dev).
// =============================================================================

import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CF_API_BASE = "https://api.cloudflare.com/client/v4";
const CF_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const isMockMode = !CF_TOKEN;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: number;
  renewalPrice: number;
  tld: string;
}

// ---------------------------------------------------------------------------
// Search Domain
// ---------------------------------------------------------------------------

export async function searchDomain(query: string): Promise<DomainSearchResult[]> {
  // Normalize the query — strip protocol, www, spaces
  const base = query
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\.[a-z]+$/, "")
    .replace(/[^a-z0-9-]/gi, "")
    .toLowerCase()
    .trim();

  if (!base) return [];

  const tlds = [
    { tld: ".com", price: 9.77, renewal: 10.44 },
    { tld: ".ca", price: 8.50, renewal: 8.50 },
    { tld: ".net", price: 10.99, renewal: 10.99 },
    { tld: ".org", price: 9.93, renewal: 10.11 },
    { tld: ".co", price: 11.50, renewal: 28.50 },
    { tld: ".io", price: 33.98, renewal: 41.98 },
  ];

  if (isMockMode) {
    // Mock: all .com taken, others available
    return tlds.map((t) => ({
      domain: `${base}${t.tld}`,
      available: t.tld !== ".com",
      price: t.price,
      renewalPrice: t.renewal,
      tld: t.tld,
    }));
  }

  // Production: call Cloudflare Registrar API
  try {
    const results: DomainSearchResult[] = [];

    for (const t of tlds) {
      const domain = `${base}${t.tld}`;
      const res = await fetch(
        `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/registrar/domains/${domain}`,
        {
          headers: { Authorization: `Bearer ${CF_TOKEN}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        results.push({
          domain,
          available: data.result?.available ?? false,
          price: data.result?.price ?? t.price,
          renewalPrice: data.result?.renewal_price ?? t.renewal,
          tld: t.tld,
        });
      } else {
        results.push({
          domain,
          available: false,
          price: t.price,
          renewalPrice: t.renewal,
          tld: t.tld,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("[domains] Search failed, falling back to mock:", error);
    return tlds.map((t) => ({
      domain: `${base}${t.tld}`,
      available: false,
      price: t.price,
      renewalPrice: t.renewal,
      tld: t.tld,
    }));
  }
}

// ---------------------------------------------------------------------------
// Purchase Domain
// ---------------------------------------------------------------------------

export async function purchaseDomain(
  userId: string,
  domainName: string,
  siteId: string
) {
  if (isMockMode) {
    // Mock: create domain record as ACTIVE immediately
    const domain = await prisma.domain.create({
      data: {
        userId,
        siteId,
        domainName,
        registrar: "cloudflare-mock",
        purchaseType: "XUSMO",
        purchasePrice: 9.77,
        renewalPrice: 10.44,
        status: "ACTIVE",
        dnsConfigured: true,
        sslActive: true,
        registeredAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    console.log(`[domains] Mock purchased: ${domainName}`);
    return domain;
  }

  // Production: Cloudflare Registrar API
  const res = await fetch(
    `${CF_API_BASE}/accounts/${CF_ACCOUNT_ID}/registrar/domains`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: domainName,
        auto_renew: true,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Domain purchase failed: ${JSON.stringify(err)}`);
  }

  const data = await res.json();

  const domain = await prisma.domain.create({
    data: {
      userId,
      siteId,
      domainName,
      registrar: "cloudflare",
      purchaseType: "XUSMO",
      purchasePrice: data.result?.price ?? 9.77,
      renewalPrice: data.result?.renewal_price ?? 10.44,
      status: "PENDING",
      registeredAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return domain;
}

// ---------------------------------------------------------------------------
// Configure DNS
// ---------------------------------------------------------------------------

export async function configureDNS(domainName: string, serverIp: string) {
  if (isMockMode) {
    // Mock: just update DB flags
    await prisma.domain.update({
      where: { domainName },
      data: {
        dnsConfigured: true,
        aRecord: serverIp,
        cnameRecord: `www.${domainName}`,
      },
    });
    console.log(`[domains] Mock DNS configured: ${domainName} → ${serverIp}`);
    return;
  }

  // Production: Cloudflare DNS API
  // First get the zone ID
  const zoneRes = await fetch(
    `${CF_API_BASE}/zones?name=${domainName}`,
    { headers: { Authorization: `Bearer ${CF_TOKEN}` } }
  );
  const zoneData = await zoneRes.json();
  const zoneId = zoneData.result?.[0]?.id;

  if (!zoneId) {
    throw new Error(`Zone not found for ${domainName}`);
  }

  // Set A record
  await fetch(`${CF_API_BASE}/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "A",
      name: domainName,
      content: serverIp,
      ttl: 3600,
      proxied: true,
    }),
  });

  // Set CNAME for www
  await fetch(`${CF_API_BASE}/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "CNAME",
      name: `www.${domainName}`,
      content: domainName,
      ttl: 3600,
      proxied: true,
    }),
  });

  await prisma.domain.update({
    where: { domainName },
    data: {
      dnsConfigured: true,
      aRecord: serverIp,
      cnameRecord: `www.${domainName}`,
    },
  });
}

// ---------------------------------------------------------------------------
// Configure SSL
// ---------------------------------------------------------------------------

export async function configureSSL(domainName: string) {
  if (isMockMode) {
    await prisma.domain.update({
      where: { domainName },
      data: { sslActive: true },
    });
    console.log(`[domains] Mock SSL configured: ${domainName}`);
    return;
  }

  // Production: Cloudflare handles SSL automatically with proxied DNS
  // Just set Full (Strict) mode
  const zoneRes = await fetch(
    `${CF_API_BASE}/zones?name=${domainName}`,
    { headers: { Authorization: `Bearer ${CF_TOKEN}` } }
  );
  const zoneData = await zoneRes.json();
  const zoneId = zoneData.result?.[0]?.id;

  if (zoneId) {
    await fetch(`${CF_API_BASE}/zones/${zoneId}/settings/ssl`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${CF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: "strict" }),
    });
  }

  await prisma.domain.update({
    where: { domainName },
    data: { sslActive: true },
  });
}

// ---------------------------------------------------------------------------
// Connect BYOD (Bring Your Own Domain)
// ---------------------------------------------------------------------------

export async function connectBYOD(
  userId: string,
  domainName: string,
  siteId: string
) {
  const serverIp = process.env.WP_SERVER_IP ?? "203.0.113.1";

  const domain = await prisma.domain.create({
    data: {
      userId,
      siteId,
      domainName,
      registrar: "byod",
      purchaseType: "BYOD",
      status: "PENDING",
    },
  });

  return {
    domainId: domain.id,
    status: "PENDING",
    dnsInstructions: {
      aRecord: {
        type: "A",
        name: "@",
        value: serverIp,
        ttl: 3600,
      },
      cnameRecord: {
        type: "CNAME",
        name: "www",
        value: domainName,
        ttl: 3600,
      },
    },
    verificationSteps: [
      `Log into your domain registrar (GoDaddy, Namecheap, etc.)`,
      `Navigate to DNS settings for ${domainName}`,
      `Add an A record: @ → ${serverIp}`,
      `Add a CNAME record: www → ${domainName}`,
      `Wait 5-30 minutes for DNS propagation`,
      `Return here and click "Verify DNS" to confirm`,
    ],
  };
}

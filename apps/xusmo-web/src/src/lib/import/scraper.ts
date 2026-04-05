// Scrapes an existing website URL and extracts structured content
// Uses fetch + regex parsing (no external dependencies)

export interface ScrapedSite {
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  images: string[];
  links: { text: string; href: string }[];
  colors: string[];  // CSS colors found
  phone: string | null;
  email: string | null;
  address: string | null;
}

export async function scrapeSite(url: string): Promise<ScrapedSite | null> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Xusmo-Bot/1.0 (site-import)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const html = await response.text();
    return parseHtml(html, url);
  } catch {
    return null;
  }
}

function parseHtml(html: string, baseUrl: string): ScrapedSite {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i);
  const description = descMatch ? descMatch[1].trim() : "";

  // Extract headings
  const headings: string[] = [];
  const headingRegex = /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  let m;
  while ((m = headingRegex.exec(html)) !== null) {
    headings.push(stripTags(m[1]).trim());
  }

  // Extract paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  while ((m = pRegex.exec(html)) !== null) {
    const text = stripTags(m[1]).trim();
    if (text.length > 20) paragraphs.push(text);
  }

  // Extract images (src attributes)
  const images: string[] = [];
  const imgRegex = /<img[^>]*src=["']([^"']+)["']/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    const src = m[1].startsWith("http") ? m[1] : new URL(m[1], baseUrl).href;
    images.push(src);
  }

  // Extract links
  const links: { text: string; href: string }[] = [];
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  while ((m = linkRegex.exec(html)) !== null) {
    links.push({ href: m[1], text: stripTags(m[2]).trim() });
  }

  // Extract CSS colors
  const colors: string[] = [];
  const colorRegex = /#[0-9a-fA-F]{3,8}\b/g;
  while ((m = colorRegex.exec(html)) !== null) {
    if (!colors.includes(m[0])) colors.push(m[0]);
  }

  // Extract contact info
  const phoneMatch = html.match(/(?:tel:|phone|call)[^"']*["']?\s*[:=]?\s*["']?([+\d\s\-().]{7,20})/i)
    || html.match(/(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);
  const emailMatch = html.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const addressMatch = html.match(/(\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln|Way|Court|Ct)[,.\s]+[\w\s]+,?\s*[A-Z]{2}\s*\d{5})/i);

  return {
    title, description, headings: headings.slice(0, 20),
    paragraphs: paragraphs.slice(0, 30), images: images.slice(0, 20),
    links: links.slice(0, 30), colors: colors.slice(0, 10),
    phone: phoneMatch ? phoneMatch[1].trim() : null,
    email: emailMatch ? emailMatch[1] : null,
    address: addressMatch ? addressMatch[1].trim() : null,
  };
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&#\d+;/g, "");
}

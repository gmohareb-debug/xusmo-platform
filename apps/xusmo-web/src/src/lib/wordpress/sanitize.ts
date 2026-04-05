// WordPress command sanitization — whitelist + injection prevention

const ALLOWED_COMMANDS = new Set([
  "post", "option", "menu", "media", "theme", "eval",
  "rewrite", "cache", "widget", "sidebar", "yoast",
]);

const BLOCKED_PATTERNS = [
  /;\s*rm\s/i,
  /;\s*cat\s/i,
  /\|\s*bash/i,
  /\$\(/,
  /`[^`]*`/,
  /&&\s*(rm|cat|wget|curl)/i,
];

export function sanitizeWpCommand(command: string): string {
  // Extract the WP-CLI subcommand (first word)
  const parts = command.trim().split(/\s+/);
  const subcommand = parts[0];

  if (!ALLOWED_COMMANDS.has(subcommand)) {
    throw new Error(`[security] Blocked WP-CLI command: ${subcommand}`);
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(command)) {
      throw new Error(`[security] Blocked injection pattern in WP command`);
    }
  }

  return command;
}

export function sanitizeCss(css: string): string {
  const blocked = [
    /<script/i, /javascript:/i, /expression\s*\(/i,
    /@import\s/i, /behavior\s*:/i, /-moz-binding/i,
  ];
  for (const pattern of blocked) {
    if (pattern.test(css)) {
      throw new Error(`[security] Blocked CSS pattern: ${pattern}`);
    }
  }
  if (css.length > 5000) {
    throw new Error("[security] CSS exceeds 5000 character limit");
  }
  return css;
}

export function sanitizeHtml(html: string): string {
  // Strip script tags, on* event handlers, javascript: URLs
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript\s*:/gi, "");
}

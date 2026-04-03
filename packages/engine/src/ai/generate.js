import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { ARCHETYPE_PRESETS, getArchetypeComponents, AUTH_ONLY, DEBUG_ONLY, VISUAL_PERSONALITIES, PERSONALITY_TOKENS } from './component-groups.js'
import { resolveImages } from './image-resolver.js'
import { generateLogo } from './logo-generator.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const catalog = JSON.parse(readFileSync(join(__dirname, 'component-catalog.json'), 'utf8'))

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const allComponentKeys = Object.keys(catalog.components)
const knownComponents = new Set(allComponentKeys)
const blockedComponents = new Set([...AUTH_ONLY, ...DEBUG_ONLY, 'announcement-bar', 'map-embed'])

// ── Build component reference from a filtered key list ──

function buildComponentReference(keys) {
  return keys
    .filter(key => catalog.components[key])
    .map(key => {
      const comp = catalog.components[key]
      const props = Object.entries(comp.props).map(([k, v]) => `    - ${k}: ${v}`).join('\n')
      return `### ${key}\n${comp.description}\nProps:\n${props}`
    })
    .join('\n\n')
}

// ══════════════════════════════════════════════════════════════
// ══ LLM Router — Multi-provider, multi-model, auto-fallback ═
// ══════════════════════════════════════════════════════════════

// Free OpenRouter models to cycle through when one is rate-limited.
// Order: best quality first, fastest last.
const OPENROUTER_FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.5-flash-preview-05-20',
  'deepseek/deepseek-chat-v3-0324:free',
  'qwen/qwen3-235b-a22b:free',
  'meta-llama/llama-4-maverick:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
]

// Fast models for Step 0 / Step 1 (business intel + planner)
const OPENROUTER_FAST_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-2.5-flash-preview-05-20',
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
]

// Track exhausted model+key combos with cooldown (5 min)
const exhaustedRoutes = new Map() // "key:model" → timestamp
const COOLDOWN_MS = 5 * 60 * 1000

function isRouteCoolingDown(key, model) {
  const routeKey = `${key.slice(0, 12)}:${model}`
  const ts = exhaustedRoutes.get(routeKey)
  if (!ts) return false
  if (Date.now() - ts > COOLDOWN_MS) {
    exhaustedRoutes.delete(routeKey)
    return false
  }
  return true
}

function markRouteExhausted(key, model) {
  const routeKey = `${key.slice(0, 12)}:${model}`
  exhaustedRoutes.set(routeKey, Date.now())
}

// ── Key state ──

const keyState = {
  gemini: { keys: [], index: 0 },
  openrouter: { keys: [], index: 0 },
}

function initKeys() {
  const geminiRaw = process.env.GOOGLE_API_KEY || ''
  keyState.gemini.keys = geminiRaw.split(',').map(k => k.trim()).filter(Boolean)
  keyState.gemini.index = 0

  const orRaw = process.env.OPENROUTER_API_KEY || ''
  keyState.openrouter.keys = orRaw.split(',').map(k => k.trim()).filter(Boolean)
  keyState.openrouter.index = 0

  const total = keyState.gemini.keys.length + keyState.openrouter.keys.length
  console.log(`[Router] ${keyState.gemini.keys.length} Gemini key(s), ${keyState.openrouter.keys.length} OpenRouter key(s)`)
  console.log(`[Router] ${OPENROUTER_FREE_MODELS.length} free models in rotation pool`)
  return total
}

initKeys()

function isExhaustedError(status, body) {
  if (status === 429 || status === 402) return true
  const s = (body || '').toLowerCase()
  return s.includes('quota') || s.includes('rate') || s.includes('exhausted') || s.includes('limit')
}

// ── Provider callers ──

async function callGemini(systemPrompt, userMessage, temperature, maxTokens, apiKey, fast, quality) {
  const geminiModel = quality
    ? (process.env.GEMINI_QUALITY_MODEL || 'gemini-2.5-pro')
    : fast
    ? (process.env.GEMINI_FAST_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash')
    : (process.env.GEMINI_MODEL || 'gemini-2.5-flash')

  const url = `${GEMINI_API_URL}/${geminiModel}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: 'application/json',
      },
    }),
  })

  const body = await response.text()
  if (!response.ok) return { ok: false, status: response.status, body }

  const data = JSON.parse(body)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  return { ok: true, text, provider: `Gemini (${geminiModel})` }
}

async function callOpenRouterWithModel(systemPrompt, userMessage, temperature, maxTokens, apiKey, model) {
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  })

  const body = await response.text()
  if (!response.ok) return { ok: false, status: response.status, body }

  const data = JSON.parse(body)
  const text = data.choices?.[0]?.message?.content?.trim()
  return { ok: true, text, provider: `OpenRouter (${model})` }
}

// ── Smart LLM Router ──
// Tries: Gemini direct keys → OpenRouter keys × free models (with cooldown tracking)

// ── Raw LLM Router — returns { text, provider } without JSON parsing ──
// Exported so xusmo-web's content agent can use the multi-provider routing
// without the JSON auto-parse logic.

export async function callLLMRaw(systemPrompt, userMessage, { temperature = 0.7, fast = false, quality = false } = {}) {
  const maxTokens = 32000
  let lastError = ''
  let text = null
  let provider = 'unknown'

  if (quality) {
    console.log('[Router] Quality mode — forcing Gemini Pro as primary model')
  }

  // ── Phase 1: Try all Gemini direct keys ──
  const gk = keyState.gemini
  for (let i = 0; i < gk.keys.length; i++) {
    const idx = (gk.index + i) % gk.keys.length
    const key = gk.keys[idx]
    const keyPreview = key.slice(0, 8) + '...'
    console.log(`[Router] Trying Gemini key ${keyPreview}`)

    try {
      const result = await callGemini(systemPrompt, userMessage, temperature, maxTokens, key, fast, quality)
      if (result.ok) {
        gk.index = idx
        if (!result.text) throw new Error('Empty response from Gemini')
        console.log(`[Router] Success via ${result.provider}`)
        text = result.text
        provider = result.provider
        break
      }
      if (isExhaustedError(result.status, result.body)) {
        console.warn(`[Router] Gemini key ${keyPreview} exhausted (${result.status}), rotating...`)
        lastError = `Gemini (${result.status}): ${result.body.slice(0, 150)}`
        continue
      }
      lastError = `Gemini (${result.status}): ${result.body.slice(0, 150)}`
    } catch (e) {
      console.warn(`[Router] Gemini key ${keyPreview} error: ${e.message}`)
      lastError = e.message
    }
  }

  // ── Phase 2: Try OpenRouter keys × free models ──
  if (!text) {
    const orKeys = keyState.openrouter.keys
    const modelPool = fast ? OPENROUTER_FAST_MODELS : OPENROUTER_FREE_MODELS
    // Also try the configured model first if it's not in the pool
    const configuredModel = fast
      ? (process.env.OPENROUTER_FAST_MODEL || process.env.OPENROUTER_MODEL)
      : process.env.OPENROUTER_MODEL
    const allModels = configuredModel && !modelPool.includes(configuredModel)
      ? [configuredModel, ...modelPool]
      : [...modelPool]

    for (const key of orKeys) {
      const keyPreview = key.slice(0, 8) + '...'

      for (const model of allModels) {
        // Skip routes on cooldown
        if (isRouteCoolingDown(key, model)) {
          continue
        }

        console.log(`[Router] Trying OpenRouter ${model} with key ${keyPreview}`)

        try {
          const result = await callOpenRouterWithModel(systemPrompt, userMessage, temperature, maxTokens, key, model)

          if (result.ok) {
            if (!result.text) {
              console.warn(`[Router] Empty response from ${model}, trying next...`)
              continue
            }
            console.log(`[Router] Success via ${result.provider}`)
            text = result.text
            provider = result.provider
            break
          }

          if (isExhaustedError(result.status, result.body)) {
            console.warn(`[Router] ${model} exhausted (${result.status}), marking cooldown & trying next model...`)
            markRouteExhausted(key, model)
            lastError = `${model} (${result.status}): ${result.body.slice(0, 150)}`
            continue
          }

          // Other error (bad model name, etc.) — skip this model
          console.warn(`[Router] ${model} error (${result.status}), trying next model...`)
          lastError = `${model} (${result.status}): ${result.body.slice(0, 150)}`
        } catch (e) {
          console.warn(`[Router] ${model} network error: ${e.message}`)
          lastError = e.message
        }
      }

      if (text) break
    }
  }

  if (!text) {
    const coolingDown = exhaustedRoutes.size
    throw new Error(
      `All LLM routes exhausted (${coolingDown} on cooldown). ` +
      `Last error: ${lastError.slice(0, 200)}. ` +
      `Add a GOOGLE_API_KEY for free Gemini access, or wait ~5 min for rate limits to reset.`
    )
  }

  return { text, provider }
}

// ── JSON-parsing LLM Router (original behavior) ──

async function callLLM(systemPrompt, userMessage, opts = {}) {
  const { text, provider } = await callLLMRaw(systemPrompt, userMessage, opts)
  if (opts.quality) {
    console.log(`[callLLM] Quality generation completed via ${provider}`)
  }

  // Strip markdown fences if the model wraps it
  let jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')

  // Fix common LLM JSON issues
  // 1. Trailing commas before closing braces/brackets
  jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1')
  // 2. Extract the outermost JSON object if there's trailing text
  const firstBrace = jsonStr.indexOf('{')
  if (firstBrace > 0) jsonStr = jsonStr.slice(firstBrace)

  try {
    return JSON.parse(jsonStr)
  } catch (e) {
    // Salvage truncated JSON — walk character by character to track
    // structural depth (ignoring braces/brackets inside strings)
    let salvaged = jsonStr
    let inString = false
    let escaped = false
    const stack = [] // track open [{

    // Find the last valid position and track nesting
    for (let i = 0; i < salvaged.length; i++) {
      const ch = salvaged[i]
      if (escaped) { escaped = false; continue }
      if (ch === '\\' && inString) { escaped = true; continue }
      if (ch === '"') { inString = !inString; continue }
      if (inString) continue
      if (ch === '{') stack.push('}')
      else if (ch === '[') stack.push(']')
      else if (ch === '}' || ch === ']') stack.pop()
    }

    // If we ended inside a string, trim back to the last complete key-value
    if (inString) {
      // Find the last unescaped quote that opened this string
      let lastQuote = salvaged.length - 1
      while (lastQuote > 0 && salvaged[lastQuote] !== '"') lastQuote--
      // Check if this is a value (preceded by :) or a key
      const before = salvaged.slice(0, lastQuote).trimEnd()
      if (before.endsWith(':')) {
        // Incomplete value — add empty string
        salvaged = salvaged.slice(0, lastQuote) + '""'
      } else if (before.endsWith(',') || before.endsWith('[') || before.endsWith('{')) {
        // Incomplete entry — remove it
        salvaged = before
      } else {
        // Close the string
        salvaged = salvaged.slice(0, lastQuote + 1) + '"'
      }
      // Re-count stack after trimming
      stack.length = 0
      inString = false
      escaped = false
      for (let i = 0; i < salvaged.length; i++) {
        const ch = salvaged[i]
        if (escaped) { escaped = false; continue }
        if (ch === '\\' && inString) { escaped = true; continue }
        if (ch === '"') { inString = !inString; continue }
        if (inString) continue
        if (ch === '{') stack.push('}')
        else if (ch === '[') stack.push(']')
        else if (ch === '}' || ch === ']') stack.pop()
      }
    }

    // Strip trailing commas and close open structures
    salvaged = salvaged.replace(/,\s*$/, '')
    salvaged += stack.reverse().join('')

    // Final trailing-comma cleanup inside the closed structure
    salvaged = salvaged.replace(/,\s*([}\]])/g, '$1')

    try {
      console.warn('[callLLM] Salvaged truncated JSON response')
      return JSON.parse(salvaged)
    } catch {
      throw new Error('AI returned invalid JSON: ' + e.message)
    }
  }
}

// ── Validation helpers ──

function validateAndFilterPages(parsed, allowedComponents, expectedPageKeys) {
  if (!parsed.pages || typeof parsed.pages !== 'object') {
    throw new Error('AI response missing pages object')
  }

  const allowed = allowedComponents ? new Set(allowedComponents) : knownComponents

  // Use dynamic page keys if provided, otherwise check whatever pages exist
  const pageKeys = expectedPageKeys || Object.keys(parsed.pages)

  if (pageKeys.length === 0) {
    throw new Error('AI response has no pages')
  }

  for (const pageName of pageKeys) {
    const page = parsed.pages[pageName]
    if (!page?.sections?.length) {
      console.warn(`[Validate] Page "${pageName}" is missing or empty — skipping`)
      continue
    }

    for (const section of page.sections) {
      if (!allowed.has(section.component)) {
        console.warn(`[${pageName}] Component "${section.component}" not in allowed set — removing`)
      }
    }
    page.sections = page.sections.filter(s => allowed.has(s.component))
  }

  return parsed.pages
}

function validateTheme(theme) {
  if (!theme?.colors) {
    console.warn('[Validate] AI response missing theme.colors — using default palette')
    return {
      ...theme,
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textLight: '#64748b',
        ...(theme?.colors || {}),
      },
    }
  }
  return theme
}

// ── Step 0: Business Intelligence Extraction ──

const BUSINESS_INTEL_PROMPT = `You are a strategic web consultant. Given a business description, extract a structured business profile to inform website design and content strategy.

Return a JSON object with these fields:

{
  "businessName": "string — the business name",
  "industry": "string — specific industry/niche (e.g., 'specialty coffee shop', 'residential landscaping', 'SaaS project management tool')",
  "location": "string or null — city/region if mentioned",
  "targetAudience": "string — who the ideal customer is (e.g., 'busy professionals aged 25-45 who want premium coffee experiences')",
  "primaryPainPoint": "string — the core problem this business solves for customers",
  "valueProposition": "string — the primary benefit or promise to customers (not a tagline, a clear statement)",
  "tone": "one of: luxury | professional | friendly | bold | creative | playful",
  "websiteGoal": "one of: leads | ecommerce | brand | portfolio | info",
  "uniqueSellingPoints": ["string", "..."],
  "keyServices": ["string", "..."]
}

Be specific. If the business name implies an industry (e.g., 'GreenScape' = landscaping, 'ByteFlow' = software), infer confidently.

Return ONLY the JSON. No markdown, no explanation.`

async function analyzeBusinessIntelligence(prompt) {
  console.log('[BizIntel] Analyzing business for:', prompt.slice(0, 80))
  try {
    const profile = await callLLM(
      BUSINESS_INTEL_PROMPT,
      `Analyze this business: ${prompt}`,
      { temperature: 0.2, fast: true }
    )
    console.log(`[BizIntel] Profile: ${profile.businessName} | ${profile.industry} | goal: ${profile.websiteGoal} | tone: ${profile.tone}`)
    return profile
  } catch (e) {
    console.warn('[BizIntel] Analysis failed, using fallback:', e.message)
    return {
      businessName: prompt.split(' ').slice(0, 3).join(' '),
      industry: 'general business',
      location: null,
      targetAudience: 'general consumers',
      primaryPainPoint: 'finding a reliable service provider',
      valueProposition: 'quality service and professional results',
      tone: 'professional',
      websiteGoal: 'leads',
      uniqueSellingPoints: ['experienced team', 'quality results'],
      keyServices: ['main service'],
    }
  }
}

// ── Step 1: Site Planner ──

const PLANNER_SYSTEM_PROMPT = `You are a website architect. Given a business description and business profile, you select the right archetype, visual personality, page set, and components.

## Available Archetypes

${Object.entries(ARCHETYPE_PRESETS).map(([key, preset]) => `- **${key}**: ${preset.description}`).join('\n')}

## Available Visual Personalities

${Object.entries(VISUAL_PERSONALITIES).map(([key, p]) => `- **${key}**: ${p.description}`).join('\n')}

## Available Components (${allComponentKeys.length} total)

${allComponentKeys.filter(k => !blockedComponents.has(k)).map(k => `- ${k}: ${catalog.components[k].description}`).join('\n')}

## Your Task

Analyze the business and return a JSON object with:

1. **archetype** — one of: ${Object.keys(ARCHETYPE_PRESETS).join(', ')}
2. **personality** — one of: ${Object.keys(VISUAL_PERSONALITIES).join(', ')} — choose based on business tone and industry
3. **heroVariant** — which hero to use: "hero" (text+gradient), "hero-video" (background video), or "hero-image" (background photo)
4. **businessSummary** — a 1-2 sentence plain-English explanation of what this business ACTUALLY sells or does.
5. **homeVariant** — choose the primary structural pattern for the home page:
   - "convert": Hero (benefit-led) → Stats/Trust → Services/Features → Testimonials → CTA → Footer
   - "story": Hero (story-led, full emotional hook) → Problem statement → Solution → How it works → Testimonials → CTA → Footer
   - "showcase": Hero (full visual) → Featured products/work gallery → Categories → Social proof → CTA → Footer
6. **pages** — array of 4-8 page objects for this specific business type. Each page: { "key": "slug-key", "label": "Display Name", "slug": "/url-path", "goal": "one-sentence conversion goal" }
   - ALWAYS include "home" and "contact" pages
   - Choose other pages based on what makes sense for this business:
     - Restaurant/cafe: home, menu, about, reservations, contact
     - E-commerce: home, shop, about, contact
     - SaaS/tech: home, features, pricing, about, contact
     - Portfolio/creative: home, work, about, contact
     - Service business: home, services, about, contact
     - Consulting/B2B: home, solutions, case-studies, about, contact
     - Medical/dental: home, services, team, about, contact
7. **components** — array of 20-35 component keys most relevant for this business. Include "navbar", "footer", ONE hero variant, "section-title". Do NOT include: ${[...blockedComponents].join(', ')}
8. **pageStructure** — object mapping each page key to an array of component keys (5-15 per page)

## Personality Selection Guide
- minimal → tech, agency, SaaS, software, design studio, consultant
- bold → fitness, gym, sports, food delivery, startup, entertainment
- editorial → fashion, photography, architecture, luxury brand, art gallery
- warm-organic → restaurant, cafe, coffee shop, wellness, yoga, bakery, organic
- dark-luxury → hotel, premium services, fine dining, wedding, executive
- geometric → fintech, finance, data, corporate, manufacturing, logistics
- playful → kids, toys, pets, casual consumer, craft, hobby
- corporate → consulting, legal, medical, dental, accounting, insurance, B2B

## Output Format (strict JSON)

{
  "archetype": "SERVICE",
  "personality": "warm-organic",
  "heroVariant": "hero-image",
  "businessSummary": "GreenScape Landscaping provides residential and commercial landscaping, lawn care, and garden design services.",
  "homeVariant": "convert",
  "pages": [
    { "key": "home", "label": "Home", "slug": "/", "goal": "Convert visitors to consultation requests" },
    { "key": "services", "label": "Services", "slug": "/services", "goal": "Showcase offerings and overcome objections" },
    { "key": "about", "label": "About Us", "slug": "/about", "goal": "Build trust with story and credentials" },
    { "key": "contact", "label": "Contact", "slug": "/contact", "goal": "Minimise friction to booking" }
  ],
  "components": ["navbar", "hero-image", "section-title", "about-section"],
  "pageStructure": {
    "home": ["navbar", "hero-image", "hero-stats", "section-title", "services-section"],
    "services": ["navbar", "section-title", "services-section", "faq-accordion", "footer"],
    "about": ["navbar", "section-title", "about-section", "testimonials", "footer"],
    "contact": ["navbar", "section-title", "contact", "contact-form", "footer"]
  }
}

Return ONLY the JSON. No markdown, no explanation.`

async function planSite(prompt, businessProfile) {
  console.log('[Planner] Selecting components for:', prompt.slice(0, 80))

  const profileContext = businessProfile
    ? `

Business Profile:
${JSON.stringify(businessProfile, null, 2)}`
    : ''

  const plan = await callLLM(
    PLANNER_SYSTEM_PROMPT,
    `Select components for this business: ${prompt}${profileContext}`,
    { temperature: 0.3, fast: true }
  )

  // Validate archetype
  if (!ARCHETYPE_PRESETS[plan.archetype]) {
    console.warn(`[Planner] Unknown archetype "${plan.archetype}", falling back to SERVICE`)
    plan.archetype = 'SERVICE'
  }

  // Validate personality
  if (!VISUAL_PERSONALITIES[plan.personality]) {
    const toneMap = {
      luxury: 'dark-luxury',
      professional: 'corporate',
      friendly: 'warm-organic',
      bold: 'bold',
      creative: 'editorial',
      playful: 'playful',
    }
    plan.personality = toneMap[businessProfile?.tone] || 'corporate'
    console.warn(`[Planner] Unknown personality, inferred: ${plan.personality}`)
  }

  // Validate pages array
  if (!Array.isArray(plan.pages) || plan.pages.length < 2) {
    console.warn('[Planner] Invalid pages array, using defaults')
    plan.pages = [
      { key: 'home', label: 'Home', slug: '/', goal: 'Convert visitors' },
      { key: 'about', label: 'About', slug: '/about', goal: 'Build trust' },
      { key: 'services', label: 'Services', slug: '/services', goal: 'Showcase offerings' },
      { key: 'contact', label: 'Contact', slug: '/contact', goal: 'Drive conversions' },
    ]
  }

  // Ensure required components are present
  const components = new Set(plan.components || [])
  components.add('navbar')
  components.add('footer')
  components.add('section-title')
  components.add('about-section')
  components.add('contact')
  components.add('contact-form')
  components.add('faq-accordion')

  // COMMERCE sites need trust/ecommerce components
  if (plan.archetype === 'COMMERCE') {
    components.add('hero-stats')
    components.add('trust-badges')
    components.add('product-grid')
    components.add('category-showcase')
    components.add('testimonials')
  }

  // Remove blocked components
  for (const blocked of blockedComponents) {
    components.delete(blocked)
  }

  // Remove components that don't exist in the catalog
  for (const key of [...components]) {
    if (!knownComponents.has(key)) {
      console.warn(`[Planner] Unknown component "${key}" — removing`)
      components.delete(key)
    }
  }

  // If planner returned too few components, backfill from archetype preset
  if (components.size < 15) {
    const archetypeDefaults = getArchetypeComponents(plan.archetype)
    for (const key of archetypeDefaults) {
      if (!blockedComponents.has(key)) {
        components.add(key)
      }
    }
  }

  const selectedKeys = [...components]
  console.log(`[Planner] Archetype: ${plan.archetype}, Personality: ${plan.personality}, Hero: ${plan.heroVariant}, Pages: ${plan.pages.map(p => p.key).join(', ')}, Components: ${selectedKeys.length}/${allComponentKeys.length}`)

  return {
    archetype: plan.archetype,
    personality: plan.personality,
    heroVariant: plan.heroVariant || 'hero',
    homeVariant: plan.homeVariant || 'convert',
    businessSummary: plan.businessSummary || prompt,
    pages: plan.pages,
    components: selectedKeys,
    pageStructure: plan.pageStructure || null,
  }
}

// ── Step 2: Build the generation prompt with ONLY selected components ──

function buildGenerationPrompt(selectedComponents, pageStructure, { archetype, businessSummary, personality, pages, homeVariant, businessProfile } = {}) {
  const filteredRef = buildComponentReference(selectedComponents)

  // Build dynamic page guide from planner's pages array
  const pageKeys = pages ? pages.map(p => p.key) : ['home', 'about', 'services', 'contact']
  const pageGuide = pages && pageStructure
    ? `
## Recommended Page Structure (from planner)

Use these as a starting point. You may adjust order and add/remove components from the allowed list.

${pages.map(p => {
  const structure = pageStructure[p.key]
  return `### ${p.label} Page (${p.key})
Goal: ${p.goal || 'Engage visitors'}
${structure ? structure.join(' → ') : 'Use your best judgment'}`
}).join('\n\n')}
`
    : ''

  const isCommerce = archetype === 'COMMERCE'

  // Personality-driven style token guidance
  const personalityTokens = PERSONALITY_TOKENS[personality]
  const personalityGuide = personalityTokens
    ? `
## Visual Personality: ${personality} (CRITICAL — apply consistently)

This site uses the **${personality}** design personality. ALL style tokens must follow these guidelines:
- Default border-radius: ${personalityTokens.radius}
- Card shadow: ${personalityTokens.shadow}
- Card hover shadow: ${personalityTokens.shadowHover}
- Card background: ${personalityTokens.cardBg}
${personalityTokens.cardBorder ? `- Card border: ${personalityTokens.cardBorder}` : ''}
- Card padding: ${personalityTokens.cardPadding}
- Gap between cards: ${personalityTokens.gap}
- Heading font: ${personalityTokens.headingFont}
- Body font: ${personalityTokens.bodyFont}
- Hero height: ${personalityTokens.heroHeight}
- Heading size: ${personalityTokens.headingSize}
${personalityTokens.extraNote ? `\n**Personality Note:** ${personalityTokens.extraNote}` : ''}

Apply these tokens to EVERY card-based component (services-section, features, product-grid, pricing-table, testimonials, case-studies).
The theme radius MUST be within the range: ${personalityTokens.radiusRange}.
The theme fonts.heading MUST use: ${personalityTokens.headingFont}.
The theme fonts.body MUST use: ${personalityTokens.bodyFont}.
`
    : ''

  // Business profile context
  const businessContext = businessProfile
    ? `
## Client Brief (from business analysis — CRITICAL, all content must reflect this)

- **Business**: ${businessProfile.businessName} — ${businessProfile.industry}
- **Target customer**: ${businessProfile.targetAudience}
- **Their problem**: ${businessProfile.primaryPainPoint}
- **How we solve it**: ${businessProfile.valueProposition}
- **Unique advantages**: ${(businessProfile.uniqueSellingPoints || []).join(', ')}
- **Key services/products**: ${(businessProfile.keyServices || []).join(', ')}
- **Tone**: ${businessProfile.tone}
- **Website goal**: ${businessProfile.websiteGoal}
${businessProfile.location ? `- **Location**: ${businessProfile.location}` : ''}

ALL content — headlines, descriptions, CTAs, testimonials — MUST speak directly to ${businessProfile.targetAudience}'s ${businessProfile.primaryPainPoint} and position ${businessProfile.businessName}'s specific advantages.
Do NOT generate generic content. Be specific to this exact client.
`
    : (archetype && businessSummary
      ? `
## Business Context (from planner analysis)

- **Archetype**: ${archetype}
- **What this business does**: ${businessSummary}
${isCommerce ? `
**COMMERCE SITE RULES:**
- Use product-grid, category-showcase, and product-related components.
- Include hero-stats or trust-badges on the home page.
- Every product in product-grid MUST have a "cartLabel" prop.
` : ''}
ALL content you generate MUST be specifically about this business. Do NOT generate content about an unrelated industry.
`
      : '')

  // Dynamic page count in task description
  const pageList = pages
    ? pages.map(p => `${p.key} (${p.label})`).join(', ')
    : 'home, about, services, contact'

  // Home variant structural guidance
  const homeVariantGuide = homeVariant === 'story'
    ? `
## Home Page Structure (Story variant — MUST FOLLOW)
The home page must follow this emotional arc:
1. Hero with emotional hook (story-led, pain-point headline)
2. Problem statement section (what the customer struggles with)
3. Solution section (how this business solves it)
4. How it works / process section
5. Social proof (testimonials)
6. CTA section
7. Footer
`
    : homeVariant === 'showcase'
    ? `
## Home Page Structure (Showcase variant — MUST FOLLOW)
The home page must lead with visual impact:
1. Hero (full-bleed visual, striking image or video)
2. Featured products/work gallery
3. Categories or service areas
4. Social proof (testimonials or client logos)
5. CTA section
6. Footer
`
    : `
## Home Page Structure (Convert variant — MUST FOLLOW)
The home page must drive conversions:
1. Hero (benefit-led headline, primary CTA above the fold)
2. Stats or trust badges (immediate credibility)
3. Services/Features overview
4. Testimonials or case studies
5. CTA section with strong action + benefit button
6. Footer
`

  return `You are an expert website designer and developer. You generate complete, multi-page website layouts as JSON.

You MUST use ONLY the components listed below. Do NOT invent or use any component not in this list.

## Available Components (${selectedComponents.length} selected for this site)

${filteredRef}
${businessContext}
## Your Task

Return a JSON object with:
1. **pages** — an object with page layouts for: ${pageList}
2. **theme** — the visual design tokens (shared across all pages)
${pageGuide}

## Page Goals (CRITICAL — structure each page around its conversion goal)

${pages ? pages.map(p => `- **${p.label}** (${p.key}): ${p.goal}`).join('\n') : `- **Home**: Convert first-time visitors — lead with value proposition, CTA above the fold
- **About**: Build trust — origin story, team, credentials, mission
- **Services**: Overcome objections — pain → solution → benefit for each item
- **Contact**: Remove friction — reassurance copy, multiple methods, short form`}

## Copywriting Rules (CRITICAL — this is what makes content professional)

- Hero headline formula: [Clear Outcome] for [Target Audience] — specific, not generic
- CTAs must use action + benefit: "Get Your Free Quote", "Book a Consultation", "Start Your Free Trial" — NEVER "Submit", "Click Here", or "Contact Us"
- Pain-before-pitch: acknowledge the customer's problem before presenting the solution
- Use specific numbers: "500+ projects delivered" not "many projects"; "24-hour response" not "fast response"
- Every service/product description: 1 sentence about the problem + 1 sentence about the solution + 1 sentence about the outcome
- Testimonials must feel real: specific results, named companies, concrete outcomes — not vague praise
${homeVariantGuide}
${personalityGuide}
## Rules

### Content Rules
- Generate REAL, specific content for the business described (not lorem ipsum or placeholder text).
- Read the "Business Context" section above carefully. Every heading, service name, product name, testimonial, and CTA must relate to THAT specific business — not a generic or unrelated industry.
- If the business name is unfamiliar, use the business summary from the planner to understand what it sells/does.

### Image URL Rules (CRITICAL — use ONLY these URL patterns)

The seed in picsum.photos URLs is used as a SEARCH KEYWORD to find a matching photo. Use plain English words that describe EXACTLY what the photo should show. Use spaces (encoded as hyphens) for multi-word queries.

**HERO IMAGES, ABOUT IMAGES, FEATURED CONTENT images:**
- https://picsum.photos/seed/{search-keyword}/1200/600  (hero: wide)
- https://picsum.photos/seed/{search-keyword}/800/600   (about/featured: standard)
- https://picsum.photos/seed/{search-keyword}/600/400   (cards/thumbnails)

The search keyword MUST describe the actual photo subject AND include the business location if known.
If the business has a location (city, region, country), APPEND it to every image search keyword so photos are geo-relevant.
Examples:
- Bidet store in Ontario: "modern bathroom bidet ontario canada" NOT "hero-image"
- Landscaping in Toronto: "green garden lawn care toronto" NOT "landscaping-hero"
- Dental in London: "dental clinic patient smiling london" NOT "dental-office"
- Restaurant in Dubai: "restaurant dining table food dubai" NOT "food-hero"
Use DIFFERENT keywords for each image so you get DIFFERENT photos.

**PRODUCT IMAGES:**
- https://picsum.photos/seed/{product-description}/400/400
Example: "handheld bidet sprayer silver", "luxury toilet bidet seat"

**SERVICE/CATEGORY IMAGES:**
- https://picsum.photos/seed/{service-description}/400/300
Example: "professional lawn mowing", "teeth whitening dental"

**AVATAR IMAGES (testimonials, team):**
Use placehold.co with person's initials:
- https://placehold.co/80x80/accent_hex/ffffff?text=JD

**TRUST BADGES and CLIENT LOGOS (CRITICAL — NEVER use picsum for these):**
Trust badges and client/partner logos MUST ONLY use placehold.co with organization names.
NEVER use picsum.photos for trust badges or client logos — they are text-based placeholders, not photos.
- https://placehold.co/120x40/e5e7eb/6b7280?text=Partner+Name
- https://placehold.co/120x40/e5e7eb/6b7280?text=Google
- https://placehold.co/120x40/e5e7eb/6b7280?text=Forbes

**NAVBAR LOGO:**
Use placehold.co with business initials on accent-colored background:
- https://placehold.co/40x40/accent_hex/ffffff?text=BN

**NEVER use images.unsplash.com — those URLs will 404.**
**NEVER use loremflickr.com — those URLs return random irrelevant photos.**
**NEVER use generic seeds like "hero", "image1", "photo" — use DESCRIPTIVE search keywords.**
**ONLY use picsum.photos/seed/ or placehold.co for ALL images.**

### Contact Information Rules (CRITICAL)
- NEVER invent fake addresses, phone numbers, or email addresses
- If the user did NOT provide an address or phone, do NOT include one
- Placeholder patterns like "123 Main St", "(555) 123-4567" are FORBIDDEN
- Only include contact details the user actually provided

### Color Selection (CRITICAL — think about what fits THIS specific business)

Do NOT use a generic color palette. Think about:
1. What does this business DO? What colors does the customer associate with it?
2. What EMOTION should the site evoke? (trust, excitement, calm, luxury, nature, warmth)
3. What is the TONE? (professional=navy/gray, bold=saturated+dark, elegant=muted+gold, warm=earth tones, casual=bright+friendly)
4. If the user specified colors, USE THEM as accent and derive the rest.

Rules:
- "accent" = the primary brand color. Pick ONE color that captures the business identity.
- "accentLight" = a very light tint of the accent (for subtle highlights). Use 10-15% opacity version.
- "background" = ALWAYS a neutral: white (#ffffff, #fafafa), cream (#fefce8), or dark (#0f0f0f, #111827). NEVER a saturated color.
- "surface" = slightly off from background (if bg is white, surface is #f8fafc; if bg is dark, surface is #1f2937)
- "text" = high contrast against background (dark text on light bg, light text on dark bg)
- "border" = subtle separator color (light gray #e5e7eb or dark gray #374151)
- "muted" = secondary/dimmed text color

Be CREATIVE and SPECIFIC. A steakhouse gets different colors than a vegan cafe. A law firm gets different colors than a skateboard shop. A wildlife sanctuary gets different colors than a nightclub.

NEVER default to generic blue (#3b82f6) or red (#dc2626) unless the business genuinely warrants it.

### Logo Rules (CRITICAL)
- The navbar MUST always include a "logo" prop with the business name.
- ALSO include a "logoUrl" prop: use placehold.co to generate a square logo image with the business initials on a colored background matching the accent color (e.g., https://placehold.co/40x40/accent_hex/ffffff?text=BN where BN = business initials).
- Use the SAME logo and logoUrl on ALL pages (navbar consistency).

### Component Placement Rules
- Use ONLY ONE navigation component per page (navbar). NEVER include both "navbar" AND "sticky-header" — use ONLY "navbar".
- NEVER use the "sticky-header" or "announcement-bar" components — they are blocked.
- Use section-title as a separator before each major content block for visual hierarchy.
- The footer should be consistent across all pages and use the MULTI-COLUMN format (see Footer Rules below).
- cookie-consent and back-to-top should only appear on the Home page.

### Footer Rules (CRITICAL — use multi-column format)
The footer component accepts these props:
- **logo**: Business name (string)
- **tagline**: Short business tagline (string, 1 sentence)
- **columns**: Array of link groups, each with { title, links: [{ label, href }] }. Include 3-4 columns such as "Quick Links", "Services/Products", "Company", "Support".
- **social**: Array of { label, href } for social links. Use platform names as labels: "Facebook", "Instagram", "Twitter", "LinkedIn", "YouTube". SVG icons are auto-rendered from the label.
- **text**: Copyright text — use the © symbol (NOT "(c)") and current year ${new Date().getFullYear()} (e.g., "© ${new Date().getFullYear()} Business Name. All rights reserved.")
- **links**: Array of { label, href } for bottom bar links (Privacy Policy, Terms, etc.)
Example footer props:
{
  "logo": "Shatafa",
  "tagline": "Premium bathroom hygiene solutions for every home.",
  "columns": [
    { "title": "Shop", "links": [{ "label": "All Products", "href": "/products" }, { "label": "New Arrivals", "href": "/new" }] },
    { "title": "Company", "links": [{ "label": "About Us", "href": "/about" }, { "label": "Contact", "href": "/contact" }] },
    { "title": "Support", "links": [{ "label": "FAQ", "href": "/faq" }, { "label": "Shipping", "href": "/shipping" }] }
  ],
  "social": [{ "label": "Facebook", "href": "#" }, { "label": "Instagram", "href": "#" }, { "label": "LinkedIn", "href": "#" }],
  "text": "© ${new Date().getFullYear()} Shatafa. All rights reserved.",
  "links": [{ "label": "Privacy Policy", "href": "/privacy" }, { "label": "Terms of Service", "href": "/terms" }]
}

### Product Grid Rules (for COMMERCE/retail sites)
- Each product in the product-grid MUST include a "cartLabel" prop (e.g., "Add to Cart", "Buy Now", "Shop Now").
- Products must have: name, price (with currency symbol), image, href, description, and cartLabel.
- Use "ctaLabel" for the view-details link text (e.g., "View Details", "Learn More").

### Avoid Duplication
- Don't put both contact-form AND quick-inquiry-form on the same page.
- Don't put both pricing AND pricing-table on the same page — choose one.

### Navbar Consistency (CRITICAL)
- Use the SAME navbar props (logo, logoUrl, links, cta) across all 4 pages so navigation is consistent.
- The navbar links MUST include ALL 5 items: Home (/), About (/about), ${isCommerce ? 'Products (/services)' : 'Services (/services)'}, Contact (/contact).
- The FIRST link MUST be Home (/) — never omit it.
- Nav links MUST only point to pages that exist in the output. Do NOT invent slugs like /menu or /custom-cakes unless those pages are in the output.
- For COMMERCE archetype: the third nav link MUST say "Products" or "Shop" — NEVER "Services".
- The CTA button MUST have a non-empty "label" (e.g., "Contact Us", "Get Started") and an "href" (e.g., "/contact"). NEVER omit the CTA label.

### Clickability Rules (CRITICAL)
- ALL service cards in services-section MUST have an "href" prop (e.g., "/services" or "/services#service-name").
- ALL product cards in product-grid MUST have an "href" prop (e.g., "/product/product-slug").
- ALL pricing plan CTA buttons MUST have a "ctaHref" prop (e.g., "#contact" or "/contact").
- Category cards in category-showcase MUST have "href" props (e.g., "/category/category-slug").
- Navigation links must use real page paths (/about, /services, /contact), not "#".
- CTA buttons in heroes: on the Home page, use anchor links like "#products", "#features". On other pages, use "/#products" (with leading slash) so it navigates to Home first then scrolls.
- Hero CTA "ctaHref" default: "#products". Hero "ctaSecondaryHref" default: "#features".
- CRITICAL: The hero section MUST include BOTH "cta" (primary button text) AND "ctaSecondary" (secondary button text). Never omit ctaSecondary — every hero needs two CTAs (e.g., "Get Started" + "Learn More").

### Visual Quality Rules (CRITICAL)
- Every services-section card SHOULD include a relevant thumbnail "image" URL using placehold.co with colors matching the theme.
- Testimonials MUST include "avatar" (placehold.co with initials), "role" (job title at company), and "rating" (ALWAYS 5 — never less than 5).
- Features should use the RICH format: array of { icon: emoji, title: string, description: string } — NOT simple string arrays.
- Use relevant EMOJI icons for services and features (e.g., landscaping: 🌿🏡🌳, restaurant: 🍽️👨‍🍳🍷, tech: 💻🚀⚡).
- CRITICAL: Emoji must be actual Unicode characters, NOT escape sequences. Write "🛠️" not "\\u{1F6E0}\\uFE0F" or "🛠ufe0f". The JSON output must contain the literal emoji character.
- About section MUST include a relevant image (picsum.photos) and at least 2-3 stats.
- Every page must feel complete with proper sections — no single-component pages.

### Premium Polish Rules (CRITICAL — this is what separates amateur from professional output)
- EVERY card-based component (services-section, features, product-grid, pricing-table, testimonials, case-studies) MUST include style tokens for visual polish:
  - "--comp-radius": "20px" or "24px" (generous rounding, not 4px)
  - "--comp-shadow": "0 4px 24px rgba(0,0,0,0.06)" (subtle resting shadow)
  - "--comp-shadow-hover": "0 12px 40px rgba(0,0,0,0.12)" (elevated hover shadow)
  - "--comp-card-padding": "28px" or "32px" (generous internal spacing)
  - "--comp-card-bg": "#ffffff" or "rgba(255,255,255,0.9)"
- Hero sections MUST use large heading sizes: "--comp-heading-size": "48px" to "56px"
- Section titles MUST use: "--comp-heading-size": "36px" or "40px"
- Use generous gaps between cards: "--comp-gap": "28px" or "32px" (never less than 20px)
- About section stats should feel big and bold
- Contact forms should feel spacious and inviting

### Content Richness Rules
- Services: generate 4-6 service items (not 2-3), each with icon + image + title + 2-sentence description + href
- Features: generate 4-6 feature items with distinct emoji icons, clear titles, and 1-sentence descriptions
- Testimonials: generate 3-4 testimonials with varied names, roles at real-sounding companies, ratings (4-5), and 2-3 sentence quotes
- FAQ: generate 5-7 realistic questions with detailed answers
- Stats in about-section: use 3-4 impressive numbers (e.g., "500+", "15 Years", "98%", "24/7")

## Section Layout Control

Each section MUST include a "layout" object that controls its visual presentation.

### Layout Properties
- **background**: "default" | "muted" | "accent" | "accent-light" | "dark" | "gradient" | "none"
- **padding**: "none" | "sm" | "md" | "lg" | "xl"
- **width**: "contained" | "full"
- **align**: "left" | "center" | "right"

### Design Rhythm Rules (creates visual breathing room)
- Alternate backgrounds between adjacent sections: default -> muted -> default -> accent-light -> default -> dark
- NEVER use the same background for 3+ consecutive sections
- Heroes should use "xl" padding and "full" width
- Section titles should use "md" padding and "center" alignment
- Footers should use "dark" background and "full" width
- Navbars should use "none" padding, "full" width, "none" background
- CTAs and testimonials work well with "accent" or "accent-light" backgrounds
- About/content sections should use "lg" padding for generous breathing room
- Contact sections should use "lg" padding and "muted" or "accent-light" background
- Use "accent" background sparingly (1-2 sections max) for high-impact CTAs
- Feature/service grids look best on "default" or "muted" backgrounds (not dark)
- The home page should create a VISUAL JOURNEY: hero (dramatic) -> trust (subtle) -> content (clean) -> social proof (warm) -> CTA (bold) -> footer (dark)

## Per-Component Style Tokens (MANDATORY for premium look)

Each section MUST include a "style" object with CSS custom properties. This is NOT optional — it's what makes the site look professional instead of generic.

Available tokens:
- --comp-cols, --comp-gap, --comp-card-bg, --comp-card-border, --comp-card-padding, --comp-card-min
- --comp-radius, --comp-shadow, --comp-shadow-hover
- --comp-heading-size, --comp-text-size, --comp-icon-size, --comp-img-height
- --comp-height, --comp-overlay, --comp-fallback-bg
- --comp-cta-bg, --comp-cta-color, --comp-cta-radius
- --comp-eyebrow-color, --comp-eyebrow-size, --comp-max-width

### Required style tokens per component type:
- **navbar**: (no style tokens needed — layout handles it)
- **hero / hero-video / hero-image**: --comp-height: "560px", --comp-heading-size: "52px", --comp-overlay, --comp-fallback-bg, --comp-eyebrow-size: "13px"
- **section-title**: --comp-heading-size: "36px", --comp-eyebrow-color: accent color
- **services-section**: --comp-cols: "3", --comp-gap: "28px", --comp-radius: "20px", --comp-shadow: "0 4px 24px rgba(0,0,0,0.06)", --comp-shadow-hover: "0 12px 40px rgba(0,0,0,0.12)", --comp-card-padding: "28px", --comp-icon-size: "40px"
- **features**: --comp-cols: "3", --comp-gap: "24px", --comp-radius: "20px", --comp-shadow: "0 2px 16px rgba(0,0,0,0.05)", --comp-shadow-hover: "0 8px 32px rgba(0,0,0,0.1)", --comp-card-padding: "28px", --comp-icon-size: "36px"
- **product-grid**: --comp-cols: "3", --comp-gap: "24px", --comp-radius: "16px", --comp-shadow: "0 4px 20px rgba(0,0,0,0.06)", --comp-shadow-hover: "0 12px 40px rgba(0,0,0,0.1)", --comp-img-height: "220px"
- **testimonials**: --comp-cols: "3", --comp-gap: "28px", --comp-radius: "24px", --comp-shadow: "0 4px 20px rgba(0,0,0,0.05)", --comp-card-padding: "32px", --comp-card-bg: "#ffffff"
- **pricing-table**: --comp-cols: "3", --comp-gap: "24px", --comp-radius: "24px", --comp-shadow: "0 4px 24px rgba(0,0,0,0.06)", --comp-card-padding: "36px"
- **about-section**: --comp-radius: "20px", --comp-shadow: "0 8px 30px rgba(0,0,0,0.08)"
- **faq-accordion**: --comp-radius: "16px", --comp-card-padding: "20px"
- **contact-form**: --comp-radius: "16px", --comp-card-padding: "32px"
- **footer**: --comp-max-width: "1200px"

### Hero Media Notes
- For hero-video, use a REAL public video URL:
  - General/business: "https://cdn.pixabay.com/video/2024/02/22/201594-916384958_large.mp4"
  - Food/restaurant: "https://cdn.pixabay.com/video/2020/07/30/45349-446487556_large.mp4"
  - Nature/wellness: "https://cdn.pixabay.com/video/2021/04/20/72011-542638942_large.mp4"
  - Technology: "https://cdn.pixabay.com/video/2023/07/12/171469-844770498_large.mp4"
  - Office/workspace: "https://cdn.pixabay.com/video/2019/06/21/24632-343562937_large.mp4"
  - Water/bathroom: "https://cdn.pixabay.com/video/2020/05/25/40397-424094498_large.mp4"
- For hero-image, use https://picsum.photos/seed/{business-type}-hero/1920/800
- Always provide --comp-fallback-bg in style tokens

## Cross-Page Data Consistency (CRITICAL)

To ensure consistent data across all pages, follow these rules:

1. **Navbar** — Use the EXACT SAME navbar props object on every page. Same logo, logoUrl, links, and CTA.
2. **Footer** — Use the EXACT SAME footer props object on every page. Same logo, tagline, columns, social, text, links.
3. **Products/Services** — If a product or service appears on multiple pages (e.g., featured on home AND listed on services/products page), it MUST have the same name, price, description, and image URL.
4. **Testimonials** — If testimonials appear on multiple pages, reuse the same people (name, role, avatar, quote).
5. **Stats** — Business statistics (years in business, customers served, etc.) MUST be consistent across hero-stats, about-section stats, and any trust-badges.
6. **Contact info** — Phone numbers, emails, addresses MUST be the same in contact sections, footer, and any contact-details-block.
7. **Social links** — Use the same social media links in footer and any social-media-icons component.

Think of it as a single "site data model" — define the business facts once and reference them everywhere.

## Output Format (strict JSON, no markdown)

{
  "pages": {
    "home": { "page": "business-name-home", "sections": [ { "component": "...", "props": {...}, "layout": {...}, "style": {...} }, ... ] },
    "about": { "page": "business-name-about", "sections": [...] },
    "services": { "page": "business-name-services", "sections": [...] },
    "contact": { "page": "business-name-contact", "sections": [...] }
  },
  "theme": {
    "name": "theme-name",
    "colors": { "accent": "#hex", "accentLight": "#hex", "surface": "#hex", "background": "#hex", "text": "#hex", "border": "#hex", "muted": "#hex" },
    "fonts": { "heading": "Serif or Display Font Name", "body": "Sans-Serif Body Font Name" },
    "radius": "Npx"
  }
}

### Font Pairing Rules (CRITICAL for premium feel)
- heading and body fonts MUST be DIFFERENT font families
- Use a serif or display font for headings (e.g., "Playfair Display", "Merriweather", "Lora", "DM Serif Display", "Crimson Text")
- Use a clean sans-serif for body (e.g., "Inter", "DM Sans", "Plus Jakarta Sans", "Outfit", "Nunito Sans")
- Match the font pairing to the business personality:
  - Elegant/luxury: "Playfair Display" + "Lato"
  - Modern/tech: "Space Grotesk" + "Inter"
  - Warm/friendly: "Merriweather" + "Nunito Sans"
  - Bold/startup: "Sora" + "DM Sans"
  - Professional/corporate: "DM Serif Display" + "Plus Jakarta Sans"
  - Creative/artistic: "Cormorant Garamond" + "Outfit"
- Use generous radius for friendly/warm brands (16-20px), smaller for corporate (6-8px)

Return ONLY the JSON object. No explanations, no markdown fences, no extra text.`
}

// ── Theme-only prompt (unchanged, no component selection needed) ──

const THEME_ONLY_SYSTEM_PROMPT = `You are an expert website designer. You generate ONLY visual theme tokens as JSON.

Given a description of the desired look and feel, generate a theme object with colors, fonts, and border radius that match the vibe.

## Output Format (strict JSON, no markdown)

{
  "theme": {
    "name": "theme-name",
    "colors": {
      "accent": "#hex",
      "accentLight": "#hex",
      "surface": "#hex",
      "background": "#hex",
      "text": "#hex",
      "border": "#hex",
      "muted": "#hex"
    },
    "fonts": {
      "heading": "Font Name",
      "body": "Font Name"
    },
    "radius": "Npx"
  }
}

### Industry Color Matching (CRITICAL)
Match colors to the business type:
- Landscaping/Nature: greens (#16a34a) + earth tones, white bg
- Restaurant/Food: warm (#c2410c, #ea580c), cream surfaces
- Health/Medical: clean blues (#0284c7) + white
- Legal/Finance: navy (#1e3a5f) + gold (#b8860b)
- Fitness/Sports: bold reds (#dc2626), dark bg
- Beauty/Spa: soft purples (#a855f7) or pinks (#ec4899)
- Technology/SaaS: modern blues (#3b82f6) or purples (#7c3aed)
- Real Estate: grays (#374151) + gold accents
- Construction/Trades: oranges (#ea580c) or yellows (#eab308)
- Photography/Creative: dark (#18181b) or bold accent on white

### Vibe Matching
- "dark" -> dark background, light text, moody accent
- "bright" / "colorful" -> vibrant accent, white background
- "minimal" -> neutral palette, subtle accent, lots of whitespace
- "bold" -> high contrast, strong accent, large radius
- "elegant" / "luxury" -> serif heading font, muted palette, small radius
- "warm" -> earthy tones, rounded radius, friendly fonts
- "professional" / "corporate" -> blue/navy accent, sans-serif, medium radius

Return ONLY the JSON object. No explanations, no markdown fences, no extra text.`

// ── Auto-populate empty pages (RC5) ──

function autoPopulateEmptyPages(parsed, plan, businessProfile) {
  if (!parsed?.pages || !plan?.pages) return

  const homeNavbar = parsed.pages.home?.sections?.find(s => s.component === 'navbar')
  const homeFooter = parsed.pages.home?.sections?.find(s => s.component === 'footer')

  for (const pageDef of plan.pages) {
    const pageKey = pageDef.key
    if (pageKey === 'home') continue

    const page = parsed.pages[pageKey]
    const hasSections = page?.sections?.length >= 2

    if (!hasSections) {
      console.log('[AutoPopulate] Page "' + pageKey + '" is empty or missing, generating defaults from goal: ' + (pageDef.goal || 'general'))

      const goal = (pageDef.goal || '').toLowerCase()
      const label = pageDef.label || pageKey.charAt(0).toUpperCase() + pageKey.slice(1)
      const bName = businessProfile?.businessName || 'Our Company'
      const bIndustry = businessProfile?.industry || 'business'

      const sections = []

      if (homeNavbar) sections.push(JSON.parse(JSON.stringify(homeNavbar)))

      sections.push({
        component: 'section-title',
        props: { title: label, subtitle: pageDef.goal || ('Learn more about ' + bName) },
        layout: { background: 'default', padding: 'lg', width: 'contained', align: 'center' },
        style: { '--comp-heading-size': '36px' }
      })

      if (pageKey === 'faq' || goal.includes('faq') || goal.includes('question')) {
        sections.push({
          component: 'faq-accordion',
          props: {
            title: 'Frequently Asked Questions',
            items: [
              { question: 'What services does ' + bName + ' offer?', answer: 'We provide comprehensive ' + bIndustry + ' services tailored to your needs. Contact us for a detailed consultation.' },
              { question: 'How can I get started?', answer: 'Simply reach out through our contact form or give us a call. We will schedule a free consultation to discuss your requirements.' },
              { question: 'What areas do you serve?', answer: 'We serve clients throughout our local region and surrounding areas. Contact us to confirm service availability in your location.' },
              { question: 'What makes ' + bName + ' different?', answer: 'Our commitment to quality, personalized service, and years of industry experience set us apart from the competition.' },
              { question: 'Do you offer free estimates?', answer: 'Yes! We provide free, no-obligation estimates for all our services. Get in touch today to request yours.' }
            ]
          },
          layout: { background: 'muted', padding: 'lg', width: 'contained', align: 'left' },
          style: { '--comp-radius': '16px', '--comp-card-padding': '20px' }
        })
      } else if (pageKey === 'blog' || goal.includes('blog') || goal.includes('article') || goal.includes('news')) {
        sections.push({
          component: 'features',
          props: {
            title: 'Latest Updates',
            features: [
              { icon: '\ud83d\udcf0', title: 'Industry Insights', description: 'Stay up to date with the latest trends and developments in ' + bIndustry + '.' },
              { icon: '\ud83d\udca1', title: 'Tips & Guides', description: 'Expert advice and practical guides to help you make informed decisions.' },
              { icon: '\ud83c\udfc6', title: 'Success Stories', description: 'See how ' + bName + ' has helped clients achieve their goals.' }
            ]
          },
          layout: { background: 'default', padding: 'lg', width: 'contained', align: 'center' },
          style: { '--comp-cols': '3', '--comp-gap': '28px', '--comp-radius': '20px', '--comp-shadow': '0 4px 24px rgba(0,0,0,0.06)', '--comp-card-padding': '28px' }
        })
      } else if (pageKey === 'testimonials' || goal.includes('testimonial') || goal.includes('review')) {
        sections.push({
          component: 'testimonials',
          props: {
            title: 'What Our Clients Say',
            testimonials: [
              { name: 'Sarah M.', role: 'Satisfied Customer', quote: bName + ' exceeded our expectations. Their attention to detail and professionalism made all the difference.', rating: 5, avatar: 'https://placehold.co/80x80/e5e7eb/6b7280?text=SM' },
              { name: 'James R.', role: 'Business Owner', quote: 'Exceptional service from start to finish. I highly recommend ' + bName + ' to anyone looking for quality ' + bIndustry + ' services.', rating: 5, avatar: 'https://placehold.co/80x80/e5e7eb/6b7280?text=JR' },
              { name: 'Emily K.', role: 'Returning Client', quote: 'We have been working with ' + bName + ' for years and they consistently deliver outstanding results.', rating: 5, avatar: 'https://placehold.co/80x80/e5e7eb/6b7280?text=EK' }
            ]
          },
          layout: { background: 'accent-light', padding: 'lg', width: 'contained', align: 'center' },
          style: { '--comp-cols': '3', '--comp-gap': '28px', '--comp-radius': '24px', '--comp-shadow': '0 4px 20px rgba(0,0,0,0.05)', '--comp-card-padding': '32px' }
        })
      } else if (pageKey === 'about' || goal.includes('trust') || goal.includes('story') || goal.includes('team')) {
        sections.push({
          component: 'about-section',
          props: {
            title: 'About ' + bName,
            description: 'We are dedicated to providing exceptional ' + bIndustry + ' services. Our team brings years of experience and a passion for excellence to every project.',
            stats: [
              { value: '10+', label: 'Years Experience' },
              { value: '500+', label: 'Happy Clients' },
              { value: '98%', label: 'Satisfaction Rate' }
            ]
          },
          layout: { background: 'default', padding: 'lg', width: 'contained', align: 'left' },
          style: { '--comp-radius': '20px', '--comp-shadow': '0 8px 30px rgba(0,0,0,0.08)' }
        })
      } else if (pageKey === 'services' || goal.includes('service') || goal.includes('offering')) {
        sections.push({
          component: 'services-section',
          props: {
            title: 'Our Services',
            services: (businessProfile?.keyServices || ['Main Service', 'Consultation', 'Support']).map((svc, idx) => ({
              icon: ['\ud83d\udd27', '\u2b50', '\ud83d\udcbc', '\ud83c\udfaf', '\ud83d\udccb', '\ud83d\udee0\ufe0f'][idx % 6],
              title: svc,
              description: 'Professional ' + svc.toLowerCase() + ' tailored to your specific needs and goals.',
              href: '/services#' + svc.toLowerCase().replace(/\s+/g, '-')
            }))
          },
          layout: { background: 'default', padding: 'lg', width: 'contained', align: 'center' },
          style: { '--comp-cols': '3', '--comp-gap': '28px', '--comp-radius': '20px', '--comp-shadow': '0 4px 24px rgba(0,0,0,0.06)', '--comp-card-padding': '28px' }
        })
      } else if (pageKey === 'contact' || goal.includes('contact') || goal.includes('booking') || goal.includes('friction')) {
        sections.push({
          component: 'contact-form',
          props: {
            title: 'Get In Touch',
            description: 'Ready to get started? Send us a message and we will get back to you within 24 hours.',
            fields: ['name', 'email', 'phone', 'message'],
            button: 'Send Message'
          },
          layout: { background: 'muted', padding: 'lg', width: 'contained', align: 'center' },
          style: { '--comp-radius': '16px', '--comp-card-padding': '32px' }
        })
      } else {
        sections.push({
          component: 'features',
          props: {
            title: label,
            features: [
              { icon: '\u2728', title: 'Quality Service', description: bName + ' delivers exceptional quality in everything we do.' },
              { icon: '\ud83e\udd1d', title: 'Trusted Partner', description: 'Years of experience serving clients with dedication and professionalism.' },
              { icon: '\ud83d\udcc8', title: 'Proven Results', description: 'Our track record speaks for itself with hundreds of satisfied clients.' }
            ]
          },
          layout: { background: 'default', padding: 'lg', width: 'contained', align: 'center' },
          style: { '--comp-cols': '3', '--comp-gap': '28px', '--comp-radius': '20px', '--comp-shadow': '0 4px 24px rgba(0,0,0,0.06)', '--comp-card-padding': '28px' }
        })
      }

      if (homeFooter) sections.push(JSON.parse(JSON.stringify(homeFooter)))

      parsed.pages[pageKey] = {
        page: (businessProfile?.businessName || 'site').toLowerCase().replace(/\s+/g, '-') + '-' + pageKey,
        sections
      }

      console.log('[AutoPopulate] Generated ' + sections.length + ' sections for page "' + pageKey + '"')
    }
  }
}

// ── Auto-assign OG images (RC9) ──

function assignPerPageSEO(parsed) {
  if (!parsed?.pages) return
  const bizName = parsed._plan?.businessProfile?.businessName || 'Business'
  for (const [slug, page] of Object.entries(parsed.pages)) {
    if (!page?.sections) continue
    if (!page.meta) page.meta = {}
    // Find the page's section-title or hero for context
    let pageTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
    let pageDesc = ''
    for (const s of page.sections) {
      if (s.component === 'section-title' && s.props?.title) {
        pageTitle = s.props.title
        if (s.props.subtitle) pageDesc = s.props.subtitle
        break
      }
      if (s.component?.includes('hero') && s.props?.title) {
        pageTitle = s.props.title
        if (s.props.subtitle) pageDesc = s.props.subtitle
        break
      }
    }
    if (!page.meta.metaTitle) {
      page.meta.metaTitle = slug === 'home'
        ? bizName + ' — ' + pageTitle
        : pageTitle + ' | ' + bizName
    }
    if (!page.meta.metaDesc) {
      page.meta.metaDesc = pageDesc || (pageTitle + '. ' + bizName + '.')
    }
  }
}

function assignOgImages(parsed) {
  if (!parsed?.pages) return

  for (const [pageKey, page] of Object.entries(parsed.pages)) {
    if (!page?.sections?.length) continue

    let ogImage = null

    for (const section of page.sections) {
      if (!section.props) continue

      if (section.component === 'hero' || section.component === 'hero-image' || section.component === 'hero-video') {
        if (section.props.imageUrl) { ogImage = section.props.imageUrl; break }
      }

      if (section.props.imageUrl) { ogImage = section.props.imageUrl; break }
      if (section.props.image) { ogImage = section.props.image; break }

      const arrays = ['products', 'services', 'items', 'features', 'testimonials']
      for (const arrKey of arrays) {
        if (Array.isArray(section.props[arrKey])) {
          const firstWithImg = section.props[arrKey].find(i => i.image || i.imageUrl)
          if (firstWithImg) {
            ogImage = firstWithImg.image || firstWithImg.imageUrl
            break
          }
        }
      }
      if (ogImage) break
    }

    if (ogImage) {
      if (!page.meta) page.meta = {}
      page.meta.ogImage = ogImage
    }
  }

  console.log('[OGImage] Assigned OG images to pages')
}

// ── Post-generation consistency enforcement ──

/**
 * Enforce cross-page data consistency AFTER LLM generation.
 * Copies the home page's navbar/footer to all pages, normalizes
 * products/services data, and ensures contact info matches.
 */
function enforceConsistency(parsed) {
  if (!parsed?.pages) return parsed

  const pages = parsed.pages
  const home = pages.home
  if (!home?.sections?.length) return parsed

  // 1. Extract canonical navbar and footer from home page
  const homeNavbar = home.sections.find(s => s.component === 'navbar')
  const homeFooter = home.sections.find(s => s.component === 'footer')

  // 2. Build canonical product/service map from home page
  const homeProducts = home.sections.find(s => s.component === 'product-grid')
  const productMap = new Map()
  if (homeProducts?.props?.products) {
    for (const product of homeProducts.props.products) {
      if (product.name) {
        productMap.set(product.name.toLowerCase(), product)
      }
    }
  }

  // 3. Extract canonical contact info from contact page
  const contactPage = pages.contact
  let canonicalContact = null
  if (contactPage?.sections) {
    const contactSection = contactPage.sections.find(s =>
      s.component === 'contact' || s.component === 'contact-form'
    )
    if (contactSection?.props) {
      canonicalContact = {
        phone: contactSection.props.phone,
        email: contactSection.props.email,
        address: contactSection.props.address,
      }
    }
  }

  // 4. Extract canonical stats from home page (hero-stats or about-section)
  const homeStats = home.sections.find(s => s.component === 'hero-stats')
  const homeAbout = home.sections.find(s => s.component === 'about-section')

  // 5. Apply consistency to all pages
  for (const [pageName, page] of Object.entries(pages)) {
    if (!page?.sections?.length) continue

    for (let i = 0; i < page.sections.length; i++) {
      const section = page.sections[i]

      // Replace navbar with home's navbar (keep layout/style from original)
      if (section.component === 'navbar' && homeNavbar) {
        page.sections[i] = {
          ...section,
          props: { ...homeNavbar.props },
        }
      }

      // Replace footer with home's footer
      if (section.component === 'footer' && homeFooter) {
        page.sections[i] = {
          ...section,
          props: { ...homeFooter.props },
        }
      }

      // Normalize product data — match by name, copy canonical data
      if (section.component === 'product-grid' && section.props?.products && productMap.size > 0) {
        section.props.products = section.props.products.map(product => {
          if (!product.name) return product
          const canonical = productMap.get(product.name.toLowerCase())
          if (canonical) {
            return { ...canonical } // use home page's version
          }
          return product
        })
      }

      // Normalize contact info
      if (canonicalContact && (section.component === 'contact' || section.component === 'contact-form')) {
        if (canonicalContact.phone && !section.props?.phone) {
          section.props = section.props || {}
          section.props.phone = canonicalContact.phone
        }
        if (canonicalContact.email && !section.props?.email) {
          section.props = section.props || {}
          section.props.email = canonicalContact.email
        }
        if (canonicalContact.address && !section.props?.address) {
          section.props = section.props || {}
          section.props.address = canonicalContact.address
        }
      }

      // Normalize about-section stats to match home page stats
      if (section.component === 'about-section' && pageName !== 'home' && homeAbout?.props?.stats) {
        if (section.props) {
          section.props.stats = homeAbout.props.stats
        }
      }

      // Normalize hero-stats to match home page
      if (section.component === 'hero-stats' && pageName !== 'home' && homeStats?.props) {
        section.props = { ...homeStats.props }
      }
    }
  }

  // 6. Ensure copyright year is current and "(c)" → "©" in all footers
  const currentYear = new Date().getFullYear().toString()
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'footer' && section.props?.text) {
        // Fix "(c)" to proper "©" symbol
        section.props.text = section.props.text.replace(/\(c\)/gi, '©')
        // Update year
        section.props.text = section.props.text.replace(
          /©\s*\d{4}/gi,
          match => match.replace(/\d{4}/, currentYear)
        )
      }
    }
  }

  // 6b. Enrich minimal footers with full content
  // Extract business name from multiple sources (most reliable first)
  let businessName = 'Business'
  // Source 1: businessProfile
  if (parsed._plan?.businessProfile?.businessName && parsed._plan.businessProfile.businessName !== 'Business') {
    businessName = parsed._plan.businessProfile.businessName
  }
  // Source 2: _plan top-level
  if (businessName === 'Business' && parsed._plan?.businessName) {
    businessName = parsed._plan.businessName
  }
  // Source 3: Extract from the first navbar's logo prop (most reliable — the LLM always sets this)
  if (businessName === 'Business') {
    for (const page of Object.values(pages)) {
      if (!page?.sections) continue
      for (const section of page.sections) {
        if (section.component === 'navbar' && section.props?.logo && section.props.logo !== 'SiteName') {
          businessName = section.props.logo
          break
        }
      }
      if (businessName !== 'Business') break
    }
  }
  const businessTagline = parsed._plan?.businessProfile?.tagline
    || parsed._plan?.businessProfile?.valueProposition
    || (businessName !== 'Business' ? businessName + ' — Excellence in every detail.' : '')
    || (businessName + ' — Quality you can trust.')
  const pageKeys = Object.keys(pages)
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component !== 'footer') continue
      // If footer is missing columns, add default ones from page list
      if (!section.props.columns || (Array.isArray(section.props.columns) && section.props.columns.length === 0)) {
        section.props.columns = [
          {
            title: 'Quick Links',
            links: pageKeys.slice(0, 6).map(slug => ({
              label: slug === 'home' ? 'Home' : slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              href: slug === 'home' ? '/' : '/' + slug
            }))
          },
          {
            title: 'Company',
            links: [
              { label: 'About Us', href: '/about' },
              { label: 'Contact', href: '/contact' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms of Service', href: '/terms' }
            ]
          }
        ]
      }
      // If footer is missing logo, add business name
      if (!section.props.logo) {
        section.props.logo = businessName
      }
      // If footer is missing tagline, create one from business profile
      if (!section.props.tagline) {
        section.props.tagline = businessTagline
      }
      // If footer is missing social links, add defaults
      if (!section.props.social || (Array.isArray(section.props.social) && section.props.social.length === 0)) {
        section.props.social = []
      }
    }
  }

  // 6c. BUG 75 - Remove placeholder social links
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === "footer" && Array.isArray(section.props?.social)) {
        section.props.social = section.props.social.filter(s => s.href && s.href !== "#")
      }
    }
  }

  // 7. Ensure navbar has "Home" link
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'navbar' && section.props?.links) {
        const hasHome = section.props.links.some(l =>
          l.href === '/' || (l.label || '').toLowerCase() === 'home'
        )
        if (!hasHome) {
          section.props.links.unshift({ label: 'Home', href: '/' })
        }
      }
    }
  }

  // 8. Replace any loremflickr.com URLs with picsum equivalents
  function replaceLoremflickr(obj) {
    if (typeof obj === 'string' && obj.includes('loremflickr.com')) {
      // Extract dimensions from loremflickr URL: /WIDTHxHEIGHT/ or /WIDTH/HEIGHT/
      const dimMatch = obj.match(/(\d{2,4})[x/](\d{2,4})/)
      const w = dimMatch?.[1] || '400'
      const h = dimMatch?.[2] || '300'
      return `https://picsum.photos/seed/placeholder/${w}/${h}`
    }
    if (Array.isArray(obj)) return obj.map(replaceLoremflickr)
    if (obj && typeof obj === 'object') {
      const out = {}
      for (const [k, v] of Object.entries(obj)) {
        out[k] = replaceLoremflickr(v)
      }
      return out
    }
    return obj
  }

  for (const [pageName, page] of Object.entries(pages)) {
    if (!page?.sections) continue
    for (let i = 0; i < page.sections.length; i++) {
      if (page.sections[i].props) {
        page.sections[i].props = replaceLoremflickr(page.sections[i].props)
      }
    }
  }

  // 9. BUG 20 — Strip "in ." or "in  " from all text fields (empty location)
  function stripEmptyLocation(obj) {
    if (typeof obj === 'string') {
      return obj
        .replace(/\s+in\s+\.\s*/g, ' ')      // "in ."
        .replace(/\s+in\.\s*/g, ' ')          // "in." (no space before period)
        .replace(/\s+in\s+,\s*/g, ' ')        // "in ,"
        .replace(/\s+in,\s*/g, ' ')           // "in," (no space before comma)
        .replace(/\s+in\s*$/g, '')             // trailing "in " at end of string
        .replace(/\s+in\s{2,}/g, ' ')          // "in   " (multiple spaces)
        .replace(/\s+in\s*"/g, '"')            // "in" (before quote)
        .replace(/\s+in\s*!/g, '!')            // "in!"
        .replace(/\s+in\s*\?/g, '?')          // "in?"
        .replace(/\s{2,}/g, ' ')               // collapse double spaces
        .trim()
    }
    if (Array.isArray(obj)) return obj.map(stripEmptyLocation)
    if (obj && typeof obj === 'object') {
      const out = {}
      for (const [k, v] of Object.entries(obj)) {
        out[k] = stripEmptyLocation(v)
      }
      return out
    }
    return obj
  }

  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (let i = 0; i < page.sections.length; i++) {
      if (page.sections[i].props) {
        page.sections[i].props = stripEmptyLocation(page.sections[i].props)
      }
    }
  }

  // 10. BUG 23 — Navbar logo must be text (business name), not a stock photo URL
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'navbar' && section.props) {
        // If logo looks like a URL, replace it with logoUrl and use business name instead
        if (section.props.logo && /^https?:\/\//.test(section.props.logo)) {
          section.props.logoUrl = section.props.logo
          section.props.logo = section.props.logo // will be overridden below
        }
        // If logoUrl is a picsum/unsplash photo (not placehold.co), replace with placehold.co
        if (section.props.logoUrl && !section.props.logoUrl.includes('placehold.co')) {
          const name = section.props.logo || 'Site'
          const initials = name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase()
          section.props.logoUrl = `https://placehold.co/40x40/333333/ffffff?text=${initials}`
        }
      }
    }
  }

  // 10b. Generate SVG logos for navbars missing proper logos
  const themeAccent = parsed.theme?.colors?.accent || '#3b82f6'
  // BUG 52 — Use actual business name from businessProfile, not the generic fallback
  const bizName = (parsed._plan?.businessProfile?.businessName && parsed._plan.businessProfile.businessName !== 'Business')
    ? parsed._plan.businessProfile.businessName
    : (businessName || 'Business')
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'navbar' && section.props) {
        const url = section.props.logoUrl || ''
        if (!url || url.includes('placehold.co')) {
          const logo = generateLogo(bizName, themeAccent, 'rounded')
          section.props.logoUrl = logo.dataUri
        }
      }
    }
  }

  // 11. BUG 26 — Force all testimonial ratings to 5
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'testimonials' && section.props?.items) {
        for (const item of section.props.items) {
          if (item.rating !== undefined && item.rating < 5) {
            item.rating = 5
          }
        }
      }
    }
  }

  // 12. BUG 27 — Rebuild footer column links from actual page list
  // Extract actual pages from the parsed output
  const actualPageKeys = Object.keys(pages)
  const pageLabels = {}
  // Try to infer labels from navbar links
  if (homeNavbar?.props?.links) {
    for (const link of homeNavbar.props.links) {
      const slug = (link.href || '').replace(/^\//, '') || 'home'
      pageLabels[slug] = link.label
    }
  }
  // Build a "Quick Links" column from actual pages
  const quickLinks = actualPageKeys
    .filter(k => k !== 'home')
    .map(k => ({
      label: pageLabels[k] || k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, ' '),
      href: k === 'home' ? '/' : `/${k}`,
    }))
  // Add Home at the start
  quickLinks.unshift({ label: 'Home', href: '/' })

  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'footer' && section.props?.columns) {
        // Find or create the "Quick Links" / navigation column
        const navColIndex = section.props.columns.findIndex(c =>
          /quick\s*links|pages|navigation|sitemap|menu/i.test(c.title)
        )
        if (navColIndex >= 0) {
          section.props.columns[navColIndex].links = quickLinks
        } else if (section.props.columns.length > 0) {
          // Replace the first column with quick links
          section.props.columns[0] = { title: 'Quick Links', links: quickLinks }
        }
      }
    }
  }

  // 13. BUG 22 — Remove trust-badges / certifications-badges sections if they only have placehold.co URLs
  // These look worse than not having them at all (grey rectangles)
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    page.sections = page.sections.filter(section => {
      if (section.component !== 'trust-badges' && section.component !== 'certifications-badges') return true
      if (!section.props) return false
      const badgeArrays = ['badges', 'items', 'logos', 'clients', 'partners']
      let hasRealImage = false
      for (const key of badgeArrays) {
        if (Array.isArray(section.props[key])) {
          for (const badge of section.props[key]) {
            const img = badge.image || badge.logo || ''
            if (img && !img.includes('placehold.co')) {
              hasRealImage = true
            }
          }
        }
      }
      if (!hasRealImage) {
        console.log(`[Consistency] Removed ${section.component} section — only placehold.co URLs`)
        return false
      }
      return true
    })
  }

  // 13. Validate theme colors — fix bad backgrounds (never saturated)
  if (parsed.theme?.colors) {
    const bg = parsed.theme.colors.background || ''
    // If background is a saturated color (not near white/black/gray), fix it
    if (bg && !bg.match(/^#(f[0-9a-f]|[0-2][0-9a-f]|[e-f][0-9a-f])/i)) {
      // Background is a saturated color — replace with neutral
      const isDark = parsed.theme.colors.text?.match(/^#[c-f]/i) // light text = dark theme
      parsed.theme.colors.background = isDark ? '#0f0f0f' : '#fafafa'
      console.log('[Consistency] Fixed saturated background color:', bg, '->', parsed.theme.colors.background)
    }
    // Ensure accent-light is not too saturated
    if (!parsed.theme.colors.accentLight) {
      const accent = parsed.theme.colors.accent || '#3b82f6'
      parsed.theme.colors.accentLight = accent + '20' // 12% opacity hex
    }
  }

  // 14. BUG 52 — Navbar CTA button must have text
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'navbar' && section.props) {
        if (section.props.cta && !section.props.cta.label) {
          section.props.cta.label = 'Contact Us'
        }
        if (!section.props.cta) {
          section.props.cta = { label: 'Contact Us', href: '/contact' }
        }
      }
    }
  }

  // 15. BUG 53 — Remove duplicate nav: if navbar exists, remove sticky-header
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    const hasNavbar = page.sections.some(s => s.component === 'navbar')
    if (hasNavbar) {
      page.sections = page.sections.filter(s => s.component !== 'sticky-header')
    }
  }

  // 16. BUG 54 — Validate navbar links point to pages that actually exist in parsed.pages
  const validPageSlugs = new Set(Object.keys(pages))
  validPageSlugs.add('') // home = "/"
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (section.component === 'navbar' && section.props?.links) {
        section.props.links = section.props.links.filter(link => {
          const href = (link.href || '').replace(/^\//, '').replace(/#.*$/, '')
          // Allow home ("/"), anchor-only links ("#..."), and valid page slugs
          if (href === '' || link.href?.startsWith('#')) return true
          if (validPageSlugs.has(href)) return true
          // Try to find closest matching page slug
          const closestMatch = [...validPageSlugs].find(slug =>
            slug && (slug.includes(href) || href.includes(slug))
          )
          if (closestMatch) {
            link.href = '/' + closestMatch
            return true
          }
          // No match found — remove this broken link
          console.log(`[Consistency] BUG 54 — Removed broken nav link: ${link.label} -> ${link.href}`)
          return false
        })
      }
    }
  }

  // 17b. BUG 76 - Strip fake 555 phone numbers from ALL sections
  function hasFakePhone(text) {
    return typeof text === 'string' && /\(\d{3}\)\s*555|555[\s-]\d{4}/.test(text)
  }
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    for (const section of page.sections) {
      if (!section.props) continue
      for (const [key, val] of Object.entries(section.props)) {
        if (typeof val === 'string' && hasFakePhone(val)) {
          section.props[key] = val.replace(/\(?\d{3}\)?\s*555[\s-]\d{4}/g, '').trim()
          if (!section.props[key]) delete section.props[key]
        }
      }
    }
  }

  // 17. BUG 45 — Remove announcement-bar from all pages (blocked component)
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    const beforeLen = page.sections.length
    page.sections = page.sections.filter(s => s.component !== 'announcement-bar')
    if (page.sections.length < beforeLen) {
      console.log('[Consistency] BUG 45 — Removed announcement-bar section')
    }
  }

  // 18. BUG 56 — Remove map-embed sections without a valid embedUrl
  for (const page of Object.values(pages)) {
    if (!page?.sections) continue
    const beforeLen = page.sections.length
    page.sections = page.sections.filter(s => {
      if (s.component !== 'map-embed') return true
      const url = s.props?.embedUrl || ''
      if (url && url.includes('google.com/maps')) return true
      console.log('[Consistency] BUG 56 — Removed map-embed section (no valid embedUrl)')
      return false
    })
  }

  console.log('[Consistency] Enforced navbar/footer/product/contact/testimonial/trust-badge/nav-links consistency across all pages')
  return parsed
}

// ── Business context validation ──

/**
 * Check if the generated output actually matches the business profile.
 * Returns a mismatch description string if there's a problem, or null if OK.
 */
function validateBusinessContext(parsed, businessProfile) {
  if (!parsed?.pages?.home?.sections?.length || !businessProfile) return null

  const home = parsed.pages.home
  const expectedName = (businessProfile.businessName || '').toLowerCase()
  const expectedIndustry = (businessProfile.industry || '').toLowerCase()

  // Check navbar logo matches business name
  const navbar = home.sections.find(s => s.component === 'navbar')
  if (navbar?.props?.logo) {
    const logo = navbar.props.logo.toLowerCase()
    // Check if logo is completely unrelated (not a substring match either way)
    if (expectedName.length > 3 && !logo.includes(expectedName.slice(0, Math.min(expectedName.length, 8))) && !expectedName.includes(logo.slice(0, Math.min(logo.length, 8)))) {
      return `Navbar logo is "${navbar.props.logo}" but business name is "${businessProfile.businessName}"`
    }
  }

  // Check hero headline mentions business or industry
  const hero = home.sections.find(s => s.component === 'hero' || s.component === 'hero-image' || s.component === 'hero-video')
  if (hero?.props?.headline) {
    const headline = hero.props.headline.toLowerCase()
    const industryWords = expectedIndustry.split(/\s+/).filter(w => w.length > 3)
    const nameWords = expectedName.split(/\s+/).filter(w => w.length > 3)
    const allKeywords = [...industryWords, ...nameWords]

    // At least one keyword from name or industry should appear in the headline
    const hasMatch = allKeywords.some(word => headline.includes(word))
    if (!hasMatch && allKeywords.length > 0) {
      return `Hero headline "${hero.props.headline}" doesn't mention "${businessProfile.businessName}" or "${businessProfile.industry}"`
    }
  }

  return null
}

// ── Exported generation functions ──

export async function generateFull(prompt, blueprintContext) {
  // Step 0: Business Intelligence — use blueprint context if available, else analyze
  let businessProfile
  if (blueprintContext && blueprintContext.businessName) {
    console.log('[Generator] Using blueprint context (skipping re-analysis)')
    businessProfile = {
      businessName: blueprintContext.businessName,
      industry: blueprintContext.industry || 'general business',
      location: blueprintContext.location || null,
      targetAudience: blueprintContext.targetAudience || 'general consumers',
      primaryPainPoint: blueprintContext.differentiator || 'finding a reliable provider',
      valueProposition: blueprintContext.description || 'quality service',
      tone: blueprintContext.tone || 'professional',
      websiteGoal: blueprintContext.primaryGoal || 'leads',
      uniqueSellingPoints: blueprintContext.services ? blueprintContext.services.map(s => s.name) : [],
      keyServices: blueprintContext.services ? blueprintContext.services.map(s => s.name) : [],
      // Pass user's custom colors so the theme uses them
      customColors: blueprintContext.colors || [],
    }
  } else {
    businessProfile = await analyzeBusinessIntelligence(prompt)
  }

  // Step 1: Plan — classify business, select personality, pages, components
  const plan = await planSite(prompt, businessProfile)

  // Step 2: Generate — build layout using only selected components
  const systemPrompt = buildGenerationPrompt(plan.components, plan.pageStructure, {
    archetype: plan.archetype,
    businessSummary: plan.businessSummary,
    personality: plan.personality,
    pages: plan.pages,
    homeVariant: plan.homeVariant,
    businessProfile,
  })

  const pageKeys = plan.pages.map(p => p.key)
  console.log(`[Generator] Generating ${pageKeys.length} pages (${pageKeys.join(', ')}) with ${plan.components.length} components, personality: ${plan.personality}`)

  // Build a rich user message that embeds business context directly (not just in system prompt)
  const userMessage = [
    `Generate a complete multi-page website for: ${prompt}`,
    ``,
    `=== BUSINESS IDENTITY (MUST match in all generated content) ===`,
    `Business Name: ${businessProfile.businessName}`,
    `Industry: ${businessProfile.industry}`,
    `Services/Products: ${(businessProfile.keyServices || []).join(', ')}`,
    `Target Audience: ${businessProfile.targetAudience}`,
    `Value Proposition: ${businessProfile.valueProposition}`,
    `Tone: ${businessProfile.tone}`,
    ``,
    `The navbar logo MUST say "${businessProfile.businessName}".`,
    `The hero headline MUST reference ${businessProfile.industry} or ${businessProfile.businessName}.`,
    `ALL content must be specifically about ${businessProfile.businessName} (${businessProfile.industry}). Do NOT generate content about any other business or industry.`,
  ].join('\n')

  let parsed = await callLLM(
    systemPrompt,
    userMessage,
    { temperature: 0.7, quality: true }
  )

  validateAndFilterPages(parsed, plan.components, pageKeys)
  validateTheme(parsed.theme)

  // Override theme colors with user's custom colors if provided
  if (businessProfile.customColors && Array.isArray(businessProfile.customColors) && businessProfile.customColors.length > 0) {
    const userColors = businessProfile.customColors
    if (userColors[0]) parsed.theme.colors.accent = userColors[0]
    if (userColors[1]) parsed.theme.colors.background = userColors[1]
    if (userColors[2]) parsed.theme.colors.text = userColors[2]
    console.log('[Generator] Applied user custom colors:', userColors)
  }

  // Step 2b: Validate business context — retry once if LLM hallucinated wrong business
  const mismatch = validateBusinessContext(parsed, businessProfile)
  if (mismatch) {
    console.warn(`[Generator] Business context mismatch detected: ${mismatch}`)
    console.log('[Generator] Retrying generation with stronger business enforcement...')

    const retryUserMessage = [
      userMessage,
      ``,
      `CRITICAL CORRECTION: Your previous attempt generated content for the WRONG business.`,
      `Issue: ${mismatch}`,
      ``,
      `You MUST generate content ONLY for "${businessProfile.businessName}" which is a "${businessProfile.industry}" business.`,
      `The navbar logo text MUST be exactly "${businessProfile.businessName}".`,
      `The hero headline MUST mention "${businessProfile.businessName}" or "${businessProfile.industry}".`,
      `Do NOT use any other business name or industry. This is non-negotiable.`,
    ].join('\n')

    parsed = await callLLM(
      systemPrompt,
      retryUserMessage,
      { temperature: 0.5, quality: true }
    )
    validateAndFilterPages(parsed, plan.components, pageKeys)
    validateTheme(parsed.theme)
  }

  // Step 3: Enforce cross-page consistency (navbar, footer, products, contact)
  enforceConsistency(parsed)

  // Generate per-page SEO meta titles and descriptions
  assignPerPageSEO(parsed)

  // Step 3b: Auto-populate empty pages declared by planner but not generated
  autoPopulateEmptyPages(parsed, plan, businessProfile)

  // Step 3c: Auto-assign OG images from hero/first image per page
  assignOgImages(parsed)

  // Step 4: Resolve images — replace picsum.photos with real keyword-matched photos
  console.log('[Generator] Step 4: Resolving images...')
  await resolveImages(parsed, parsed.theme?.colors?.accent?.replace('#', ''), { businessName: businessProfile.businessName, industry: businessProfile.industry, location: businessProfile.location })

  // Attach plan metadata for debugging and UI
  parsed._plan = {
    archetype: plan.archetype,
    personality: plan.personality,
    heroVariant: plan.heroVariant,
    homeVariant: plan.homeVariant,
    pages: plan.pages,
    componentCount: plan.components.length,
    components: plan.components,
    businessProfile: {
      businessName: businessProfile.businessName,
      industry: businessProfile.industry,
      targetAudience: businessProfile.targetAudience,
      tone: businessProfile.tone,
      websiteGoal: businessProfile.websiteGoal,
    },
  }

  return parsed
}

export async function generateThemeOnly(prompt, currentTheme) {
  const context = currentTheme
    ? `\n\nThe current theme is:\n${JSON.stringify(currentTheme, null, 2)}\n\nUse it as reference for what to change.`
    : ''

  const parsed = await callLLM(
    THEME_ONLY_SYSTEM_PROMPT,
    `Generate a visual theme for: ${prompt}${context}`
  )

  return validateTheme(parsed.theme || parsed)
}

export async function generateLayoutOnly(prompt, currentPages) {
  // Step 0: Business Intelligence
  const businessProfile = await analyzeBusinessIntelligence(prompt)

  // Step 1: Plan
  const plan = await planSite(prompt, businessProfile)

  // Step 2: Generate layouts only (no theme)
  const systemPrompt = buildGenerationPrompt(plan.components, plan.pageStructure, {
    archetype: plan.archetype,
    businessSummary: plan.businessSummary,
    personality: plan.personality,
    pages: plan.pages,
    homeVariant: plan.homeVariant,
    businessProfile,
  })
    .replace(
      '2. **theme** — the visual design tokens (shared across all pages)',
      '(Do NOT include a theme — only pages)'
    )

  const pageKeys = plan.pages.map(p => p.key)
  const context = currentPages
    ? `\n\nThe current page structure is:\n${JSON.stringify(Object.keys(currentPages))}\nRedesign the layouts while keeping the same business context.`
    : ''

  console.log(`[Generator] Layout-only with ${plan.components.length} components, ${pageKeys.length} pages`)

  const parsed = await callLLM(
    systemPrompt,
    `Generate new page layouts for: ${prompt}${context}`,
    { temperature: 0.7, quality: true }
  )

  validateAndFilterPages(parsed, plan.components, pageKeys)

  // Enforce cross-page consistency
  enforceConsistency(parsed)

  // Resolve images if API key available
  console.log('[Generator] Layout-only: Resolving images...')
  await resolveImages(parsed, null, null)

  return parsed.pages
}

// Legacy default export for backward compatibility
export async function generateWebsite(prompt) {
  return generateFull(prompt)
}

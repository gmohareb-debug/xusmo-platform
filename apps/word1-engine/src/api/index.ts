import type { Express, Request, Response } from 'express'
import {
  generateFull,
  generateThemeOnly,
  generateLayoutOnly,
  ARCHETYPE_PRESETS,
  VISUAL_PERSONALITIES,
  PERSONALITY_TOKENS,
} from '@xusmo/engine'

export function registerApiRoutes(app: Express) {
  // ── POST /api/generate ── main generation endpoint
  app.post('/api/generate', async (req: Request, res: Response) => {
    const { prompt, mode = 'full', currentTheme, currentPages } = req.body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return res.status(400).json({ error: 'A prompt describing the website is required.' })
    }

    try {
      if (mode === 'theme-only') {
        const theme = await generateThemeOnly(prompt.trim(), currentTheme)
        return res.json({ pages: currentPages || {}, theme })
      }

      if (mode === 'layout-only') {
        const pages = await generateLayoutOnly(prompt.trim(), currentPages)
        return res.json({ pages, theme: currentTheme })
      }

      // Full generation (default)
      const result = await generateFull(prompt.trim())
      res.json(result)
    } catch (error: any) {
      console.error('Generation failed:', error.message)

      let userMessage = 'Something went wrong while generating your website. Please try again.'
      let errorCode = 'GENERATION_ERROR'
      let status = 500

      const msg = error.message || ''

      if (msg.includes('402') || msg.includes('Payment Required') || msg.includes('credit') || msg.includes('quota')) {
        userMessage = 'AI service credits have been exhausted. The API quota needs to be refilled or upgraded.'
        errorCode = 'CREDITS_EXHAUSTED'
        status = 402
      } else if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('invalid_api_key') || msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
        userMessage = 'AI service API key is invalid or expired.'
        errorCode = 'INVALID_API_KEY'
        status = 401
      } else if (msg.includes('All API keys exhausted')) {
        userMessage = 'All API keys have been exhausted. Add more keys or wait for quota reset.'
        errorCode = 'ALL_KEYS_EXHAUSTED'
        status = 402
      } else if (msg.includes('No API keys configured')) {
        userMessage = 'No API keys configured. Set GOOGLE_API_KEY or OPENROUTER_API_KEY in .env.'
        errorCode = 'NO_API_KEYS'
        status = 401
      } else if (msg.includes('429') || msg.includes('rate limit') || msg.includes('Too Many')) {
        userMessage = 'Too many requests. Please wait a moment and try again.'
        errorCode = 'RATE_LIMITED'
        status = 429
      } else if (msg.includes('timeout') || msg.includes('abort') || msg.includes('ECONNREFUSED')) {
        userMessage = 'The AI service took too long to respond. Try a simpler prompt or try again.'
        errorCode = 'TIMEOUT'
        status = 504
      } else if (msg.includes('invalid JSON') || msg.includes('missing pages')) {
        userMessage = 'The AI generated an incomplete response. Please try again.'
        errorCode = 'INVALID_RESPONSE'
      }

      res.status(status).json({
        error: userMessage,
        code: errorCode,
        detail: process.env.NODE_ENV === 'development' ? msg : undefined,
      })
    }
  })

  // ── GET /api/archetypes ── list business archetypes
  app.get('/api/archetypes', (_req: Request, res: Response) => {
    const archetypes = Object.entries(ARCHETYPE_PRESETS).map(([key, groups]: [string, any]) => ({
      key,
      groups: Array.isArray(groups) ? groups : [],
    }))
    res.json({ archetypes })
  })

  // ── GET /api/personalities ── list visual personalities
  app.get('/api/personalities', (_req: Request, res: Response) => {
    const personalities = Object.entries(VISUAL_PERSONALITIES).map(([key, label]: [string, any]) => ({
      key,
      label,
      tokens: (PERSONALITY_TOKENS as any)[key] || {},
    }))
    res.json({ personalities })
  })
}

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { registerApiRoutes } from './api/index.js'

const app = express()
const PORT = process.env.PORT || 3010

app.use(cors())
app.use(express.json({ limit: '50mb' }))

// API routes
registerApiRoutes(app)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'word1-engine', version: '0.1.0' })
})

app.listen(PORT, () => {
  console.log(`Word1 Engine running on http://localhost:${PORT}`)
  console.log(`  API:    http://localhost:${PORT}/api/generate`)
  console.log(`  Health: http://localhost:${PORT}/api/health`)
})

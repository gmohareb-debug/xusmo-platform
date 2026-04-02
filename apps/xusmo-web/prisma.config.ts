import path from 'node:path'
import { defineConfig } from 'prisma/config'

// Prisma 7 requires migrate/studio URLs in config, not in schema.prisma.
// Using `as any` because the type definitions lag behind the runtime API.
export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async url() {
      return process.env.DATABASE_URL || 'postgresql://postgres:xusmo@localhost:5434/xusmo'
    },
  },
} as any) // eslint-disable-line @typescript-eslint/no-explicit-any

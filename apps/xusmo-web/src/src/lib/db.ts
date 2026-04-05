// =============================================================================
// Prisma Client Singleton
// Prevents multiple PrismaClient instances in development (hot reload).
// Usage: import { prisma } from "@/lib/db";
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || "20", 10),
    idleTimeoutMillis: 30_000,
  },
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

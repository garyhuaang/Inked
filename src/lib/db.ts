import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient } from '@/generated/prisma/client'

/**
 * Prisma 7 requires a driver adapter. PrismaNeon talks to Neon over its
 * serverless driver, which suits short-lived Vercel function invocations
 * better than a long-held TCP pool.
 *
 * Next's dev server re-evaluates modules on every hot reload, so a plain
 * `new PrismaClient()` would open a fresh pool each time until Neon refuses
 * more connections. Cache it on globalThis outside production.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const connectionString = process.env['DATABASE_URL']
  if (!connectionString) throw new Error('DATABASE_URL is not set')

  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

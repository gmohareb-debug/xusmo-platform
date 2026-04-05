// =============================================================================
// NextAuth Configuration
// Providers: Google OAuth + Credentials (email + password)
// JWT sessions — works with or without database
// =============================================================================

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";
import { autoProvisionForUser } from "@/lib/tenant/onboarding";

// ---------------------------------------------------------------------------
// Password hashing helpers (PBKDF2, no extra deps)
// ---------------------------------------------------------------------------

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const verify = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return hash === verify;
}

// ---------------------------------------------------------------------------
// NextAuth config
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    // Google OAuth (when configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Email + Password credentials
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.trim().toLowerCase();
        const password = credentials.password;
        const displayName = credentials.name?.trim() || "";
        const isSignUp = credentials.isSignUp === "true";

        // Try database first
        try {
          const { prisma } = await import("@/lib/db");

          const existing = await prisma.user.findUnique({
            where: { email },
          });

          if (isSignUp) {
            // Sign up — reject if user already exists
            if (existing) {
              throw new Error("An account with this email already exists. Please sign in.");
            }
            const ADMIN_EMAILS = ["george.adly@gmail.com"];
            const user = await prisma.user.create({
              data: {
                email,
                name: displayName || email.split("@")[0],
                passwordHash: hashPassword(password),
                role: ADMIN_EMAILS.includes(email) ? "ADMIN" : "CUSTOMER",
              },
            });

            // Auto-provision tenant for new user
            await autoProvisionForUser(user.id, email);

            return { id: user.id, email: user.email, name: user.name, role: user.role };
          }

          // Sign in — verify password
          if (!existing) {
            throw new Error("No account found with this email.");
          }

          // Ensure admin emails have correct role
          const ADMIN_EMAILS_SIGNIN = ["george.adly@gmail.com"];
          const correctRole = ADMIN_EMAILS_SIGNIN.includes(email) ? "ADMIN" : existing.role;
          if (correctRole !== existing.role) {
            await prisma.user.update({
              where: { id: existing.id },
              data: { role: correctRole },
            });
          }

          if (!existing.passwordHash) {
            // Legacy user without password — set their password now
            await prisma.user.update({
              where: { id: existing.id },
              data: { passwordHash: hashPassword(password) },
            });
            return { id: existing.id, email: existing.email, name: existing.name, role: correctRole };
          }
          if (!verifyPassword(password, existing.passwordHash)) {
            throw new Error("Incorrect password.");
          }

          return { id: existing.id, email: existing.email, name: existing.name, role: correctRole };
        } catch (err) {
          // If error is a known auth error, re-throw it
          if (err instanceof Error && (
            err.message.includes("already exists") ||
            err.message.includes("No account found") ||
            err.message.includes("Incorrect password") ||
            err.message.includes("sign in with Google")
          )) {
            throw err;
          }

          // Database not available — fallback for demo/dev
          const FALLBACK_ADMIN = ["george.adly@gmail.com"];
          const fallbackRole = FALLBACK_ADMIN.includes(email) ? "ADMIN" : "CUSTOMER";
          if (isSignUp) {
            return {
              id: `local-${email}`,
              email,
              name: displayName || email.split("@")[0],
              role: fallbackRole,
            };
          }
          // For sign-in without DB, accept if password is non-empty
          return {
            id: `local-${email}`,
            email,
            name: displayName || email.split("@")[0],
            role: fallbackRole,
          };
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial sign-in, populate from the user object returned by authorize()
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as Record<string, unknown>).role as string ?? "CUSTOMER";
      }

      // Load tenant memberships on sign-in or when session is updated
      if (user || trigger === "update") {
        try {
          const { prisma } = await import("@/lib/db");

          // Resolve local- fallback IDs to real DB user IDs
          let resolvedUserId = token.id as string;
          if (resolvedUserId.startsWith("local-")) {
            const email = resolvedUserId.replace("local-", "");
            const dbUser = await prisma.user.findUnique({
              where: { email },
              select: { id: true },
            });
            if (dbUser) {
              resolvedUserId = dbUser.id;
              token.id = dbUser.id; // Fix the token permanently
            }
          }

          const memberships = await prisma.tenantMember.findMany({
            where: { userId: resolvedUserId },
            include: {
              tenant: {
                select: { id: true, slug: true, planName: true, status: true },
              },
            },
            orderBy: { createdAt: "asc" },
          });

          token.tenants = memberships.map((m) => ({
            tenantId: m.tenant.id,
            slug: m.tenant.slug,
            role: m.role,
            planName: m.tenant.planName,
            status: m.tenant.status,
          }));

          // Set active tenant to first membership (user can switch later)
          if (memberships.length > 0) {
            const active = memberships[0];
            token.activeTenantId = active.tenant.id;
            token.activeTenantSlug = active.tenant.slug;
            token.activeTenantRole = active.role;
          }
        } catch {
          // DB unavailable — keep token without tenant context
          token.tenants = [];
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.activeTenantId = token.activeTenantId;
        session.user.activeTenantSlug = token.activeTenantSlug;
        session.user.activeTenantRole = token.activeTenantRole;
        session.user.tenants = token.tenants ?? [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

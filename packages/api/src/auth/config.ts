import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '../db/client.js'
import * as schema from '../db/schema/index.js'
import { env } from '../env.js'

// NOTE: Session tokens are stored in plaintext in the `sessions` table.
// The session cookie IS signed (HMAC via BETTER_AUTH_SECRET), so DB tokens
// alone cannot be used to forge valid cookies — an attacker also needs the
// secret key. Hashing tokens before DB storage (SHA-256) would add a second
// layer, but Better Auth v1.x does not expose a hook that intercepts both
// createSession (write) AND findSession (read), which are both needed to
// implement transparent hashing. Track the upstream issue; revisit when
// Better Auth adds native token-hashing support.
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  socialProviders: {
    ...(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    } : {}),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    // NOTE: cookieCache embeds session data in a signed cookie for 5 minutes.
    // After changePassword() deletes all DB sessions, clients holding a cached
    // cookie retain access for up to this window before the cache expires.
    // This is a Better Auth framework limitation — no hook exists to invalidate
    // the cookie cache on session deletion. Acceptable for current threat model.
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  trustedOrigins: env.CORS_ORIGIN === '*'
    ? ['http://localhost:5173', 'http://localhost:3000']
    : env.CORS_ORIGIN.split(',').map(o => o.trim()),
})

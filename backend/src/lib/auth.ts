const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

const secret = new TextEncoder().encode(NEXTAUTH_SECRET);

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Lazy load jose module to avoid ESM/CommonJS issues
 * Using Function constructor to prevent TypeScript from converting to require()
 */
const loadJose = new Function('return import("jose")');

/**
 * Verify JWT token created by our /api/auth/token endpoint
 * This is a simple HS256 JWT, not NextAuth's encrypted JWE format
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    // Dynamic import using Function constructor to prevent TypeScript optimization
    const jose = await loadJose() as typeof import('jose');
    const { jwtVerify } = jose;

    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Helper to throw auth error in GraphQL resolvers
 */
export function requireAuth(context: { userId: string | null }): string {
  if (!context.userId) {
    throw new Error('Authentication required. Please sign in.');
  }
  return context.userId;
}

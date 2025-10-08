import { verifyJWT } from '../lib/auth';
import { prisma } from '../lib/prisma';

export interface GraphQLContext {
  prisma: typeof prisma;
  userId: string | null;
  isAuthenticated: boolean;
}

/**
 * Extract and verify JWT from Authorization header
 */
export async function createContext(req: Request): Promise<GraphQLContext> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      prisma,
      userId: null,
      isAuthenticated: false,
    };
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  try {
    const payload = await verifyJWT(token);
    return {
      prisma,
      userId: payload.sub, // User ID from JWT 'sub' claim
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return {
      prisma,
      userId: null,
      isAuthenticated: false,
    };
  }
}

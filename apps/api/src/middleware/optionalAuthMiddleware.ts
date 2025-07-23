import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY';
}

// Extend the FastifyRequest interface to include the user property
// This is already done in authMiddleware, but it's good practice
// to have it here as well in case this middleware is used alone.
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserPayload;
  }
}

export const optionalAuthMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
) => {
  const token = request.cookies?.token;

  if (!token) {
    // If no token, just continue without a user object
    return done();
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.error('[OptionalAuth] JWT_SECRET environment variable is not set');
      }
      return done();
    }

    const decoded = jwt.verify(token, jwtSecret) as UserPayload;
    request.user = decoded;
    done();
  } catch (error) {
    // If token is invalid or expired, just continue without a user object
    // Log in development and test environments, but not in production
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`[OptionalAuth] Invalid token encountered: ${errorMessage}`);
    }
    done();
  }
}; 
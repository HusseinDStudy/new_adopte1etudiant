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
  const token = request.cookies.token;

  if (!token) {
    // If no token, just continue without a user object
    return done();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    request.user = decoded;
    done();
  } catch (error) {
    // If token is invalid or expired, just continue without a user object
    // You might want to log this error
    console.warn('Invalid token encountered in optionalAuthMiddleware:', error);
    done();
  }
}; 
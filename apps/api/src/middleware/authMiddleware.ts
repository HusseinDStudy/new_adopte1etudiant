import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

interface UserPayload {
  id: string;
  email: string;
  role: 'STUDENT' | 'COMPANY';
}

// Extend the FastifyRequest interface to include the user property
declare module 'fastify' {
  interface FastifyRequest {
    user?: UserPayload;
  }
}

export const authMiddleware = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
) => {
  const token = request.cookies.token;

  if (!token) {
    return reply.code(401).send({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    request.user = decoded;
    done();
  } catch (error) {
    return reply.code(401).send({ message: 'Invalid or expired token' });
  }
}; 
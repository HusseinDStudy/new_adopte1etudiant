import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';

export const roleMiddleware = (allowedRoles: Role[]) => {
  return (request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) => {
    const userRole = request.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return reply.code(403).send({ message: 'Forbidden: Insufficient permissions' });
    }

    done();
  };
}; 
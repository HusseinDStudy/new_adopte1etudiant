import { FastifyInstance } from 'fastify';
import { listAvailableStudents } from '../controllers/studentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

async function studentRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    listAvailableStudents
  );
}

export default studentRoutes; 
import { FastifyInstance } from 'fastify';
import { listAvailableStudents } from '../controllers/studentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { Role } from '@prisma/client';

async function studentRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    listAvailableStudents as any
  );
}

export default studentRoutes; 
import { FastifyInstance } from 'fastify';
import {
  createApplication,
  getMyApplications,
  updateApplicationStatus,
} from '../controllers/applicationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

async function applicationRoutes(server: FastifyInstance) {
  server.post(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
    },
    createApplication
  );

  server.get(
    '/my-applications',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
    },
    getMyApplications
  );

  server.patch(
    '/:id/status',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    updateApplicationStatus
  );
}

export default applicationRoutes; 
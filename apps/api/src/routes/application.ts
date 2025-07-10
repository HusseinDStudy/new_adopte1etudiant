import { FastifyInstance } from 'fastify';
import {
  createApplication,
  getMyApplications,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
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
    updateApplicationStatus as any
  );

  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.STUDENT])],
    },
    deleteApplication as any
  );
}

export default applicationRoutes; 
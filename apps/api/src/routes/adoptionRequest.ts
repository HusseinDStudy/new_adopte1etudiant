import { FastifyInstance } from 'fastify';
import {
  createAdoptionRequest,
  listMyAdoptionRequests,
  updateAdoptionRequestStatus,
  listSentAdoptionRequests
} from '../controllers/adoptionRequestController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { Role } from '@prisma/client';

async function adoptionRequestRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware);

  server.post(
    '/',
    {
      preHandler: [roleMiddleware([Role.COMPANY])],
    },
    createAdoptionRequest as any
  );

  server.get(
    '/sent-requests',
    {
        preHandler: [roleMiddleware([Role.COMPANY])]
    },
    listSentAdoptionRequests
  );

  server.get(
    '/my-requests',
    {
      preHandler: [roleMiddleware([Role.STUDENT])],
    },
    listMyAdoptionRequests
  );

  server.patch(
    '/:id/status',
    {
        preHandler: [roleMiddleware([Role.STUDENT])]
    },
    updateAdoptionRequestStatus as any
  )
}

export default adoptionRequestRoutes; 
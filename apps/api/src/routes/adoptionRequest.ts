import { FastifyInstance } from 'fastify';
import {
  createAdoptionRequest,
  listMyAdoptionRequests,
  updateAdoptionRequestStatus,
  listSentAdoptionRequests
} from '../controllers/adoptionRequestController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { Role } from '@prisma/client';

async function adoptionRequestRoutes(server: FastifyInstance) {
  server.addHook('preHandler', authMiddleware);

  server.post(
    '/',
    {
      preHandler: [roleMiddleware([Role.COMPANY])],
    },
    createAdoptionRequest
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
    updateAdoptionRequestStatus
  )
}

export default adoptionRequestRoutes; 
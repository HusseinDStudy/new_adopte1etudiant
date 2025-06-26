import { FastifyInstance } from 'fastify';
import {
  listOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  listMyOffers,
  getOfferApplications,
} from '../controllers/offerController';
import { authMiddleware } from '../middleware/authMiddleware';
import { roleMiddleware } from '../middleware/roleMiddleware';
import { createOfferSchema, updateOfferSchema } from 'shared-types';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Role } from '@prisma/client';

async function offerRoutes(server: FastifyInstance) {
  // Public routes
  server.get('/', listOffers);
  server.get('/:id', getOfferById);

  // Protected routes for Companies only
  server.get(
    '/my-offers',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    listMyOffers
  );

  server.get(
    '/:id/applications',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    getOfferApplications
  );

  server.post(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: { body: zodToJsonSchema(createOfferSchema) },
    },
    createOffer
  );

  server.put(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
      schema: { body: zodToJsonSchema(updateOfferSchema) },
    },
    updateOffer
  );

  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    deleteOffer
  );
}

export default offerRoutes; 
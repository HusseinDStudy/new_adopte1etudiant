import { FastifyInstance } from 'fastify';
import {
  listOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  listMyOffers,
  getOfferApplications,
} from '../controllers/offerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
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
    getOfferApplications as any
  );

  server.post(
    '/',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: { body: zodToJsonSchema(createOfferSchema) },
    },
    createOffer as any
  );

  server.put(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: { body: zodToJsonSchema(updateOfferSchema) },
    },
    updateOffer as any
  );

  server.patch(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY]), sanitizationMiddleware],
      schema: { body: zodToJsonSchema(updateOfferSchema) },
    },
    updateOffer as any
  );

  server.delete(
    '/:id',
    {
      preHandler: [authMiddleware, roleMiddleware([Role.COMPANY])],
    },
    deleteOffer as any
  );
}

export default offerRoutes; 
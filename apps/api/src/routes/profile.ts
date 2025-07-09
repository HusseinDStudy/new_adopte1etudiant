import { FastifyInstance } from 'fastify';
import { getProfile, upsertProfile } from '../controllers/profileController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
import { studentProfileSchema, companyProfileSchema } from 'shared-types';
import { zodToJsonSchema } from 'zod-to-json-schema';

async function profileRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      preHandler: [authMiddleware],
    },
    getProfile
  );

  server.post(
    '/',
    {
      preHandler: [authMiddleware, sanitizationMiddleware],
      schema: {
        // This is tricky because the schema depends on the user's role.
        // For now, we'll skip strict validation on the POST body,
        // the controller logic will handle the data correctly.
        // A more advanced solution might involve a custom validation hook.
      },
    },
    upsertProfile as any
  );

  server.patch(
    '/',
    {
      preHandler: [authMiddleware, sanitizationMiddleware],
    },
    upsertProfile as any
  );
}

export default profileRoutes; 
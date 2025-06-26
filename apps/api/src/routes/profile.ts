import { FastifyInstance } from 'fastify';
import { getProfile, upsertProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';
import { studentProfileSchema, companyProfileSchema } from 'shared-types';
import { zodToJsonSchema } from 'zod-to-json-schema';

async function profileRoutes(server: FastifyInstance) {
  server.addHook('onRequest', authMiddleware);

  server.get('/', getProfile);

  server.post(
    '/',
    {
      schema: {
        // This is tricky because the schema depends on the user's role.
        // For now, we'll skip strict validation on the POST body,
        // the controller logic will handle the data correctly.
        // A more advanced solution might involve a custom validation hook.
      },
    },
    upsertProfile
  );
}

export default profileRoutes; 
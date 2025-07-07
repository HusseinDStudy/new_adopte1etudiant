import { FastifyInstance } from 'fastify';
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  disableTwoFactor,
} from '../controllers/twoFactorAuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const verifyBodySchema = z.object({
  token: z.string(),
});

const disableBodySchema = z.object({
  token: z.string(),
});


async function twoFactorAuthRoutes(server: FastifyInstance) {
  server.post(
    '/generate',
    {
      onRequest: [authMiddleware],
    },
    generateTwoFactorSecret
  );

  server.post(
    '/verify',
    {
      onRequest: [authMiddleware],
      schema: {
        body: zodToJsonSchema(verifyBodySchema),
      }
    },
    verifyTwoFactorToken
  );

  server.post(
    '/disable',
    {
      onRequest: [authMiddleware],
       schema: {
        body: zodToJsonSchema(disableBodySchema),
      }
    },
    disableTwoFactor
  );
}

export default twoFactorAuthRoutes; 
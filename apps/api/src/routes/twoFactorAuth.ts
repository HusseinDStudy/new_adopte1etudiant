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
      schema: {
        description: 'Generate a new 2FA secret and QR code for the user. This is the first step in setting up two-factor authentication.',
        tags: ['2FA'],
        summary: 'Generate 2FA secret',
        security: [{ cookieAuth: [] }],
        response: {
          200: {
            description: '2FA secret and QR code generated successfully',
            type: 'object',
            properties: {
              secret: { type: 'string', description: 'Base32 encoded secret for manual entry' },
              qrCodeUrl: { type: 'string', description: 'Data URL for QR code image' },
              backupCodes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Backup codes for account recovery'
              }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          409: {
            description: '2FA is already enabled for this user',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    generateTwoFactorSecret
  );

  server.post(
    '/verify',
    {
      onRequest: [authMiddleware],
      schema: {
        description: 'Verify 2FA token and enable two-factor authentication. This completes the 2FA setup process.',
        tags: ['2FA'],
        summary: 'Verify and enable 2FA',
        security: [{ cookieAuth: [] }],
        body: zodToJsonSchema(verifyBodySchema),
        response: {
          200: {
            description: '2FA enabled successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              recoveryCodes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Recovery codes for account recovery'
              }
            }
          },
          400: {
            description: 'Invalid or expired token',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          409: {
            description: '2FA is already enabled',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      }
    },
    verifyTwoFactorToken
  );

  server.post(
    '/disable',
    {
      onRequest: [authMiddleware],
      schema: {
        description: 'Disable two-factor authentication for the user. Requires a valid 2FA token to confirm.',
        tags: ['2FA'],
        summary: 'Disable 2FA',
        security: [{ cookieAuth: [] }],
        body: zodToJsonSchema(disableBodySchema),
        response: {
          200: {
            description: '2FA disabled successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              enabled: { type: 'boolean', enum: [false] }
            }
          },
          400: {
            description: 'Invalid or expired token',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          409: {
            description: '2FA is not enabled for this user',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      }
    },
    disableTwoFactor
  );
}

export default twoFactorAuthRoutes; 
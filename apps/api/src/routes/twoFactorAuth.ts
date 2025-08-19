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
              secret: { type: 'string', description: 'Base32 encoded secret for manual entry', example: 'JBSWY3DPEHPK3PXP' },
              qrCodeUrl: { type: 'string', description: 'Data URL for QR code image', example: 'otpauth://totp/Adopte1Etudiant:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Adopte1Etudiant' },
              backupCodes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Backup codes for account recovery', example: ['CODE1234', 'CODE5678', 'CODE9012']
              }
            },
            example: {
              secret: 'JBSWY3DPEHPK3PXP',
              qrCodeUrl: 'otpauth://totp/Adopte1Etudiant:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Adopte1Etudiant',
              backupCodes: ['CODE1234', 'CODE5678', 'CODE9012']
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          409: {
            description: '2FA is already enabled for this user',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Two-factor authentication is already enabled for this user' }
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
        example: { token: '123456' },
        response: {
          200: {
            description: '2FA enabled successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              recoveryCodes: {
                type: 'array',
                items: { type: 'string' },
                description: 'Recovery codes for account recovery', example: ['REC-ABCD-1234', 'REC-EFGH-5678']
              }
            },
            example: {
              message: 'Two-factor authentication enabled successfully',
              recoveryCodes: ['REC-ABCD-1234', 'REC-EFGH-5678']
            }
          },
          400: {
            description: 'Invalid or expired token',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid or expired 2FA token' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          409: {
            description: '2FA is already enabled',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Two-factor authentication is already enabled' }
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
        example: { token: '654321' },
        response: {
          200: {
            description: '2FA disabled successfully',
            type: 'object',
            properties: {
              message: { type: 'string' },
              enabled: { type: 'boolean', enum: [false] }
            },
            example: {
              message: 'Two-factor authentication disabled successfully',
              enabled: false
            }
          },
          400: {
            description: 'Invalid or expired token',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Invalid 2FA token provided' }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          409: {
            description: '2FA is not enabled for this user',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Two-factor authentication is not enabled for this user' }
          }
        }
      }
    },
    disableTwoFactor
  );
}

export default twoFactorAuthRoutes; 
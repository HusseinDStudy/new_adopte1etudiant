import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { TwoFactorAuthService } from '../services/TwoFactorAuthService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const twoFactorAuthService = new TwoFactorAuthService();

export const generateTwoFactorSecret = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const result = await twoFactorAuthService.generateTwoFactorSecret(request.user!.id);
  return reply.send(result);
});

const verifySchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export const verifyTwoFactorToken = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const validation = verifySchema.safeParse(request.body);
  if (!validation.success) {
    return reply.code(400).send({ message: 'Invalid input', errors: validation.error.flatten() });
  }
  const { token } = validation.data;

  const result = await twoFactorAuthService.verifyTwoFactorToken(request.user!.id, token);

  return reply.send({ 
    message: '2FA enabled successfully',
    recoveryCodes: result.recoveryCodes,
  });
});

const disableSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export const disableTwoFactor = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const validation = disableSchema.safeParse(request.body);
  if (!validation.success) {
    return reply.code(400).send({ message: 'Invalid input', errors: validation.error.flatten() });
  }
  const { token } = validation.data;

  await twoFactorAuthService.disableTwoFactor(request.user!.id, token);

  return reply.send({ message: '2FA disabled successfully' });
}); 
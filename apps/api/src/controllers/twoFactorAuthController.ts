import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const APP_NAME = 'AdopteUnEtudiant';

export const generateTwoFactorSecret = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: request.user!.id } });
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    if (user.isTwoFactorEnabled) {
      return reply.code(400).send({ message: '2FA is already enabled' });
    }

    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${user.email})`,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret.base32 },
    });

    try {
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);
      return reply.send({
        secret: secret.base32,
        qrCodeUrl: qrCodeUrl,
      });
    } catch (err) {
      console.error('QR code generation failed:', err);
      return reply.code(500).send({ message: 'Could not generate QR code' });
    }
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

const verifySchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export const verifyTwoFactorToken = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validation = verifySchema.safeParse(request.body);
    if (!validation.success) {
      return reply.code(400).send({ message: 'Invalid input', errors: validation.error.flatten() });
    }
    const { token } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: request.user!.id } });

    if (!user || !user.twoFactorSecret) {
      return reply.code(400).send({ message: '2FA not requested or secret not found' });
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!isVerified) {
      // Try to verify as a recovery code
      let usedCodeHash: string | null = null;
      for (const hashedCode of user.twoFactorRecoveryCodes) {
        const match = await bcrypt.compare(token, hashedCode);
        if (match) {
          isVerified = true;
          usedCodeHash = hashedCode;
          break;
        }
      }

      if (isVerified && usedCodeHash) {
        // Invalidate the used recovery code
        const updatedRecoveryCodes = user.twoFactorRecoveryCodes.filter(c => c !== usedCodeHash);
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorRecoveryCodes: updatedRecoveryCodes },
        });
      }
    }

    if (!isVerified) {
      return reply.code(400).send({ message: 'Invalid token or recovery code' });
    }

    const recoveryCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
    
    // Hash each code individually. bcrypt handles the salt.
    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map(code => bcrypt.hash(code, 10))
    );

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isTwoFactorEnabled: true,
        twoFactorRecoveryCodes: hashedRecoveryCodes,
      },
    });

    return reply.send({ 
      message: '2FA enabled successfully',
      recoveryCodes: recoveryCodes,
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

const disableSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export const disableTwoFactor = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const validation = disableSchema.safeParse(request.body);
     if (!validation.success) {
      return reply.code(400).send({ message: 'Invalid input', errors: validation.error.flatten() });
    }
    const { token } = validation.data;

    const user = await prisma.user.findUnique({ where: { id: request.user!.id } });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return reply.code(400).send({ message: '2FA is not enabled for this user' });
    }

    let isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 1,
    });

    if (!isVerified) {
      // Try to verify as a recovery code
      let usedCodeHash: string | null = null;
      for (const hashedCode of user.twoFactorRecoveryCodes) {
        const match = await bcrypt.compare(token, hashedCode);
        if (match) {
          isVerified = true;
          usedCodeHash = hashedCode;
          break;
        }
      }

      if (isVerified && usedCodeHash) {
        // Invalidate the used recovery code
        const updatedRecoveryCodes = user.twoFactorRecoveryCodes.filter(c => c !== usedCodeHash);
        await prisma.user.update({
          where: { id: user.id },
          data: { twoFactorRecoveryCodes: updatedRecoveryCodes },
        });
      }
    }

    if (!isVerified) {
      return reply.code(400).send({ message: 'Invalid token or recovery code' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
      },
    });

    return reply.send({ message: '2FA disabled successfully' });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
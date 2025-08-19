import { prisma } from 'db-postgres';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import bcrypt from 'bcryptjs';
import { ValidationError, NotFoundError } from '../errors/AppError.js';

const APP_NAME = 'Adopte1Etudiant';

export interface TwoFactorSetupResult {
  secret: string;
  qrCodeUrl: string;
}

export interface TwoFactorVerificationResult {
  success: boolean;
  recoveryCodes?: string[];
}

export class TwoFactorAuthService {
  async generateTwoFactorSecret(userId: string): Promise<TwoFactorSetupResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.isTwoFactorEnabled) {
      throw new ValidationError('2FA is already enabled');
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
      return {
        secret: secret.base32,
        qrCodeUrl: qrCodeUrl,
      };
    } catch (err) {
      console.error('QR code generation failed:', err);
      throw new Error('Could not generate QR code');
    }
  }

  async verifyTwoFactorToken(userId: string, token: string): Promise<TwoFactorVerificationResult> {
    if (token.length !== 6) {
      throw new ValidationError('Token must be 6 digits');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      throw new ValidationError('2FA not requested or secret not found');
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
      throw new ValidationError('Invalid token or recovery code');
    }

    // Generate recovery codes
    const recoveryCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
    
    // Hash each code individually. bcrypt handles the salt.
    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map(code => bcrypt.hash(code, 10))
    );

    // Enable 2FA and save recovery codes
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isTwoFactorEnabled: true,
        twoFactorRecoveryCodes: hashedRecoveryCodes,
      },
    });

    return {
      success: true,
      recoveryCodes,
    };
  }

  async disableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
      throw new ValidationError('2FA is not enabled for this user');
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
          where: { id: userId },
          data: { twoFactorRecoveryCodes: updatedRecoveryCodes },
        });
      }
    }

    if (!isVerified) {
      throw new ValidationError('Invalid token or recovery code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorRecoveryCodes: [],
      },
    });
  }

  async generateNewRecoveryCodes(userId: string, password: string): Promise<string[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isTwoFactorEnabled) {
      throw new ValidationError('2FA is not enabled');
    }

    if (!user.passwordHash) {
      throw new ValidationError('No password set for this account');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new ValidationError('Invalid password');
    }

    const recoveryCodes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
    
    const hashedRecoveryCodes = await Promise.all(
      recoveryCodes.map(code => bcrypt.hash(code, 10))
    );

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorRecoveryCodes: hashedRecoveryCodes },
    });

    return recoveryCodes;
  }
} 
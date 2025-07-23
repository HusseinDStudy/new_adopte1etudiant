import { prisma } from 'db-postgres';
import { RegisterInput, LoginInput } from 'shared-types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';

export interface AuthResult {
  success: boolean;
  message: string;
  twoFactorRequired?: boolean;
  user?: any;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthService {
  // Store invalidated JWT tokens (in production, use Redis or a proper cache)
  private invalidatedTokens = new Set<string>();

  isTokenInvalidated(token: string): boolean {
    return this.invalidatedTokens.has(token);
  }

  private invalidateToken(token: string): void {
    this.invalidatedTokens.add(token);
    // Clean up old tokens after 7 days to prevent memory leaks
    setTimeout(() => {
      this.invalidatedTokens.delete(token);
    }, 7 * 24 * 60 * 60 * 1000);
  }

  async register(data: RegisterInput & { firstName?: string; lastName?: string; name?: string; contactEmail?: string }): Promise<AuthResult> {
    const { email, password, role } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'User with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with transaction to include profile creation
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role,
          passwordLoginDisabled: false,
        },
      });

      if (role === 'STUDENT') {
        const { firstName, lastName } = data;
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            firstName: firstName!,
            lastName: lastName!,
          },
        });
      } else if (role === 'COMPANY') {
        const { name, contactEmail } = data;
        await tx.companyProfile.create({
          data: {
            userId: newUser.id,
            name: name!,
            contactEmail: contactEmail!,
          },
        });
      }
      return newUser;
    });

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash!);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid credentials',
      };
    }

    // Check if 2FA is enabled
    if (user.isTwoFactorEnabled) {
      return {
        success: true,
        message: '2FA verification required',
        twoFactorRequired: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    }

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async verifyTwoFactorLogin(userId: string, token: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return {
        success: false,
        message: 'Invalid 2FA setup',
      };
    }

    // Verify the 2FA token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow some time drift
    });

    if (!verified) {
      return {
        success: false,
        message: 'Invalid 2FA token',
      };
    }

    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  generateJWT(payload: TokenPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
  }

  generateTempJWT(payload: any): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '5m',
    });
  }

  verifyJWT(token: string): TokenPayload | null {
    try {
      if (this.isTokenInvalidated(token)) {
        return null;
      }
      return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  async logout(token: string): Promise<void> {
    this.invalidateToken(token);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash!);
    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNewPassword },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        isTwoFactorEnabled: true,
        createdAt: true,
      },
    });

    return user;
  }
}

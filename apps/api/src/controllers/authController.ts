import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { RegisterInput, LoginInput } from 'shared-types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export const isTokenInvalidated = (token: string): boolean => {
  return authService.isTokenInvalidated(token);
};

export const registerUser = async (
  request: FastifyRequest<{ Body: RegisterInput }>,
  reply: FastifyReply
) => {
  try {
    const result = await authService.register(request.body);

    if (!result.success) {
      if (result.message === 'User with this email already exists') {
        return reply.code(409).send({ message: 'User already exists' });
      }
      return reply.code(400).send({ message: result.message });
    }

    return reply.code(201).send(result.user);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const loginUser = async (
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) => {
  try {
    // Check for password login disabled first
    const user = await prisma.user.findUnique({ where: { email: request.body.email } });
    if (user?.passwordLoginDisabled) {
      return reply.code(403).send({ message: 'Password login is disabled for this account. Please use your social login provider (e.g., Google).' });
    }

    if (user && !user.passwordHash) {
      return reply.code(401).send({ message: 'This account was created with a social login. Please use that method to sign in.' });
    }

    const result = await authService.login(request.body);

    if (!result.success) {
      return reply.code(401).send({ message: result.message });
    }

    // Handle 2FA case
    if (result.twoFactorRequired) {
      const tempPayload = {
        id: result.user!.id,
        email: result.user!.email,
        '2f-in_progress': true,
      } as const;

      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET!, { expiresIn: '5m' });

      reply.setCookie('2fa_token', tempToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60,
      });

      return reply.code(200).send({ twoFactorRequired: true });
    }

    // Normal login
    const token = jwt.sign(
      { id: result.user!.id, email: result.user!.email, role: result.user!.role },
      process.env.JWT_SECRET!
    );

    return reply
      .setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
      .code(200)
      .send({ message: 'Logged in successfully' });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const verifyTwoFactorLogin = async (
  request: FastifyRequest<{ Body: { token: string } }>,
  reply: FastifyReply
) => {
  const { token: twoFactorToken } = request.body;
  const tempAuthToken = request.cookies['2fa_token'];

  if (!tempAuthToken) {
    return reply.code(401).send({ message: 'No 2FA session found. Please login again.' });
  }

  try {
    const tempPayload = authService.verifyJWT(tempAuthToken) as any;

    if (!tempPayload) {
      return reply.code(401).send({ message: '2FA session expired. Please login again.' });
    }

    if (!tempPayload['2f-in_progress']) {
      return reply.code(400).send({ message: 'Invalid 2FA session token.' });
    }

    // Handle recovery codes manually since AuthService doesn't handle them yet
    const user = await prisma.user.findUnique({ where: { id: tempPayload.id } });

    const result = await authService.verifyTwoFactorLogin(tempPayload.id, twoFactorToken);

    let isVerified = result.success;

    // If TOTP fails, check recovery codes
    if (!isVerified && user) {
      let usedCodeHash: string | null = null;
      for (const hashedCode of user.twoFactorRecoveryCodes) {
        const bcrypt = await import('bcryptjs');
        const match = await bcrypt.compare(twoFactorToken, hashedCode);
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
      return reply.code(401).send({ message: 'Invalid 2FA token or recovery code.' });
    }

    // Clear the temporary 2FA token
    reply.clearCookie('2fa_token', { path: '/' });

    // Generate final JWT
    const token = authService.generateJWT({
      id: result.user!.id,
      email: result.user!.email,
      role: result.user!.role,
    });

    reply
      .setCookie('token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      .code(200)
      .send({ message: 'Logged in successfully' });

  } catch (error) {
    reply.clearCookie('2fa_token', { path: '/' });
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export const getMe = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const user = await authService.getUserById(request.user!.id);
    if (!user) return reply.code(404).send({ message: 'User not found' });

    // Get additional account info
    const fullUser = await prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { accounts: true },
    });

    const linkedProviders = fullUser?.accounts.map((acc: any) => acc.provider) || [];

    return reply.send({
      ...user,
      hasPassword: !!fullUser?.passwordHash,
      linkedProviders,
    });
  } catch (error) {
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const logoutUser = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // Invalidate the JWT so it cannot be reused, even if not expired
  const token = request.cookies.token as string | undefined;
  if (token) {
    await authService.logout(token);
  }

  return reply
    .clearCookie('token', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })
    .code(200)
    .send({ message: 'Logged out successfully' });
};

export const deleteUserAndData = async (userId: string) => {
    // The logic is wrapped in a transaction to ensure all or nothing is deleted.
    return prisma.$transaction(async (tx) => {
        // If this user is a company, delete dependent offers first to avoid FK constraints
        const company = await tx.companyProfile.findUnique({ where: { userId } });
        if (company) {
            // Delete offers for this company; applications will cascade; adoptionRequests on offers are set to null
            await tx.offer.deleteMany({ where: { companyId: company.id } });
        }

        // Cascading deletes in the schema handle most related data. Finally, delete the user.
        await tx.user.delete({ where: { id: userId } });
    });
};

export const deleteAccount = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.id;
    const { password } = request.body as { password?: string };

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return reply.code(404).send({ message: 'User not found' });
        }

        // Handle password-based account deletion
        if (user.passwordHash) {
            if (!password) {
                return reply.code(400).send({ message: 'Password is required for deletion.' });
            }
            const isMatch = await bcrypt.compare(password, user.passwordHash);
            if (!isMatch) {
                return reply.code(401).send({ message: 'Incorrect password.' });
            }
        } else {
            // This endpoint is for password-based deletion only.
            // OAuth users must use the specific OAuth deletion flow.
            return reply.code(400).send({ message: 'This account must be deleted via the original sign-in provider.' });
        }

        await deleteUserAndData(userId);

        return reply
            .clearCookie('token', { path: '/' })
            .code(200)
            .send({ message: 'Account deleted successfully.' });

    } catch (error) {
        console.error('Account deletion error:', error);
        return reply.code(500).send({ message: 'Internal server error during account deletion.' });
    }
};

export const disablePasswordLogin = async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const userId = request.user!.id;
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { accounts: true },
      });
  
      if (!user) {
        return reply.code(404).send({ message: 'User not found' });
      }
  
      if (!user.passwordHash) {
          return reply.code(400).send({ message: 'Password login is already disabled.' });
      }
      
      if (user.accounts.length === 0) {
        return reply.code(400).send({ message: 'You must have at least one social login linked before disabling your password.' });
      }
  
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: null,
          passwordLoginDisabled: true,
        },
      });
  
      return reply.code(200).send({ message: 'Password login has been disabled.' });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  };

export const changePassword = async (
  request: FastifyRequest<{ Body: { currentPassword: string; newPassword: string } }>,
  reply: FastifyReply
) => {
  const userId = request.user!.id;
  const { currentPassword, newPassword } = request.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    if (!user.passwordHash) {
      return reply.code(400).send({ message: 'This account does not have a password set' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return reply.code(401).send({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hashed } });

    return reply.code(200).send({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
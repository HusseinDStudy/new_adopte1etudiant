import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { RegisterInput, LoginInput } from 'shared-types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Account, Prisma, PrismaClient } from '.prisma/client';
import speakeasy from 'speakeasy';

// Store invalidated JWT tokens (in production, use Redis or a proper cache)
const invalidatedTokens = new Set<string>();

export const isTokenInvalidated = (token: string): boolean => {
  return invalidatedTokens.has(token);
};

const invalidateToken = (token: string): void => {
  invalidatedTokens.add(token);
  // Clean up old tokens after 7 days to prevent memory leaks
  setTimeout(() => {
    invalidatedTokens.delete(token);
  }, 7 * 24 * 60 * 60 * 1000);
};

export const registerUser = async (
  request: FastifyRequest<{ Body: RegisterInput }>,
  reply: FastifyReply
) => {
  const { email, password, role } = request.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return reply.code(409).send({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          role,
          passwordLoginDisabled: false,
        },
      });

      if (role === 'STUDENT') {
        const { firstName, lastName } = request.body;
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            firstName,
            lastName,
          },
        });
      } else if (role === 'COMPANY') {
        const { name, contactEmail } = request.body;
        await tx.companyProfile.create({
          data: {
            userId: newUser.id,
            name,
            contactEmail,
          },
        });
      }
      return newUser;
    });

    return reply.code(201).send({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const loginUser = async (
  request: FastifyRequest<{ Body: LoginInput }>,
  reply: FastifyReply
) => {
  const { email, password } = request.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    if (user.passwordLoginDisabled) {
      return reply.code(403).send({ message: 'Password login is disabled for this account. Please use your social login provider (e.g., Google).' });
    }
    
    if (!user.passwordHash) {
      return reply.code(401).send({ message: 'This account was created with a social login. Please use that method to sign in.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    // --- 2FA Check ---
    if (user.isTwoFactorEnabled) {
      // Don't issue the final token yet.
      // Issue a temporary token that says this user is in the middle of a 2FA login.
      const tempPayload = {
        id: user.id,
        email: user.email,
        '2fa_in_progress': true,
      };
      const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET!, { expiresIn: '5m' });

      reply.setCookie('2fa_token', tempToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60, // 5 minutes
      });

      return reply.code(200).send({ twoFactorRequired: true });
    }
    // --- End 2FA Check ---

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
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
    const tempPayload = jwt.verify(tempAuthToken, process.env.JWT_SECRET!) as { id: string; '2fa_in_progress': boolean };
    
    if (!tempPayload['2fa_in_progress']) {
      return reply.code(400).send({ message: 'Invalid 2FA session token.' });
    }

    const user = await prisma.user.findUnique({ where: { id: tempPayload.id } });

    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return reply.code(400).send({ message: '2FA is not enabled for this user.' });
    }

    let isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: twoFactorToken,
      window: 1,
    });

    // If TOTP fails, check recovery codes
    if (!isVerified) {
      let usedCodeHash: string | null = null;
      for (const hashedCode of user.twoFactorRecoveryCodes) {
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

    // --- Issue final JWT ---
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
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
    if (error instanceof jwt.JsonWebTokenError) {
      return reply.code(401).send({ message: '2FA session expired. Please login again.' });
    }
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export const getMe = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: request.user!.id },
      include: { accounts: true },
    });
    if (!user) return reply.code(404).send({ message: 'User not found' });
    
    const { passwordHash, ...userData } = user;
    
    const linkedProviders = user.accounts.map((acc: Account) => acc.provider);

    return reply.send({ 
      ...userData,
      hasPassword: !!passwordHash,
      linkedProviders,
    });
  } catch (error) {
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const logoutUser = async (request: FastifyRequest, reply: FastifyReply) => {
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
        // Cascading deletes in the schema should handle related data.
        // We just need to delete the user.
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

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return reply.code(401).send({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return reply.code(400).send({ message: 'New password must be at least 8 characters long' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password in database
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate current session
    const token = request.cookies.token;
    if (token) {
      invalidateToken(token);
    }

    // Clear the current token cookie
    reply.clearCookie('token', { path: '/' });

    return reply.code(200).send({ 
      message: 'Password changed successfully. Please log in again.' 
    });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
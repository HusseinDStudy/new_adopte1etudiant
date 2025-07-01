import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { RegisterInput, LoginInput } from 'shared-types';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Account, Prisma, PrismaClient } from '.prisma/client';

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
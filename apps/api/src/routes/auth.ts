import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  deleteAccount,
  deleteUserAndData,
  disablePasswordLogin,
  verifyTwoFactorLogin,
} from '../controllers/authController.js';
import {
  extendedRegisterSchema,
  loginSchema,
  completeOauthSchema,
} from 'shared-types';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';
import oauthPlugin from '@fastify/oauth2';
import { prisma } from 'db-postgres';
import jwt from 'jsonwebtoken';

async function authRoutes(server: FastifyInstance) {
  // Google OAuth2
  server.register(oauthPlugin, {
    name: 'google',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/google',
    callbackUri: `http://localhost:${process.env.PORT || 8080}/api/auth/google/callback`,
  });

  server.register(oauthPlugin, {
    name: 'googleDelete',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID!,
        secret: process.env.GOOGLE_CLIENT_SECRET!,
      },
      auth: oauthPlugin.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/google/delete',
    callbackUri: `http://localhost:${
      process.env.PORT || 8080
    }/api/auth/google/delete-callback`,
  });

  server.get('/google/callback', { onRequest: [optionalAuthMiddleware] }, async function (request, reply) {
    // @ts-ignore
    const token = await this.google.getAccessTokenFromAuthorizationCodeFlow(request);
    
    // Fetch user profile from Google
    const googleUser = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${token.access_token}`
        }
    }).then(res => res.json());

    // If user is already logged in, link the account
    if (request.user) {
      if (request.user.email !== googleUser.email) {
        return reply.redirect('http://localhost:5173/profile?error=OAuth+email+does+not+match');
      }

      // Check if user has a password
      const userWithPassword = await prisma.user.findFirst({
        where: { id: request.user.id, passwordHash: { not: null } },
      });

      if (userWithPassword) {
        // User has a password, so they are a password-based user trying to link Google.
        // Generate a temporary token with provider info and redirect to a confirmation page.
        const linkingToken = jwt.sign(
          {
            userId: request.user.id,
            provider: 'google',
            providerAccountId: googleUser.id,
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            expiresAt: token.expires_in,
          },
          process.env.JWT_SECRET!,
          { expiresIn: '15m' }
        );
        return reply.redirect(`http://localhost:5173/link-account?token=${linkingToken}`);
      }

      // Link account directly if user has no password (they are an existing OAuth user)
      await prisma.account.upsert({
        where: { provider_providerAccountId: { provider: 'google', providerAccountId: googleUser.id } },
        update: { access_token: token.access_token, refresh_token: token.refresh_token },
        create: {
            userId: request.user.id,
            type: 'oauth',
            provider: 'google',
            providerAccountId: googleUser.id,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: token.expires_in,
        }
      });
      return reply.redirect('http://localhost:5173/profile?message=Account+linked+successfully');
    }

    // Check if user exists with this email
    const user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (user) {
        // --- 2FA Check for existing OAuth user ---
        if (user.isTwoFactorEnabled) {
            const tempPayload = { id: user.id, email: user.email, '2fa_in_progress': true };
            const tempToken = jwt.sign(tempPayload, process.env.JWT_SECRET!, { expiresIn: '5m' });

            reply.setCookie('2fa_token', tempToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 5 * 60, // 5 minutes
            });

            // Redirect to a dedicated 2FA verification page
            return reply.redirect('http://localhost:5173/verify-2fa');
        }
        // --- End 2FA Check ---

        // User exists, link account and log them in
        await prisma.account.upsert({
            where: { provider_providerAccountId: { provider: 'google', providerAccountId: googleUser.id } },
            update: { access_token: token.access_token, refresh_token: token.refresh_token },
            create: {
                userId: user.id,
                type: 'oauth',
                provider: 'google',
                providerAccountId: googleUser.id,
                access_token: token.access_token,
                refresh_token: token.refresh_token,
                expires_at: token.expires_in,
            }
        });
        
        const appToken = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!);
        return reply
            .setCookie('token', appToken, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            })
            .redirect('http://localhost:5173/profile');
    } else {
        // New user, create a temporary registration token
        const registrationToken = jwt.sign(
            {
                email: googleUser.email,
                provider: 'google',
                providerAccountId: googleUser.id,
                accessToken: token.access_token,
                refreshToken: token.refresh_token,
                expiresAt: token.expires_in
            },
            process.env.JWT_SECRET!,
            { expiresIn: '15m' }
        );
        
        return reply.redirect(`http://localhost:5173/complete-registration?token=${registrationToken}`);
    }
  });

  server.get('/google/delete-callback', { onRequest: [authMiddleware] }, async function (request, reply) {
    if (!request.user) {
      return reply.status(401).send({ message: 'You must be logged in to delete your account.' });
    }
    // @ts-ignore
    const token = await this.googleDelete.getAccessTokenFromAuthorizationCodeFlow(request);
    const googleUser = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    ).then((res) => res.json());

    if (googleUser.email !== request.user.email) {
      return reply.status(403).send({ message: 'Re-authentication failed. User mismatch.' });
    }

    await deleteUserAndData(request.user.id);

    return reply.clearCookie('token', { path: '/' }).redirect('http://localhost:5173/?message=Account deleted');
  });

  const completeLinkSchema = z.object({
    choice: z.enum(['google_only', 'keep_both']),
  });

  server.post('/complete-link', async (request, reply) => {
    try {
      const { choice } = completeLinkSchema.parse(request.body);
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }
      const linkingToken = authHeader.split(' ')[1];

      const decoded = jwt.verify(linkingToken, process.env.JWT_SECRET!) as any;

      // Ensure user exists and matches the one in the token
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return reply.status(401).send({ message: 'Invalid user in token.' });
      }

      // Link the account
      await prisma.account.upsert({
        where: { provider_providerAccountId: { provider: decoded.provider, providerAccountId: decoded.providerAccountId } },
        update: {
          access_token: decoded.accessToken,
          refresh_token: decoded.refreshToken,
          expires_at: decoded.expiresAt,
        },
        create: {
            userId: decoded.userId,
            type: 'oauth',
            provider: decoded.provider,
            providerAccountId: decoded.providerAccountId,
            access_token: decoded.accessToken,
            refresh_token: decoded.refreshToken,
            expires_at: decoded.expiresAt,
        }
      });

      if (choice === 'google_only') {
        // Remove password login
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { passwordHash: null, passwordLoginDisabled: true },
        });
      }

      return reply.send({ message: 'Account linked successfully.' });

    } catch (error) {
      server.log.error(error);
      if (error instanceof z.ZodError) {
          return reply.status(400).send(error.flatten());
      }
      if (error instanceof jwt.JsonWebTokenError) {
          return reply.status(401).send({ message: 'Invalid linking token' });
      }
      return reply.status(500).send({ message: 'Internal Server Error' });
    }
  });

  const completeRegistrationSchema = z.object({
    role: z.enum(['STUDENT', 'COMPANY']),
  });

  server.post(
    '/complete-oauth-registration',
    {
      schema: {
        body: zodToJsonSchema(completeOauthSchema, 'completeOauthSchema'),
      },
    },
    async (request, reply) => {
      try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({ message: 'Unauthorized' });
        }
        const registrationToken = authHeader.split(' ')[1];
        const decoded = jwt.verify(
          registrationToken,
          process.env.JWT_SECRET!
        ) as any;

        const { role } = request.body as any;

        const user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: decoded.email,
              role,
              passwordLoginDisabled: true,
              passwordHash: null,
              accounts: {
                create: {
                  type: 'oauth',
                  provider: decoded.provider,
                  providerAccountId: decoded.providerAccountId,
                  access_token: decoded.accessToken,
                  refresh_token: decoded.refreshToken,
                  expires_at: decoded.expiresAt,
                },
              },
            },
          });

          if (role === 'STUDENT') {
            const { firstName, lastName } = request.body as any;
            await tx.studentProfile.create({
              data: { userId: newUser.id, firstName, lastName },
            });
          } else if (role === 'COMPANY') {
            const { name, contactEmail } = request.body as any;
            await tx.companyProfile.create({
              data: { userId: newUser.id, name, contactEmail },
            });
          }
          return newUser;
        });

        const appToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          process.env.JWT_SECRET!
        );

        return reply
          .setCookie('token', appToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          })
          .send({ user });
      } catch (error) {
        server.log.error(error);
        if (error instanceof z.ZodError) {
          return reply.status(400).send(error.flatten());
        }
        if (error instanceof jwt.JsonWebTokenError) {
          return reply
            .status(401)
            .send({ message: 'Invalid registration token' });
        }
        return reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  );

  server.post(
    '/register',
    {
      schema: {
        body: zodToJsonSchema(extendedRegisterSchema, 'registerSchema'),
      },
    },
    registerUser
  );

  server.post(
    '/login',
    {
      schema: {
        body: zodToJsonSchema(loginSchema, 'loginSchema'),
      },
    },
    loginUser
  );

  server.post(
    '/login/verify-2fa',
    {
      schema: {
        body: zodToJsonSchema(z.object({ token: z.string() })),
      },
    },
    verifyTwoFactorLogin
  );

  server.post('/logout', logoutUser);

  server.get(
    '/me',
    {
      onRequest: [authMiddleware],
    },
    getMe
  );

  server.delete(
    '/account',
    {
      onRequest: [authMiddleware],
    },
    deleteAccount
  );

  server.post(
    '/disable-password',
    {
      onRequest: [authMiddleware],
    },
    disablePasswordLogin
  );
}

export default authRoutes; 
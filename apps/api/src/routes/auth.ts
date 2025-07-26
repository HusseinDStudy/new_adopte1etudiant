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
  changePassword,
} from '../controllers/authController.js';
import {
  extendedRegisterSchema,
  loginSchema,
  completeOauthSchema,
} from 'shared-types';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { optionalAuthMiddleware } from '../middleware/optionalAuthMiddleware.js';
import { authSanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
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
    callbackUri: `${process.env.API_URL}:${process.env.PORT}/auth/google/callback`,
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
    callbackUri: `${process.env.API_URL}:${process.env.PORT}/auth/google/delete-callback`,
  });

  server.get('/google/callback', {
    onRequest: [optionalAuthMiddleware],
    schema: {
      description: 'Google OAuth callback endpoint. Handles OAuth flow completion and account linking.',
      tags: ['Authentication'],
      summary: 'Google OAuth callback',
      querystring: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'OAuth authorization code' },
          state: { type: 'string', description: 'OAuth state parameter' }
        }
      },
      response: {
        302: {
          description: 'Redirect to web app with success or error',
          type: 'object',
          properties: {
            location: { type: 'string', description: 'Redirect URL' }
          }
        },
        400: {
          description: 'OAuth error',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, async function (request, reply) {
    // @ts-ignore
    const { token } = await this.google.getAccessTokenFromAuthorizationCodeFlow(request);
    
    // Fetch user profile from Google
    const googleUser = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${token.access_token}`
        }
    }).then(res => res.json());

    // If user is already logged in, link the account
    if (request.user) {
      if (request.user.email !== googleUser.email) {
        return reply.redirect(`${process.env.WEB_APP_URL}/profile?error=OAuth+email+does+not+match`);
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
        return reply.redirect(`${process.env.WEB_APP_URL}/link-account?token=${linkingToken}`);
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
      return reply.redirect(`${process.env.WEB_APP_URL}/profile?message=Account+linked+successfully`);
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
            return reply.redirect(`${process.env.WEB_APP_URL}/verify-2fa`);
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
            .redirect(`${process.env.WEB_APP_URL}/profile`);
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
        
        return reply.redirect(`${process.env.WEB_APP_URL}/complete-registration?token=${registrationToken}`);
    }
  });

  server.get('/google/delete-callback', {
    onRequest: [authMiddleware],
    schema: {
      description: 'Google OAuth callback for account deletion. Handles OAuth flow for account deletion confirmation.',
      tags: ['Authentication'],
      summary: 'Google OAuth delete callback',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'OAuth authorization code' },
          state: { type: 'string', description: 'OAuth state parameter' }
        }
      },
      response: {
        302: {
          description: 'Redirect to web app with deletion result',
          type: 'object',
          properties: {
            location: { type: 'string', description: 'Redirect URL' }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, async function (request, reply) {
    if (!request.user) {
      return reply.status(401).send({ message: 'You must be logged in to delete your account.' });
    }
    // @ts-ignore
    const { token } = await this.googleDelete.getAccessTokenFromAuthorizationCodeFlow(request);
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

    return reply.clearCookie('token', { path: '/' }).redirect(`${process.env.WEB_APP_URL}/?message=Account deleted`);
  });

  const completeLinkSchema = z.object({
    choice: z.enum(['google_only', 'keep_both']),
  });

  server.post('/complete-link', {
    schema: {
      description: 'Complete account linking process. Used to link OAuth accounts with existing accounts.',
      tags: ['Authentication'],
      summary: 'Complete account linking',

      body: {
        type: 'object',
        required: ['choice'],
        properties: {
          choice: {
            type: 'string',
            enum: ['google_only', 'keep_both'],
            description: 'User choice for account linking'
          }
        }
      },
      response: {
        200: {
          description: 'Account linking completed successfully',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        400: {
          description: 'Invalid choice or linking data',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        401: {
          description: 'Invalid or expired linking token',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, async (request, reply) => {
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
      preHandler: [authSanitizationMiddleware],
      schema: {
        description: 'Complete OAuth registration by selecting user role',
        tags: ['Authentication'],
        summary: 'Complete OAuth registration',
        body: zodToJsonSchema(completeOauthSchema, 'completeOauthSchema'),
        response: {
          200: {
            description: 'Registration completed successfully',
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  role: { type: 'string', enum: ['STUDENT', 'COMPANY'] },
                  passwordLoginDisabled: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
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
      preHandler: [authSanitizationMiddleware],
      schema: {
        description: 'Register a new user account. Use role "STUDENT" for students or "COMPANY" for companies. The request body structure changes based on the role.',
        tags: ['Authentication'],
        summary: 'Register new user',
        body: zodToJsonSchema(extendedRegisterSchema, 'registerSchema'),
        response: {
          201: {
            description: 'User successfully registered',
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['STUDENT', 'COMPANY'] },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          409: {
            description: 'User already exists',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      },
    },
    registerUser as any
  );

  server.post(
    '/login',
    {
      schema: {
        description: 'Authenticate user and create session',
        tags: ['Authentication'],
        summary: 'User login',
        body: zodToJsonSchema(loginSchema, 'loginSchema'),
        response: {
          200: {
            description: 'Login successful or 2FA required',
            type: 'object',
            properties: {
              message: { type: 'string' },
              twoFactorRequired: { type: 'boolean' }
            }
          },
          401: {
            description: 'Invalid credentials',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          403: {
            description: 'Password login disabled',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      },
    },
    loginUser
  );

  server.post(
    '/login/verify-2fa',
    {
      schema: {
        description: 'Verify two-factor authentication code',
        tags: ['Authentication'],
        summary: 'Verify 2FA code',
        body: zodToJsonSchema(z.object({ token: z.string() })),
        response: {
          200: {
            description: 'Login successful',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          400: {
            description: 'Bad request',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Unauthorized',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    verifyTwoFactorLogin
  );

  server.post('/logout', {
    schema: {
      description: 'Logout user and clear session',
      tags: ['Authentication'],
      summary: 'User logout',
      response: {
        200: {
          description: 'Logout successful',
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  }, logoutUser);

  server.get(
    '/me',
    {
      onRequest: [authMiddleware],
      schema: {
        description: 'Get current user information',
        tags: ['Authentication'],
        summary: 'Get current user',
        security: [{ cookieAuth: [] }],
        response: {
          200: {
            description: 'Current user information',
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string', format: 'email' },
              role: { type: 'string', enum: ['STUDENT', 'COMPANY'] },
              hasPassword: { type: 'boolean' },
              linkedProviders: {
                type: 'array',
                items: { type: 'string' }
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          404: {
            description: 'User not found',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          }
        }
      },
    },
    getMe
  );

  server.delete(
    '/account',
    {
      onRequest: [authMiddleware],
      schema: {
        description: 'Delete user account permanently. This action cannot be undone.',
        tags: ['Authentication'],
        summary: 'Delete account',
        security: [{ cookieAuth: [] }],
        response: {
          200: {
            description: 'Account deleted successfully',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          500: {
            description: 'Error deleting account',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    deleteAccount
  );

  server.post(
    '/disable-password',
    {
      onRequest: [authMiddleware],
      schema: {
        description: 'Disable password login for the account. User will only be able to login via OAuth.',
        tags: ['Authentication'],
        summary: 'Disable password login',
        security: [{ cookieAuth: [] }],
        response: {
          200: {
            description: 'Password login disabled successfully',
            type: 'object',
            properties: {
              message: { type: 'string' }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          400: {
            description: 'Cannot disable password login',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    disablePasswordLogin
  );

  server.patch(
    '/change-password',
    {
      onRequest: [authMiddleware],
      schema: {
        body: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 8 }
          }
        }
      }
    },
    changePassword as any
  );
}

export default authRoutes; 
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
} from '../controllers/authController';
import { registerSchema, loginSchema } from 'shared-types';
import { authMiddleware } from '../middleware/authMiddleware';

async function authRoutes(server: FastifyInstance) {
  server.post(
    '/register',
    {
      schema: {
        body: zodToJsonSchema(registerSchema, 'registerSchema'),
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

  server.post('/logout', logoutUser);

  server.get(
    '/me',
    {
      onRequest: [authMiddleware],
    },
    getMe
  );
}

export default authRoutes; 
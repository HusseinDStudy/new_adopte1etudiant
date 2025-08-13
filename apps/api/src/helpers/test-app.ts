import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import addFormats from 'ajv-formats';
import { errorHandler } from '../middleware/errorHandler.js';
import authRoutes from '../routes/auth.js';
import profileRoutes from '../routes/profile.js';
import offerRoutes from '../routes/offer.js';
import applicationRoutes from '../routes/application.js';
import messageRoutes from '../routes/message.js';
import studentRoutes from '../routes/student.js';
import adoptionRequestRoutes from '../routes/adoptionRequest.js';
import skillRoutes from '../routes/skill.js';
import companyRoutes from '../routes/company.js';
import twoFactorAuthRoutes from '../routes/twoFactorAuth.js';
import blogRoutes from '../routes/blog.js';
import adminRoutes from '../routes/admin.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { Role } from '@prisma/client';

export async function buildTestApp(): Promise<FastifyInstance> {
  const app = Fastify({
    ajv: {
      customOptions: {
        addUsedSchema: false,
        removeAdditional: false,
        useDefaults: true,
        coerceTypes: false,
        allErrors: true,
      },
      plugins: [addFormats]
    }
  });

  await app.register(cors, {
    origin: 'http://localhost:5173',
    credentials: true,
  });
  await app.register(helmet);
  await app.register(cookie);
  // Mirror production rate-limit plugin but disabled caps in tests
  await app.register(rateLimit, {
    global: true,
    max: 1000, // effectively disabled for unit tests
    timeWindow: '1 minute',
  });

  // Register global error handler
  app.setErrorHandler(errorHandler);

  // Register routes
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(profileRoutes, { prefix: '/api/profile' });
  app.register(skillRoutes, { prefix: '/api/skills' });
  app.register(studentRoutes, { prefix: '/api/students' });
  app.register(companyRoutes, { prefix: '/api/companies' });
  app.register(offerRoutes, { prefix: '/api/offers' });
  app.register(applicationRoutes, { prefix: '/api/applications' });
  app.register(messageRoutes, { prefix: '/api/messages' });
  app.register(adoptionRequestRoutes, { prefix: '/api/adoption-requests' });
  app.register(twoFactorAuthRoutes, { prefix: '/api/2fa' });
  app.register(blogRoutes, { prefix: '/api/blog' });
  app.register(adminRoutes, { prefix: '/api/admin' });

  // Health endpoint (simple for tests)
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' }));

  // Metrics endpoint (admin only) to mirror production
  app.get('/metrics', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Runtime metrics (admin only)',
      tags: ['System'],
      summary: 'Metrics',
    }
  }, async () => {
    const mem = process.memoryUsage();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        external: mem.external
      }
    };
  });

  await app.ready();

  return app;
} 
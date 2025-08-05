import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import addFormats from 'ajv-formats';
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

  await app.ready();

  return app;
} 
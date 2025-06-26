import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import offerRoutes from './routes/offer';
import applicationRoutes from './routes/application';
import messageRoutes from './routes/message';
import studentRoutes from './routes/student';
import adoptionRequestRoutes from './routes/adoptionRequest';

const server = Fastify({
  logger: true,
});

// Register plugins
server.register(cors, { origin: process.env.WEB_APP_URL || 'http://localhost:5173', credentials: true });
server.register(helmet);
server.register(cookie);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Register API routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(profileRoutes, { prefix: '/api/profiles' });
server.register(offerRoutes, { prefix: '/api/offers' });
server.register(applicationRoutes, { prefix: '/api/applications' });
server.register(messageRoutes, { prefix: '/api/applications' });
server.register(studentRoutes, { prefix: '/api/students' });
server.register(adoptionRequestRoutes, { prefix: '/api/adoption-requests' });
// TODO: Register API routes from adapters layer
// server.register(applicationRoutes, { prefix: '/api/applications' });
// server.register(messageRoutes, { prefix: '/api/messages' });

const start = async () => {
  try {
    await server.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 
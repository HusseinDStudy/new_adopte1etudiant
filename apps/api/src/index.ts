import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { swaggerConfig, swaggerUiConfig } from './config/swagger.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import offerRoutes from './routes/offer.js';
import applicationRoutes from './routes/application.js';
import messageRoutes from './routes/message.js';
import studentRoutes from './routes/student.js';
import adoptionRequestRoutes from './routes/adoptionRequest.js';
import skillRoutes from './routes/skill.js';
import companyRoutes from './routes/company.js';
import twoFactorAuthRoutes from './routes/twoFactorAuth.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';
import { prisma } from 'db-postgres';

const server = Fastify({
  logger: true,
});

// Register Swagger documentation
server.register(swagger, swaggerConfig);
server.register(swaggerUi, swaggerUiConfig);

// Register plugins
const allowedOrigins = [
  process.env.WEB_APP_URL,
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean) as string[];

server.register(cors, {
  origin: allowedOrigins,
  credentials: true
});
server.register(helmet, { xssFilter: false }); // Disable XSS filter to prevent HTML encoding
server.register(cookie);

// Health check route with database connectivity test
server.get('/health', {
  schema: {
    description: 'Health check endpoint to verify API and database connectivity',
    tags: ['System'],
    summary: 'Health check',
    response: {
      200: {
        description: 'Service is healthy',
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok'] },
          timestamp: { type: 'string', format: 'date-time' },
          database: { type: 'string', enum: ['connected'] },
          uptime: { type: 'number', description: 'Server uptime in seconds' }
        }
      },
      503: {
        description: 'Service is unhealthy',
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error'] },
          timestamp: { type: 'string', format: 'date-time' },
          database: { type: 'string', enum: ['disconnected'] },
          error: { type: 'string', description: 'Error details' }
        }
      }
    }
  }
}, async (request, reply) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString(), database: 'connected' };
  } catch (error) {
    // Return unhealthy status if database is not accessible
    server.log.error('Health check failed:', error);
    return reply.code(503).send({ 
      status: 'error', 
      timestamp: new Date().toISOString(), 
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add a startup log for debugging
console.log('Starting Adopte1Etudiant API Server...');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT || 8080,
  DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
});

// Register API routes
server.register(authRoutes, { prefix: '/api/auth' });
server.register(profileRoutes, { prefix: '/api/profile' });
server.register(skillRoutes, { prefix: '/api/skills' });
server.register(studentRoutes, { prefix: '/api/students' });
server.register(companyRoutes, { prefix: '/api/companies' });
server.register(offerRoutes, { prefix: '/api/offers' });
server.register(applicationRoutes, { prefix: '/api/applications' });
server.register(messageRoutes, { prefix: '/api/messages' });
server.register(adoptionRequestRoutes, { prefix: '/api/adoption-requests' });
server.register(twoFactorAuthRoutes, { prefix: '/api/2fa' });
server.register(blogRoutes, { prefix: '/api/blog' });
server.register(adminRoutes, { prefix: '/api/admin' });

// Database connection test with retry logic
const connectToDatabase = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔌 Attempting database connection (${i + 1}/${retries})...`);
      console.log(`🔍 Database URL: ${process.env.DATABASE_URL ? 'SET' : 'NOT SET'}`);
      await prisma.$connect();
      console.log('✅ Database connection successful!');
      return;
    } catch (error) {
      console.log(`❌ Database connection failed (attempt ${i + 1}/${retries}):`, error instanceof Error ? error.message : String(error));
      if (i === retries - 1) {
        console.log('💥 All database connection attempts failed. Exiting...');
        console.log('🔍 Final error details:', error);
        throw error;
      }
      console.log(`⏳ Waiting ${delay/1000} seconds before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await server.close();
  await prisma.$disconnect();
  process.exit(0);
});

const start = async () => {
  try {
    // First, connect to the database
    await connectToDatabase();
    
    // Then start the server
    console.log('🚀 Starting Fastify server...');
    await server.listen({ port: 8080, host: '0.0.0.0' });
    console.log('✅ Server started successfully on port 8080');
    console.log('🔍 Health check endpoint available at: http://localhost:8080/health');
    
    // Test health check endpoint immediately
    setTimeout(async () => {
      try {
        console.log('🔍 Testing health check endpoint...');
        await prisma.$queryRaw`SELECT 1`;
        console.log('✅ Health check test passed');
      } catch (error) {
        console.log('❌ Health check test failed:', error);
      }
    }, 5000);
  } catch (err) {
    server.log.error('💥 Server startup failed:', err);
    console.error('💥 Detailed startup error:', err);
    process.exit(1);
  }
};

start(); 
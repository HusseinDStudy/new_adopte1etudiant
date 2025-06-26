import { FastifyInstance } from 'fastify';
import {
  getMessagesForApplication,
  createMessage,
} from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

async function messageRoutes(server: FastifyInstance) {
  // All message routes require authentication
  server.addHook('preHandler', authMiddleware);

  server.get(
    '/:applicationId/messages',
    getMessagesForApplication
  );

  server.post(
    '/:applicationId/messages',
    createMessage
  );
}

export default messageRoutes; 
import { FastifyInstance } from 'fastify';
import {
  getMyConversations,
  getMessagesForConversation,
  createMessageInConversation,
} from '../controllers/messageController';
import { authMiddleware } from '../middleware/authMiddleware';

async function messageRoutes(server: FastifyInstance) {
  // All message routes require authentication
  server.addHook('preHandler', authMiddleware);

  server.get('/conversations', getMyConversations);

  server.get(
    '/conversations/:conversationId/messages',
    getMessagesForConversation
  );

  server.post(
    '/conversations/:conversationId/messages',
    createMessageInConversation
  );
}

export default messageRoutes; 
import { FastifyInstance } from 'fastify';
import {
  getMyConversations,
  getMessagesForConversation,
  createMessageInConversation,
} from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';

async function messageRoutes(server: FastifyInstance) {
  // All message routes require authentication
  server.addHook('preHandler', authMiddleware);

  server.get('/conversations', getMyConversations);

  server.get(
    '/conversations/:conversationId/messages',
    getMessagesForConversation as any
  );

  server.post(
    '/conversations/:conversationId/messages',
    {
      preHandler: [sanitizationMiddleware],
    },
    createMessageInConversation as any
  );
}

export default messageRoutes; 
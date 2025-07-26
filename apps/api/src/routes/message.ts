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

  server.get('/conversations', {
    schema: {
      description: 'Get all conversations for the current user',
      tags: ['Messages'],
      summary: 'Get my conversations',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          description: 'List of user conversations',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              topic: { type: 'string' },
              lastMessage: {
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      content: { type: 'string' },
                      senderId: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  {
                    type: 'string'
                  }
                ]
              },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getMyConversations);

  server.get(
    '/conversations/:conversationId/messages',
    {
      schema: {
        description: 'Get all messages in a specific conversation',
        tags: ['Messages'],
        summary: 'Get conversation messages',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            conversationId: { type: 'string', description: 'Conversation ID' }
          },
          required: ['conversationId']
        },
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
            before: { type: 'string', description: 'Get messages before this message ID (for pagination)' }
          }
        },
        response: {
          200: {
            description: 'List of messages in conversation',
            type: 'object',
            properties: {
              messages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    content: { type: 'string' },
                    senderId: { type: 'string' },
                    sender: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['STUDENT', 'COMPANY'] }
                      }
                    },
                    conversationId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' }
                  }
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  hasMore: { type: 'boolean' }
                }
              },
              adoptionRequestStatus: {
                type: ['string', 'null'],
                enum: ['PENDING', 'ACCEPTED', 'REJECTED', null],
                description: 'Status of the adoption request associated with this conversation, if any'
              }
            }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Access denied - Not a participant in this conversation',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Conversation not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      }
    },
    getMessagesForConversation as any
  );

  server.post(
    '/conversations/:conversationId/messages',
    {
      preHandler: [sanitizationMiddleware],
      schema: {
        description: 'Send a new message in a conversation',
        tags: ['Messages'],
        summary: 'Send message',
        security: [{ cookieAuth: [] }],
        params: {
          type: 'object',
          properties: {
            conversationId: { type: 'string', description: 'Conversation ID' }
          },
          required: ['conversationId']
        },
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              description: 'Message content'
            }
          }
        },
        response: {
          201: {
            description: 'Message sent successfully',
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              senderId: { type: 'string' },
              conversationId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' }
            }
          },
          400: {
            description: 'Invalid input data',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          403: {
            description: 'Access denied - Not a participant in this conversation',
            type: 'object',
            properties: { message: { type: 'string' } }
          },
          404: {
            description: 'Conversation not found',
            type: 'object',
            properties: { message: { type: 'string' } }
          }
        }
      },
    },
    createMessageInConversation as any
  );
}

export default messageRoutes; 
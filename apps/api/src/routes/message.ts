import { FastifyInstance } from 'fastify';
import {
  getMyConversations,
  getBroadcastConversations,
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
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          context: { type: 'string', enum: ['ADOPTION_REQUEST', 'OFFER', 'ADMIN_MESSAGE', 'BROADCAST'] },
          status: { type: 'string', enum: ['ACTIVE', 'PENDING_APPROVAL', 'ARCHIVED', 'EXPIRED'] }
        }
      },
      response: {
        200: {
          description: 'List of user conversations with pagination',
          type: 'object',
          properties: {
            conversations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  topic: { type: ['string', 'null'] },
                  isReadOnly: { type: 'boolean' },
                  isBroadcast: { type: 'boolean' },
                  broadcastTarget: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null] },
                  context: { type: ['string', 'null'] },
                  status: { type: ['string', 'null'] },
                  expiresAt: { type: ['string', 'null'], format: 'date-time' },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' },
                            studentProfile: {
                              type: 'object',
                              properties: {
                                firstName: { type: 'string' },
                                lastName: { type: 'string' }
                              }
                            },
                            companyProfile: {
                              type: ['object', 'null'],
                              properties: {
                                name: { type: 'string' }
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  lastMessage: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          content: { type: 'string' },
                          senderId: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          sender: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              email: { type: 'string' },
                              role: { type: 'string' }
                            }
                          }
                        }
                      },
                      { type: 'null' }
                    ]
                  },
                  updatedAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  contextDetails: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          type: { type: 'string' },
                          status: { type: ['string', 'null'] },
                          companyName: { type: ['string', 'null'] },
                          offerTitle: { type: ['string', 'null'] },
                          initialMessage: { type: ['string', 'null'] }
                        }
                      },
                      { type: 'null' }
                    ]
                  }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    },
    handler: getMyConversations
  });

  server.get('/broadcasts', {
    schema: {
      description: 'Get broadcast conversations for the current user',
      tags: ['Messages'],
      summary: 'Get broadcast conversations',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      },
      response: {
        200: {
          description: 'List of broadcast conversations with pagination',
          type: 'object',
          properties: {
            conversations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  topic: { type: ['string', 'null'] },
                  isReadOnly: { type: 'boolean' },
                  isBroadcast: { type: 'boolean' },
                  broadcastTarget: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null] },
                  context: { type: ['string', 'null'] },
                  status: { type: ['string', 'null'] },
                  expiresAt: { type: ['string', 'null'], format: 'date-time' },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        userId: { type: 'string' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            email: { type: 'string' },
                            role: { type: 'string' }
                          }
                        }
                      }
                    }
                  },
                  lastMessage: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          content: { type: 'string' },
                          senderId: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                          sender: {
                            type: 'object',
                            properties: {
                              id: { type: 'string' },
                              email: { type: 'string' },
                              role: { type: 'string' }
                            }
                          }
                        }
                      },
                      { type: 'null' }
                    ]
                  },
                  updatedAt: { type: 'string', format: 'date-time' },
                  createdAt: { type: 'string', format: 'date-time' },
                  contextDetails: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      target: { type: ['string', 'null'] }
                    }
                  }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' }
              }
            }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    },
    handler: getBroadcastConversations
  });

  server.get('/conversations/:conversationId', {
    schema: {
      description: 'Get conversation details and messages. This endpoint provides both the conversation metadata and a paginated list of its messages.',
      tags: ['Messages'],
      summary: 'Get conversation with messages',
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
          before: { type: 'string', description: 'Get messages before this message ID (for older messages pagination)' }
        }
      },
      response: {
        200: {
          description: 'Conversation details with messages',
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
                      role: { type: 'string', enum: ['STUDENT', 'COMPANY', 'ADMIN'] }
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
                totalPages: { type: 'integer' },
                hasMore: { type: 'boolean' }
              }
            },
            conversation: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                topic: { type: ['string', 'null'] },
                isReadOnly: { type: 'boolean' },
                isBroadcast: { type: 'boolean' },
                broadcastTarget: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null] },
                context: { type: ['string', 'null'] },
                status: { type: ['string', 'null'] },
                expiresAt: { type: ['string', 'null'], format: 'date-time' },
                participants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      userId: { type: 'string' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          email: { type: 'string', format: 'email' },
                          role: { type: 'string', enum: ['STUDENT', 'COMPANY', 'ADMIN'] },
                          studentProfile: {
                            type: ['object', 'null'],
                            properties: {
                              firstName: { type: 'string' },
                              lastName: { type: 'string' }
                            }
                          },
                          companyProfile: {
                            type: ['object', 'null'],
                            properties: {
                              name: { type: 'string' }
                            }
                          }
                        }
                      }
                    }
                  }
                },
                adoptionRequestStatus: { type: ['string', 'null'], enum: ['PENDING', 'ACCEPTED', 'REJECTED', null] },
                applicationStatus: { type: ['string', 'null'], enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED', null] },
                  contextDetails: {
                  type: ['object', 'null'],
                  properties: {
                    type: { type: 'string' },
                    status: { type: 'string' },
                    companyName: { type: ['string', 'null'] },
                    initialMessage: { type: 'string' },
                    offerTitle: { type: 'string' },
                    target: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null] }
                }
              }
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
    handler: getMessagesForConversation
  });

  server.post('/conversations/:conversationId', {
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
            createdAt: { type: 'string', format: 'date-time' },
            sender: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string' }
              }
            }
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
          description: 'Access denied - Not a participant in this conversation or conversation is read-only',
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
    handler: createMessageInConversation
  });
}

export default messageRoutes; 
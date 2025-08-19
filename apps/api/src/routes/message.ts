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
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, example: 10 },
          context: { type: 'string', enum: ['ADOPTION_REQUEST', 'OFFER', 'ADMIN_MESSAGE', 'BROADCAST'], example: 'OFFER' },
          status: { type: 'string', enum: ['ACTIVE', 'PENDING_APPROVAL', 'ARCHIVED', 'EXPIRED'], example: 'ACTIVE' }
        },
        example: {
          page: 1,
          limit: 10,
          context: 'OFFER',
          status: 'ACTIVE'
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
                  id: { type: 'string', example: 'clp_conv_id_1' },
                  topic: { type: ['string', 'null'], example: 'Discussion about Frontend Internship' },
                  isReadOnly: { type: 'boolean', example: false },
                  isBroadcast: { type: 'boolean', example: false },
                  broadcastTarget: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null], example: null },
                  context: { type: ['string', 'null'], example: 'OFFER' },
                  status: { type: ['string', 'null'], example: 'ACTIVE' },
                  expiresAt: { type: ['string', 'null'], format: 'date-time', example: '2024-04-01T10:00:00Z' },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp_participant_id_1' },
                        userId: { type: 'string', example: 'clp_user_id_1' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'clp_user_id_1' },
                            email: { type: 'string', example: 'user1@example.com' },
                            role: { type: 'string', example: 'STUDENT' },
                            studentProfile: {
                              type: 'object',
                              properties: {
                                firstName: { type: 'string', example: 'Alice' },
                                lastName: { type: 'string', example: 'Smith' }
                              },
                              example: { firstName: 'Alice', lastName: 'Smith' }
                            },
                            companyProfile: {
                              type: ['object', 'null'],
                              properties: {
                                name: { type: 'string', example: 'TechCorp' }
                              },
                              example: null
                            }
                          },
                          example: {
                            id: 'clp_user_id_1',
                            email: 'user1@example.com',
                            role: 'STUDENT',
                            studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                            companyProfile: null
                          }
                        }
                      },
                      example: {
                        id: 'clp_participant_id_1',
                        userId: 'clp_user_id_1',
                        user: {
                          id: 'clp_user_id_1',
                          email: 'user1@example.com',
                          role: 'STUDENT',
                          studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                          companyProfile: null
                        }
                      }
                    },
                    example: [
                      {
                        id: 'clp_participant_id_1',
                        userId: 'clp_user_id_1',
                        user: {
                          id: 'clp_user_id_1',
                          email: 'user1@example.com',
                          role: 'STUDENT',
                          studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                          companyProfile: null
                        }
                      },
                      {
                        id: 'clp_participant_id_2',
                        userId: 'clp_user_id_2',
                        user: {
                          id: 'clp_user_id_2',
                          email: 'company@example.com',
                          role: 'COMPANY',
                          studentProfile: null,
                          companyProfile: { name: 'InnovateCorp' }
                        }
                      }
                    ]
                  },
                  lastMessage: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'clp_msg_id_1' },
                          content: { type: 'string', example: 'Hello, I am interested in your offer.' },
                          senderId: { type: 'string', example: 'clp_user_id_1' },
                          createdAt: { type: 'string', format: 'date-time', example: '2024-03-20T10:00:00Z' },
                          sender: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'clp_user_id_1' },
                              email: { type: 'string', example: 'user1@example.com' },
                              role: { type: 'string', example: 'STUDENT' }
                            },
                            example: { id: 'clp_user_id_1', email: 'user1@example.com', role: 'STUDENT' }
                          }
                        },
                        example: {
                          id: 'clp_msg_id_1',
                          content: 'Hello, I am interested in your offer.',
                          senderId: 'clp_user_id_1',
                          createdAt: '2024-03-20T10:00:00Z',
                          sender: { id: 'clp_user_id_1', email: 'user1@example.com', role: 'STUDENT' }
                        }
                      },
                      { type: 'null' }
                    ]
                  },
                  updatedAt: { type: 'string', format: 'date-time', example: '2024-03-20T10:05:00Z' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-03-20T09:55:00Z' },
                  contextDetails: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          type: { type: 'string', example: 'OFFER' },
                          status: { type: ['string', 'null'], example: 'ACTIVE' },
                          companyName: { type: ['string', 'null'], example: 'InnovateCorp' },
                          offerTitle: { type: ['string', 'null'], example: 'Frontend Developer Internship' },
                          initialMessage: { type: ['string', 'null'], example: 'We are interested in your profile for this internship.' }
                        },
                        example: {
                          type: 'OFFER',
                          status: 'ACTIVE',
                          companyName: 'InnovateCorp',
                          offerTitle: 'Frontend Developer Internship',
                          initialMessage: 'We are interested in your profile for this internship.'
                        }
                      },
                      { type: 'null' }
                    ]
                  }
                },
                example: {
                  id: 'clp_conv_id_1',
                  topic: 'Discussion about Frontend Internship',
                  isReadOnly: false,
                  isBroadcast: false,
                  broadcastTarget: null,
                  context: 'OFFER',
                  status: 'ACTIVE',
                  expiresAt: '2024-04-01T10:00:00Z',
                  participants: [
                    {
                      id: 'clp_participant_id_1',
                      userId: 'clp_user_id_1',
                      user: {
                        id: 'clp_user_id_1',
                        email: 'user1@example.com',
                        role: 'STUDENT',
                        studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                        companyProfile: null
                      }
                    },
                    {
                      id: 'clp_participant_id_2',
                      userId: 'clp_user_id_2',
                      user: {
                        id: 'clp_user_id_2',
                        email: 'company@example.com',
                        role: 'COMPANY',
                        studentProfile: null,
                        companyProfile: { name: 'InnovateCorp' }
                      }
                    }
                  ],
                  lastMessage: {
                    id: 'clp_msg_id_1',
                    content: 'Hello, I am interested in your offer.',
                    senderId: 'clp_user_id_1',
                    createdAt: '2024-03-20T10:00:00Z',
                    sender: { id: 'clp_user_id_1', email: 'user1@example.com', role: 'STUDENT' }
                  },
                  updatedAt: '2024-03-20T10:05:00Z',
                  createdAt: '2024-03-20T09:55:00Z',
                  contextDetails: {
                    type: 'OFFER',
                    status: 'ACTIVE',
                    companyName: 'InnovateCorp',
                    offerTitle: 'Frontend Developer Internship',
                    initialMessage: 'We are interested in your profile for this internship.'
                  }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 25 },
                totalPages: { type: 'integer', example: 3 }
              },
              example: {
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3
              }
            }
          },
          example: {
            conversations: [
              {
                id: 'clp_conv_id_1',
                topic: 'Discussion about Frontend Internship',
                isReadOnly: false,
                isBroadcast: false,
                broadcastTarget: null,
                context: 'OFFER',
                status: 'ACTIVE',
                expiresAt: '2024-04-01T10:00:00Z',
                participants: [
                  {
                    id: 'clp_participant_id_1',
                    userId: 'clp_user_id_1',
                    user: {
                      id: 'clp_user_id_1',
                      email: 'user1@example.com',
                      role: 'STUDENT',
                      studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                      companyProfile: null
                    }
                  },
                  {
                    id: 'clp_participant_id_2',
                    userId: 'clp_user_id_2',
                    user: {
                      id: 'clp_user_id_2',
                      email: 'company@example.com',
                      role: 'COMPANY',
                      studentProfile: null,
                      companyProfile: { name: 'InnovateCorp' }
                    }
                  }
                ],
                lastMessage: {
                  id: 'clp_msg_id_1',
                  content: 'Hello, I am interested in your offer.',
                  senderId: 'clp_user_id_1',
                  createdAt: '2024-03-20T10:00:00Z',
                  sender: { id: 'clp_user_id_1', email: 'user1@example.com', role: 'STUDENT' }
                },
                updatedAt: '2024-03-20T10:05:00Z',
                createdAt: '2024-03-20T09:55:00Z',
                contextDetails: {
                  type: 'OFFER',
                  status: 'ACTIVE',
                  companyName: 'InnovateCorp',
                  offerTitle: 'Frontend Developer Internship',
                  initialMessage: 'We are interested in your profile for this internship.'
                }
              }
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 25,
              totalPages: 3
            }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'An unexpected error occurred' }
        }
      }
    }
  }, getMyConversations);

  server.get('/broadcasts', {
    schema: {
      description: 'Get broadcast conversations for the current user',
      tags: ['Messages'],
      summary: 'Get broadcast conversations',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20, example: 10 }
        },
        example: {
          page: 1,
          limit: 10
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
                  id: { type: 'string', example: 'clp_broadcast_conv_id_1' },
                  topic: { type: ['string', 'null'], example: 'Important Announcement' },
                  isReadOnly: { type: 'boolean', example: true },
                  isBroadcast: { type: 'boolean', example: true },
                  broadcastTarget: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null], example: 'STUDENTS' },
                  context: { type: ['string', 'null'], example: 'ADMIN_MESSAGE' },
                  status: { type: ['string', 'null'], example: 'ACTIVE' },
                  expiresAt: { type: ['string', 'null'], format: 'date-time', example: '2024-04-15T12:00:00Z' },
                  participants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', example: 'clp_b_participant_id_1' },
                        userId: { type: 'string', example: 'clp_b_user_id_1' },
                        user: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', example: 'clp_b_user_id_1' },
                            email: { type: 'string', example: 'admin@example.com' },
                            role: { type: 'string', example: 'ADMIN' }
                          },
                          example: { id: 'clp_b_user_id_1', email: 'admin@example.com', role: 'ADMIN' }
                        }
                      },
                      example: {
                        id: 'clp_b_participant_id_1',
                        userId: 'clp_b_user_id_1',
                        user: { id: 'clp_b_user_id_1', email: 'admin@example.com', role: 'ADMIN' }
                      }
                    },
                    example: [
                      {
                        id: 'clp_b_participant_id_1',
                        userId: 'clp_b_user_id_1',
                        user: {
                          id: 'clp_b_user_id_1',
                          email: 'admin@example.com',
                          role: 'ADMIN'
                        }
                      }
                    ]
                  },
                  lastMessage: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'clp_b_msg_id_1' },
                          content: { type: 'string', example: 'Welcome all new students to the platform!' },
                          senderId: { type: 'string', example: 'clp_b_user_id_1' },
                          createdAt: { type: 'string', format: 'date-time', example: '2024-03-25T09:00:00Z' },
                          sender: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', example: 'clp_b_user_id_1' },
                              email: { type: 'string', example: 'admin@example.com' },
                              role: { type: 'string', example: 'ADMIN' }
                            },
                            example: { id: 'clp_b_user_id_1', email: 'admin@example.com', role: 'ADMIN' }
                          }
                        },
                        example: {
                          id: 'clp_b_msg_id_1',
                          content: 'Welcome all new students to the platform!',
                          senderId: 'clp_b_user_id_1',
                          createdAt: '2024-03-25T09:00:00Z',
                          sender: { id: 'clp_b_user_id_1', email: 'admin@example.com', role: 'ADMIN' }
                        }
                      },
                      { type: 'null' }
                    ]
                  },
                  updatedAt: { type: 'string', format: 'date-time', example: '2024-03-25T09:00:00Z' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-03-25T09:00:00Z' },
                  contextDetails: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', example: 'ADMIN_MESSAGE' },
                      target: { type: ['string', 'null'], example: 'STUDENTS' }
                    },
                    example: {
                      type: 'ADMIN_MESSAGE',
                      target: 'STUDENTS'
                    }
                  }
                },
                example: {
                  id: 'clp_broadcast_conv_id_1',
                  topic: 'Important Announcement',
                  isReadOnly: true,
                  isBroadcast: true,
                  broadcastTarget: 'STUDENTS',
                  context: 'ADMIN_MESSAGE',
                  status: 'ACTIVE',
                  expiresAt: '2024-04-15T12:00:00Z',
                  participants: [
                    {
                      id: 'clp_b_participant_id_1',
                      userId: 'clp_b_user_id_1',
                      user: {
                        id: 'clp_b_user_id_1',
                        email: 'admin@example.com',
                        role: 'ADMIN'
                      }
                    }
                  ],
                  lastMessage: {
                    id: 'clp_b_msg_id_1',
                    content: 'Welcome all new students to the platform!',
                    senderId: 'clp_b_user_id_1',
                    createdAt: '2024-03-25T09:00:00Z',
                    sender: { id: 'clp_b_user_id_1', email: 'admin@example.com', role: 'ADMIN' }
                  },
                  updatedAt: '2024-03-25T09:00:00Z',
                  createdAt: '2024-03-25T09:00:00Z',
                  contextDetails: {
                    type: 'ADMIN_MESSAGE',
                    target: 'STUDENTS'
                  }
                }
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                total: { type: 'integer', example: 1 },
                totalPages: { type: 'integer', example: 1 }
              },
              example: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1
              }
            }
          },
          example: {
            conversations: [
              {
                id: 'clp_broadcast_conv_id_1',
                topic: 'Important Announcement',
                isReadOnly: true,
                isBroadcast: true,
                broadcastTarget: 'STUDENTS',
                context: 'ADMIN_MESSAGE',
                status: 'ACTIVE',
                expiresAt: '2024-04-15T12:00:00Z',
                participants: [
                  {
                    id: 'clp_b_participant_id_1',
                    userId: 'clp_b_user_id_1',
                    user: {
                      id: 'clp_b_user_id_1',
                      email: 'admin@example.com',
                      role: 'ADMIN'
                    }
                  }
                ],
                lastMessage: {
                  id: 'clp_b_msg_id_1',
                  content: 'Welcome all new students to the platform!',
                  senderId: 'clp_b_user_id_1',
                  createdAt: '2024-03-25T09:00:00Z',
                  sender: { id: 'clp_b_user_id_1', email: 'admin@example.com', role: 'ADMIN' }
                },
                updatedAt: '2024-03-25T09:00:00Z',
                createdAt: '2024-03-25T09:00:00Z',
                contextDetails: {
                  type: 'ADMIN_MESSAGE',
                  target: 'STUDENTS'
                }
              }
            ],
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1
            }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'An unexpected error occurred' }
        }
      }
    }
  }, getBroadcastConversations);

  server.get('/conversations/:conversationId', {
    schema: {
      description: 'Get conversation details and messages. This endpoint provides both the conversation metadata and a paginated list of its messages.',
      tags: ['Messages'],
      summary: 'Get conversation with messages',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          conversationId: { type: 'string', description: 'Conversation ID', example: 'clp_conv_id_to_retrieve' }
        },
        required: ['conversationId'],
        example: { conversationId: 'clp_conv_id_to_retrieve' }
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1, example: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50, example: 20 },
          before: { type: 'string', description: 'Get messages before this message ID (for older messages pagination)', example: 'clp_last_message_id' }
        },
        example: {
          page: 1,
          limit: 20,
          before: 'clp_last_message_id'
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
                  id: { type: 'string', example: 'clp_msg_id_1' },
                  content: { type: 'string', example: 'Hello, I am interested in your offer.' },
                  senderId: { type: 'string', example: 'clp_sender_id_1' },
                  sender: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'clp_sender_id_1' },
                      email: { type: 'string', format: 'email', example: 'sender@example.com' },
                      role: { type: 'string', enum: ['STUDENT', 'COMPANY', 'ADMIN'], example: 'STUDENT' }
                    },
                    example: { id: 'clp_sender_id_1', email: 'sender@example.com', role: 'STUDENT' }
                  },
                  conversationId: { type: 'string', example: 'clp_conv_id_to_retrieve' },
                  createdAt: { type: 'string', format: 'date-time', example: '2024-03-20T10:00:00Z' }
                },
                example: {
                  id: 'clp_msg_id_1',
                  content: 'Hello, I am interested in your offer.',
                  senderId: 'clp_sender_id_1',
                  sender: { id: 'clp_sender_id_1', email: 'sender@example.com', role: 'STUDENT' },
                  conversationId: 'clp_conv_id_to_retrieve',
                  createdAt: '2024-03-20T10:00:00Z'
                }
              },
              example: [
                {
                  id: 'clp_msg_id_1',
                  content: 'Hello, I am interested in your offer.',
                  senderId: 'clp_sender_id_1',
                  sender: { id: 'clp_sender_id_1', email: 'sender@example.com', role: 'STUDENT' },
                  conversationId: 'clp_conv_id_to_retrieve',
                  createdAt: '2024-03-20T10:00:00Z'
                },
                {
                  id: 'clp_msg_id_2',
                  content: 'Yes, it is still available.',
                  senderId: 'clp_sender_id_2',
                  sender: { id: 'clp_sender_id_2', email: 'company@example.com', role: 'COMPANY' },
                  conversationId: 'clp_conv_id_to_retrieve',
                  createdAt: '2024-03-20T10:05:00Z'
                }
              ]
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 20 },
                total: { type: 'integer', example: 50 },
                totalPages: { type: 'integer', example: 3 },
                hasMore: { type: 'boolean', example: true }
              },
              example: {
                page: 1,
                limit: 20,
                total: 50,
                totalPages: 3,
                hasMore: true
              }
            },
            conversation: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clp_conv_id_to_retrieve' },
                topic: { type: ['string', 'null'], example: 'Internship Application Discussion' },
                isReadOnly: { type: 'boolean', example: false },
                isBroadcast: { type: 'boolean', example: false },
                broadcastTarget: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null], example: null },
                context: { type: ['string', 'null'], example: 'OFFER' },
                status: { type: ['string', 'null'], example: 'ACTIVE' },
                expiresAt: { type: ['string', 'null'], format: 'date-time', example: '2024-04-20T10:00:00Z' },
                participants: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'clp_participant_id_1' },
                      userId: { type: 'string', example: 'clp_user_id_1' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string', example: 'clp_user_id_1' },
                          email: { type: 'string', format: 'email', example: 'user1@example.com' },
                          role: { type: 'string', enum: ['STUDENT', 'COMPANY', 'ADMIN'], example: 'STUDENT' },
                          studentProfile: {
                            type: ['object', 'null'],
                            properties: {
                              firstName: { type: 'string', example: 'Alice' },
                              lastName: { type: 'string', example: 'Smith' }
                            },
                            example: { firstName: 'Alice', lastName: 'Smith' }
                          },
                          companyProfile: {
                            type: ['object', 'null'],
                            properties: {
                              name: { type: 'string', example: 'TechCorp' }
                            },
                            example: null
                          }
                        },
                        example: {
                          id: 'clp_user_id_1',
                          email: 'user1@example.com',
                          role: 'STUDENT',
                          studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                          companyProfile: null
                        }
                      }
                    },
                    example: [
                      {
                        id: 'clp_participant_id_1',
                        userId: 'clp_user_id_1',
                        user: {
                          id: 'clp_user_id_1',
                          email: 'user1@example.com',
                          role: 'STUDENT',
                          studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                          companyProfile: null
                        }
                      },
                      {
                        id: 'clp_participant_id_2',
                        userId: 'clp_user_id_2',
                        user: {
                          id: 'clp_user_id_2',
                          email: 'company@example.com',
                          role: 'COMPANY',
                          studentProfile: null,
                          companyProfile: { name: 'InnovateCorp' }
                        }
                      }
                    ]
                  },
                  adoptionRequestStatus: { type: ['string', 'null'], enum: ['PENDING', 'ACCEPTED', 'REJECTED', null], example: 'ACCEPTED' },
                  applicationStatus: { type: ['string', 'null'], enum: ['NEW', 'SEEN', 'INTERVIEW', 'REJECTED', 'HIRED', null], example: 'INTERVIEW' },
                  contextDetails: {
                    type: ['object', 'null'],
                    properties: {
                      type: { type: 'string', example: 'OFFER' },
                      status: { type: 'string', example: 'ACTIVE' },
                      companyName: { type: 'string', example: 'InnovateCorp' },
                      initialMessage: { type: 'string', example: 'We are interested in your profile.' },
                      offerTitle: { type: 'string', example: 'Software Engineer Internship' },
                      target: { type: ['string', 'null'], enum: ['ALL', 'STUDENTS', 'COMPANIES', null], example: null }
                    },
                    example: {
                      type: 'OFFER',
                      status: 'ACTIVE',
                      companyName: 'InnovateCorp',
                      initialMessage: 'We are interested in your profile.',
                      offerTitle: 'Software Engineer Internship',
                      target: null
                    }
                  }
                },
                example: {
                  id: 'clp_conv_id_to_retrieve',
                  topic: 'Internship Application Discussion',
                  isReadOnly: false,
                  isBroadcast: false,
                  broadcastTarget: null,
                  context: 'OFFER',
                  status: 'ACTIVE',
                  expiresAt: '2024-04-20T10:00:00Z',
                  participants: [
                    {
                      id: 'clp_participant_id_1',
                      userId: 'clp_user_id_1',
                      user: {
                        id: 'clp_user_id_1',
                        email: 'user1@example.com',
                        role: 'STUDENT',
                        studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                        companyProfile: null
                      }
                    },
                    {
                      id: 'clp_participant_id_2',
                      userId: 'clp_user_id_2',
                      user: {
                        id: 'clp_user_id_2',
                        email: 'company@example.com',
                        role: 'COMPANY',
                        studentProfile: null,
                        companyProfile: { name: 'InnovateCorp' }
                      }
                    }
                  ],
                  adoptionRequestStatus: 'ACCEPTED',
                  applicationStatus: 'INTERVIEW',
                  contextDetails: {
                    type: 'OFFER',
                    status: 'ACTIVE',
                    companyName: 'InnovateCorp',
                    initialMessage: 'We are interested in your profile.',
                    offerTitle: 'Software Engineer Internship',
                    target: null
                  }
                }
              }
            },
            example: {
              messages: [
                {
                  id: 'clp_msg_id_1',
                  content: 'Hello, I am interested in your offer.',
                  senderId: 'clp_sender_id_1',
                  sender: { id: 'clp_sender_id_1', email: 'sender@example.com', role: 'STUDENT' },
                  conversationId: 'clp_conv_id_to_retrieve',
                  createdAt: '2024-03-20T10:00:00Z'
                },
                {
                  id: 'clp_msg_id_2',
                  content: 'Yes, it is still available.',
                  senderId: 'clp_sender_id_2',
                  sender: { id: 'clp_sender_id_2', email: 'company@example.com', role: 'COMPANY' },
                  conversationId: 'clp_conv_id_to_retrieve',
                  createdAt: '2024-03-20T10:05:00Z'
                }
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 50,
                totalPages: 3,
                hasMore: true
              },
              conversation: {
                id: 'clp_conv_id_to_retrieve',
                topic: 'Internship Application Discussion',
                isReadOnly: false,
                isBroadcast: false,
                broadcastTarget: null,
                context: 'OFFER',
                status: 'ACTIVE',
                expiresAt: '2024-04-20T10:00:00Z',
                participants: [
                  {
                    id: 'clp_participant_id_1',
                    userId: 'clp_user_id_1',
                    user: {
                      id: 'clp_user_id_1',
                      email: 'user1@example.com',
                      role: 'STUDENT',
                      studentProfile: { firstName: 'Alice', lastName: 'Smith' },
                      companyProfile: null
                    }
                  },
                  {
                    id: 'clp_participant_id_2',
                    userId: 'clp_user_id_2',
                    user: {
                      id: 'clp_user_id_2',
                      email: 'company@example.com',
                      role: 'COMPANY',
                      studentProfile: null,
                      companyProfile: { name: 'InnovateCorp' }
                    }
                  }
                ],
                adoptionRequestStatus: 'ACCEPTED',
                applicationStatus: 'INTERVIEW',
                contextDetails: {
                  type: 'OFFER',
                  status: 'ACTIVE',
                  companyName: 'InnovateCorp',
                  initialMessage: 'We are interested in your profile.',
                  offerTitle: 'Software Engineer Internship',
                  target: null
                }
              }
            }
          }
        },
          401: {
            description: 'Not authenticated',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Unauthorized' }
          },
          403: {
            description: 'Access denied - Not a participant in this conversation',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Forbidden: You are not a participant in this conversation' }
          },
          404: {
            description: 'Conversation not found',
            type: 'object',
            properties: { message: { type: 'string' } },
            example: { message: 'Conversation with ID clp_conv_id_to_retrieve not found' }
          }
        }
      }
    }, getMessagesForConversation);

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
          conversationId: { type: 'string', description: 'Conversation ID', example: 'clp_conv_id_to_send_message' }
        },
        required: ['conversationId'],
        example: { conversationId: 'clp_conv_id_to_send_message' }
      },
      body: {
        type: 'object',
        required: ['content'],
        properties: {
          content: {
            type: 'string',
            minLength: 1,
            maxLength: 2000,
            description: 'Message content', example: 'I am available for an interview on Tuesday.'
          }
        },
        example: { content: 'I am available for an interview on Tuesday.' }
      },
      response: {
        201: {
          description: 'Message sent successfully',
          type: 'object',
          properties: {
            id: { type: 'string', example: 'clp_new_msg_id' },
            content: { type: 'string', example: 'I am available for an interview on Tuesday.' },
            senderId: { type: 'string', example: 'clp_sender_user_id' },
            conversationId: { type: 'string', example: 'clp_conv_id_to_send_message' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-03-20T10:10:00Z' },
            sender: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'clp_sender_user_id' },
                email: { type: 'string', format: 'email', example: 'sender@example.com' },
                role: { type: 'string', example: 'STUDENT' }
              },
              example: { id: 'clp_sender_user_id', email: 'sender@example.com', role: 'STUDENT' }
            }
          },
          example: {
            id: 'clp_new_msg_id',
            content: 'I am available for an interview on Tuesday.',
            senderId: 'clp_sender_user_id',
            conversationId: 'clp_conv_id_to_send_message',
            createdAt: '2024-03-20T10:10:00Z',
            sender: { id: 'clp_sender_user_id', email: 'sender@example.com', role: 'STUDENT' }
          }
        },
        400: {
          description: 'Invalid input data',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Message content is required' }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Unauthorized' }
        },
        403: {
          description: 'Access denied - Not a participant in this conversation or conversation is read-only',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Forbidden: You cannot send messages in this conversation' }
        },
        404: {
          description: 'Conversation not found',
          type: 'object',
          properties: { message: { type: 'string' } },
          example: { message: 'Conversation with ID clp_conv_id_to_send_message not found' }
        }
      }
    }
  }, createMessageInConversation as any);
}

export default messageRoutes; 
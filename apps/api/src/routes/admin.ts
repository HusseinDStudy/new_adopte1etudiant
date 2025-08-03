import { FastifyInstance } from 'fastify';
import {
  getAdminAnalytics,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getAdminOffers,
  deleteOffer,
  updateOfferStatus,
  sendAdminMessage,
  sendBroadcastMessage,
  getAdminConversations,
  testAdminOffersPagination
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import { sanitizationMiddleware } from '../middleware/sanitizationMiddleware.js';
import { Role } from '@prisma/client';

async function adminRoutes(server: FastifyInstance) {
  // Analytics endpoint
  server.get('/analytics', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Get admin analytics and statistics',
      tags: ['Admin'],
      summary: 'Admin: Get analytics',
      security: [{ cookieAuth: [] }],
      response: {
        200: {
          description: 'Analytics data',
          type: 'object',
          properties: {
            totalUsers: { type: 'integer' },
            totalStudents: { type: 'integer' },
            totalCompanies: { type: 'integer' },
            totalOffers: { type: 'integer' },
            totalApplications: { type: 'integer' },
            totalAdoptionRequests: { type: 'integer' },
            totalBlogPosts: { type: 'integer' },
            recentActivity: {
              type: 'object',
              properties: {
                newUsersToday: { type: 'integer' },
                newOffersToday: { type: 'integer' },
                newApplicationsToday: { type: 'integer' }
              }
            },
            usersByRole: {
              type: 'object',
              properties: {
                STUDENT: { type: 'integer' },
                COMPANY: { type: 'integer' },
                ADMIN: { type: 'integer' }
              }
            },
            offersByStatus: {
              type: 'object',
              properties: {
                ACTIVE: { type: 'integer' },
                INACTIVE: { type: 'integer' }
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
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getAdminAnalytics);

  // Users management endpoints
  server.get('/users', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Get all users for admin management',
      tags: ['Admin'],
      summary: 'Admin: List all users',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 15 },
          search: { type: 'string', description: 'Search in names and emails' },
          role: { type: 'string', enum: ['STUDENT', 'COMPANY', 'ADMIN'] },
          isActive: { type: 'string', enum: ['true', 'false'], description: 'Filter by user active status' }
        }
      },
             response: {
         200: {
           description: 'List of users with pagination',
           type: 'object',
           properties: {
             data: { 
               type: 'array',
               items: {
                 type: 'object',
                 properties: {
                   id: { type: 'string' },
                   email: { type: 'string' },
                   role: { type: 'string' },
                   createdAt: { type: 'string' },
                   updatedAt: { type: 'string' },
                   passwordLoginDisabled: { type: 'boolean' },
                   isActive: { type: 'boolean' },
                   profile: { type: 'object' }
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
               },
               required: ['page', 'limit', 'total', 'totalPages']
             }
           },
           required: ['data', 'pagination']
         },
         401: {
           description: 'Not authenticated',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         403: {
           description: 'Access denied - Admin role required',
           type: 'object',
           properties: { message: { type: 'string' } }
         }
       }
    }
  }, getAdminUsers);



  server.patch('/users/:userId/role', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Update user role',
      tags: ['Admin'],
      summary: 'Admin: Update user role',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      body: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['STUDENT', 'COMPANY', 'ADMIN'] }
        },
                 required: ['role']
       },
       response: {
         200: {
           description: 'User role updated successfully',
           type: 'object',
           properties: {
             success: { type: 'boolean' }
           }
         },
         401: {
           description: 'Not authenticated',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         403: {
           description: 'Access denied - Admin role required',
           type: 'object',
           properties: { message: { type: 'string' } }
         }
       }
     }
   }, updateUserRole);

  server.patch('/users/:userId/status', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Update user status (active/inactive)',
      tags: ['Admin'],
      summary: 'Admin: Update user status',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
        required: ['userId']
      },
      body: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' }
        },
                 required: ['isActive']
       },
       response: {
         200: {
           description: 'User status updated successfully',
           type: 'object',
           properties: {
             success: { type: 'boolean' }
           }
         },
         401: {
           description: 'Not authenticated',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         403: {
           description: 'Access denied - Admin role required',
           type: 'object',
           properties: { message: { type: 'string' } }
         }
       }
     }
   }, updateUserStatus);

  server.delete('/users/:userId', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Delete a user',
      tags: ['Admin'],
      summary: 'Admin: Delete user',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        },
                 required: ['userId']
       },
       response: {
         204: {
           description: 'User deleted successfully',
           type: 'null'
         },
         401: {
           description: 'Not authenticated',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         403: {
           description: 'Access denied - Admin role required',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         404: {
           description: 'User not found',
           type: 'object',
           properties: { message: { type: 'string' } }
         }
       }
     }
   }, deleteUser);

  // Offers management endpoints
  server.get('/offers', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Get all offers for admin management',
      tags: ['Admin'],
      summary: 'Admin: List all offers',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 15 },
          search: { type: 'string', description: 'Search in titles and descriptions' },
          isActive: { type: 'string', enum: ['true', 'false'], description: 'Filter by active status' },
          companyId: { type: 'string', description: 'Filter by company' }
        }
      },
                   response: {
       200: {
         description: 'List of offers with pagination',
         type: 'object',
         properties: {
           data: { 
             type: 'array',
             items: {
               type: 'object',
               properties: {
                 id: { type: 'string' },
                 title: { type: 'string' },
                 description: { type: 'string' },
                 location: { type: 'string' },
                 duration: { type: 'string' },
                 isActive: { type: 'boolean' },
                 createdAt: { type: 'string' },
                 updatedAt: { type: 'string' },
                 company: {
                   type: 'object',
                   properties: {
                     id: { type: 'string' },
                     companyName: { type: 'string' },
                     email: { type: 'string' }
                   }
                 },
                 _count: {
                   type: 'object',
                   properties: {
                     applications: { type: 'integer' }
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
             },
             required: ['page', 'limit', 'total', 'totalPages']
           }
         },
         required: ['data', 'pagination']
       },
         401: {
           description: 'Not authenticated',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         403: {
           description: 'Access denied - Admin role required',
           type: 'object',
           properties: { message: { type: 'string' } }
         }
       }
    }
  }, getAdminOffers);

  // Test endpoint for offers pagination (no auth required)
  server.get('/test-offers', {
    schema: {
      description: 'Test endpoint for admin offers pagination (no auth required)',
      tags: ['Admin'],
      summary: 'Test: Admin offers pagination',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 15 },
          search: { type: 'string', description: 'Search in titles and descriptions' },
          isActive: { type: 'string', enum: ['true', 'false'], description: 'Filter by active status' },
          companyId: { type: 'string', description: 'Filter by company' }
        }
      },
      response: {
        200: {
          description: 'List of offers with pagination',
          type: 'object',
          properties: {
            data: { 
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  duration: { type: 'string' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  company: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      companyName: { type: 'string' },
                      email: { type: 'string' }
                    }
                  },
                  _count: {
                    type: 'object',
                    properties: {
                      applications: { type: 'integer' }
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
              },
              required: ['page', 'limit', 'total', 'totalPages']
            }
          },
          required: ['data', 'pagination']
        }
      }
    }
  }, testAdminOffersPagination);

  server.delete('/offers/:offerId', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Delete an offer',
      tags: ['Admin'],
      summary: 'Admin: Delete offer',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          offerId: { type: 'string' }
        },
                 required: ['offerId']
       },
       response: {
         204: {
           description: 'Offer deleted successfully',
           type: 'null'
         },
         401: {
           description: 'Not authenticated',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         403: {
           description: 'Access denied - Admin role required',
           type: 'object',
           properties: { message: { type: 'string' } }
         },
         404: {
           description: 'Offer not found',
           type: 'object',
           properties: { message: { type: 'string' } }
         }
       }
     }
   }, deleteOffer);

  server.patch('/offers/:offerId/status', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Update offer status (activate/deactivate)',
      tags: ['Admin'],
      summary: 'Admin: Update offer status',
      security: [{ cookieAuth: [] }],
      params: {
        type: 'object',
        properties: {
          offerId: { type: 'string' }
        },
        required: ['offerId']
      },
      body: {
        type: 'object',
        properties: {
          isActive: { type: 'boolean' }
        },
        required: ['isActive']
      },
      response: {
        200: {
          description: 'Offer status updated successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        404: {
          description: 'Offer not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, updateOfferStatus);

  // Messages endpoints
  server.post('/messages', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN]), sanitizationMiddleware],
    schema: {
      description: 'Send a message to a specific user',
      tags: ['Admin'],
      summary: 'Admin: Send message',
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        properties: {
          recipientId: { type: 'string' },
          subject: { type: 'string' },
          content: { type: 'string' },
          isReadOnly: { type: 'boolean', default: false }
        },
        required: ['recipientId', 'subject', 'content']
      },
      response: {
        200: {
          description: 'Message sent successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            conversation: { type: 'object' }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        404: {
          description: 'Recipient not found',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, sendAdminMessage);

  server.post('/messages/broadcast', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN]), sanitizationMiddleware],
    schema: {
      description: 'Send a broadcast message to users',
      tags: ['Admin'],
      summary: 'Admin: Send broadcast message',
      security: [{ cookieAuth: [] }],
      body: {
        type: 'object',
        properties: {
          targetRole: { type: 'string', enum: ['STUDENT', 'COMPANY'] },
          subject: { type: 'string' },
          content: { type: 'string' }
        },
        required: ['subject', 'content']
      },
      response: {
        200: {
          description: 'Broadcast message sent successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            sentTo: { type: 'integer' },
            conversations: { type: 'array' }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        400: {
          description: 'No users found for criteria',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, sendBroadcastMessage);

  server.get('/conversations', {
    preHandler: [authMiddleware, roleMiddleware([Role.ADMIN])],
    schema: {
      description: 'Get admin conversations',
      tags: ['Admin'],
      summary: 'Admin: List conversations',
      security: [{ cookieAuth: [] }],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          search: { type: 'string', description: 'Search in conversation topics and participant names' }
        }
      },
      response: {
        200: {
          description: 'List of conversations with pagination',
          type: 'object',
          properties: {
            data: { type: 'array' },
            pagination: { type: 'object' }
          }
        },
        401: {
          description: 'Not authenticated',
          type: 'object',
          properties: { message: { type: 'string' } }
        },
        403: {
          description: 'Access denied - Admin role required',
          type: 'object',
          properties: { message: { type: 'string' } }
        }
      }
    }
  }, getAdminConversations);
}

export default adminRoutes; 
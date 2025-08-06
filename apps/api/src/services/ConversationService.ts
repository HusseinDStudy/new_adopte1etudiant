import { prisma } from 'db-postgres';

export class ConversationService {
  /**
   * Clean up expired conversations
   */
  async cleanupExpiredConversations() {
    const expiredConversations = await prisma.conversation.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        },
        status: 'ACTIVE'
      }
    });

    for (const conversation of expiredConversations) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: 'EXPIRED' }
      });
    }

    return expiredConversations.length;
  }

  /**
   * Get conversations for a user with context information
   */
  async getUserConversations(userId: string, options: {
    page?: number;
    limit?: number;
    context?: string;
    status?: string;
  } = {}) {
    const { page = 1, limit = 20, context, status } = options;
    const skip = (page - 1) * limit;

    // Get user info to determine role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const whereClause: any = {
      OR: [
        // Regular conversations where user is a participant
        {
          participants: {
            some: {
              userId: userId
            }
          },
          isBroadcast: false
        },
        // Broadcast conversations that match user's role OR were created by admin
        {
          isBroadcast: true,
          OR: [
            // Match user's role
            {
              broadcastTarget: {
                in: ['ALL', user.role === 'STUDENT' ? 'STUDENTS' : user.role === 'COMPANY' ? 'COMPANIES' : null].filter(Boolean)
              }
            },
            // Or created by admin
            {
              participants: {
                some: {
                  userId: userId
                }
              }
            }
          ]
        }
      ]
    };

    if (context) {
      whereClause.context = context;
    }

    if (status) {
      whereClause.status = status;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  studentProfile: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  },
                  companyProfile: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          adoptionRequest: {
            select: {
              status: true,
              company: {
                select: {
                  name: true
                }
              }
            }
          },
          application: {
            select: {
              status: true,
              offer: {
                select: {
                  title: true,
                  company: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.conversation.count({ where: whereClause })
    ]);

    return {
      conversations: conversations.map(conv => {
        const lastMessage = conv.messages[0] || null;

        // For broadcast conversations, show anonymous participants
        let participants = conv.participants;
        if (conv.isBroadcast) {
          participants = [{
            id: 'anonymous',
            userId: 'anonymous',
            conversationId: conv.id,
            joinedAt: conv.createdAt,
            user: {
              id: 'anonymous',
              email: 'admin@system',
              role: 'ADMIN',
              studentProfile: null,
              companyProfile: null
            }
          }];
        }

        return {
          id: conv.id,
          topic: conv.topic,
          isReadOnly: conv.isReadOnly,
          isBroadcast: conv.isBroadcast,
          broadcastTarget: conv.broadcastTarget,
          context: conv.context,
          status: conv.status,
          expiresAt: conv.expiresAt,
          participants,
          lastMessage,
          updatedAt: conv.updatedAt,
          createdAt: conv.createdAt,
          contextDetails: conv.context === 'ADOPTION_REQUEST' ? {
            type: 'adoption_request',
            status: conv.adoptionRequest?.status,
            companyName: conv.adoptionRequest?.company?.name
          } : conv.context === 'OFFER' ? {
            type: 'offer',
            status: conv.application?.status,
            offerTitle: conv.application?.offer?.title,
            companyName: conv.application?.offer?.company?.name
          } : conv.context === 'BROADCAST' ? {
            type: 'broadcast',
            target: conv.broadcastTarget
          } : null
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get broadcast conversations for a user based on their role
   */
  async getBroadcastConversationsForUser(userId: string, options: {
    page?: number;
    limit?: number;
  } = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    // Get user info to determine role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const whereClause = {
      isBroadcast: true,
      OR: [
        { broadcastTarget: 'ALL' },
        { broadcastTarget: user.role === 'STUDENT' ? 'STUDENTS' : user.role === 'COMPANY' ? 'COMPANIES' : null }
      ].filter(Boolean) as any
    };

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: whereClause,
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  role: true
                }
              }
            }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  email: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.conversation.count({ where: whereClause as any })
    ]);

    return {
      conversations: conversations.map(conv => ({
        id: conv.id,
        topic: conv.topic,
        isReadOnly: conv.isReadOnly,
        isBroadcast: conv.isBroadcast,
        broadcastTarget: conv.broadcastTarget,
        context: conv.context,
        status: conv.status,
        expiresAt: conv.expiresAt,
        participants: conv.participants,
        lastMessage: conv.messages[0] || null,
        updatedAt: conv.updatedAt,
        createdAt: conv.createdAt,
        contextDetails: {
          type: 'broadcast',
          target: conv.broadcastTarget
        }
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Check if a conversation is accessible for messaging
   */
  async isConversationAccessible(conversationId: string, userId: string): Promise<{
    accessible: boolean;
    reason?: string;
    conversation?: any;
  }> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
        adoptionRequest: true,
        application: true
      }
    });

    if (!conversation) {
      return { accessible: false, reason: 'Conversation not found' };
    }

    // Get user info to check role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return { accessible: false, reason: 'User not found' };
    }

    // For broadcast conversations, check if user can access based on role
    if (conversation.isBroadcast) {
      // Admins can always access broadcast conversations they created
      if (user.role === 'ADMIN') {
        const isCreator = conversation.participants.some(p => p.userId === userId);
        if (isCreator) {
          // Check conversation status - allow viewing but not messaging if archived/expired
          if (conversation.status === 'ARCHIVED' || conversation.status === 'EXPIRED') {
            return { accessible: true, conversation }; // Allow viewing archived broadcasts
          }

          if (conversation.expiresAt && new Date() > conversation.expiresAt) {
            return { accessible: true, conversation }; // Allow viewing expired broadcasts
          }

          return { accessible: true, conversation };
        }
      }

      // For non-admins, check if user's role matches the broadcast target
      const canAccess = conversation.broadcastTarget === 'ALL' ||
        (conversation.broadcastTarget === 'STUDENTS' && user.role === 'STUDENT') ||
        (conversation.broadcastTarget === 'COMPANIES' && user.role === 'COMPANY');

      if (!canAccess) {
        return { accessible: false, reason: 'Broadcast not intended for your role' };
      }

      // Allow viewing broadcast conversations regardless of status
      return { accessible: true, conversation };
    }

    // For regular conversations, check if user is a participant
    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      return { accessible: false, reason: 'Not a participant' };
    }

    // Allow viewing conversations regardless of status
    // The messaging restrictions will be handled in createMessageInConversation
    return { accessible: true, conversation };
  }
} 
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { createMessageSchema } from 'shared-types';
import { ConversationService } from '../services/ConversationService.js';

const conversationService = new ConversationService();

async function isUserPartOfConversation(userId: string, conversationId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });
  return !!participant;
}

export const getMyConversations = async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
      context?: string;
      status?: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { id: userId } = request.user!;
  const { page = '1', limit = '20', context, status } = request.query;

  try {
    const result = await conversationService.getUserConversations(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      context,
      status
    });

    return reply.send(result);
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getBroadcastConversations = async (
  request: FastifyRequest<{
    Querystring: {
      page?: string;
      limit?: string;
    }
  }>,
  reply: FastifyReply
) => {
  const { id: userId } = request.user!;
  const { page = '1', limit = '20' } = request.query;

  try {
    const result = await conversationService.getBroadcastConversationsForUser(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return reply.send(result);
  } catch (error) {
    console.error('Failed to get broadcast conversations:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getMessagesForConversation = async (
  request: FastifyRequest<{ Params: { conversationId: string } }>,
  reply: FastifyReply
) => {
  const { conversationId } = request.params;
  const { id: userId } = request.user!;

  try {
    // Use ConversationService to check access (handles both regular and broadcast conversations)
    const accessCheck = await conversationService.isConversationAccessible(conversationId, userId);
    if (!accessCheck.accessible) {
      return reply.code(403).send({ message: accessCheck.reason || 'You do not have permission to view these messages.' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    const conversationDetails = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        adoptionRequest: {
          select: {
            status: true,
            message: true,
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
        },
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
        }
      }
    });

    if (!conversationDetails) {
      console.error('Conversation not found for ID:', conversationId);
      return reply.code(404).send({ message: 'Conversation not found.' });
    }

    console.log('Found conversation details:', {
      id: conversationDetails.id,
      context: conversationDetails.context,
      status: conversationDetails.status
    });

    const response = {
      messages,
      conversation: {
        id: conversationDetails.id,
        topic: conversationDetails.topic,
        isReadOnly: conversationDetails.isReadOnly,
        isBroadcast: conversationDetails.isBroadcast,
        context: conversationDetails.context,
        status: conversationDetails.status,
        expiresAt: conversationDetails.expiresAt,
        participants: conversationDetails.participants,
        adoptionRequestStatus: conversationDetails.adoptionRequest?.status || null,
        applicationStatus: conversationDetails.application?.status || null,
        contextDetails: conversationDetails.context === 'ADOPTION_REQUEST' ? {
          type: 'adoption_request',
          status: conversationDetails.adoptionRequest?.status,
          companyName: conversationDetails.adoptionRequest?.company?.name,
          initialMessage: conversationDetails.adoptionRequest?.message
        } : conversationDetails.context === 'OFFER' ? {
          type: 'offer',
          status: conversationDetails.application?.status,
          offerTitle: conversationDetails.application?.offer?.title,
          companyName: conversationDetails.application?.offer?.company?.name
        } : null
      }
    };

    return reply.send(response);
  } catch (error) {
    console.error('Failed to get messages:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const createMessageInConversation = async (
  request: FastifyRequest<{ Params: { conversationId: string } }>,
  reply: FastifyReply
) => {
  const { conversationId } = request.params;
  const { id: senderId, role: senderRole } = request.user!;

  const parseResult = createMessageSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.code(400).send({ message: 'Invalid message content', issues: parseResult.error.issues });
  }
  const { content } = parseResult.data;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        adoptionRequest: true,
        application: {
          include: {
            offer: true
          }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return reply.code(404).send({ message: 'Conversation not found.' });
    }

    // For broadcast conversations, check if user can access based on role
    if (conversation.isBroadcast) {
      // Check if user is the creator (admin) of the broadcast
      const isCreator = conversation.participants.some(p => p.userId === senderId);
      
      if (isCreator) {
        // Admin creator can always send messages to their broadcasts
        // No additional checks needed
      } else {
        // For non-creators, check if user's role matches the broadcast target
        const canAccess = conversation.broadcastTarget === 'ALL' ||
          (conversation.broadcastTarget === 'STUDENTS' && senderRole === 'STUDENT') ||
          (conversation.broadcastTarget === 'COMPANIES' && senderRole === 'COMPANY');

        if (!canAccess) {
          return reply.code(403).send({ message: 'You do not have permission to access this broadcast conversation.' });
        }

        // Broadcast conversations are read-only for non-admins
        if (senderRole !== 'ADMIN') {
          return reply.code(403).send({ message: 'Broadcast conversations are read-only. Only administrators can send messages.' });
        }
      }
    } else {
      // For regular conversations, check if user is a participant
      const hasAccess = await isUserPartOfConversation(senderId, conversationId);
      if (!hasAccess) {
        return reply.code(403).send({ message: 'You do not have permission to send messages to this conversation.' });
      }
    }

    // Check conversation status
    if (conversation.status === 'ARCHIVED' || conversation.status === 'EXPIRED') {
      return reply.code(403).send({ message: 'This conversation has been ended and is now read-only.' });
    }

    // Check if conversation has expired
    if (conversation.expiresAt && new Date() > conversation.expiresAt) {
      // Update conversation status to expired
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'EXPIRED' }
      });
      return reply.code(403).send({ message: 'This conversation has expired and is now read-only.' });
    }

    // Check if conversation is read-only
    if (conversation.isReadOnly) {
      // Only admins can send messages in read-only conversations
      if (senderRole !== 'ADMIN') {
        return reply.code(403).send({ message: 'This conversation is read-only. Only administrators can send messages.' });
      }
    }

    // Context-specific rules (only for non-broadcast conversations)
    if (!conversation.isBroadcast) {
      if (conversation.context === 'ADOPTION_REQUEST' && conversation.adoptionRequest) {
        if (conversation.adoptionRequest.status === 'REJECTED') {
          return reply.code(403).send({ message: 'This adoption request has been rejected and the conversation is now read-only.' });
        }
        if (conversation.adoptionRequest.status === 'PENDING') {
          // Only the student can send messages while pending (to accept/reject)
          if (senderRole !== 'STUDENT') {
            return reply.code(403).send({ message: 'You can only send messages after the student responds to the adoption request.' });
          }
        }
      }

      if (conversation.context === 'OFFER' && conversation.application) {
        if (conversation.application.status === 'REJECTED') {
          return reply.code(403).send({ message: 'This application has been rejected and the conversation is now read-only.' });
        }
        if (conversation.application.status === 'NEW') {
          return reply.code(403).send({ message: 'You can only send messages after the application status changes from NEW.' });
        }
      }
    }

    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Auto-accept adoption request when student responds
    if (!conversation.isBroadcast && 
        conversation.context === 'ADOPTION_REQUEST' && 
        conversation.adoptionRequest && 
        conversation.adoptionRequest.status === 'PENDING' && 
        senderRole === 'STUDENT') {
      
      // Update adoption request status to ACCEPTED
      await prisma.adoptionRequest.update({
        where: { id: conversation.adoptionRequest.id },
        data: { status: 'ACCEPTED' }
      });

      // Update conversation status to ACTIVE and remove read-only
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { 
          status: 'ACTIVE',
          isReadOnly: false
        }
      });
    }

    return reply.code(201).send(newMessage);
  } catch (error) {
    console.error('Failed to create message:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
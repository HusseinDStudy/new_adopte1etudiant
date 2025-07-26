import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { createMessageSchema } from 'shared-types';

async function isUserPartOfConversation(userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      application: {
        include: {
          student: true,
          offer: { include: { company: { include: { user: true } } } },
        },
      },
      adoptionRequest: {
        include: {
          student: true,
          company: { include: { user: true } },
        },
      },
    },
  });

  if (!conversation) {
    return false;
  }

  if (conversation.application) {
    return (
      userId === conversation.application.studentId ||
      userId === conversation.application.offer.company.userId
    );
  }

  if (conversation.adoptionRequest) {
    return (
      userId === conversation.adoptionRequest.studentId ||
      userId === conversation.adoptionRequest.company.userId
    );
  }

  return false;
}

export const getMyConversations = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: userId } = request.user!;

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { application: { studentId: userId } },
          { application: { offer: { company: { userId } } } },
          { adoptionRequest: { studentId: userId } },
          { adoptionRequest: { company: { userId } } },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        application: {
          include: {
            offer: { select: { title: true } },
            student: { select: { studentProfile: { select: { firstName: true, lastName: true } } } },
          }
        },
        adoptionRequest: {
          include: {
            company: { select: { name: true } },
            student: { select: { studentProfile: { select: { firstName: true, lastName: true } } } },
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Simplified topic for frontend
    const formattedConversations = conversations.map(c => {
      let topic = 'Conversation';
      if (c.application) {
        topic = `Application for ${c.application.offer.title}`;
      } else if (c.adoptionRequest) {
        topic = `Adoption Request from ${c.adoptionRequest.company.name}`;
      }
      return {
        id: c.id,
        topic,
        lastMessage: c.messages[0]?.content || 'No messages yet.',
        updatedAt: c.updatedAt.toISOString(),
      }
    });

    return reply.send(formattedConversations);
  } catch (error) {
    console.error('Failed to get conversations:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export const getMessagesForConversation = async (
  request: FastifyRequest<{ Params: { conversationId: string } }>,
  reply: FastifyReply
) => {
  const { conversationId } = request.params;
  const { id: userId } = request.user!;

  try {
    const hasAccess = await isUserPartOfConversation(userId, conversationId);
    if (!hasAccess) {
      return reply.code(403).send({ message: 'You do not have permission to view these messages.' });
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
          }
        }
      }
    });



    return reply.send({
      messages,
      adoptionRequestStatus: conversationDetails?.adoptionRequest?.status || null
    });
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
  const { id: senderId } = request.user!;

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
      }
    });

    if (!conversation) {
      return reply.code(404).send({ message: 'Conversation not found.' });
    }

    if (conversation.adoptionRequest && conversation.adoptionRequest.status === 'REJECTED') {
      return reply.code(403).send({ message: 'This conversation has been ended and is now read-only.' });
    }

    const hasAccess = await isUserPartOfConversation(senderId, conversationId);
    if (!hasAccess) {
      return reply.code(403).send({ message: 'You do not have permission to send messages to this conversation.' });
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

    return reply.code(201).send(newMessage);
  } catch (error) {
    console.error('Failed to create message:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
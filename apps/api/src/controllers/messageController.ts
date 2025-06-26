import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { createMessageSchema } from 'shared-types';

// Utility function to check if a user is part of an application
async function isUserPartOfApplication(userId: string, applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      offer: {
        select: {
          company: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    return false;
  }

  // User is the student who applied
  if (application.studentId === userId) {
    return true;
  }

  // User is the company who posted the offer
  if (application.offer.company.userId === userId) {
    return true;
  }

  return false;
}

export const getMessagesForApplication = async (
  request: FastifyRequest<{ Params: { applicationId: string } }>,
  reply: FastifyReply
) => {
  const { applicationId } = request.params;
  const { id: userId } = request.user!;

  try {
    // 1. Verify user has access to this application's messages
    const hasAccess = await isUserPartOfApplication(userId, applicationId);
    if (!hasAccess) {
      return reply.code(403).send({ message: 'You do not have permission to view these messages.' });
    }

    // 2. Fetch messages
    const messages = await prisma.message.findMany({
      where: { applicationId },
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

    return reply.send(messages);
  } catch (error) {
    console.error('Failed to get messages:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const createMessage = async (
  request: FastifyRequest<{ Params: { applicationId: string } }>,
  reply: FastifyReply
) => {
  const { applicationId } = request.params;
  const { id: senderId } = request.user!;

  const parseResult = createMessageSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.code(400).send({ message: 'Invalid message content', issues: parseResult.error.issues });
  }
  const { content } = parseResult.data;

  try {
    // 1. Verify user has access to this application
    const hasAccess = await isUserPartOfApplication(senderId, applicationId);
    if (!hasAccess) {
      return reply.code(403).send({ message: 'You do not have permission to send messages to this application.' });
    }

    // 2. Create the new message
    const newMessage = await prisma.message.create({
      data: {
        applicationId,
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
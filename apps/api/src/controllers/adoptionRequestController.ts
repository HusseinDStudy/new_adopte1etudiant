import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { updateAdoptionRequestStatusSchema } from 'shared-types';

export const createAdoptionRequest = async (
  request: FastifyRequest<{ Body: { studentId: string; message: string } }>,
  reply: FastifyReply
) => {
  const { id: companyUserId } = request.user!;
  const { studentId, message } = request.body;

  if (!message || message.trim().length === 0) {
    return reply.code(400).send({ message: 'A message is required to send a request.' });
  }

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: companyUserId },
    });

    if (!companyProfile) {
      return reply.code(403).send({ message: 'You must have a company profile to send requests.' });
    }

    const existingRequest = await prisma.adoptionRequest.findUnique({
      where: {
        companyId_studentId: {
          companyId: companyProfile.id,
          studentId,
        },
      },
    });

    if (existingRequest) {
      return reply.code(409).send({ message: 'You have already sent a request to this student.' });
    }

    const newRequest = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.create({
        data: {},
      });

      await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: companyUserId,
          content: message,
        },
      });

      const adoptionRequest = await tx.adoptionRequest.create({
      data: {
        companyId: companyProfile.id,
        studentId,
          conversationId: conversation.id,
      },
      });

      return adoptionRequest;
    });

    return reply.code(201).send(newRequest);
  } catch (error) {
    console.error('Failed to create adoption request:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const listSentAdoptionRequests = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: companyUserId } = request.user!;
  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: companyUserId },
    });

    if (!companyProfile) {
      return reply.code(403).send({ message: 'Company profile not found.' });
    }

    const requests = await prisma.adoptionRequest.findMany({
      where: { companyId: companyProfile.id },
      include: {
        student: {
          select: {
            id: true,
            studentProfile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(requests);
  } catch (error) {
    console.error('Failed to list sent adoption requests:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export const listMyAdoptionRequests = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: studentId } = request.user!;
  try {
    const requests = await prisma.adoptionRequest.findMany({
      where: { studentId },
      include: {
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
        conversation: {
          include: {
            messages: {
              take: 1,
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return reply.send(requests);
  } catch (error) {
    console.error('Failed to list adoption requests:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const updateAdoptionRequestStatus = async (
  request: FastifyRequest<{ Params: { id: string }, Body: { status: string } }>,
  reply: FastifyReply
) => {
    const { id: requestId } = request.params;
    const { id: studentId } = request.user!;
    
    const parseResult = updateAdoptionRequestStatusSchema.safeParse(request.body);
    if (!parseResult.success) {
        return reply.code(400).send({ message: 'Invalid status provided.'});
    }
    const { status } = parseResult.data;

    try {
        const requestToUpdate = await prisma.adoptionRequest.findFirst({
            where: { id: requestId, studentId }
        });

        if (!requestToUpdate) {
            return reply.code(404).send({ message: 'Request not found or you do not have permission to update it.'});
        }

        const updatedRequest = await prisma.adoptionRequest.update({
            where: { id: requestId },
            data: { status: status as any }
        });

        return reply.send(updatedRequest);
    } catch (error) {
        console.error('Failed to update adoption request status:', error);
        return reply.code(500).send({ message: 'Internal Server Error' });
    }
} 
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from 'shared-types';

export const createApplication = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: studentId } = request.user!;

  const parseResult = createApplicationSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply
      .code(400)
      .send({ message: 'Invalid request body', issues: parseResult.error.issues });
  }
  const { offerId } = parseResult.data;

  try {
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    });

    if (!studentProfile) {
      return reply.code(403).send({ message: 'You must have a profile to apply.' });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_offerId: {
          studentId: studentId,
          offerId: offerId,
        },
      },
    });

    if (existingApplication) {
      return reply.code(409).send({ message: 'You have already applied to this offer.' });
    }

    const newApplication = await prisma.application.create({
      data: {
        offerId: offerId,
        studentId: studentId,
      },
    });

    return reply.code(201).send(newApplication);
  } catch (error) {
    console.error('Failed to create application:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getMyApplications = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: studentId } = request.user!;

  try {
    const applications = await prisma.application.findMany({
      where: { studentId },
      include: {
        offer: {
          include: {
            company: {
              select: {
                name: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reply.send(applications);
  } catch (error) {
    console.error('Failed to get my applications:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const updateApplicationStatus = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id: applicationId } = request.params;
  const { id: companyUserId } = request.user!;

  const parseResult = updateApplicationStatusSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply
      .code(400)
      .send({ message: 'Invalid status value', issues: parseResult.error.issues });
  }
  const { status } = parseResult.data;

  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        offer: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!application) {
      return reply.code(404).send({ message: 'Application not found.' });
    }

    if (application.offer.company.userId !== companyUserId) {
      return reply
        .code(403)
        .send({ message: 'You do not have permission to update this application.' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    if ((status === 'HIRED' || status === 'INTERVIEW') && !application.conversationId) {
      await prisma.conversation.create({
        data: {
          application: {
            connect: { id: applicationId },
          },
        },
      });
    }

    return reply.send(updatedApplication);
  } catch (error) {
    console.error('Failed to update application status:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};
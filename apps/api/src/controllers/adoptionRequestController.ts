import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { updateAdoptionRequestStatusSchema } from 'shared-types';

export const createAdoptionRequest = async (
  request: FastifyRequest<{ Body: { studentId: string; message: string } }>,
  reply: FastifyReply
) => {
  const { id: companyUserId } = request.user!;
  const { studentId, message } = request.body;

  if (!studentId || typeof studentId !== 'string') {
    return reply.code(400).send({ message: 'A valid studentId is required.' });
  }

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
      // Create conversation with context
      const conversation = await tx.conversation.create({
        data: {
          topic: `Demande d'adoption - ${companyProfile.name}`,
          context: 'ADOPTION_REQUEST',
          status: 'PENDING_APPROVAL',
          participants: {
            create: [
              { userId: companyUserId },
              { userId: studentId }
            ]
          },
          messages: {
            create: {
              senderId: companyUserId,
              content: message,
            }
          }
        },
      });

      // Create adoption request with conversation link and initial message
      const adoptionRequest = await tx.adoptionRequest.create({
        data: {
          companyId: companyProfile.id,
          studentId,
          message: message,
          conversationId: conversation.id,
        },
      });

      // Update conversation with context ID
      await tx.conversation.update({
        where: { id: conversation.id },
        data: { contextId: adoptionRequest.id }
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
                school: true,
                degree: true,
                isOpenToOpportunities: true,
                cvUrl: true,
                isCvPublic: true,
                skills: {
                  include: {
                    skill: true,
                  },
                },
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



    // Flatten the student profile data for API consistency
    const formattedRequests = requests.map(request => ({
      ...request,
      student: request.student.studentProfile ? {
        id: request.student.id,
        firstName: request.student.studentProfile.firstName,
        lastName: request.student.studentProfile.lastName,
        school: request.student.studentProfile.school,
        degree: request.student.studentProfile.degree,
        isOpenToOpportunities: request.student.studentProfile.isOpenToOpportunities,
        cvUrl: request.student.studentProfile.cvUrl,
        isCvPublic: request.student.studentProfile.isCvPublic,
        skills: request.student.studentProfile.skills.map((s: any) => s.skill.name),
      } : null,
    }));

    return reply.send({
      requests: formattedRequests,
      pagination: {
        page: 1,
        limit: formattedRequests.length,
        total: formattedRequests.length,
        totalPages: 1
      }
    });
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
            contactEmail: true,
            sector: true,
            size: true,
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

    return reply.send({
      requests,
      pagination: {
        page: 1,
        limit: requests.length,
        total: requests.length,
        totalPages: 1
      }
    });
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
            where: { id: requestId, studentId },
            include: {
                conversation: true
            }
        });

        if (!requestToUpdate) {
            return reply.code(404).send({ message: 'Request not found or you do not have permission to update it.'});
        }

        // Update adoption request status
        const updatedRequest = await prisma.adoptionRequest.update({
            where: { id: requestId },
            data: { status: status as any }
        });

        // Update conversation status based on adoption request status
        if (requestToUpdate.conversation) {
            let conversationStatus = 'ACTIVE';
            let isReadOnly = false;

            switch (status) {
                case 'ACCEPTED':
                    conversationStatus = 'ACTIVE';
                    isReadOnly = false;
                    break;
                case 'REJECTED':
                    conversationStatus = 'ARCHIVED';
                    isReadOnly = true;
                    break;
                case 'PENDING':
                    conversationStatus = 'PENDING_APPROVAL';
                    isReadOnly = false;
                    break;
                default:
                    conversationStatus = 'ACTIVE';
                    isReadOnly = false;
            }

            await prisma.conversation.update({
                where: { id: requestToUpdate.conversation.id },
                data: {
                    status: conversationStatus as any,
                    isReadOnly: isReadOnly
                }
            });
        }

        return reply.send(updatedRequest);
    } catch (error) {
        console.error('Failed to update adoption request status:', error);
        return reply.code(500).send({ message: 'Internal Server Error' });
    }
} 
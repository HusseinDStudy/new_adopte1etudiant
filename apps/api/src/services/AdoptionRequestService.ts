import { prisma } from 'db-postgres';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '../errors/AppError.js';

export interface CreateAdoptionRequestData {
  studentId: string;
  message: string;
  position?: string;
  offerId?: string; // optional: when present, tie request to a specific offer
}

export interface UpdateAdoptionRequestStatusData {
  status: 'ACCEPTED' | 'REJECTED';
}

export class AdoptionRequestService {
  async createAdoptionRequest(companyUserId: string, data: CreateAdoptionRequestData) {
    const { studentId, message, position, offerId } = data;

    // Validate input
    if (!studentId || typeof studentId !== 'string') {
      throw new ValidationError('A valid studentId is required.');
    }

    if (!message || message.trim().length === 0) {
      throw new ValidationError('A message is required to send a request.');
    }

    // Check if company profile exists
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: companyUserId },
    });

    if (!companyProfile) {
      throw new ForbiddenError('You must have a company profile to send requests.');
    }

    // Enforce uniqueness rules
    if (offerId) {
      // Offer-specific: ensure the offer belongs to the company and one request per (company, student, offer)
      const offer = await prisma.offer.findUnique({ where: { id: offerId } });
      if (!offer || offer.companyId !== companyProfile.id) {
        throw new ForbiddenError('You can only invite students for your own offers.');
      }
      const existingOfferSpecific = await prisma.adoptionRequest.findFirst({
        where: {
          companyId: companyProfile.id,
          studentId,
          offerId,
        }
      });
      if (existingOfferSpecific) {
        throw new ConflictError('You have already sent a request for this student for this offer.');
      }
    } else {
      // General: at most one general request per (company, student) with offerId null
      const existingGeneral = await prisma.adoptionRequest.findFirst({
        where: {
          companyId: companyProfile.id,
          studentId,
          offerId: null,
        }
      });
      if (existingGeneral) {
        throw new ConflictError('You have already sent a general request to this student.');
      }
    }

    // Create adoption request with conversation in transaction
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
            offerId: offerId ?? null,
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

    return newRequest;
  }

  async listSentAdoptionRequests(companyUserId: string) {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId: companyUserId },
    });

    if (!companyProfile) {
      throw new ForbiddenError('Company profile not found.');
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

    return formattedRequests;
  }

  async listMyAdoptionRequests(studentId: string) {
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

    return requests;
  }

  async updateAdoptionRequestStatus(requestId: string, studentId: string, data: UpdateAdoptionRequestStatusData) {
    const { status } = data;

    const requestToUpdate = await prisma.adoptionRequest.findFirst({
      where: { id: requestId, studentId },
      include: {
        conversation: true
      }
    });

    if (!requestToUpdate) {
      throw new NotFoundError('Request not found or you do not have permission to update it.');
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

    return updatedRequest;
  }
} 
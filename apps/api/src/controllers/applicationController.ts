import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import {
  createApplicationSchema,
  updateApplicationStatusSchema,
} from 'shared-types';
import { ApplicationService } from '../services/ApplicationService.js';

const applicationService = new ApplicationService();

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
    const newApplication = await applicationService.createApplication(studentId, { offerId });
    return reply.code(201).send(newApplication);
  } catch (error) {
    console.error('Failed to create application:', error);
    if (error instanceof Error) {
      if (error.message === 'Offer not found.') {
        return reply.code(404).send({ message: error.message });
      }
      if (error.message === 'You must have a profile to apply.') {
        return reply.code(403).send({ message: error.message });
      }
      if (error.message === 'You have already applied to this offer.') {
        return reply.code(409).send({ message: error.message });
      }
    }
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getMyApplications = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: studentId } = request.user!;

  try {
    const applications = await applicationService.getMyApplications(studentId);
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
    const updatedApplication = await applicationService.updateApplicationStatus(
      applicationId,
      companyUserId,
      { status }
    );

    // Handle conversation creation for certain statuses
    if ((status === 'HIRED' || status === 'INTERVIEW')) {
      // Check if conversation already exists
      const existingApp = await applicationService.getApplicationById(applicationId, companyUserId);
      if (!existingApp.conversationId) {
        await prisma.conversation.create({
          data: {
            application: {
              connect: { id: applicationId },
            },
          },
        });
      }
    }

    return reply.send(updatedApplication);
  } catch (error) {
    console.error('Failed to update application status:', error);
    if (error instanceof Error) {
      if (error.message === 'Application not found.') {
        return reply.code(404).send({ message: error.message });
      }
      if (error.message === 'You do not have permission to update this application.') {
        return reply.code(403).send({ message: error.message });
      }
    }
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const deleteApplication = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) => {
    const { id: applicationId } = request.params;
    const { id: studentId } = request.user!;

    try {
        await applicationService.deleteApplication(applicationId, studentId);
        return reply.code(204).send();
    } catch (error) {
        console.error('Failed to delete application:', error);
        if (error instanceof Error) {
            if (error.message === 'Application not found.') {
                return reply.code(404).send({ message: error.message });
            }
            if (error.message === 'You do not have permission to delete this application.') {
                return reply.code(403).send({ message: error.message });
            }
        }
        return reply.code(500).send({ message: 'Internal Server Error' });
    }
}
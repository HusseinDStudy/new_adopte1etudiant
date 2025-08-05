import { FastifyRequest, FastifyReply } from 'fastify';
import { updateAdoptionRequestStatusSchema } from 'shared-types';
import { AdoptionRequestService } from '../services/AdoptionRequestService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const adoptionRequestService = new AdoptionRequestService();

export const createAdoptionRequest = asyncHandler(async (
  request: FastifyRequest<{ Body: { studentId: string; message: string; position?: string } }>,
  reply: FastifyReply
) => {
  const { id: companyUserId } = request.user!;
  const { studentId, message, position } = request.body;

  const newRequest = await adoptionRequestService.createAdoptionRequest(companyUserId, {
    studentId,
    message,
    position
  });

  return reply.code(201).send(newRequest);
});

export const listSentAdoptionRequests = asyncHandler(async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: companyUserId } = request.user!;
  
  const requests = await adoptionRequestService.listSentAdoptionRequests(companyUserId);

  return reply.send({
    requests,
    pagination: {
      page: 1,
      limit: requests.length,
      total: requests.length,
      totalPages: 1
    }
  });
});

export const listMyAdoptionRequests = asyncHandler(async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const { id: studentId } = request.user!;
  
  const requests = await adoptionRequestService.listMyAdoptionRequests(studentId);

  return reply.send({
    requests,
    pagination: {
      page: 1,
      limit: requests.length,
      total: requests.length,
      totalPages: 1
    }
  });
});

export const updateAdoptionRequestStatus = asyncHandler(async (
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

    const updatedRequest = await adoptionRequestService.updateAdoptionRequestStatus(
        requestId, 
        studentId, 
        { status: status as 'ACCEPTED' | 'REJECTED' }
    );

    return reply.send(updatedRequest);
}); 
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateOfferInput, UpdateOfferInput } from 'shared-types';
import { OfferService } from '../services/OfferService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import jwt from 'jsonwebtoken';

const offerService = new OfferService();

// Helper to decode token without middleware to check for user
const decodeToken = (request: FastifyRequest) => {
  const token = request.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
  } catch (error) {
    return null;
  }
};

// List all offers (publicly accessible)
export const listOffers = asyncHandler(async (
  request: FastifyRequest<{ Querystring: { search?: string, location?: string, skills?: string, companyName?: string } }>,
  reply: FastifyReply
) => {
  const { search, location, skills, companyName } = request.query;
  const user = decodeToken(request);

  const filters = { search, location, skills, companyName };
  const offers = await offerService.listOffers(filters, user);
  return reply.send(offers);
});

export const listMyOffers = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  const offers = await offerService.listMyOffers(userId);
  return reply.send(offers);
});

export const getOfferById = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const user = decodeToken(request);

  const offer = await offerService.getOfferById(id, user);
  return reply.send(offer);
});

export const createOffer = asyncHandler(async (request: FastifyRequest<{ Body: CreateOfferInput }>, reply: FastifyReply) => {
  const userId = request.user!.id;
  const offer = await offerService.createOffer(userId, request.body);
  return reply.code(201).send(offer);
});

export const updateOffer = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateOfferInput }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = request.user!.id;

  const updatedOffer = await offerService.updateOffer(id, userId, request.body);
  return reply.send(updatedOffer);
});

export const deleteOffer = asyncHandler(async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const { id } = request.params;
  const userId = request.user!.id;

  await offerService.deleteOffer(id, userId);
  return reply.code(204).send();
});

export const getOfferApplications = asyncHandler(async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id: offerId } = request.params;
  const { id: companyUserId } = request.user!;

  const applications = await offerService.getOfferApplications(offerId, companyUserId);

  // Flatten student profile data for API consistency
  const formattedApplications = applications.map(app => ({
    ...app,
    studentId: app.studentId, // Ensure studentId is included for API contract compliance
    student: app.student.studentProfile ? {
      userId: app.student.id, // Include user ID for adoption requests
      firstName: app.student.studentProfile.firstName,
      lastName: app.student.studentProfile.lastName,
      school: app.student.studentProfile.school || null,
      degree: app.student.studentProfile.degree || null,
      skills: app.student.studentProfile.skills.map((s: any) => s.skill.name),
      cvUrl: app.student.studentProfile.cvUrl || null,
      isCvPublic: app.student.studentProfile.isCvPublic,
      isOpenToOpportunities: app.student.studentProfile.isOpenToOpportunities,
    } : null,
  }));

  return reply.send({ applications: formattedApplications });
});
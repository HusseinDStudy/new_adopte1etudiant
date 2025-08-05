import { FastifyRequest, FastifyReply } from 'fastify';
import { CompanyService } from '../services/CompanyService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const companyService = new CompanyService();

export const getCompaniesWithOffers = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const companies = await companyService.getCompaniesWithOffers();
  return reply.send(companies);
});

export const getCompanyStats = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = (request as any).user.id;
  const stats = await companyService.getCompanyStats(userId);
  return reply.send(stats);
});
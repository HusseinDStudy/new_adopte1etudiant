import { FastifyRequest, FastifyReply } from 'fastify';
import { SkillService } from '../services/SkillService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const skillService = new SkillService();

export const getAllSkills = asyncHandler(async (request: FastifyRequest, reply: FastifyReply) => {
  const skills = await skillService.getAllSkills();
  return reply.send(skills);
});
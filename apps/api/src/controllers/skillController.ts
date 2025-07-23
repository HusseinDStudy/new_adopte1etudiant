import { FastifyRequest, FastifyReply } from 'fastify';
import { SkillService } from '../services/SkillService.js';

const skillService = new SkillService();

export const getAllSkills = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const skills = await skillService.getAllSkills();
    return reply.send(skills);
  } catch (error) {
    console.error('Failed to get skills:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};
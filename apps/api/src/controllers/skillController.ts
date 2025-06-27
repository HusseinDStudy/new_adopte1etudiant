import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';

export const getAllSkills = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const skills = await prisma.skill.findMany({
      where: {
        offerSkills: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      },
      distinct: ['name']
    });
    return reply.send(skills);
  } catch (error) {
    console.error('Failed to get skills:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
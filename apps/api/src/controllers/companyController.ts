import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';

export const getCompaniesWithOffers = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const companies = await prisma.companyProfile.findMany({
      where: {
        offers: {
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
    return reply.send(companies);
  } catch (error) {
    console.error('Failed to get companies:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
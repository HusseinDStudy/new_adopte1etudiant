import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';

export const listAvailableStudents = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const students = await prisma.studentProfile.findMany({
      where: {
        isOpenToOpportunities: true,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: 'desc',
        },
      },
    });

    // We might not want to expose everything, so let's map the data
    const safeStudentData = students.map(profile => ({
        id: profile.userId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.user.email,
        school: profile.school,
        degree: profile.degree,
        skills: profile.skills.map(s => s.skill.name)
    }));
    
    return reply.send(safeStudentData);
  } catch (error) {
    console.error('Failed to list available students:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
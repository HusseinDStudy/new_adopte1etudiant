import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { Prisma } from '@prisma/client';

export const listAvailableStudents = async (
  request: FastifyRequest<{
    Querystring: { search?: string; skills?: string };
  }>,
  reply: FastifyReply
) => {
  try {
    const { search, skills } = request.query;

    const where: Prisma.StudentProfileWhereInput = {
      isOpenToOpportunities: true,
    };

    // If search term exists, add the multi-field search condition inside the main AND
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { school: { contains: search, mode: 'insensitive' } },
        { degree: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If skills exist, add a condition for each skill
    if (skills) {
      const skillsArray = skills.split(',').filter(s => s); // filter out empty strings
      if (skillsArray.length > 0) {
        where.AND = skillsArray.map(skillName => ({
          skills: {
            some: {
              skill: {
                name: {
                  equals: skillName,
                  mode: 'insensitive',
                },
              },
            },
          },
        }));
      }
    }

    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        user: {
          createdAt: 'desc',
        },
      },
    });

    const safeStudentData = students.map((profile) => ({
      id: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user.email,
      school: profile.school,
      degree: profile.degree,
      skills: profile.skills.map((s) => s.skill),
      cvUrl: profile.cvUrl,
      isCvPublic: profile.isCvPublic,
    }));

    return reply.send(safeStudentData);
  } catch (error) {
    console.error('Failed to list available students:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
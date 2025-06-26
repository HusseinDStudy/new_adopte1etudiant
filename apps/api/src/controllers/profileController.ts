import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';
import { studentProfileSchema } from 'shared-types';

export const getProfile = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { id: userId, role } = request.user!;
    let profile;

    if (role === 'STUDENT') {
      profile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
        },
      });
    } else if (role === 'COMPANY') {
      profile = await prisma.companyProfile.findUnique({ where: { userId } });
    }

    if (!profile) {
      // Return a 200 with null so the frontend knows to create one
      return reply.code(200).send(null);
    }

    return reply.send(profile);
  } catch (error) {
    console.error('Failed to get profile:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const upsertProfile = async (
  request: FastifyRequest<{ Body: StudentProfileInput | CompanyProfileInput }>,
  reply: FastifyReply
) => {
  const userId = request.user!.id;
  const role = request.user!.role;
  const data = request.body;

  try {
    let profile;
    if (role === 'STUDENT') {
      const studentData = data as StudentProfileInput;
      
      const skillOps = studentData.skills.map(skillName => 
        prisma.skill.upsert({
          where: { name: skillName },
          update: {},
          create: { name: skillName },
        })
      );
      const createdSkills = await prisma.$transaction(skillOps);

      const { firstName, lastName, school, degree, skills, isOpenToOpportunities } =
        studentProfileSchema.parse(request.body);

      profile = await prisma.studentProfile.upsert({
        where: { userId },
        update: {
          firstName,
          lastName,
          school,
          degree,
          isOpenToOpportunities,
          skills: {
            deleteMany: {},
            create: createdSkills.map(skill => ({
              skill: { connect: { id: skill.id } }
            })),
          },
        },
        create: {
          user: { connect: { id: userId } },
          firstName,
          lastName,
          school,
          degree,
          isOpenToOpportunities,
          skills: {
            create: createdSkills.map(skill => ({
              skill: { connect: { id: skill.id } }
            })),
          },
        },
        include: { skills: { include: { skill: true } } },
      });
    } else if (role === 'COMPANY') {
      const companyData = data as CompanyProfileInput;
      profile = await prisma.companyProfile.upsert({
        where: { userId },
        update: companyData,
        create: { ...companyData, userId },
      });
    }
    return reply.send(profile);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
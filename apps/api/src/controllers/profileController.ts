import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';
import { studentProfileSchema } from 'shared-types';

const normalizeSkillName = (name: string): string => {
  if (!name) return '';
  const cleanedName = name.trim().replace(/\s+/g, ' ');
  return cleanedName
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const validateSkillName = (name: string): { isValid: boolean; message?: string } => {
    const validSkillRegex = /^[a-zA-Z0-9\s\+#\.\-]*$/;
    if (validSkillRegex.test(name)) {
        return { isValid: true };
    }
    const invalidChars = [...new Set(name.replace(/[a-zA-Z0-9\s\+#\.\-]/g, ''))];
    return {
        isValid: false,
        message: `Skill name "${name}" contains invalid characters: ${invalidChars.join(', ')}. Only letters, numbers, spaces, and '+', '#', '.', '-' are allowed.`
    };
}

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
      // Validate the data first with Zod
      let validatedData;
      try {
        validatedData = studentProfileSchema.parse(request.body);
      } catch (validationError: any) {
        return reply.code(400).send({ 
          message: validationError.errors?.[0]?.message || 'Invalid input data' 
        });
      }

      const studentData = data as StudentProfileInput;
      
      if (studentData.skills) {
        for (const skillName of studentData.skills) {
          const validation = validateSkillName(skillName);
          if (!validation.isValid) {
            return reply.code(400).send({ message: validation.message });
          }
        }
      }

      const skillOps = (studentData.skills || []).map(skillName => {
        const normalizedSkillName = normalizeSkillName(skillName);
        return prisma.skill.upsert({
          where: { name: normalizedSkillName },
          update: {},
          create: { name: normalizedSkillName },
        });
      });
      const createdSkills = await prisma.$transaction(skillOps);

      const { firstName, lastName, school, degree, skills, isOpenToOpportunities, cvUrl, isCvPublic } = validatedData;

      profile = await prisma.studentProfile.upsert({
        where: { userId },
        update: {
          firstName,
          lastName,
          school,
          degree,
          isOpenToOpportunities,
          cvUrl,
          isCvPublic,
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
          cvUrl,
          isCvPublic,
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
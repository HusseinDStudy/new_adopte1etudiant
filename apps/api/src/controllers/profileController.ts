import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';
import { studentProfileSchema } from 'shared-types';
import { normalizeSkillName } from '../utils/skillNormalization.js';

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
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } else if (role === 'COMPANY') {
      profile = await prisma.companyProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    }

    if (!profile) {
      // Return a 200 with null so the frontend knows to create one
      return reply.code(200).send(null);
    }

    // Flatten the user data into the profile for API compatibility
    const { user, ...profileData } = profile;

    let flattenedProfile: any = {
      ...profileData,
      role,
      email: user?.email,
    };

    // Handle student-specific fields
    if (role === 'STUDENT' && 'skills' in profile) {
      flattenedProfile.skills = (profile.skills as any) || [];

      // Handle cvUrl - only include if it's a valid string
      if ('cvUrl' in profileData && (profileData as any).cvUrl) {
        flattenedProfile.cvUrl = (profileData as any).cvUrl;
      }

      // Remove null fields that have format constraints
      if (flattenedProfile.cvUrl === null) {
        delete flattenedProfile.cvUrl;
      }
    }

    return reply.send(flattenedProfile);
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



  if (!userId) {
    console.error('No userId found in request.user');
    return reply.code(401).send({ message: 'User not authenticated' });
  }

  try {
    if (role === 'STUDENT') {
      const validatedData = data as StudentProfileInput;
      const { firstName, lastName, school, degree, skills, isOpenToOpportunities, cvUrl, isCvPublic } = validatedData;

      // Validate skills if provided
      if (skills && skills.length > 0) {
        for (const skillName of skills) {
          const validation = validateSkillName(skillName);
          if (!validation.isValid) {
            return reply.code(400).send({ message: validation.message });
          }
        }
      }

      // Use transaction to ensure data consistency
      const profile = await prisma.$transaction(async (tx) => {
        // Create or update the student profile
        const studentProfile = await tx.studentProfile.upsert({
          where: { userId },
          update: {
            firstName,
            lastName,
            school,
            degree,
            isOpenToOpportunities,
            cvUrl,
            isCvPublic,
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
          },
        });

        // Handle skills if provided
        if (skills && skills.length > 0) {
          // Remove existing skills
          await tx.studentSkill.deleteMany({
            where: { studentProfileId: studentProfile.id },
          });

          // Create or find skills and create relationships
          for (const skillName of skills) {
            const normalizedSkillName = normalizeSkillName(skillName);
            const skill = await tx.skill.upsert({
              where: { name: normalizedSkillName },
              update: {},
              create: { name: normalizedSkillName },
            });

            await tx.studentSkill.create({
              data: {
                studentProfileId: studentProfile.id,
                skillId: skill.id,
              },
            });
          }
        } else {
          // If no skills provided, remove all existing skills
          await tx.studentSkill.deleteMany({
            where: { studentProfileId: studentProfile.id },
          });
        }

        // Return the complete profile with skills
        return await tx.studentProfile.findUnique({
          where: { id: studentProfile.id },
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });
      });

      if (!profile) {
        return reply.code(500).send({ message: 'Failed to create/update profile' });
      }

      // Flatten the user data into the profile for API compatibility
      const { user, ...profileData } = profile;
      const flattenedProfile = {
        ...profileData,
        role,
        email: user?.email,
        skills: profile.skills || [],
      };

      // Remove null fields that have format constraints
      if (flattenedProfile.cvUrl === null) {
        delete (flattenedProfile as any).cvUrl;
      }

      return reply.send(flattenedProfile);
    } else if (role === 'COMPANY') {
      const companyData = data as CompanyProfileInput;


      const profile = await prisma.companyProfile.upsert({
        where: { userId },
        update: companyData,
        create: { ...companyData, userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });



      if (!profile) {
        return reply.code(500).send({ message: 'Failed to create/update profile' });
      }

      // Flatten the user data into the profile for API compatibility
      const { user, ...profileData } = profile;
      const flattenedProfile = {
        ...profileData,
        role,
        email: user?.email,
      };

      return reply.send(flattenedProfile);
    }

    return reply.code(400).send({ message: 'Invalid role' });
  } catch (error) {
    console.error('Profile upsert error:', error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}; 
import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from 'db-postgres';
import { CreateOfferInput, UpdateOfferInput } from 'shared-types';
import { MatchScoreService } from 'core';
import jwt from 'jsonwebtoken';

const matchScoreService = new MatchScoreService();

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

// Helper to decode token without middleware to check for user
const decodeToken = (request: FastifyRequest) => {
  const token = request.cookies.token;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
  } catch (error) {
    return null;
  }
};

// List all offers (publicly accessible)
export const listOffers = async (
  request: FastifyRequest<{ Querystring: { search?: string, location?: string, skills?: string, companyName?: string } }>,
  reply: FastifyReply
) => {
  const { search, location, skills: skillsQuery, companyName } = request.query;
  const user = decodeToken(request);

  try {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (location) {
        whereClause.location = {
            contains: location,
            mode: 'insensitive',
        }
    }

    if (companyName) {
      whereClause.company = {
        name: {
          equals: companyName,
          mode: 'insensitive'
        }
      }
    }

    if (skillsQuery) {
        const skills = skillsQuery.split(',');
        whereClause.skills = {
            some: {
                name: {
                    in: skills,
                    mode: 'insensitive'
                }
            }
        }
    }

    const offers = await prisma.offer.findMany({
      where: whereClause,
      include: {
        company: true,
        skills: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { skills: { include: { skill: true } } },
      });

      if (studentProfile) {
        const studentSkills = studentProfile.skills.map((s) => s.skill.name);
        const offersWithScores = offers.map((offer) => {
          const offerSkills = offer.skills.map((s) => s.name);
          const score = matchScoreService.calculate(
            { skills: studentSkills },
            { requiredSkills: offerSkills }
          );
          return { ...offer, matchScore: score };
        });

        offersWithScores.sort((a, b) => b.matchScore - a.matchScore);
        
        return reply.send(offersWithScores);
      }
    }

    return reply.send(offers.map(o => ({...o, matchScore: 0 })));
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const listMyOffers = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!.id;
  try {
    const companyProfile = await prisma.companyProfile.findUnique({ where: { userId } });
    if (!companyProfile) {
      return reply.status(404).send({ message: 'Company profile not found.' });
    }

    const offers = await prisma.offer.findMany({
      where: { companyId: companyProfile.id },
      include: {
        skills: true,
        _count: {
          select: { applications: true },
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return reply.send(offers);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export const getOfferById = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const user = decodeToken(request);

  try {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        company: true,
        skills: true,
      },
    });
    if (!offer) {
      return reply.code(404).send({ message: 'Offer not found' });
    }

    if (user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { skills: { include: { skill: true } } },
      });

      if (studentProfile) {
        const studentSkills = studentProfile.skills.map((s) => s.skill.name);
        const offerSkills = offer.skills.map((s) => s.name);
        const score = matchScoreService.calculate(
          { skills: studentSkills },
          { requiredSkills: offerSkills }
        );
        return reply.send({ ...offer, matchScore: score });
      }
    }

    return reply.send({ ...offer, matchScore: 0 });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const createOffer = async (request: FastifyRequest<{ Body: CreateOfferInput }>, reply: FastifyReply) => {
  const userId = request.user!.id;

  try {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      return reply.code(403).send({ message: 'User does not have a company profile' });
    }

    const { title, description, location, duration, skills } = request.body;

    for (const skillName of skills) {
      const validation = validateSkillName(skillName);
      if (!validation.isValid) {
        return reply.code(400).send({ message: validation.message });
      }
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        description,
        location,
        duration,
        companyId: companyProfile.id,
        skills: {
          connectOrCreate: skills.map(skill => {
            const normalizedSkill = normalizeSkillName(skill);
            return {
              where: { name: normalizedSkill },
              create: { name: normalizedSkill },
            };
          }),
        },
      },
    });
    return reply.code(201).send(offer);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const updateOffer = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateOfferInput }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = request.user!.id;

  try {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!offer || offer.company.userId !== userId) {
      return reply.code(404).send({ message: 'Offer not found or not owned by user' });
    }

    const { title, description, location, duration, skills } = request.body;

    if (skills) {
      for (const skillName of skills) {
        const validation = validateSkillName(skillName);
        if (!validation.isValid) {
          return reply.code(400).send({ message: validation.message });
        }
      }
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        title,
        description,
        location,
        duration,
        skills: {
          set: [],
          connectOrCreate: skills?.map(skill => {
            const normalizedSkill = normalizeSkillName(skill);
            return {
              where: { name: normalizedSkill },
              create: { name: normalizedSkill },
            };
          }),
        },
      },
    });
    return reply.send(updatedOffer);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const deleteOffer = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  const { id } = request.params;
  const userId = request.user!.id;

  try {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!offer || offer.company.userId !== userId) {
      return reply.code(404).send({ message: 'Offer not found or not owned by user' });
    }

    await prisma.offer.delete({ where: { id } });
    return reply.code(204).send();
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};

export const getOfferApplications = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id: offerId } = request.params;
  const { id: companyUserId } = request.user!;

  try {
    const offer = await prisma.offer.findFirst({
      where: { id: offerId, company: { userId: companyUserId } },
    });

    if (!offer) {
      return reply.code(404).send({ message: 'Offer not found or not owned by you.' });
    }

    const applications = await prisma.application.findMany({
      where: { offerId },
      include: {
        student: {
          include: {
            studentProfile: true,
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
    });

    return reply.send(applications);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
};
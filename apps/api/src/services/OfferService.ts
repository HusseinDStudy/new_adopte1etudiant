import { prisma } from 'db-postgres';
import { CreateOfferInput, UpdateOfferInput } from 'shared-types';
import { MatchScoreService } from 'core';
import { SkillService } from './SkillService.js';
import { NotFoundError, ForbiddenError, ValidationError } from '../errors/AppError.js';

export interface OfferFilters {
  search?: string;
  location?: string;
  skills?: string;
  companyName?: string;
}

export interface UserContext {
  id: string;
  role: string;
}

export class OfferService {
  private matchScoreService: MatchScoreService;
  private skillService: SkillService;

  constructor() {
    this.matchScoreService = new MatchScoreService();
    this.skillService = new SkillService();
  }

  async listOffers(filters: OfferFilters, user?: UserContext | null) {
    const { search, location, skills: skillsQuery, companyName } = filters;
    
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
      };
    }

    if (companyName) {
      whereClause.company = {
        name: {
          equals: companyName,
          mode: 'insensitive'
        }
      };
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
      };
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

    // If user is a student, calculate match scores and sort by them
    if (user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { skills: { include: { skill: true } } },
      });

      if (studentProfile) {
        const studentSkills = studentProfile.skills.map((s) => s.skill.name);

        const offersWithScores = offers.map((offer) => {
          const offerSkills = offer.skills.map((s) => s.name);
          const score = this.matchScoreService.calculate(
            { skills: studentSkills },
            { requiredSkills: offerSkills }
          );
          return { ...offer, matchScore: score };
        });

        offersWithScores.sort((a, b) => {
          if (a.matchScore !== b.matchScore) {
            return b.matchScore - a.matchScore;
          }
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        return offersWithScores;
      }
    }

    return offers.map(offer => ({ ...offer, matchScore: 0 }));
  }

  async getOfferById(id: string, user?: UserContext | null) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        company: true,
        skills: true,
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (user?.role === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: user.id },
        include: { skills: { include: { skill: true } } },
      });

      if (studentProfile) {
        const studentSkills = studentProfile.skills.map((s) => s.skill.name);
        const offerSkills = offer.skills.map((s) => s.name);
        const score = this.matchScoreService.calculate(
          { skills: studentSkills },
          { requiredSkills: offerSkills }
        );
        return { ...offer, matchScore: score };
      }
    }

    return { ...offer, matchScore: 0 };
  }

  async listMyOffers(userId: string) {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId }
    });

    if (!companyProfile) {
      throw new NotFoundError('Company profile not found.');
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

    return offers;
  }

  async createOffer(userId: string, offerData: CreateOfferInput) {
    const companyProfile = await prisma.companyProfile.findUnique({
      where: { userId },
    });

    if (!companyProfile) {
      throw new ForbiddenError('User does not have a company profile');
    }

    const { title, description, location, duration, skills } = offerData;

    // Validate skills
    for (const skillName of skills) {
      const validation = this.skillService.validateSkillName(skillName);
      if (!validation.isValid) {
        throw new ValidationError(validation.message!);
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
            const normalizedSkill = this.skillService.normalizeSkillName(skill);
            return {
              where: { name: normalizedSkill },
              create: { name: normalizedSkill },
            };
          }),
        },
      },
    });

    return offer;
  }

  async updateOffer(id: string, userId: string, offerData: UpdateOfferInput) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!offer || offer.company.userId !== userId) {
      throw new NotFoundError('Offer not found or not owned by user');
    }

    const { title, description, location, duration, skills } = offerData;

    if (skills) {
      for (const skillName of skills) {
        const validation = this.skillService.validateSkillName(skillName);
        if (!validation.isValid) {
          throw new ValidationError(validation.message!);
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
            const normalizedSkill = this.skillService.normalizeSkillName(skill);
            return {
              where: { name: normalizedSkill },
              create: { name: normalizedSkill },
            };
          }),
        },
      },
    });

    return updatedOffer;
  }

  async deleteOffer(id: string, userId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!offer || offer.company.userId !== userId) {
      throw new NotFoundError('Offer not found or not owned by user');
    }

    await prisma.offer.delete({
      where: { id },
    });
  }

  async getOfferApplications(offerId: string, userId: string) {
    // First verify the user owns this offer
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { company: true },
    });

    if (!offer || offer.company.userId !== userId) {
      throw new NotFoundError('Offer not found or not owned by user');
    }

    const applications = await prisma.application.findMany({
      where: { offerId },
      include: {
        student: {
          include: {
            studentProfile: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
              },
            },
          },
        },
        conversation: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return applications;
  }
}

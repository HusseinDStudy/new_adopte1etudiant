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
  type?: string;
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

  async listOffers(filters: OfferFilters, user?: UserContext | null, pagination?: { page: number; limit: number; sortBy?: string }) {
    const { search, location, skills: skillsQuery, companyName, type } = filters;
    const { page = 1, limit = 9, sortBy = 'recent' } = pagination || {};

    console.log('OfferService.listOffers called with filters:', filters, 'pagination:', pagination);

    const whereClause: any = {
      isActive: true // Only show active offers to public
    };

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
          contains: companyName,
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

    if (type) {
      console.log('Adding type filter:', type);
      whereClause.duration = {
        contains: type,
        mode: 'insensitive'
      };
    }

    console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Determine orderBy based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' }; // default
    
    if (sortBy === 'location') {
      orderBy = { location: 'asc' };
    } else if (sortBy === 'recent') {
      orderBy = { createdAt: 'desc' };
    }
    // For 'relevance', we'll handle it after fetching if user is a student

    // Get offers and total count in parallel
    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where: whereClause,
        include: {
          company: true,
          skills: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.offer.count({ where: whereClause })
    ]);

    // If user is a student, calculate match scores
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
          const result = {
            id: offer.id,
            title: offer.title,
            description: offer.description,
            location: offer.location,
            duration: offer.duration,
            companyId: offer.companyId,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt,
            company: offer.company,
            skills: offerSkills,
            matchScore: score
          };
          return result;
        });

        // Apply sorting based on sortBy parameter
        if (sortBy === 'relevance') {
          offersWithScores.sort((a, b) => {
            if (a.matchScore !== b.matchScore) {
              return b.matchScore - a.matchScore;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        } else if (sortBy === 'location') {
          offersWithScores.sort((a, b) => {
            if (a.location && b.location) {
              return a.location.localeCompare(b.location);
            }
            return 0;
          });
        } else if (sortBy === 'recent') {
          offersWithScores.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        }

        const formattedOffers = offersWithScores.map(offer => ({
          ...offer,
          skills: offer.skills.map((s: any) => typeof s === 'string' ? s : s.name)
        }));

        return {
          data: formattedOffers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      } else {
        // Student doesn't have a profile yet, return offers with 0 match score
        const formattedOffers = offers.map(offer => ({
          ...offer,
          skills: offer.skills.map((s: any) => typeof s === 'string' ? s : s.name),
          matchScore: 0
        }));

        return {
          data: formattedOffers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        };
      }
    }

    // For non-student users or no user, return offers without match scores
    const formattedOffers = offers.map(offer => ({
      ...offer,
      skills: offer.skills.map((s: any) => typeof s === 'string' ? s : s.name),
      matchScore: null
    }));

    return {
      data: formattedOffers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
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

    // Check if user is the owner of the offer (company user)
    let isOwner = false;
    if (user?.role === 'COMPANY') {
      const companyProfile = await prisma.companyProfile.findUnique({
        where: { userId: user.id }
      });
      if (companyProfile && companyProfile.id === offer.companyId) {
        isOwner = true;
      }
    }

    // Only allow access to inactive offers for admin users or the offer owner
    if (!offer.isActive && user?.role !== 'ADMIN' && !isOwner) {
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
        return { ...offer, skills: offerSkills, matchScore: score };
      }
    }

    return { ...offer, skills: offer.skills.map((s) => s.name), matchScore: 0 };
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

    return offers.map(offer => ({
      ...offer,
      skills: offer.skills.map((s) => s.name)
    }));
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
      select: {
        id: true,
        studentId: true,
        offerId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
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

  async getOfferTypes() {
    // Get distinct duration values from offers (these represent offer types)
    const types = await prisma.offer.findMany({
      select: {
        duration: true,
      },
      distinct: ['duration'],
      where: {
        duration: {
          not: null,
        },
      },
      orderBy: {
        duration: 'asc',
      },
    });

    // Return array of unique duration values (offer types)
    return types
      .map(offer => offer.duration)
      .filter(duration => duration !== null && duration.trim() !== '');
  }
}

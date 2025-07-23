import { prisma } from 'db-postgres';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '../errors/AppError.js';

export interface StudentFilters {
  search?: string;
  skills?: string;
}

export class StudentService {
  async listAvailableStudents(filters: StudentFilters) {
    const { search, skills } = filters;

    const where: Prisma.StudentProfileWhereInput = {
      isOpenToOpportunities: true,
    };

    // If search term exists, add the multi-field search condition
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

    // Transform the data to a safe format for public consumption
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

    return safeStudentData;
  }

  async getStudentProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
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
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    return {
      id: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user.email,
      school: profile.school,
      degree: profile.degree,
      skills: profile.skills.map((s) => s.skill),
      cvUrl: profile.cvUrl,
      isCvPublic: profile.isCvPublic,
      isOpenToOpportunities: profile.isOpenToOpportunities,
    };
  }

  async updateStudentVisibility(userId: string, isOpenToOpportunities: boolean) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId },
      data: { isOpenToOpportunities },
    });

    return updatedProfile;
  }

  async getStudentStats(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundError('Student profile not found');
    }

    // Get application statistics
    const applicationStats = await prisma.application.groupBy({
      by: ['status'],
      where: { studentId: userId },
      _count: {
        status: true,
      },
    });

    // Get total applications count
    const totalApplications = await prisma.application.count({
      where: { studentId: userId },
    });

    // Get adoption requests count
    const adoptionRequestsCount = await prisma.adoptionRequest.count({
      where: { studentId: userId },
    });

    return {
      totalApplications,
      applicationsByStatus: applicationStats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>),
      adoptionRequestsReceived: adoptionRequestsCount,
    };
  }
}

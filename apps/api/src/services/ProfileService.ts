import { prisma } from 'db-postgres';
import { StudentProfileInput, CompanyProfileInput } from 'shared-types';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
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

export class ProfileService {
  async getProfile(userId: string, role: string) {
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
      return null;
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

    return flattenedProfile;
  }

  async upsertProfile(userId: string, role: string, profileData: StudentProfileInput | CompanyProfileInput) {
    if (role === 'STUDENT') {
      return this.upsertStudentProfile(userId, profileData as StudentProfileInput);
    } else if (role === 'COMPANY') {
      return this.upsertCompanyProfile(userId, profileData as CompanyProfileInput);
    } else {
      throw new ValidationError('Invalid role');
    }
  }

  private async upsertStudentProfile(userId: string, profileData: StudentProfileInput) {
    const { skills, ...profileFields } = profileData;

    // Validate skills if provided
    if (skills && Array.isArray(skills)) {
      for (const skillName of skills) {
        const validation = validateSkillName(skillName);
        if (!validation.isValid) {
          throw new ValidationError(validation.message!);
        }
      }
    }

    // Upsert the profile
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      update: profileFields,
      create: {
        ...profileFields,
        userId,
      },
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

    // Handle skills if provided
    if (skills && Array.isArray(skills)) {
      // Remove existing skills
      await prisma.studentSkill.deleteMany({
        where: { studentProfileId: profile.id },
      });

      // Add new skills
      for (const skillName of skills) {
        const normalizedName = normalizeSkillName(skillName);
        
        // Find or create the skill
        let skill = await prisma.skill.findFirst({
          where: { name: normalizedName },
        });

        if (!skill) {
          skill = await prisma.skill.create({
            data: { name: normalizedName },
          });
        }

        // Create the relationship
        await prisma.studentSkill.create({
          data: {
            studentProfileId: profile.id,
            skillId: skill.id,
          },
        });
      }

      // Refresh the profile with updated skills
      return await prisma.studentProfile.findUnique({
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
    }

    return profile;
  }

  private async upsertCompanyProfile(userId: string, profileData: CompanyProfileInput) {
    const profile = await prisma.companyProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        ...profileData,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return profile;
  }
} 
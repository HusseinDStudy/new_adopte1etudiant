import { prisma } from 'db-postgres';
import { normalizeSkillName } from '../utils/skillNormalization.js';

export interface SkillValidationResult {
  isValid: boolean;
  message?: string;
}

export class SkillService {
  normalizeSkillName(name: string): string {
    return normalizeSkillName(name);
  }

  validateSkillName(name: string): SkillValidationResult {
    const validSkillRegex = /^[a-zA-Z0-9\s+#.-]*$/;
    if (validSkillRegex.test(name)) {
      return { isValid: true };
    }
    const invalidChars = [...new Set(name.replace(/[a-zA-Z0-9\s+#.-]/g, ''))];
    return {
      isValid: false,
      message: `Skill name "${name}" contains invalid characters: ${invalidChars.join(', ')}. Only letters, numbers, spaces, and '+', '#', '.', '-' are allowed.`
    };
  }

  async getAllSkills() {
    const skills = await prisma.skill.findMany({
      where: {
        offerSkills: {
          some: {}
        }
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc'
      },
      distinct: ['name']
    });
    return skills;
  }

  async validateSkills(skillNames: string[]): Promise<void> {
    for (const skillName of skillNames) {
      const validation = this.validateSkillName(skillName);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }
    }
  }

  async normalizeAndCreateSkills(skillNames: string[]) {
    return skillNames.map(skill => {
      const normalizedSkill = this.normalizeSkillName(skill);
      return {
        where: { name: normalizedSkill },
        create: { name: normalizedSkill },
      };
    });
  }
}

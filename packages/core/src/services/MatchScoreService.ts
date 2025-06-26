// Example pure domain service. No infra concerns.
// Can be tested in isolation.

interface Student {
  skills: string[];
}

interface Offer {
  requiredSkills: string[];
}

export class MatchScoreService {
  public calculate(student: Student, offer: Offer): number {
    const studentSkills = new Set(student.skills);
    const offerSkills = new Set(offer.requiredSkills);

    if (offerSkills.size === 0) {
      return 100; // No specific skills required
    }

    let matchCount = 0;
    for (const skill of offerSkills) {
      if (studentSkills.has(skill)) {
        matchCount++;
      }
    }

    return Math.round((matchCount / offerSkills.size) * 100);
  }
} 
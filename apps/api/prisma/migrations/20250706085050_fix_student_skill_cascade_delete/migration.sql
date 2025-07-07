-- DropForeignKey
ALTER TABLE "StudentSkill" DROP CONSTRAINT "StudentSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "StudentSkill" DROP CONSTRAINT "StudentSkill_studentProfileId_fkey";

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `message` on the `AdoptionRequest` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `StudentProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AdoptionRequest" DROP COLUMN "message";

-- AlterTable
ALTER TABLE "StudentProfile" DROP COLUMN "createdAt";

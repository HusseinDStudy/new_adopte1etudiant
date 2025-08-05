/*
  Warnings:

  - You are about to drop the column `applicationId` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[conversationId]` on the table `AdoptionRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[conversationId]` on the table `Application` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `conversationId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_applicationId_fkey";

-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN     "conversationId" TEXT;

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "conversationId" TEXT;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "applicationId",
ADD COLUMN     "conversationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdoptionRequest_conversationId_key" ON "AdoptionRequest"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_conversationId_key" ON "Application"("conversationId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

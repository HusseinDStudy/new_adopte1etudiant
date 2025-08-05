-- Add missing columns to Conversation table

-- Create enums first
CREATE TYPE "ConversationContext" AS ENUM ('ADOPTION_REQUEST', 'OFFER', 'ADMIN_MESSAGE', 'BROADCAST');
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'EXPIRED', 'PENDING_APPROVAL');
CREATE TYPE "BroadcastTarget" AS ENUM ('ALL', 'STUDENTS', 'COMPANIES');

-- Add columns to Conversation table
ALTER TABLE "Conversation" ADD COLUMN "isReadOnly" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Conversation" ADD COLUMN "isBroadcast" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Conversation" ADD COLUMN "broadcastTarget" "BroadcastTarget";
ALTER TABLE "Conversation" ADD COLUMN "context" "ConversationContext";
ALTER TABLE "Conversation" ADD COLUMN "contextId" TEXT;
ALTER TABLE "Conversation" ADD COLUMN "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Conversation" ADD COLUMN "expiresAt" TIMESTAMP(3); 
-- CreateEnum
CREATE TYPE "BroadcastTarget" AS ENUM ('ALL', 'STUDENTS', 'COMPANIES');

-- CreateEnum
CREATE TYPE "ConversationContext" AS ENUM ('ADOPTION_REQUEST', 'OFFER', 'ADMIN_MESSAGE', 'BROADCAST');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'EXPIRED', 'PENDING_APPROVAL'); 
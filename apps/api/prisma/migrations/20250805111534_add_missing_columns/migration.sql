-- Add missing columns to match the Prisma schema

-- Add isActive column to Offer table
ALTER TABLE "Offer" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Add contentFormat column to blog_posts table
ALTER TABLE "blog_posts" ADD COLUMN "contentFormat" TEXT NOT NULL DEFAULT 'MARKDOWN'; 
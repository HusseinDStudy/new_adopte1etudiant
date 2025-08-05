-- Add contentFormat column to blog_posts table for blog management
ALTER TABLE "blog_posts" ADD COLUMN "contentFormat" TEXT NOT NULL DEFAULT 'MARKDOWN'; 
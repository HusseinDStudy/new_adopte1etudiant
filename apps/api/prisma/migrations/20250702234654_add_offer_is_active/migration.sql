-- Add isActive column to Offer table for offer management
ALTER TABLE "Offer" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true; 
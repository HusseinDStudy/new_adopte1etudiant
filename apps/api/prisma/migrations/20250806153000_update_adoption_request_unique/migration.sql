-- Drop previous unique index that prevented specific requests alongside general ones
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname = 'AdoptionRequest_companyId_studentId_key'
  ) THEN
    DROP INDEX "AdoptionRequest_companyId_studentId_key";
  END IF;
END $$;

-- Add new unique index allowing one general (offerId NULL handled in app logic)
-- and one per-offer specific request per (company, student, offer)
CREATE UNIQUE INDEX IF NOT EXISTS "AdoptionRequest_companyId_studentId_offerId_key"
ON "AdoptionRequest" ("companyId", "studentId", "offerId");



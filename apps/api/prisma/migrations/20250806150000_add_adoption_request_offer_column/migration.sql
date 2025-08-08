-- AlterTable
ALTER TABLE "AdoptionRequest" ADD COLUMN "offerId" TEXT;

-- CreateIndex
CREATE INDEX "AdoptionRequest_offerId_idx" ON "AdoptionRequest"("offerId");

-- AddForeignKey
ALTER TABLE "AdoptionRequest" ADD CONSTRAINT "AdoptionRequest_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;



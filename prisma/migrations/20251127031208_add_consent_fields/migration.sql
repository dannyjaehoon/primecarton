-- AlterTable
ALTER TABLE "User" ADD COLUMN     "marketingConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingConsentAt" TIMESTAMP(6),
ADD COLUMN     "termsAgreed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsAgreedAt" TIMESTAMP(6);

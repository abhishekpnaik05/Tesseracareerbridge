-- Add missing attempts column to AuthChallenge
ALTER TABLE "AuthChallenge" ADD COLUMN IF NOT EXISTS "attempts" INTEGER NOT NULL DEFAULT 0;

-- Drop obsolete createdAt column from DdpQuestionOption (already removed from schema)
ALTER TABLE "DdpQuestionOption" DROP COLUMN IF EXISTS "createdAt";

-- Enhance DDP model with configuration fields
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "instructions" TEXT;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "durationMinutes" INTEGER NOT NULL DEFAULT 15;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "passingScore" INTEGER NOT NULL DEFAULT 70;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 3;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "randomizeQuestions" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "randomizeOptions" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "required" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Ddp" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- Update existing DDPs to have default values
UPDATE "Ddp" SET "durationMinutes" = 15, "passingScore" = 70, "maxAttempts" = 3, "status" = 'PUBLISHED' WHERE "durationMinutes" IS NULL;

-- Enhance DdpQuestion model
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "explanation" TEXT;
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'MCQ_SINGLE';
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "points" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "difficulty" TEXT;
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DdpQuestion" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing questions to have default values
UPDATE "DdpQuestion" SET "type" = 'MCQ_SINGLE', "points" = 1, "status" = 'PUBLISHED' WHERE "type" IS NULL;

-- Create DdpQuestionOption model
CREATE TABLE IF NOT EXISTS "DdpQuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DdpQuestionOption_pkey" PRIMARY KEY ("id")
);

-- Create foreign key constraint
ALTER TABLE "DdpQuestionOption" ADD CONSTRAINT "DdpQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DdpQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "DdpQuestionOption_questionId_sortOrder_key" ON "DdpQuestionOption"("questionId", "sortOrder");

-- Update DdpAttempt model
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "enrollmentId" TEXT;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "attemptNumber" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS';
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3);
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "score" INTEGER;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "percentage" DECIMAL(5,2);
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "passed" BOOLEAN;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "timeSpent" INTEGER;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "flagData" JSONB;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "DdpAttempt" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create foreign key for enrollment
ALTER TABLE "DdpAttempt" ADD CONSTRAINT "DdpAttempt_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update existing attempts to have default values
UPDATE "DdpAttempt" SET "attemptNumber" = 1, "startedAt" = "createdAt" WHERE "attemptNumber" IS NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS "DdpAttempt_ddpId_enrollmentId_idx" ON "DdpAttempt"("ddpId", "enrollmentId");
CREATE INDEX IF NOT EXISTS "DdpAttempt_status_idx" ON "DdpAttempt"("status");

-- Update DdpAnswer model
ALTER TABLE "DdpAnswer" ADD COLUMN IF NOT EXISTS "selectedOptionIds" TEXT[];
ALTER TABLE "DdpAnswer" ADD COLUMN IF NOT EXISTS "isCorrect" BOOLEAN;
ALTER TABLE "DdpAnswer" ADD COLUMN IF NOT EXISTS "pointsAwarded" INTEGER;
ALTER TABLE "DdpAnswer" ADD COLUMN IF NOT EXISTS "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing answers to have default values
UPDATE "DdpAnswer" SET "answeredAt" = "createdAt" WHERE "answeredAt" IS NULL;

-- Add relationship to Enrollment model
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "ddpAttempts_enrollmentId" TEXT;

-- Add CurriculumStatus enum
CREATE TYPE "CurriculumStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Update Week table with new fields
ALTER TABLE "Week" ADD COLUMN "description" TEXT;
ALTER TABLE "Week" ADD COLUMN "status" "CurriculumStatus" NOT NULL DEFAULT 'DRAFT';

-- Update Day table with new fields
ALTER TABLE "Day" ADD COLUMN "description" TEXT;
ALTER TABLE "Day" ADD COLUMN "estimatedDuration" INTEGER;
ALTER TABLE "Day" ADD COLUMN "status" "CurriculumStatus" NOT NULL DEFAULT 'DRAFT';

-- Update existing weeks and days to have default status
UPDATE "Week" SET "status" = 'DRAFT' WHERE "status" IS NULL;
UPDATE "Day" SET "status" = 'DRAFT' WHERE "status" IS NULL;

-- Add StudentActivityProgress model
CREATE TABLE "StudentActivityProgress" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercent" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentActivityProgress_pkey" PRIMARY KEY ("id")
);

-- Create foreign key constraints
ALTER TABLE "StudentActivityProgress" ADD CONSTRAINT "StudentActivityProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentActivityProgress" ADD CONSTRAINT "StudentActivityProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "Progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create unique constraint and indexes
CREATE UNIQUE INDEX "StudentActivityProgress_enrollmentId_contentType_contentId_key" ON "StudentActivityProgress"("enrollmentId", "contentType", "contentId");
CREATE INDEX "StudentActivityProgress_enrollmentId_contentId_idx" ON "StudentActivityProgress"("enrollmentId", "contentId");
CREATE INDEX "StudentActivityProgress_contentType_contentId_idx" ON "StudentActivityProgress"("contentType", "contentId");

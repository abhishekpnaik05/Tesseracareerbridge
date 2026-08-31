-- Assignment System Migration

-- Create new enums
CREATE TYPE "AssignmentType" AS ENUM ('TEXT', 'FILE_UPLOAD', 'LINK');
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "AssignmentResourceType" AS ENUM ('LINK', 'PDF', 'GITHUB', 'DOC', 'OTHER');

-- Add RESUBMISSION_REQUIRED to SubmissionStatus enum
ALTER TYPE "SubmissionStatus" ADD VALUE IF NOT EXISTS 'RESUBMISSION_REQUIRED';

-- Drop Evaluation FK first so we can drop AssignmentSubmission
ALTER TABLE "Evaluation" DROP CONSTRAINT IF EXISTS "Evaluation_assignmentSubmissionId_fkey";
ALTER TABLE "Evaluation" DROP COLUMN IF EXISTS "assignmentSubmissionId";

-- Drop old AssignmentSubmission table (CASCADE handles remaining refs)
DROP TABLE IF EXISTS "AssignmentSubmission" CASCADE;

-- Expand Assignment table
ALTER TABLE "Assignment"
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "instructions" TEXT,
  ADD COLUMN IF NOT EXISTS "type" "AssignmentType" NOT NULL DEFAULT 'TEXT',
  ADD COLUMN IF NOT EXISTS "assignmentStatus" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS "maxScore" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "passingScore" INTEGER,
  ADD COLUMN IF NOT EXISTS "estimatedTime" INTEGER,
  ADD COLUMN IF NOT EXISTS "isRequired" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS "Assignment_dayId_assignmentStatus_idx" ON "Assignment"("dayId", "assignmentStatus");

-- AssignmentRequirement
CREATE TABLE "AssignmentRequirement" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AssignmentRequirement_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AssignmentRequirement_assignmentId_sortOrder_idx" ON "AssignmentRequirement"("assignmentId", "sortOrder");
ALTER TABLE "AssignmentRequirement" ADD CONSTRAINT "AssignmentRequirement_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AssignmentResource
CREATE TABLE "AssignmentResource" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT,
  "type" "AssignmentResourceType" NOT NULL DEFAULT 'LINK',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "AssignmentResource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AssignmentResource_assignmentId_sortOrder_idx" ON "AssignmentResource"("assignmentId", "sortOrder");
ALTER TABLE "AssignmentResource" ADD CONSTRAINT "AssignmentResource_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- New AssignmentSubmission (enrollment-based)
CREATE TABLE "AssignmentSubmission" (
  "id" TEXT NOT NULL,
  "assignmentId" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "attemptNumber" INTEGER NOT NULL DEFAULT 1,
  "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "textAnswer" TEXT,
  "linkUrl" TEXT,
  "fileKey" TEXT,
  "fileOriginalName" TEXT,
  "score" INTEGER,
  "feedback" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewedByMentorId" TEXT,
  "isLate" BOOLEAN NOT NULL DEFAULT false,
  "submittedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssignmentSubmission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssignmentSubmission_assignmentId_enrollmentId_attemptNumber_key" ON "AssignmentSubmission"("assignmentId", "enrollmentId", "attemptNumber");
CREATE INDEX "AssignmentSubmission_assignmentId_enrollmentId_idx" ON "AssignmentSubmission"("assignmentId", "enrollmentId");
CREATE INDEX "AssignmentSubmission_enrollmentId_status_idx" ON "AssignmentSubmission"("enrollmentId", "status");

ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignmentSubmission" ADD CONSTRAINT "AssignmentSubmission_reviewedByMentorId_fkey" FOREIGN KEY ("reviewedByMentorId") REFERENCES "MentorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DdpAttempt unique constraint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'DdpAttempt_ddpId_enrollmentId_attemptNumber_key'
  ) THEN
    ALTER TABLE "DdpAttempt" ADD CONSTRAINT "DdpAttempt_ddpId_enrollmentId_attemptNumber_key" UNIQUE ("ddpId", "enrollmentId", "attemptNumber");
  END IF;
END $$;

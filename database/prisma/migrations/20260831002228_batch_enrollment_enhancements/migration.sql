-- Add BatchStatus enum and update Batch model
CREATE TYPE "BatchStatus" AS ENUM ('DRAFT', 'UPCOMING', 'OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Add SUSPENDED to EnrollmentStatus (PostgreSQL requires recreating the enum)
-- First, drop the default value for the status column
ALTER TABLE "Enrollment" ALTER COLUMN "status" DROP DEFAULT;

-- Recreate the enum with the new value
ALTER TYPE "EnrollmentStatus" RENAME TO "EnrollmentStatus_old";
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'WITHDRAWN', 'SUSPENDED');
ALTER TABLE "Enrollment" ALTER COLUMN "status" TYPE "EnrollmentStatus" USING "status"::text::"EnrollmentStatus";
DROP TYPE "EnrollmentStatus_old";

-- Add back the default value
ALTER TABLE "Enrollment" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Update Batch table with new fields
ALTER TABLE "Batch" ADD COLUMN "slug" TEXT;
ALTER TABLE "Batch" ADD COLUMN "enrollmentOpenDate" TIMESTAMP(3);
ALTER TABLE "Batch" ADD COLUMN "enrollmentCloseDate" TIMESTAMP(3);
ALTER TABLE "Batch" ADD COLUMN "capacity" INTEGER;
ALTER TABLE "Batch" ADD COLUMN "status" "BatchStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Batch" ADD COLUMN "description" TEXT;

-- Update existing batches to have a default status
UPDATE "Batch" SET "status" = 'DRAFT' WHERE "status" IS NULL;

-- Generate slugs for existing batches
UPDATE "Batch" SET "slug" = 'batch-' || SUBSTRING(id, 1, 8) WHERE "slug" IS NULL;

-- Update Enrollment table with new fields
ALTER TABLE "Enrollment" ADD COLUMN "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Enrollment" ADD COLUMN "activatedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "Enrollment" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- Update existing enrollments to have enrolledAt
UPDATE "Enrollment" SET "enrolledAt" = "createdAt" WHERE "enrolledAt" IS NULL;

-- Create indexes for better query performance
CREATE INDEX "Batch_programId_status_idx" ON "Batch"("programId", "status");
CREATE INDEX "Batch_status_enrollmentOpenDate_enrollmentCloseDate_idx" ON "Batch"("status", "enrollmentOpenDate", "enrollmentCloseDate");
CREATE UNIQUE INDEX "Batch_slug_key" ON "Batch"("slug");
CREATE INDEX "Enrollment_userId_status_idx" ON "Enrollment"("userId", "status");
CREATE INDEX "Enrollment_batchId_status_idx" ON "Enrollment"("batchId", "status");

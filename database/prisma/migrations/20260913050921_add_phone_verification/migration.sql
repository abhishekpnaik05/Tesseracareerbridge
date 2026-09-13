/*
  Warnings:

  - You are about to drop the column `prompt` on the `Ddp` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `DdpAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `studentProfileId` on the `DdpAttempt` table. All the data in the column will be lost.
  - The `status` column on the `DdpAttempt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ddpAttempts_enrollmentId` on the `Enrollment` table. All the data in the column will be lost.
  - Made the column `enrollmentId` on table `DdpAttempt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "AuthChallengeType" ADD VALUE 'PHONE_VERIFY';

-- DropForeignKey
ALTER TABLE "DdpAttempt" DROP CONSTRAINT "DdpAttempt_studentProfileId_fkey";

-- AlterTable
ALTER TABLE "AssignmentSubmission" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Ddp" DROP COLUMN "prompt";

-- AlterTable
ALTER TABLE "DdpAnswer" DROP COLUMN "body";

-- AlterTable
ALTER TABLE "DdpAttempt" DROP COLUMN "studentProfileId",
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
ALTER COLUMN "enrollmentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DdpQuestion" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "ddpAttempts_enrollmentId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneVerifiedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "DdpAnswer_attemptId_idx" ON "DdpAnswer"("attemptId");

-- CreateIndex
CREATE INDEX "DdpAnswer_questionId_idx" ON "DdpAnswer"("questionId");

-- CreateIndex
CREATE INDEX "DdpAttempt_status_idx" ON "DdpAttempt"("status");

-- RenameIndex
ALTER INDEX "AssignmentSubmission_assignmentId_enrollmentId_attemptNumber_ke" RENAME TO "AssignmentSubmission_assignmentId_enrollmentId_attemptNumbe_key";

-- RenameIndex
ALTER INDEX "DdpQuestionOption_questionId_sortOrder_key" RENAME TO "DdpQuestionOption_questionId_sortOrder_idx";

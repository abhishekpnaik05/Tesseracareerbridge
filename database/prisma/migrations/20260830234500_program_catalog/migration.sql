-- Public program catalog fields and related tables.

CREATE TYPE "ProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

ALTER TABLE "Program" ADD COLUMN "thumbnailKey" TEXT;
ALTER TABLE "Program" ADD COLUMN "durationWeeks" INTEGER;
ALTER TABLE "Program" ADD COLUMN "durationLabel" TEXT;
ALTER TABLE "Program" ADD COLUMN "level" TEXT;
ALTER TABLE "Program" ADD COLUMN "category" TEXT;
ALTER TABLE "Program" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Program" ADD COLUMN "status" "ProgramStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Program" ADD COLUMN "availability" TEXT NOT NULL DEFAULT 'OPEN';
ALTER TABLE "Program" ADD COLUMN "audience" TEXT;
ALTER TABLE "Program" ADD COLUMN "learningApproach" TEXT;
ALTER TABLE "Program" ADD COLUMN "learningDaysPerWeek" INTEGER;
ALTER TABLE "Program" ADD COLUMN "visualTone" TEXT NOT NULL DEFAULT 'a';

UPDATE "Program" SET "status" = 'PUBLISHED' WHERE "isPublished" = true;

ALTER TABLE "Program" DROP COLUMN "isPublished";

CREATE INDEX "Program_status_featured_idx" ON "Program"("status", "featured");
CREATE INDEX "Program_category_level_idx" ON "Program"("category", "level");

CREATE TABLE "ProgramSkill" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgramSkill_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProgramSkill_programId_sortOrder_idx" ON "ProgramSkill"("programId", "sortOrder");
ALTER TABLE "ProgramSkill" ADD CONSTRAINT "ProgramSkill_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProgramOutcome" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgramOutcome_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgramOutcome" ADD CONSTRAINT "ProgramOutcome_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProgramRequirement" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgramRequirement_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgramRequirement" ADD CONSTRAINT "ProgramRequirement_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProgramBenefit" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgramBenefit_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgramBenefit" ADD CONSTRAINT "ProgramBenefit_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProgramFaq" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgramFaq_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgramFaq" ADD CONSTRAINT "ProgramFaq_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProgramProjectPreview" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT,
    "skills" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProgramProjectPreview_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "ProgramProjectPreview" ADD CONSTRAINT "ProgramProjectPreview_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

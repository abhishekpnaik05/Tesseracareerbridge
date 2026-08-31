-- Auth foundation: account fields, sessions, challenges, role profiles.

CREATE TYPE "UserStatus_new" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DISABLED');

ALTER TABLE "User" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "User" ALTER COLUMN "status" TYPE "UserStatus_new" USING (
  CASE
    WHEN status::text = 'INVITED' THEN 'PENDING_VERIFICATION'::"UserStatus_new"
    WHEN status::text = 'ACTIVE' THEN 'ACTIVE'::"UserStatus_new"
    WHEN status::text = 'SUSPENDED' THEN 'SUSPENDED'::"UserStatus_new"
    ELSE 'PENDING_VERIFICATION'::"UserStatus_new"
  END
);

DROP TYPE "UserStatus";

ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";

ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'PENDING_VERIFICATION';

ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

ALTER TABLE "AuthSession" ADD COLUMN "revokedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "AuthSession_tokenHash_key" ON "AuthSession"("tokenHash");

CREATE TYPE "AuthChallengeType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

CREATE TABLE "AuthChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AuthChallengeType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "otpHash" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AuthChallenge_tokenHash_key" ON "AuthChallenge"("tokenHash");

CREATE INDEX "AuthChallenge_userId_type_idx" ON "AuthChallenge"("userId", "type");

ALTER TABLE "AuthChallenge" ADD CONSTRAINT "AuthChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentProfile" ADD COLUMN "photoKey" TEXT;
ALTER TABLE "StudentProfile" ADD COLUMN "college" TEXT;
ALTER TABLE "StudentProfile" ADD COLUMN "graduationYear" INTEGER;
ALTER TABLE "StudentProfile" ADD COLUMN "city" TEXT;
ALTER TABLE "StudentProfile" ADD COLUMN "state" TEXT;

ALTER TABLE "MentorProfile" ADD COLUMN "phone" TEXT;
ALTER TABLE "MentorProfile" ADD COLUMN "photoKey" TEXT;
ALTER TABLE "MentorProfile" ADD COLUMN "skills" TEXT;
ALTER TABLE "MentorProfile" ADD COLUMN "experience" TEXT;
ALTER TABLE "MentorProfile" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "MentorProfile" ADD COLUMN "github" TEXT;

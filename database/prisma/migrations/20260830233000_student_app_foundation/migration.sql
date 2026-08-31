-- Student app foundation: preferences and notification metadata.

ALTER TABLE "StudentProfile" ADD COLUMN "preferences" JSONB;

ALTER TABLE "Announcement" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';

ALTER TABLE "Notification" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'ACCOUNT';
ALTER TABLE "Notification" ADD COLUMN "priority" TEXT NOT NULL DEFAULT 'NORMAL';
ALTER TABLE "Notification" ADD COLUMN "href" TEXT;

CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

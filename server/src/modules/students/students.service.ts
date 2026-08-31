import type { Prisma } from "@tesseracareerbridge/database";
import { prisma } from "@tesseracareerbridge/database";
import type {
  NotificationCategory,
  NotificationDto,
  NotificationPriority,
  StudentAccountDto,
  StudentDashboardDto,
  StudentPreferences,
  StudentProfileDto,
} from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";
import { toAuthUser } from "../auth/auth.service.js";
import { storage } from "../../storage/instance.js";

const PHONE = /^[0-9+\-\s]{10,16}$/;
const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const PHOTO_MAX = 1024 * 1024;

const DEFAULT_PREFERENCES: StudentPreferences = {
  notifyAssignments: true,
  notifyTests: true,
  notifyMentor: true,
  notifyAnnouncements: true,
  language: "en",
  appearance: "dark",
};

function asProfile(row: {
  university: string | null;
  usn: string | null;
  branch: string | null;
  semester: number | null;
  phone: string | null;
  college: string | null;
  graduationYear: number | null;
  city: string | null;
  state: string | null;
}): StudentProfileDto {
  return {
    university: row.university,
    usn: row.usn,
    branch: row.branch,
    semester: row.semester,
    phone: row.phone,
    college: row.college,
    graduationYear: row.graduationYear,
    city: row.city,
    state: row.state,
  };
}

function parsePreferences(value: Prisma.JsonValue | null | undefined): StudentPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...DEFAULT_PREFERENCES };
  const raw = value as Record<string, unknown>;
  return {
    notifyAssignments: raw.notifyAssignments !== false,
    notifyTests: raw.notifyTests !== false,
    notifyMentor: raw.notifyMentor !== false,
    notifyAnnouncements: raw.notifyAnnouncements !== false,
    language: typeof raw.language === "string" ? raw.language : "en",
    appearance: raw.appearance === "system" ? "system" : "dark",
  };
}

function completion(displayName: string, phone: string | null, profile: StudentProfileDto, hasPhoto: boolean) {
  const checks = [
    { key: "name", label: "Full name", ok: displayName.trim().length >= 2 },
    { key: "phone", label: "Phone", ok: Boolean(phone?.trim() || profile.phone?.trim()) },
    { key: "college", label: "College", ok: Boolean(profile.college?.trim()) },
    { key: "usn", label: "VTU USN", ok: Boolean(profile.usn?.trim()) },
    { key: "branch", label: "Branch", ok: Boolean(profile.branch?.trim()) },
    { key: "semester", label: "Semester", ok: Boolean(profile.semester) },
    { key: "graduationYear", label: "Graduation year", ok: Boolean(profile.graduationYear) },
    { key: "photo", label: "Profile photo", ok: hasPhoto },
  ];
  const missing = checks.filter((item) => !item.ok).map(({ key, label }) => ({ key, label }));
  return {
    percent: Math.round(((checks.length - missing.length) / checks.length) * 100),
    missing,
  };
}

async function photoUrl(photoKey: string | null) {
  if (!photoKey) return null;
  return storage.getUrl(photoKey);
}

export function toNotificationDto(row: {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
}): NotificationDto {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category as NotificationCategory,
    priority: row.priority as NotificationPriority,
    href: row.href,
    readAt: row.readAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getStudentAccount(userId: string): Promise<StudentAccountDto> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { studentProfile: true },
  });
  if (!user || user.role !== "STUDENT") {
    throw new HttpError(403, "FORBIDDEN", "You do not have access to this resource.");
  }
  let profile = user.studentProfile;
  if (!profile) {
    profile = await prisma.studentProfile.create({ data: { userId, phone: user.phone } });
  }
  const dto = asProfile(profile);
  const unreadNotificationCount = await prisma.notification.count({
    where: { userId, readAt: null },
  });
  return {
    user: toAuthUser(user),
    profile: dto,
    photoUrl: await photoUrl(profile.photoKey),
    completion: completion(user.displayName, user.phone, dto, Boolean(profile.photoKey)),
    preferences: parsePreferences(profile.preferences),
    unreadNotificationCount,
  };
}

export async function updateStudentAccount(
  userId: string,
  input: {
    displayName?: string;
    phone?: string | null;
    college?: string | null;
    university?: string | null;
    usn?: string | null;
    branch?: string | null;
    semester?: number | null;
    graduationYear?: number | null;
    city?: string | null;
    state?: string | null;
  },
) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } });
  if (!user || user.role !== "STUDENT") {
    throw new HttpError(403, "FORBIDDEN", "You do not have access to this resource.");
  }
  const displayName = input.displayName?.trim();
  if (displayName !== undefined && displayName.length < 2) {
    throw new HttpError(400, "VALIDATION", "Enter your full name.");
  }
  const phone = input.phone === undefined ? undefined : input.phone?.trim() || null;
  if (phone && !PHONE.test(phone)) throw new HttpError(400, "VALIDATION", "Enter a valid phone number.");
  const semester = input.semester;
  if (semester != null && (semester < 1 || semester > 8)) {
    throw new HttpError(400, "VALIDATION", "Enter a valid semester.");
  }
  const year = input.graduationYear;
  if (year != null && (year < 2000 || year > 2040)) {
    throw new HttpError(400, "VALIDATION", "Enter a valid graduation year.");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        ...(displayName ? { displayName } : {}),
        ...(phone !== undefined ? { phone } : {}),
      },
    }),
    prisma.studentProfile.upsert({
      where: { userId },
      update: {
        ...(phone !== undefined ? { phone } : {}),
        ...(input.college !== undefined ? { college: input.college?.trim() || null } : {}),
        ...(input.university !== undefined ? { university: input.university?.trim() || null } : {}),
        ...(input.usn !== undefined ? { usn: input.usn?.trim() || null } : {}),
        ...(input.branch !== undefined ? { branch: input.branch?.trim() || null } : {}),
        ...(semester !== undefined ? { semester } : {}),
        ...(year !== undefined ? { graduationYear: year } : {}),
        ...(input.city !== undefined ? { city: input.city?.trim() || null } : {}),
        ...(input.state !== undefined ? { state: input.state?.trim() || null } : {}),
      },
      create: {
        userId,
        phone: phone ?? user.phone,
        college: input.college?.trim() || null,
        university: input.university?.trim() || null,
        usn: input.usn?.trim() || null,
        branch: input.branch?.trim() || null,
        semester: semester ?? null,
        graduationYear: year ?? null,
        city: input.city?.trim() || null,
        state: input.state?.trim() || null,
      },
    }),
  ]);
  return getStudentAccount(userId);
}

export async function updatePreferences(userId: string, patch: Partial<StudentPreferences>) {
  const current = await getStudentAccount(userId);
  const preferences = { ...current.preferences, ...patch };
  await prisma.studentProfile.update({
    where: { userId },
    data: { preferences: preferences as Prisma.InputJsonValue },
  });
  return getStudentAccount(userId);
}

export async function savePhoto(userId: string, mimeType: string, originalName: string, data: Buffer) {
  const ext = PHOTO_TYPES[mimeType];
  if (!ext) throw new HttpError(400, "VALIDATION", "Use a JPEG, PNG, or WebP image.");
  if (data.byteLength > PHOTO_MAX) throw new HttpError(400, "VALIDATION", "Keep the photo under 1 MB.");
  const account = await getStudentAccount(userId);
  const previous = await prisma.studentProfile.findUnique({ where: { userId } });
  if (previous?.photoKey) await storage.delete(previous.photoKey);
  const key = `avatars/${userId}/${Date.now()}.${ext}`;
  await storage.put({
    key,
    mimeType,
    byteSize: data.byteLength,
    originalName,
    kind: "IMAGE",
    body: data,
  });
  await prisma.studentProfile.update({ where: { userId }, data: { photoKey: key } });
  void account;
  return getStudentAccount(userId);
}

export async function removePhoto(userId: string) {
  await getStudentAccount(userId);
  const profile = await prisma.studentProfile.findUnique({ where: { userId } });
  if (profile?.photoKey) await storage.delete(profile.photoKey);
  await prisma.studentProfile.update({ where: { userId }, data: { photoKey: null } });
  return getStudentAccount(userId);
}

export async function getDashboard(userId: string): Promise<StudentDashboardDto> {
  const account = await getStudentAccount(userId);
  const announcements = await prisma.announcement.findMany({
    where: { batchId: null },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const notificationPreview = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return {
    studentName: account.user.displayName,
    currentInternship: null,
    today: null,
    continueLearning: null,
    progress: null,
    upcoming: [],
    announcements: announcements.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      createdAt: item.createdAt.toISOString(),
      priority: (item.priority as NotificationPriority) || "NORMAL",
    })),
    notificationPreview: notificationPreview.map(toNotificationDto),
  };
}

export async function listOwnNotifications(userId: string) {
  await getStudentAccount(userId);
  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return items.map(toNotificationDto);
}

export async function markNotificationRead(userId: string, id: string) {
  const row = await prisma.notification.findFirst({ where: { id, userId } });
  if (!row) throw new HttpError(404, "NOT_FOUND", "Notification not found.");
  await prisma.notification.update({ where: { id }, data: { readAt: row.readAt ?? new Date() } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

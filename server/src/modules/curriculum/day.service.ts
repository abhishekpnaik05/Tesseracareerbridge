import { prisma } from "@tesseracareerbridge/database";
import type {
  DayDetailDto,
  LearningContentDto,
  VideoDto,
  NoteDto,
  ResourceDto,
  PracticeTaskDto,
  DdpDto,
  AssignmentDto,
  ActivityStatus,
  ContentType,
  UpdateActivityProgressRequest,
} from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";

function formatDate(date: Date | null): string {
  return date ? date.toISOString() : "";
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatReadingTime(body: string | null): number | null {
  if (!body) return null;
  const words = body.split(/\s+/).length;
  return Math.ceil(words / 200); // Average reading speed: 200 words per minute
}

async function getEnrollment(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: enrollmentId,
      userId,
    },
    include: {
      program: {
        select: {
          id: true,
          title: true,
        },
      },
      batch: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!enrollment) {
    throw new HttpError(404, "NOT_FOUND", "Enrollment not found.");
  }

  return enrollment;
}

async function getDay(dayId: string, programId: string) {
  const day = await prisma.day.findFirst({
    where: {
      id: dayId,
      week: {
        programId,
        status: "PUBLISHED",
      },
      status: "PUBLISHED",
    },
    include: {
      week: {
        select: {
          id: true,
          index: true,
          title: true,
          programId: true,
        },
      },
    },
  });

  if (!day) {
    throw new HttpError(404, "NOT_FOUND", "Day not found or not published.");
  }

  return day;
}

function calculateDayAvailability(
  dayProgress: { status: string } | null,
  previousDayCompleted: boolean,
  isFirstDay: boolean
): "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" {
  if (!dayProgress) {
    if (isFirstDay || previousDayCompleted) {
      return "AVAILABLE";
    }
    return "LOCKED";
  }

  if (dayProgress.status === "COMPLETED") {
    return "COMPLETED";
  }

  if (dayProgress.status === "IN_PROGRESS") {
    return "IN_PROGRESS";
  }

  return "AVAILABLE";
}

async function getPreviousAndNextDays(dayId: string, weekId: string, _programId: string) {
  const currentDay = await prisma.day.findUnique({
    where: { id: dayId },
    select: { index: true },
  });

  if (!currentDay) return { previousDayId: null, nextDayId: null };

  const [previousDay, nextDay] = await Promise.all([
    prisma.day.findFirst({
      where: {
        weekId,
        index: { lt: currentDay.index },
        status: "PUBLISHED",
      },
      orderBy: { index: "desc" },
      select: { id: true },
    }),
    prisma.day.findFirst({
      where: {
        weekId,
        index: { gt: currentDay.index },
        status: "PUBLISHED",
      },
      orderBy: { index: "asc" },
      select: { id: true },
    }),
  ]);

  return {
    previousDayId: previousDay?.id || null,
    nextDayId: nextDay?.id || null,
  };
}

async function getActivityProgress(
  enrollmentId: string,
  _progressId: string,
  contentType: ContentType,
  contentId: string
): Promise<{ status: ActivityStatus; progressPercent: number }> {
  const activityProgress = await prisma.studentActivityProgress.findUnique({
    where: {
      enrollmentId_contentType_contentId: {
        enrollmentId,
        contentType,
        contentId,
      },
    },
  });

  return {
    status: (activityProgress?.status as ActivityStatus) || "NOT_STARTED",
    progressPercent: activityProgress?.progressPercent || 0,
  };
}

async function buildLearningContent(
  dayId: string,
  enrollmentId: string,
  progressId: string
): Promise<LearningContentDto[]> {
  const content: LearningContentDto[] = [];

  // Videos
  const videos = await prisma.video.findMany({
    where: { dayId },
    orderBy: { sortOrder: "asc" },
  });

  for (const video of videos) {
    const progress = await getActivityProgress(enrollmentId, progressId, "VIDEO", video.id);
    content.push({
      id: video.id,
      title: video.title,
      description: null,
      type: "VIDEO",
      order: video.sortOrder,
      duration: video.durationSeconds || null,
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: true,
      contentId: video.id,
    });
  }

  // Lessons
  const lessons = await prisma.lesson.findMany({
    where: { dayId },
    orderBy: { sortOrder: "asc" },
  });

  for (const lesson of lessons) {
    const progress = await getActivityProgress(enrollmentId, progressId, "LESSON", lesson.id);
    content.push({
      id: lesson.id,
      title: lesson.title,
      description: lesson.body,
      type: "LESSON",
      order: lesson.sortOrder,
      duration: null,
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: true,
      contentId: lesson.id,
    });
  }

  // Notes
  const notes = await prisma.note.findMany({
    where: { dayId },
    orderBy: { sortOrder: "asc" },
  });

  for (const note of notes) {
    const progress = await getActivityProgress(enrollmentId, progressId, "NOTE", note.id);
    content.push({
      id: note.id,
      title: note.title,
      description: note.body,
      type: "NOTE",
      order: note.sortOrder,
      duration: formatReadingTime(note.body),
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: true,
      contentId: note.id,
    });
  }

  // Resources
  const resources = await prisma.resource.findMany({
    where: { dayId },
    orderBy: { sortOrder: "asc" },
  });

  for (const resource of resources) {
    const progress = await getActivityProgress(enrollmentId, progressId, "RESOURCE", resource.id);
    content.push({
      id: resource.id,
      title: resource.title,
      description: null,
      type: "RESOURCE",
      order: resource.sortOrder,
      duration: null,
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: false,
      contentId: resource.id,
    });
  }

  // Practice Tasks
  const practiceTasks = await prisma.practiceTask.findMany({
    where: { dayId },
    orderBy: { sortOrder: "asc" },
  });

  for (const practice of practiceTasks) {
    const progress = await getActivityProgress(enrollmentId, progressId, "PRACTICE", practice.id);
    content.push({
      id: practice.id,
      title: practice.title,
      description: practice.instructions,
      type: "PRACTICE",
      order: practice.sortOrder,
      duration: null,
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: true,
      contentId: practice.id,
    });
  }

  // DDPs
  const ddps = await prisma.ddp.findMany({
    where: { dayId },
    orderBy: { createdAt: "asc" },
  });

  for (const ddp of ddps) {
    const progress = await getActivityProgress(enrollmentId, progressId, "DDP", ddp.id);
    content.push({
      id: ddp.id,
      title: ddp.title,
      description: ddp.description,
      type: "DDP",
      order: 0,
      duration: null,
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: true,
      contentId: ddp.id,
    });
  }

  // Assignments (only PUBLISHED ones visible to students)
  const assignments = await prisma.assignment.findMany({
    where: { dayId, assignmentStatus: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
  });

  for (const assignment of assignments) {
    const progress = await getActivityProgress(enrollmentId, progressId, "ASSIGNMENT", assignment.id);
    content.push({
      id: assignment.id,
      title: assignment.title,
      description: assignment.brief,
      type: "ASSIGNMENT",
      order: 100, // Assignments always appear last
      duration: assignment.estimatedTime,
      status: progress.status,
      progressPercent: progress.progressPercent,
      isRequired: assignment.isRequired,
      contentId: assignment.id,
    });
  }

  // Sort by order
  return content.sort((a, b) => a.order - b.order);
}

export async function getDayDetail(
  enrollmentId: string,
  dayId: string,
  userId: string
): Promise<DayDetailDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  const day = await getDay(dayId, enrollment.programId);

  // Get or create day progress
  let dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  if (!dayProgress) {
    dayProgress = await prisma.progress.create({
      data: {
        enrollmentId,
        dayId,
        status: "NOT_STARTED",
      },
    });
  }

  // Check availability
  const weekDays = await prisma.day.findMany({
    where: {
      weekId: day.weekId,
      status: "PUBLISHED",
    },
    orderBy: { index: "asc" },
  });

  const dayIndex = weekDays.findIndex((d) => d.id === dayId);
  const isFirstDay = dayIndex === 0;
  const previousDay = dayIndex > 0 ? weekDays[dayIndex - 1] : null;

  const previousDayProgress = previousDay
    ? await prisma.progress.findUnique({
        where: {
          enrollmentId_dayId: {
            enrollmentId,
            dayId: previousDay.id,
          },
        },
      })
    : null;

  const previousDayCompleted = previousDayProgress?.status === "COMPLETED";
  const availability = calculateDayAvailability(dayProgress, previousDayCompleted, isFirstDay);

  if (availability === "LOCKED") {
    throw new HttpError(403, "FORBIDDEN", "This day is not available yet. Complete the previous day to unlock it.");
  }

  // Get learning content
  const content = await buildLearningContent(dayId, enrollmentId, dayProgress.id);

  // Calculate progress
  const totalActivities = content.length;
  const completedActivities = content.filter((c) => c.status === "COMPLETED").length;
  const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  // Get previous and next days
  const { previousDayId, nextDayId } = await getPreviousAndNextDays(dayId, day.weekId, enrollment.programId);

  // Parse objectives
  const objectives = day.objective ? day.objective.split('\n').filter((o) => o.trim()) : [];

  return {
    id: day.id,
    dayNumber: day.index + 1,
    title: day.title,
    description: day.description,
    objective: day.objective,
    objectives,
    estimatedDuration: day.estimatedDuration,
    week: {
      id: day.week.id,
      weekNumber: day.week.index + 1,
      title: day.week.title,
    },
    program: {
      id: enrollment.program.id,
      title: enrollment.program.title,
    },
    availability,
    status: dayProgress.status as ActivityStatus,
    progress,
    content,
    totalActivities,
    completedActivities,
    previousDayId,
    nextDayId,
  };
}

export async function getVideoDetail(
  enrollmentId: string,
  dayId: string,
  videoId: string,
  userId: string
): Promise<VideoDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const video = await prisma.video.findFirst({
    where: {
      id: videoId,
      dayId,
    },
    include: {
      storageObject: true,
    },
  });

  if (!video) {
    throw new HttpError(404, "NOT_FOUND", "Video not found.");
  }

  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  const activityProgress = await getActivityProgress(enrollmentId, dayProgress?.id || "", "VIDEO", videoId);

  return {
    id: video.id,
    title: video.title,
    storageObjectId: video.storageObjectId,
    storageUrl: video.storageObject?.key || null,
    durationSeconds: video.durationSeconds,
    duration: formatDuration(video.durationSeconds),
    progress: activityProgress.progressPercent,
    lastPosition: (activityProgress as any)?.metadata?.lastPosition || null,
    status: activityProgress.status,
  };
}

export async function getNoteDetail(
  enrollmentId: string,
  dayId: string,
  noteId: string,
  userId: string
): Promise<NoteDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      dayId,
    },
  });

  if (!note) {
    throw new HttpError(404, "NOT_FOUND", "Note not found.");
  }

  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  const activityProgress = await getActivityProgress(enrollmentId, dayProgress?.id || "", "NOTE", noteId);

  return {
    id: note.id,
    title: note.title,
    body: note.body,
    readingTime: formatReadingTime(note.body),
    status: activityProgress.status,
  };
}

export async function getResourceDetail(
  enrollmentId: string,
  dayId: string,
  resourceId: string,
  userId: string
): Promise<ResourceDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const resource = await prisma.resource.findFirst({
    where: {
      id: resourceId,
      dayId,
    },
    include: {
      storageObject: true,
    },
  });

  if (!resource) {
    throw new HttpError(404, "NOT_FOUND", "Resource not found.");
  }

  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  const activityProgress = await getActivityProgress(enrollmentId, dayProgress?.id || "", "RESOURCE", resourceId);

  return {
    id: resource.id,
    title: resource.title,
    storageObjectId: resource.storageObjectId,
    storageUrl: resource.storageObject?.key || null,
    type: resource.storageObject?.kind || "DOCUMENT",
    description: null,
    status: activityProgress.status,
  };
}

export async function getPracticeTaskDetail(
  enrollmentId: string,
  dayId: string,
  practiceId: string,
  userId: string
): Promise<PracticeTaskDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const practice = await prisma.practiceTask.findFirst({
    where: {
      id: practiceId,
      dayId,
    },
  });

  if (!practice) {
    throw new HttpError(404, "NOT_FOUND", "Practice task not found.");
  }

  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  const activityProgress = await getActivityProgress(enrollmentId, dayProgress?.id || "", "PRACTICE", practiceId);

  return {
    id: practice.id,
    title: practice.title,
    instructions: practice.instructions,
    status: activityProgress.status,
  };
}

export async function getDdpDetail(
  enrollmentId: string,
  dayId: string,
  ddpId: string,
  userId: string
): Promise<DdpDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const ddp = await prisma.ddp.findFirst({
    where: {
      id: ddpId,
      dayId,
    },
    include: {
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  const activityProgress = await getActivityProgress(enrollmentId, dayProgress?.id || "", "DDP", ddpId);

  // Count attempts for this student
  const attemptCount = await prisma.ddpAttempt.count({
    where: {
      ddpId,
      enrollmentId,
    },
  });

  return {
    id: ddp.id,
    title: ddp.title,
    prompt: ddp.description,
    questionCount: ddp._count.questions,
    estimatedTime: ddp.durationMinutes ?? null,
    status: activityProgress.status,
    attemptCount,
  };
}

export async function getAssignmentDetail(
  enrollmentId: string,
  dayId: string,
  assignmentId: string,
  userId: string
): Promise<AssignmentDto> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, dayId },
  });

  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  const dayProgress = await prisma.progress.findUnique({
    where: { enrollmentId_dayId: { enrollmentId, dayId } },
  });

  const activityProgress = await getActivityProgress(enrollmentId, dayProgress?.id || "", "ASSIGNMENT", assignmentId);

  const latestSubmission = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, enrollmentId },
    orderBy: { attemptNumber: "desc" },
  });

  return {
    id: assignment.id,
    title: assignment.title,
    brief: assignment.brief,
    type: assignment.type as any,
    assignmentStatus: assignment.assignmentStatus as any,
    dueAt: assignment.dueAt ? formatDate(assignment.dueAt) : null,
    estimatedTime: assignment.estimatedTime,
    isRequired: assignment.isRequired,
    maxAttempts: assignment.maxAttempts,
    status: activityProgress.status,
    submissionStatus: (latestSubmission?.status as any) || null,
  };
}


export async function updateActivityProgress(
  enrollmentId: string,
  dayId: string,
  request: UpdateActivityProgressRequest,
  userId: string
): Promise<void> {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);

  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

  if (!dayProgress) {
    throw new HttpError(404, "NOT_FOUND", "Day progress not found.");
  }

  // Update or create activity progress
  await prisma.studentActivityProgress.upsert({
    where: {
      enrollmentId_contentType_contentId: {
        enrollmentId,
        contentType: request.contentType,
        contentId: request.contentId,
      },
    },
    update: {
      status: request.status,
      progressPercent: request.progressPercent || 0,
      lastAccessedAt: new Date(),
      completedAt: request.status === "COMPLETED" ? new Date() : null,
      startedAt: request.status === "IN_PROGRESS" ? new Date() : undefined,
    },
    create: {
      enrollmentId,
      progressId: dayProgress.id,
      contentType: request.contentType,
      contentId: request.contentId,
      status: request.status,
      progressPercent: request.progressPercent || 0,
      lastAccessedAt: new Date(),
      completedAt: request.status === "COMPLETED" ? new Date() : null,
      startedAt: request.status === "IN_PROGRESS" ? new Date() : undefined,
    },
  });

  // Recalculate day progress
  const content = await buildLearningContent(dayId, enrollmentId, dayProgress.id);
  const totalActivities = content.length;
  const completedActivities = content.filter((c) => c.status === "COMPLETED").length;
  const newProgress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

  // Update day progress status
  let newDayStatus = dayProgress.status;
  if (newProgress === 100 && dayProgress.status !== "COMPLETED") {
    newDayStatus = "COMPLETED";
  } else if (newProgress > 0 && dayProgress.status === "NOT_STARTED") {
    newDayStatus = "IN_PROGRESS";
  }

  await prisma.progress.update({
    where: { id: dayProgress.id },
    data: {
      status: newDayStatus,
      completedAt: newDayStatus === "COMPLETED" ? new Date() : null,
    },
  });
}

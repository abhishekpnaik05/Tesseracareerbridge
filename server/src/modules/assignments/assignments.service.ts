import { prisma } from "@tesseracareerbridge/database";
import type {
  AssignmentDetailDto,
  AssignmentDto,
  AssignmentSubmissionDto,
  SaveDraftRequest,
  SubmitAssignmentRequest,
} from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

async function getEnrollmentWithOwnership(enrollmentId: string, userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: { id: enrollmentId, userId },
    include: {
      program: { select: { id: true, title: true } },
    },
  });
  if (!enrollment) {
    throw new HttpError(404, "NOT_FOUND", "Enrollment not found.");
  }
  if (enrollment.status !== "ACTIVE") {
    throw new HttpError(403, "FORBIDDEN", "Your enrollment is not active.");
  }
  return enrollment;
}

async function getPublishedAssignment(assignmentId: string, programId: string) {
  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, programId, assignmentStatus: "PUBLISHED" },
    include: {
      requirements: { orderBy: { sortOrder: "asc" } },
      resources: { orderBy: { sortOrder: "asc" } },
      day: { select: { id: true, index: true, title: true } },
    },
  });
  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found or not published.");
  }
  return assignment;
}

function mapSubmission(sub: any, maxScore: number): AssignmentSubmissionDto {
  return {
    id: sub.id,
    assignmentId: sub.assignmentId,
    enrollmentId: sub.enrollmentId,
    attemptNumber: sub.attemptNumber,
    status: sub.status,
    textAnswer: sub.textAnswer,
    linkUrl: sub.linkUrl,
    fileKey: sub.fileKey,
    fileOriginalName: sub.fileOriginalName,
    score: sub.score,
    maxScore,
    feedback: sub.feedback,
    reviewedAt: formatDate(sub.reviewedAt),
    reviewedByName: sub.reviewedByMentor?.user?.displayName ?? null,
    isLate: sub.isLate,
    submittedAt: formatDate(sub.submittedAt),
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  };
}

const MENTOR_INCLUDE = {
  reviewedByMentor: { select: { user: { select: { displayName: true } } } },
} as const;

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getAssignmentDetail(
  assignmentId: string,
  enrollmentId: string,
  userId: string
): Promise<AssignmentDetailDto> {
  const enrollment = await getEnrollmentWithOwnership(enrollmentId, userId);
  const assignment = await getPublishedAssignment(assignmentId, enrollment.programId);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId, enrollmentId },
    include: MENTOR_INCLUDE,
    orderBy: { attemptNumber: "asc" },
  });

  const attemptCount = submissions.length;
  const latestSubmission = submissions[submissions.length - 1] ?? null;
  const latestStatus = latestSubmission?.status ?? null;

  const activityProgress = assignment.dayId
    ? await prisma.studentActivityProgress.findUnique({
        where: {
          enrollmentId_contentType_contentId: {
            enrollmentId,
            contentType: "ASSIGNMENT",
            contentId: assignmentId,
          },
        },
      })
    : null;

  const isDeadlinePassed = assignment.dueAt ? new Date() > assignment.dueAt : false;
  const maxAttempts = assignment.maxAttempts;
  const canSubmit =
    !isDeadlinePassed &&
    attemptCount < maxAttempts &&
    (latestStatus === null || latestStatus === "DRAFT");
  const canResubmit =
    !isDeadlinePassed &&
    attemptCount < maxAttempts &&
    latestStatus === "RESUBMISSION_REQUIRED";

  return {
    id: assignment.id,
    dayId: assignment.dayId,
    dayNumber: assignment.day ? assignment.day.index + 1 : null,
    dayTitle: assignment.day?.title ?? null,
    programId: enrollment.programId,
    programTitle: enrollment.program.title,
    title: assignment.title,
    brief: assignment.brief,
    description: assignment.description,
    instructions: assignment.instructions,
    type: assignment.type as any,
    assignmentStatus: assignment.assignmentStatus as any,
    maxScore: assignment.maxScore,
    passingScore: assignment.passingScore,
    estimatedTime: assignment.estimatedTime,
    isRequired: assignment.isRequired,
    maxAttempts,
    dueAt: formatDate(assignment.dueAt),
    requirements: assignment.requirements.map((r) => ({
      id: r.id,
      body: r.body,
      sortOrder: r.sortOrder,
    })),
    resources: assignment.resources.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      type: r.type as any,
      sortOrder: r.sortOrder,
    })),
    activityStatus: (activityProgress?.status as any) ?? "NOT_STARTED",
    currentSubmission: latestSubmission
      ? mapSubmission(latestSubmission, assignment.maxScore)
      : null,
    submissionHistory: submissions.map((s) => mapSubmission(s, assignment.maxScore)),
    attemptCount,
    canSubmit,
    canResubmit,
  };
}

export async function saveDraft(
  assignmentId: string,
  userId: string,
  body: SaveDraftRequest
): Promise<AssignmentSubmissionDto> {
  const { enrollmentId } = body;
  const enrollment = await getEnrollmentWithOwnership(enrollmentId, userId);
  const assignment = await getPublishedAssignment(assignmentId, enrollment.programId);

  if (assignment.type === "TEXT" && body.textAnswer && body.textAnswer.length > 20000) {
    throw new HttpError(400, "VALIDATION", "Text answer exceeds the maximum length.");
  }
  if (assignment.type === "LINK" && body.linkUrl && body.linkUrl.trim()) {
    try {
      const url = new URL(body.linkUrl);
      if (!["https:", "http:"].includes(url.protocol)) {
        throw new HttpError(400, "VALIDATION", "Only http/https URLs are allowed.");
      }
    } catch {
      throw new HttpError(400, "VALIDATION", "Invalid URL format.");
    }
  }

  const existingDraft = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, enrollmentId, status: "DRAFT" },
  });

  let submission;
  if (existingDraft) {
    submission = await prisma.assignmentSubmission.update({
      where: { id: existingDraft.id },
      data: {
        textAnswer: body.textAnswer ?? existingDraft.textAnswer,
        linkUrl: body.linkUrl ?? existingDraft.linkUrl,
      },
      include: MENTOR_INCLUDE,
    });
  } else {
    const totalAttempts = await prisma.assignmentSubmission.count({
      where: { assignmentId, enrollmentId },
    });
    if (totalAttempts >= assignment.maxAttempts) {
      throw new HttpError(400, "ATTEMPT_LIMIT", "Maximum submission attempts reached.");
    }
    submission = await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        enrollmentId,
        attemptNumber: totalAttempts + 1,
        status: "DRAFT",
        textAnswer: body.textAnswer,
        linkUrl: body.linkUrl,
      },
      include: MENTOR_INCLUDE,
    });
  }

  return mapSubmission(submission, assignment.maxScore);
}

export async function submitAssignment(
  assignmentId: string,
  userId: string,
  body: SubmitAssignmentRequest
): Promise<AssignmentSubmissionDto> {
  const { enrollmentId } = body;
  const enrollment = await getEnrollmentWithOwnership(enrollmentId, userId);
  const assignment = await getPublishedAssignment(assignmentId, enrollment.programId);

  const isDeadlinePassed = assignment.dueAt ? new Date() > assignment.dueAt : false;
  if (isDeadlinePassed) {
    throw new HttpError(400, "DEADLINE_PASSED", "The submission deadline has passed.");
  }

  if (assignment.type === "TEXT") {
    if (!body.textAnswer?.trim()) {
      throw new HttpError(400, "VALIDATION", "Text answer is required for this assignment.");
    }
    if (body.textAnswer.length > 20000) {
      throw new HttpError(400, "VALIDATION", "Text answer exceeds the maximum length of 20,000 characters.");
    }
  }
  if (assignment.type === "LINK") {
    if (!body.linkUrl?.trim()) {
      throw new HttpError(400, "VALIDATION", "A URL is required for this assignment.");
    }
    try {
      const url = new URL(body.linkUrl);
      if (!["https:", "http:"].includes(url.protocol)) {
        throw new HttpError(400, "VALIDATION", "Only http/https URLs are allowed.");
      }
    } catch {
      throw new HttpError(400, "VALIDATION", "Invalid URL format. Please enter a valid https:// URL.");
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const existingSubmissions = await tx.assignmentSubmission.findMany({
      where: { assignmentId, enrollmentId },
      orderBy: { attemptNumber: "asc" },
    });

    const existingDraft = existingSubmissions.find((s) => s.status === "DRAFT");
    const nonDraftSubmissions = existingSubmissions.filter((s) => s.status !== "DRAFT");
    const latestNonDraft = nonDraftSubmissions[nonDraftSubmissions.length - 1] ?? null;
    const totalAttempts = existingSubmissions.length;

    if (latestNonDraft && latestNonDraft.status !== "RESUBMISSION_REQUIRED") {
      throw new HttpError(400, "ALREADY_SUBMITTED", "You have already submitted this assignment.");
    }
    if (nonDraftSubmissions.length >= assignment.maxAttempts) {
      throw new HttpError(400, "ATTEMPT_LIMIT", "Maximum submission attempts reached.");
    }

    let submission;
    if (existingDraft) {
      submission = await tx.assignmentSubmission.update({
        where: { id: existingDraft.id },
        data: {
          status: "SUBMITTED",
          textAnswer: body.textAnswer ?? existingDraft.textAnswer,
          linkUrl: body.linkUrl ?? existingDraft.linkUrl,
          submittedAt: new Date(),
          isLate: false,
        },
        include: MENTOR_INCLUDE,
      });
    } else {
      if (totalAttempts >= assignment.maxAttempts) {
        throw new HttpError(400, "ATTEMPT_LIMIT", "Maximum submission attempts reached.");
      }
      submission = await tx.assignmentSubmission.create({
        data: {
          assignmentId,
          enrollmentId,
          attemptNumber: totalAttempts + 1,
          status: "SUBMITTED",
          textAnswer: body.textAnswer,
          linkUrl: body.linkUrl,
          submittedAt: new Date(),
          isLate: false,
        },
        include: MENTOR_INCLUDE,
      });
    }

    // Update activity progress to COMPLETED on submit
    if (assignment.dayId) {
      const dayProgress = await tx.progress.findUnique({
        where: { enrollmentId_dayId: { enrollmentId, dayId: assignment.dayId! } },
      });
      if (dayProgress) {
        await tx.studentActivityProgress.upsert({
          where: {
            enrollmentId_contentType_contentId: {
              enrollmentId,
              contentType: "ASSIGNMENT",
              contentId: assignmentId,
            },
          },
          update: { status: "COMPLETED", progressPercent: 100, completedAt: new Date(), lastAccessedAt: new Date() },
          create: {
            enrollmentId,
            progressId: dayProgress.id,
            contentType: "ASSIGNMENT",
            contentId: assignmentId,
            status: "COMPLETED",
            progressPercent: 100,
            completedAt: new Date(),
            lastAccessedAt: new Date(),
            startedAt: new Date(),
          },
        });
      }
    }

    return submission;
  });

  return mapSubmission(result, assignment.maxScore);
}

export async function getMySubmission(
  assignmentId: string,
  enrollmentId: string,
  userId: string
): Promise<AssignmentSubmissionDto | null> {
  const enrollment = await getEnrollmentWithOwnership(enrollmentId, userId);
  const assignment = await getPublishedAssignment(assignmentId, enrollment.programId);

  const submission = await prisma.assignmentSubmission.findFirst({
    where: { assignmentId, enrollmentId },
    include: MENTOR_INCLUDE,
    orderBy: { attemptNumber: "desc" },
  });

  return submission ? mapSubmission(submission, assignment.maxScore) : null;
}

export async function getSubmissionHistory(
  assignmentId: string,
  enrollmentId: string,
  userId: string
): Promise<AssignmentSubmissionDto[]> {
  const enrollment = await getEnrollmentWithOwnership(enrollmentId, userId);
  const assignment = await getPublishedAssignment(assignmentId, enrollment.programId);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId, enrollmentId },
    include: MENTOR_INCLUDE,
    orderBy: { attemptNumber: "asc" },
  });

  return submissions.map((s) => mapSubmission(s, assignment.maxScore));
}

// For Day page card (minimal)
export async function getAssignmentCardDto(
  assignmentId: string,
  dayId: string,
  enrollmentId: string,
  userId: string
): Promise<AssignmentDto> {
  const enrollment = await getEnrollmentWithOwnership(enrollmentId, userId);

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, dayId, programId: enrollment.programId },
  });
  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  const activityProgress = await prisma.studentActivityProgress.findUnique({
    where: {
      enrollmentId_contentType_contentId: {
        enrollmentId,
        contentType: "ASSIGNMENT",
        contentId: assignmentId,
      },
    },
  });

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
    dueAt: formatDate(assignment.dueAt),
    estimatedTime: assignment.estimatedTime,
    isRequired: assignment.isRequired,
    maxAttempts: assignment.maxAttempts,
    status: (activityProgress?.status as any) ?? "NOT_STARTED",
    submissionStatus: (latestSubmission?.status as any) ?? null,
  };
}

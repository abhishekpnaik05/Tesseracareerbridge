import { prisma } from "@tesseracareerbridge/database";
import type { EnrollmentDto, EnrollmentListResponse } from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";

function formatDate(date: Date | null): string {
  return date ? date.toISOString() : "";
}

export async function createEnrollment(userId: string, batchId: string): Promise<EnrollmentDto> {
  return await prisma.$transaction(async (tx) => {
    // Validate batch exists and is enrollable
    const batch = await tx.batch.findFirst({
      where: {
        id: batchId,
        status: { in: ["OPEN", "UPCOMING"] },
      },
      include: {
        program: { select: { id: true, title: true, status: true } },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!batch) {
      throw new HttpError(404, "NOT_FOUND", "Batch not found or not available for enrollment.");
    }

    if (batch.program.status !== "PUBLISHED") {
      throw new HttpError(400, "VALIDATION", "Program is not available for enrollment.");
    }

    // Check enrollment window
    const now = new Date();
    if (batch.enrollmentOpenDate && now < batch.enrollmentOpenDate) {
      throw new HttpError(400, "VALIDATION", "Enrollment has not opened yet.");
    }

    if (batch.enrollmentCloseDate && now > batch.enrollmentCloseDate) {
      throw new HttpError(400, "VALIDATION", "Enrollment period has closed.");
    }

    // Check capacity
    if (batch.capacity && batch._count.enrollments >= batch.capacity) {
      throw new HttpError(400, "VALIDATION", "Batch is full.");
    }

    // Check for duplicate enrollment
    const existingEnrollment = await tx.enrollment.findFirst({
      where: {
        userId,
        batchId,
        status: { in: ["PENDING", "ACTIVE"] },
      },
    });

    if (existingEnrollment) {
      throw new HttpError(400, "VALIDATION", "You are already enrolled in this batch.");
    }

    // Create enrollment
    const enrollment = await tx.enrollment.create({
      data: {
        userId,
        programId: batch.program.id,
        batchId,
        status: "PENDING",
        enrolledAt: new Date(),
      },
      include: {
        batch: true,
        program: true,
      },
    });

    // If no payment required, activate immediately
    // (Payment integration will be added in Prompt 22)
    const updatedEnrollment = await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "ACTIVE",
        activatedAt: new Date(),
      },
    });

    return {
      id: updatedEnrollment.id,
      userId: updatedEnrollment.userId,
      programId: updatedEnrollment.programId,
      programTitle: batch.program.title,
      batchId: updatedEnrollment.batchId,
      batchName: batch.name,
      status: updatedEnrollment.status,
      enrolledAt: formatDate(updatedEnrollment.enrolledAt),
      activatedAt: formatDate(updatedEnrollment.activatedAt),
      completedAt: formatDate(updatedEnrollment.completedAt),
      cancelledAt: formatDate(updatedEnrollment.cancelledAt),
      progressPercent: 0,
      currentDay: null,
      totalDays: null,
    };
  });
}

export async function listUserEnrollments(userId: string): Promise<EnrollmentListResponse> {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      batch: { select: { name: true } },
      program: { select: { title: true, durationWeeks: true } },
      _count: {
        select: { progress: true },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const total = await prisma.enrollment.count({ where: { userId } });

  return {
    items: enrollments.map((enrollment) => {
      const totalDays = enrollment.program.durationWeeks ? enrollment.program.durationWeeks * 5 : null;
      const completedDays = enrollment._count.progress;
      const progressPercent = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

      return {
        id: enrollment.id,
        userId: enrollment.userId,
        programId: enrollment.programId,
        programTitle: enrollment.program.title,
        batchId: enrollment.batchId,
        batchName: enrollment.batch.name,
        status: enrollment.status,
        enrolledAt: formatDate(enrollment.enrolledAt),
        activatedAt: formatDate(enrollment.activatedAt),
        completedAt: formatDate(enrollment.completedAt),
        cancelledAt: formatDate(enrollment.cancelledAt),
        progressPercent,
        currentDay: completedDays > 0 ? completedDays : null,
        totalDays,
      };
    }),
    total,
  };
}

export async function getEnrollment(id: string, userId: string): Promise<EnrollmentDto> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id,
      userId,
    },
    include: {
      batch: { select: { name: true } },
      program: { select: { title: true, durationWeeks: true } },
      _count: {
        select: { progress: true },
      },
    },
  });

  if (!enrollment) {
    throw new HttpError(404, "NOT_FOUND", "Enrollment not found.");
  }

  const totalDays = enrollment.program.durationWeeks ? enrollment.program.durationWeeks * 5 : null;
  const completedDays = enrollment._count.progress;
  const progressPercent = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    id: enrollment.id,
    userId: enrollment.userId,
    programId: enrollment.programId,
    programTitle: enrollment.program.title,
    batchId: enrollment.batchId,
    batchName: enrollment.batch.name,
    status: enrollment.status,
    enrolledAt: formatDate(enrollment.enrolledAt),
    activatedAt: formatDate(enrollment.activatedAt),
    completedAt: formatDate(enrollment.completedAt),
    cancelledAt: formatDate(enrollment.cancelledAt),
    progressPercent,
    currentDay: completedDays > 0 ? completedDays : null,
    totalDays,
  };
}

export async function cancelEnrollment(id: string, userId: string): Promise<EnrollmentDto> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id,
      userId,
      status: { in: ["PENDING", "ACTIVE"] },
    },
    include: {
      batch: { select: { name: true } },
      program: { select: { title: true, durationWeeks: true } },
      _count: {
        select: { progress: true },
      },
    },
  });

  if (!enrollment) {
    throw new HttpError(404, "NOT_FOUND", "Enrollment not found or cannot be cancelled.");
  }

  const updated = await prisma.enrollment.update({
    where: { id },
    data: {
      status: "WITHDRAWN",
      cancelledAt: new Date(),
    },
    include: {
      batch: { select: { name: true } },
      program: { select: { title: true, durationWeeks: true } },
      _count: {
        select: { progress: true },
      },
    },
  });

  const totalDays = updated.program.durationWeeks ? updated.program.durationWeeks * 5 : null;
  const completedDays = updated._count.progress;
  const progressPercent = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    id: updated.id,
    userId: updated.userId,
    programId: updated.programId,
    programTitle: updated.program.title,
    batchId: updated.batchId,
    batchName: updated.batch.name,
    status: updated.status,
    enrolledAt: formatDate(updated.enrolledAt),
    activatedAt: formatDate(updated.activatedAt),
    completedAt: formatDate(updated.completedAt),
    cancelledAt: formatDate(updated.cancelledAt),
    progressPercent,
    currentDay: completedDays > 0 ? completedDays : null,
    totalDays,
  };
}

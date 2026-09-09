import { prisma } from "@tesseracareerbridge/database";
import { HttpError } from "../../lib/http.js";
import { storage } from "../../storage/instance.js";

// ─── Helper Functions ───────────────────────────────────────────────────────

async function getStorageUrl(storageObjectId: string | null): Promise<string | null> {
  if (!storageObjectId) return null;
  try {
    const storageObject = await prisma.storageObject.findUnique({
      where: { id: storageObjectId },
    });
    if (!storageObject) return null;
    return await storage.getUrl(storageObject.key);
  } catch {
    return null;
  }
}

async function verifyMentorAccessToBatch(batchId: string, userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  const batchMentor = await prisma.batchMentor.findFirst({
    where: {
      batchId,
      mentorId: mentorProfile.id,
    },
    include: {
      mentor: {
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!batchMentor) {
    throw new HttpError(403, "FORBIDDEN", "You don't have access to this batch.");
  }

  return batchMentor;
}

async function verifyMentorAccessToProgram(programId: string, userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  // Check if mentor has access to any batch in this program
  const batchMentor = await prisma.batchMentor.findFirst({
    where: {
      mentorId: mentorProfile.id,
      batch: {
        programId,
      },
    },
    include: {
      mentor: {
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!batchMentor) {
    throw new HttpError(403, "FORBIDDEN", "You don't have access to this program.");
  }

  return batchMentor;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export async function getMentorDashboard(userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          displayName: true,
          email: true,
        },
      },
    },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  const batches = await prisma.batchMentor.findMany({
    where: { mentorId: mentorProfile.id },
    include: {
      batch: {
        include: {
          enrollments: true,
        },
      },
    },
  });

  const totalStudents = batches.reduce((sum, bm) => sum + bm.batch.enrollments.length, 0);

  const pendingReviews = await prisma.assignmentSubmission.count({
    where: {
      status: "SUBMITTED",
      enrollment: {
        batch: {
          mentors: {
            some: {
              mentorId: mentorProfile.id,
            },
          },
        },
      },
    },
  });

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = await prisma.attendance.findMany({
    where: {
      occurredOn: new Date(today),
      batch: {
        mentors: {
          some: {
            mentorId: mentorProfile.id,
          },
        },
      },
    },
  });

  const presentCount = todayAttendance.filter(a => a.status === "PRESENT").length;

  return {
    mentorName: mentorProfile.user.displayName,
    assignedBatches: batches.length,
    totalStudents,
    pendingReviews,
    todayAttendance: {
      present: presentCount,
      total: todayAttendance.length,
    },
    recentActivity: [], // Would be populated from activity logs
  };
}

// ─── Batches ───────────────────────────────────────────────────────────────

export async function getMentorBatches(userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  const batchMentors = await prisma.batchMentor.findMany({
    where: { mentorId: mentorProfile.id },
    include: {
      batch: {
        include: {
          program: {
            select: {
              id: true,
              title: true,
            },
          },
          enrollments: true,
        },
      },
      mentor: {
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  // Get weeks for all programs to calculate content progress
  const programIds = batchMentors.map(bm => bm.batch.programId);
  const weeks = await prisma.week.findMany({
    where: { programId: { in: programIds } },
    include: { days: true },
  });

  return batchMentors.map((bm) => {
    const batch = bm.batch;
    const programWeeks = weeks.filter(w => w.programId === batch.programId);
    const totalWeeks = programWeeks.length;
    const publishedWeeks = programWeeks.filter(w => w.status === "PUBLISHED").length;
    const totalDays = programWeeks.reduce((sum, w) => sum + w.days.length, 0);
    const publishedDays = programWeeks.reduce((sum, w) => sum + w.days.filter(d => d.status === "PUBLISHED").length, 0);

    return {
      id: batch.id,
      slug: batch.slug,
      name: batch.name,
      programId: batch.programId,
      programTitle: batch.program.title,
      startsAt: batch.startsAt?.toISOString() || null,
      endsAt: batch.endsAt?.toISOString() || null,
      enrollmentOpenDate: batch.enrollmentOpenDate?.toISOString() || null,
      enrollmentCloseDate: batch.enrollmentCloseDate?.toISOString() || null,
      capacity: batch.capacity,
      enrolledCount: batch.enrollments.length,
      status: batch.status,
      description: batch.description,
      studentCount: batch.enrollments.length,
      mentorName: bm.mentor.user.displayName,
      contentProgress: {
        totalWeeks,
        publishedWeeks,
        totalDays,
        publishedDays,
      },
    };
  });
}

export async function getMentorBatch(batchId: string, userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  const batchMentor = await prisma.batchMentor.findFirst({
    where: {
      batchId,
      mentorId: mentorProfile.id,
    },
    include: {
      batch: {
        include: {
          program: {
            select: {
              id: true,
              title: true,
            },
          },
          enrollments: true,
        },
      },
      mentor: {
        include: {
          user: {
            select: {
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!batchMentor) {
    throw new HttpError(403, "FORBIDDEN", "You don't have access to this batch.");
  }

  const batch = batchMentor.batch;
  
  // Get weeks for this program to calculate content progress
  const weeks = await prisma.week.findMany({
    where: { programId: batch.programId },
    include: { days: true },
  });

  const totalWeeks = weeks.length;
  const publishedWeeks = weeks.filter(w => w.status === "PUBLISHED").length;
  const totalDays = weeks.reduce((sum, w) => sum + w.days.length, 0);
  const publishedDays = weeks.reduce((sum, w) => sum + w.days.filter(d => d.status === "PUBLISHED").length, 0);

  return {
    id: batch.id,
    slug: batch.slug,
    name: batch.name,
    programId: batch.programId,
    programTitle: batch.program.title,
    startsAt: batch.startsAt?.toISOString() || null,
    endsAt: batch.endsAt?.toISOString() || null,
    enrollmentOpenDate: batch.enrollmentOpenDate?.toISOString() || null,
    enrollmentCloseDate: batch.enrollmentCloseDate?.toISOString() || null,
    capacity: batch.capacity,
    enrolledCount: batch.enrollments.length,
    status: batch.status,
    description: batch.description,
    studentCount: batch.enrollments.length,
    mentorName: batchMentor.mentor.user.displayName,
    contentProgress: {
      totalWeeks,
      publishedWeeks,
      totalDays,
      publishedDays,
    },
  };
}

// ─── Curriculum ───────────────────────────────────────────────────────────

export async function getMentorCurriculum(programId: string, userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  // Verify mentor has access to this program
  const hasAccess = await prisma.batchMentor.findFirst({
    where: {
      mentorId: mentorProfile.id,
      batch: {
        programId,
      },
    },
  });

  if (!hasAccess) {
    throw new HttpError(403, "FORBIDDEN", "You don't have access to this program.");
  }

  const program = await prisma.program.findUnique({
    where: { id: programId },
  });

  if (!program) {
    throw new HttpError(404, "NOT_FOUND", "Program not found.");
  }

  const weeks = await prisma.week.findMany({
    where: { programId },
    include: {
      days: true,
    },
    orderBy: { index: "asc" },
  });

  // Get the first batch this mentor has access to in this program
  const batchMentor = await prisma.batchMentor.findFirst({
    where: {
      mentorId: mentorProfile.id,
      batch: {
        programId,
      },
    },
    include: {
      batch: true,
    },
  });

  return {
    programId: program.id,
    programTitle: program.title,
    batchId: batchMentor?.batch.id || "",
    batchName: batchMentor?.batch.name || "",
    weeks: weeks.map((week) => ({
      id: week.id,
      weekNumber: week.index + 1,
      title: week.title,
      description: week.description,
      status: week.status,
      daysCount: week.days.length,
      publishedDaysCount: week.days.filter(d => d.status === "PUBLISHED").length,
    })),
  };
}

// ─── Week Management ───────────────────────────────────────────────────────

export async function createWeek(userId: string, data: any) {
  const { programId, weekNumber, title, description, status } = data;

  await verifyMentorAccessToProgram(programId, userId);

  // Check if week number already exists
  const existingWeek = await prisma.week.findFirst({
    where: {
      programId,
      index: weekNumber,
    },
  });

  if (existingWeek) {
    throw new HttpError(400, "BAD_REQUEST", "Week number already exists.");
  }

  const week = await prisma.week.create({
    data: {
      programId,
      index: weekNumber,
      title,
      description,
      status: status || "DRAFT",
    },
  });

  return {
    id: week.id,
    weekNumber: week.index + 1,
    title: week.title,
    description: week.description,
    status: week.status,
    daysCount: 0,
    publishedDaysCount: 0,
  };
}

export async function updateWeek(weekId: string, userId: string, data: any) {
  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      program: true,
    },
  });

  if (!week) {
    throw new HttpError(404, "NOT_FOUND", "Week not found.");
  }

  await verifyMentorAccessToProgram(week.programId, userId);

  const updated = await prisma.week.update({
    where: { id: weekId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
    },
  });

  return {
    id: updated.id,
    weekNumber: updated.index + 1,
    title: updated.title,
    description: updated.description,
    status: updated.status,
    daysCount: 0, // Would need to count days
    publishedDaysCount: 0,
  };
}

export async function deleteWeek(weekId: string, userId: string) {
  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      program: true,
    },
  });

  if (!week) {
    throw new HttpError(404, "NOT_FOUND", "Week not found.");
  }

  await verifyMentorAccessToProgram(week.programId, userId);

  await prisma.week.delete({
    where: { id: weekId },
  });
}

export async function reorderWeeks(programId: string, userId: string, data: any) {
  const { weekIds } = data;

  await verifyMentorAccessToProgram(programId, userId);

  // Update each week's index
  await Promise.all(
    weekIds.map((weekId: string, index: number) =>
      prisma.week.update({
        where: { id: weekId },
        data: { index },
      })
    )
  );
}

// ─── Day Management ───────────────────────────────────────────────────────

export async function createDay(userId: string, data: any) {
  const { weekId, dayNumber, title, description, objective, estimatedDuration, status } = data;

  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      program: true,
    },
  });

  if (!week) {
    throw new HttpError(404, "NOT_FOUND", "Week not found.");
  }

  await verifyMentorAccessToProgram(week.programId, userId);

  const day = await prisma.day.create({
    data: {
      weekId,
      index: dayNumber,
      title,
      description,
      objective,
      estimatedDuration,
      status: status || "DRAFT",
    },
  });

  return {
    id: day.id,
    dayNumber: day.index + 1,
    title: day.title,
    description: day.description,
    objective: day.objective,
    estimatedDuration: day.estimatedDuration,
    status: day.status,
    weekId: day.weekId,
    weekNumber: week.index + 1,
  };
}

export async function updateDay(dayId: string, userId: string, data: any) {
  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!day) {
    throw new HttpError(404, "NOT_FOUND", "Day not found.");
  }

  await verifyMentorAccessToProgram(day.week.programId, userId);

  const updated = await prisma.day.update({
    where: { id: dayId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.objective !== undefined && { objective: data.objective }),
      ...(data.estimatedDuration !== undefined && { estimatedDuration: data.estimatedDuration }),
      ...(data.status && { status: data.status }),
    },
  });

  return {
    id: updated.id,
    dayNumber: updated.index + 1,
    title: updated.title,
    description: updated.description,
    objective: updated.objective,
    estimatedDuration: updated.estimatedDuration,
    status: updated.status,
    weekId: updated.weekId,
    weekNumber: day.week.index + 1,
  };
}

export async function deleteDay(dayId: string, userId: string) {
  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!day) {
    throw new HttpError(404, "NOT_FOUND", "Day not found.");
  }

  await verifyMentorAccessToProgram(day.week.programId, userId);

  await prisma.day.delete({
    where: { id: dayId },
  });
}

export async function reorderDays(weekId: string, userId: string, data: any) {
  const { dayIds } = data;

  const week = await prisma.week.findUnique({
    where: { id: weekId },
    include: {
      program: true,
    },
  });

  if (!week) {
    throw new HttpError(404, "NOT_FOUND", "Week not found.");
  }

  await verifyMentorAccessToProgram(week.programId, userId);

  // Update each day's index
  await Promise.all(
    dayIds.map((dayId: string, index: number) =>
      prisma.day.update({
        where: { id: dayId },
        data: { index },
      })
    )
  );
}

// ─── Content Management ─────────────────────────────────────────────────────

export async function createVideo(userId: string, data: any) {
  const { dayId, title, storageObjectId, durationSeconds, sortOrder } = data;

  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!day) {
    throw new HttpError(404, "NOT_FOUND", "Day not found.");
  }

  await verifyMentorAccessToProgram(day.week.programId, userId);

  const video = await prisma.video.create({
    data: {
      dayId,
      title,
      storageObjectId,
      durationSeconds,
      sortOrder: sortOrder || 0,
    },
    include: {
      storageObject: true,
    },
  });

  return {
    id: video.id,
    title: video.title,
    storageObjectId: video.storageObjectId,
    storageUrl: await getStorageUrl(video.storageObjectId),
    durationSeconds: video.durationSeconds,
    sortOrder: video.sortOrder,
  };
}

export async function updateVideo(videoId: string, userId: string, data: any) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      day: {
        include: {
          week: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!video) {
    throw new HttpError(404, "NOT_FOUND", "Video not found.");
  }

  await verifyMentorAccessToProgram(video.day.week.programId, userId);

  const updated = await prisma.video.update({
    where: { id: videoId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.storageObjectId !== undefined && { storageObjectId: data.storageObjectId }),
      ...(data.durationSeconds !== undefined && { durationSeconds: data.durationSeconds }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
    include: {
      storageObject: true,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    storageObjectId: updated.storageObjectId,
    storageUrl: await getStorageUrl(updated.storageObjectId),
    durationSeconds: updated.durationSeconds,
    sortOrder: updated.sortOrder,
  };
}

export async function deleteVideo(videoId: string, userId: string) {
  const video = await prisma.video.findUnique({
    where: { id: videoId },
    include: {
      day: {
        include: {
          week: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!video) {
    throw new HttpError(404, "NOT_FOUND", "Video not found.");
  }

  await verifyMentorAccessToProgram(video.day.week.programId, userId);

  await prisma.video.delete({
    where: { id: videoId },
  });
}

export async function createNote(userId: string, data: any) {
  const { dayId, title, body, sortOrder } = data;

  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!day) {
    throw new HttpError(404, "NOT_FOUND", "Day not found.");
  }

  await verifyMentorAccessToProgram(day.week.programId, userId);

  const note = await prisma.note.create({
    data: {
      dayId,
      title,
      body,
      sortOrder: sortOrder || 0,
    },
  });

  return {
    id: note.id,
    title: note.title,
    body: note.body,
    sortOrder: note.sortOrder,
  };
}

export async function updateNote(noteId: string, userId: string, data: any) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      day: {
        include: {
          week: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!note) {
    throw new HttpError(404, "NOT_FOUND", "Note not found.");
  }

  await verifyMentorAccessToProgram(note.day.week.programId, userId);

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.body !== undefined && { body: data.body }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    body: updated.body,
    sortOrder: updated.sortOrder,
  };
}

export async function deleteNote(noteId: string, userId: string) {
  const note = await prisma.note.findUnique({
    where: { id: noteId },
    include: {
      day: {
        include: {
          week: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!note) {
    throw new HttpError(404, "NOT_FOUND", "Note not found.");
  }

  await verifyMentorAccessToProgram(note.day.week.programId, userId);

  await prisma.note.delete({
    where: { id: noteId },
  });
}

export async function createResource(userId: string, data: any) {
  const { dayId, title, storageObjectId, sortOrder } = data;

  const day = await prisma.day.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!day) {
    throw new HttpError(404, "NOT_FOUND", "Day not found.");
  }

  await verifyMentorAccessToProgram(day.week.programId, userId);

  const resource = await prisma.resource.create({
    data: {
      dayId,
      title,
      storageObjectId,
      sortOrder: sortOrder || 0,
    },
    include: {
      storageObject: true,
    },
  });

  return {
    id: resource.id,
    title: resource.title,
    storageObjectId: resource.storageObjectId,
    storageUrl: await getStorageUrl(resource.storageObjectId),
    type: resource.storageObject?.kind || "DOCUMENT",
    sortOrder: resource.sortOrder,
  };
}

export async function updateResource(resourceId: string, userId: string, data: any) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      day: {
        include: {
          week: {
            include: {
              program: true,
            },
          },
        },
      },
      storageObject: true,
    },
  });

  if (!resource) {
    throw new HttpError(404, "NOT_FOUND", "Resource not found.");
  }

  await verifyMentorAccessToProgram(resource.day.week.programId, userId);

  const updated = await prisma.resource.update({
    where: { id: resourceId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.storageObjectId !== undefined && { storageObjectId: data.storageObjectId }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
    include: {
      storageObject: true,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    storageObjectId: updated.storageObjectId,
    storageUrl: await getStorageUrl(updated.storageObjectId),
    type: updated.storageObject?.kind || "DOCUMENT",
    sortOrder: updated.sortOrder,
  };
}

export async function deleteResource(resourceId: string, userId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    include: {
      day: {
        include: {
          week: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!resource) {
    throw new HttpError(404, "NOT_FOUND", "Resource not found.");
  }

  await verifyMentorAccessToProgram(resource.day.week.programId, userId);

  await prisma.resource.delete({
    where: { id: resourceId },
  });
}

// ─── Student Management ─────────────────────────────────────────────────────

export async function getBatchStudents(batchId: string, userId: string) {
  await verifyMentorAccessToBatch(batchId, userId);

  const enrollments = await prisma.enrollment.findMany({
    where: { batchId },
    include: {
      user: {
        select: {
          displayName: true,
          email: true,
        },
      },
      program: {
        select: {
          title: true,
        },
      },
      batch: {
        select: {
          name: true,
        },
      },
      progress: {
        select: {
          status: true,
        },
      },
    },
  });

  return enrollments.map((enrollment) => {
    const completedDays = enrollment.progress.filter(p => p.status === "COMPLETED").length;
    const totalDays = enrollment.progress.length;
    const progressPercent = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    return {
      id: enrollment.userId,
      name: enrollment.user.displayName,
      email: enrollment.user.email,
      programTitle: enrollment.program.title,
      batchName: enrollment.batch.name,
      enrollmentId: enrollment.id,
      progressPercent,
      attendanceRate: 0, // Would need to calculate from attendance records
      ddpAverage: null, // Would need to calculate from DDP attempts
      assignmentStatus: "ACTIVE", // Would need to calculate from submissions
    };
  });
}

// ─── Attendance ───────────────────────────────────────────────────────────

export async function getBatchAttendance(batchId: string, date: string, userId: string) {
  await verifyMentorAccessToBatch(batchId, userId);

  const attendance = await prisma.attendance.findMany({
    where: {
      batchId,
      occurredOn: new Date(date),
    },
    include: {
      student: {
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return attendance.map((a) => ({
    studentId: a.student.id,
    studentName: a.student.user.displayName,
    status: a.status,
  }));
}

export async function markAttendance(userId: string, data: any) {
  const { batchId, date, attendance } = data;

  await verifyMentorAccessToBatch(batchId, userId);

  // Delete existing attendance for this date
  await prisma.attendance.deleteMany({
    where: {
      batchId,
      occurredOn: new Date(date),
    },
  });

  // Create new attendance records
  await Promise.all(
    attendance.map((a: any) =>
      prisma.attendance.create({
        data: {
          batchId,
          studentProfileId: a.studentProfileId,
          occurredOn: new Date(date),
          status: a.status,
        },
      })
    )
  );
}

// ─── Assignment Review ─────────────────────────────────────────────────────

export async function getPendingSubmissions(batchId: string, userId: string) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  const submissions = await prisma.assignmentSubmission.findMany({
    where: {
      status: "SUBMITTED",
      enrollment: {
        batchId,
      },
    },
    include: {
      assignment: {
        select: {
          title: true,
        },
      },
      enrollment: {
        include: {
          user: {
            select: {
              displayName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  // Get user details for each enrollment
  const enrollmentIds = submissions.map(s => s.enrollmentId);
  const users = await prisma.user.findMany({
    where: {
      enrollments: {
        some: {
          id: { in: enrollmentIds },
        },
      },
    },
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  return submissions.map((s) => {
    const user = userMap.get(s.enrollment.userId);
    return {
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      studentName: user?.displayName || "Unknown",
      studentEmail: user?.email || "Unknown",
      submittedAt: s.submittedAt?.toISOString() || null,
      status: s.status,
      textAnswer: s.textAnswer,
      linkUrl: s.linkUrl,
      fileOriginalName: s.fileOriginalName,
    };
  });
}

export async function getSubmissionDetails(submissionId: string, userId: string) {
  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      assignment: {
        select: {
          title: true,
        },
      },
      enrollment: {
        include: {
          batch: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new HttpError(404, "NOT_FOUND", "Submission not found.");
  }

  // Verify mentor has access to this batch
  if (submission.enrollment.batch) {
    await verifyMentorAccessToBatch(submission.enrollment.batch.id, userId);
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: submission.enrollment.userId },
    select: {
      displayName: true,
      email: true,
    },
  });

  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    assignmentTitle: submission.assignment.title,
    studentName: user?.displayName || "Unknown",
    studentEmail: user?.email || "Unknown",
    submittedAt: submission.submittedAt?.toISOString() || null,
    status: submission.status,
    textAnswer: submission.textAnswer,
    linkUrl: submission.linkUrl,
    fileOriginalName: submission.fileOriginalName,
  };
}

export async function reviewSubmission(submissionId: string, userId: string, data: any) {
  const { score, feedback, status } = data;

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { id: submissionId },
    include: {
      enrollment: {
        include: {
          batch: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!submission) {
    throw new HttpError(404, "NOT_FOUND", "Submission not found.");
  }

  // Verify mentor has access to this batch
  if (submission.enrollment.batch) {
    await verifyMentorAccessToBatch(submission.enrollment.batch.id, userId);
  }

  // Get mentor profile ID
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId },
  });

  if (!mentorProfile) {
    throw new HttpError(404, "NOT_FOUND", "Mentor profile not found.");
  }

  await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      score,
      feedback,
      status,
      reviewedAt: new Date(),
      reviewedByMentorId: mentorProfile.id,
    },
  });
}

// ─── DDP Results ───────────────────────────────────────────────────────────

export async function getDdpResults(batchId: string, userId: string) {
  await verifyMentorAccessToBatch(batchId, userId);

  const attempts = await prisma.ddpAttempt.findMany({
    where: {
      status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
      enrollment: {
        batchId,
      },
    },
    include: {
      ddp: {
        select: {
          title: true,
        },
      },
      enrollment: {
        select: {
          userId: true,
        },
      },
    },
  });

  // Get user details for each enrollment
  const userIds = attempts.map(a => a.enrollment.userId);
  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      displayName: true,
      email: true,
    },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  return attempts.map((a) => {
    const user = userMap.get(a.enrollment.userId);
    return {
      studentName: user?.displayName || "Unknown",
      studentEmail: user?.email || "Unknown",
      ddpTitle: a.ddp.title,
      attemptNumber: a.attemptNumber,
      score: a.score || 0,
      percentage: a.percentage ? Number(a.percentage) : 0,
      passed: a.passed || false,
      submittedAt: a.submittedAt?.toISOString() || null,
    };
  });
}

// ─── Announcements ───────────────────────────────────────────────────────

export async function getBatchAnnouncements(batchId: string, userId: string) {
  await verifyMentorAccessToBatch(batchId, userId);

  const announcements = await prisma.announcement.findMany({
    where: { batchId },
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    priority: a.priority,
    createdAt: a.createdAt.toISOString(),
    authorName: a.author.displayName,
  }));
}

export async function createAnnouncement(userId: string, data: any) {
  const { batchId, title, body, priority } = data;

  await verifyMentorAccessToBatch(batchId, userId);

  const announcement = await prisma.announcement.create({
    data: {
      batchId,
      authorId: userId,
      title,
      body,
      priority: priority || "NORMAL",
    },
    include: {
      author: {
        select: {
          displayName: true,
        },
      },
    },
  });

  return {
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    priority: announcement.priority,
    createdAt: announcement.createdAt.toISOString(),
    authorName: announcement.author.displayName,
  };
}

// ─── DDP Management (placeholder for future implementation) ─────────────

export async function getMentorDdp(ddpId: string, userId: string) {
  const ddp = await prisma.ddp.findUnique({
    where: { id: ddpId },
    include: {
      program: true,
      questions: {
        include: {
          options: true,
        },
      },
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  await verifyMentorAccessToProgram(ddp.programId, userId);

  return {
    id: ddp.id,
    programId: ddp.programId,
    dayId: ddp.dayId,
    dayTitle: null, // Would need to fetch from day
    title: ddp.title,
    description: ddp.description,
    instructions: ddp.instructions,
    durationMinutes: ddp.durationMinutes,
    passingScore: ddp.passingScore,
    maxAttempts: ddp.maxAttempts,
    required: ddp.required,
    status: ddp.status,
    questions: ddp.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      explanation: q.explanation,
      type: q.type,
      points: q.points,
      sortOrder: q.sortOrder,
      difficulty: q.difficulty,
      status: q.status,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        isCorrect: o.isCorrect,
        sortOrder: o.sortOrder,
      })),
    })),
  };
}

export async function createDdp(userId: string, data: any) {
  const { programId, dayId, title, description, instructions, durationMinutes, passingScore, maxAttempts, required, status } = data;

  await verifyMentorAccessToProgram(programId, userId);

  const ddp = await prisma.ddp.create({
    data: {
      programId,
      dayId,
      title,
      description,
      instructions,
      durationMinutes,
      passingScore,
      maxAttempts,
      required,
      status: status || "DRAFT",
    },
  });

  return getMentorDdp(ddp.id, userId);
}

export async function updateDdp(ddpId: string, userId: string, data: any) {
  const ddp = await prisma.ddp.findUnique({
    where: { id: ddpId },
    include: {
      program: true,
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  await verifyMentorAccessToProgram(ddp.programId, userId);

  const updated = await prisma.ddp.update({
    where: { id: ddpId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.instructions !== undefined && { instructions: data.instructions }),
      ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
      ...(data.passingScore !== undefined && { passingScore: data.passingScore }),
      ...(data.maxAttempts !== undefined && { maxAttempts: data.maxAttempts }),
      ...(data.required !== undefined && { required: data.required }),
      ...(data.status && { status: data.status }),
    },
  });

  return getMentorDdp(updated.id, userId);
}

export async function deleteDdp(ddpId: string, userId: string) {
  const ddp = await prisma.ddp.findUnique({
    where: { id: ddpId },
    include: {
      program: true,
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  await verifyMentorAccessToProgram(ddp.programId, userId);

  await prisma.ddp.delete({
    where: { id: ddpId },
  });
}

// DDP Question Management (placeholder)

export async function createDdpQuestion(userId: string, data: any) {
  const { ddpId, prompt, explanation, type, points, sortOrder, difficulty, status } = data;

  const ddp = await prisma.ddp.findUnique({
    where: { id: ddpId },
    include: {
      program: true,
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  await verifyMentorAccessToProgram(ddp.programId, userId);

  const question = await prisma.ddpQuestion.create({
    data: {
      ddpId,
      prompt,
      explanation,
      type,
      points,
      sortOrder,
      difficulty,
      status: status || "PUBLISHED",
    },
  });

  return {
    id: question.id,
    prompt: question.prompt,
    explanation: question.explanation,
    type: question.type,
    points: question.points,
    sortOrder: question.sortOrder,
    difficulty: question.difficulty,
    status: question.status,
    options: [],
  };
}

export async function updateDdpQuestion(questionId: string, userId: string, data: any) {
  const question = await prisma.ddpQuestion.findUnique({
    where: { id: questionId },
    include: {
      ddp: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!question) {
    throw new HttpError(404, "NOT_FOUND", "Question not found.");
  }

  await verifyMentorAccessToProgram(question.ddp.programId, userId);

  const updated = await prisma.ddpQuestion.update({
    where: { id: questionId },
    data: {
      ...(data.prompt && { prompt: data.prompt }),
      ...(data.explanation !== undefined && { explanation: data.explanation }),
      ...(data.type && { type: data.type }),
      ...(data.points !== undefined && { points: data.points }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
      ...(data.status && { status: data.status }),
    },
  });

  return {
    id: updated.id,
    prompt: updated.prompt,
    explanation: updated.explanation,
    type: updated.type,
    points: updated.points,
    sortOrder: updated.sortOrder,
    difficulty: updated.difficulty,
    status: updated.status,
    options: [],
  };
}

export async function deleteDdpQuestion(questionId: string, userId: string) {
  const question = await prisma.ddpQuestion.findUnique({
    where: { id: questionId },
    include: {
      ddp: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!question) {
    throw new HttpError(404, "NOT_FOUND", "Question not found.");
  }

  await verifyMentorAccessToProgram(question.ddp.programId, userId);

  await prisma.ddpQuestion.delete({
    where: { id: questionId },
  });
}

// DDP Option Management (placeholder)

export async function createDdpOption(userId: string, data: any) {
  const { questionId, text, isCorrect, sortOrder } = data;

  const question = await prisma.ddpQuestion.findUnique({
    where: { id: questionId },
    include: {
      ddp: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!question) {
    throw new HttpError(404, "NOT_FOUND", "Question not found.");
  }

  await verifyMentorAccessToProgram(question.ddp.programId, userId);

  const option = await prisma.ddpQuestionOption.create({
    data: {
      questionId,
      text,
      isCorrect,
      sortOrder: sortOrder || 0,
    },
  });

  return {
    id: option.id,
    text: option.text,
    isCorrect: option.isCorrect,
    sortOrder: option.sortOrder,
  };
}

export async function updateDdpOption(optionId: string, userId: string, data: any) {
  const option = await prisma.ddpQuestionOption.findUnique({
    where: { id: optionId },
    include: {
      question: {
        include: {
          ddp: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new HttpError(404, "NOT_FOUND", "Option not found.");
  }

  await verifyMentorAccessToProgram(option.question.ddp.programId, userId);

  const updated = await prisma.ddpQuestionOption.update({
    where: { id: optionId },
    data: {
      ...(data.text && { text: data.text }),
      ...(data.isCorrect !== undefined && { isCorrect: data.isCorrect }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });

  return {
    id: updated.id,
    text: updated.text,
    isCorrect: updated.isCorrect,
    sortOrder: updated.sortOrder,
  };
}

export async function deleteDdpOption(optionId: string, userId: string) {
  const option = await prisma.ddpQuestionOption.findUnique({
    where: { id: optionId },
    include: {
      question: {
        include: {
          ddp: {
            include: {
              program: true,
            },
          },
        },
      },
    },
  });

  if (!option) {
    throw new HttpError(404, "NOT_FOUND", "Option not found.");
  }

  await verifyMentorAccessToProgram(option.question.ddp.programId, userId);

  await prisma.ddpQuestionOption.delete({
    where: { id: optionId },
  });
}

export async function reorderDdpQuestions(ddpId: string, userId: string, data: any) {
  const { questionIds } = data;

  const ddp = await prisma.ddp.findUnique({
    where: { id: ddpId },
    include: {
      program: true,
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  await verifyMentorAccessToProgram(ddp.programId, userId);

  await Promise.all(
    questionIds.map((questionId: string, index: number) =>
      prisma.ddpQuestion.update({
        where: { id: questionId },
        data: { sortOrder: index },
      })
    )
  );
}

// ─── Assignment Management (placeholder for future implementation) ─────────────

export async function getMentorAssignment(assignmentId: string, userId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      program: true,
      day: true,
      requirements: true,
      resources: true,
    },
  });

  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  await verifyMentorAccessToProgram(assignment.programId, userId);

  return {
    id: assignment.id,
    programId: assignment.programId,
    dayId: assignment.dayId,
    dayTitle: assignment.day?.title || null,
    dayNumber: assignment.day?.index || null,
    title: assignment.title,
    brief: assignment.brief,
    description: assignment.description,
    instructions: assignment.instructions,
    type: assignment.type,
    assignmentStatus: assignment.assignmentStatus,
    maxScore: assignment.maxScore,
    passingScore: assignment.passingScore,
    estimatedTime: assignment.estimatedTime,
    isRequired: assignment.isRequired,
    maxAttempts: assignment.maxAttempts,
    dueAt: assignment.dueAt?.toISOString() || null,
    requirements: assignment.requirements.map((r) => ({
      id: r.id,
      body: r.body,
      sortOrder: r.sortOrder,
    })),
    resources: assignment.resources.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      type: r.type,
      sortOrder: r.sortOrder,
    })),
  };
}

export async function createAssignment(userId: string, data: any) {
  const { programId, dayId, title, brief, description, instructions, type, maxScore, passingScore, estimatedTime, isRequired, maxAttempts, dueAt, status } = data;

  await verifyMentorAccessToProgram(programId, userId);

  const assignment = await prisma.assignment.create({
    data: {
      programId,
      dayId,
      title,
      brief,
      description,
      instructions,
      type,
      maxScore,
      passingScore,
      estimatedTime,
      isRequired,
      maxAttempts,
      dueAt: dueAt ? new Date(dueAt) : null,
      assignmentStatus: status || "DRAFT",
    },
  });

  return getMentorAssignment(assignment.id, userId);
}

export async function updateAssignment(assignmentId: string, userId: string, data: any) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      program: true,
    },
  });

  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  await verifyMentorAccessToProgram(assignment.programId, userId);

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.brief !== undefined && { brief: data.brief }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.instructions !== undefined && { instructions: data.instructions }),
      ...(data.type && { type: data.type }),
      ...(data.maxScore !== undefined && { maxScore: data.maxScore }),
      ...(data.passingScore !== undefined && { passingScore: data.passingScore }),
      ...(data.estimatedTime !== undefined && { estimatedTime: data.estimatedTime }),
      ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
      ...(data.maxAttempts !== undefined && { maxAttempts: data.maxAttempts }),
      ...(data.dueAt !== undefined && { dueAt: data.dueAt ? new Date(data.dueAt) : null }),
      ...(data.status && { assignmentStatus: data.status }),
    },
  });

  return getMentorAssignment(updated.id, userId);
}

export async function deleteAssignment(assignmentId: string, userId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      program: true,
    },
  });

  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  await verifyMentorAccessToProgram(assignment.programId, userId);

  await prisma.assignment.delete({
    where: { id: assignmentId },
  });
}

// Assignment Requirements Management (placeholder)

export async function createAssignmentRequirement(userId: string, data: any) {
  const { assignmentId, body, sortOrder } = data;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      program: true,
    },
  });

  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  await verifyMentorAccessToProgram(assignment.programId, userId);

  const requirement = await prisma.assignmentRequirement.create({
    data: {
      assignmentId,
      body,
      sortOrder: sortOrder || 0,
    },
  });

  return {
    id: requirement.id,
    body: requirement.body,
    sortOrder: requirement.sortOrder,
  };
}

export async function updateAssignmentRequirement(requirementId: string, userId: string, data: any) {
  const requirement = await prisma.assignmentRequirement.findUnique({
    where: { id: requirementId },
    include: {
      assignment: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!requirement) {
    throw new HttpError(404, "NOT_FOUND", "Requirement not found.");
  }

  await verifyMentorAccessToProgram(requirement.assignment.programId, userId);

  const updated = await prisma.assignmentRequirement.update({
    where: { id: requirementId },
    data: {
      ...(data.body && { body: data.body }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });

  return {
    id: updated.id,
    body: updated.body,
    sortOrder: updated.sortOrder,
  };
}

export async function deleteAssignmentRequirement(requirementId: string, userId: string) {
  const requirement = await prisma.assignmentRequirement.findUnique({
    where: { id: requirementId },
    include: {
      assignment: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!requirement) {
    throw new HttpError(404, "NOT_FOUND", "Requirement not found.");
  }

  await verifyMentorAccessToProgram(requirement.assignment.programId, userId);

  await prisma.assignmentRequirement.delete({
    where: { id: requirementId },
  });
}

// Assignment Resources Management (placeholder)

export async function createAssignmentResource(userId: string, data: any) {
  const { assignmentId, title, url, type, sortOrder } = data;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      program: true,
    },
  });

  if (!assignment) {
    throw new HttpError(404, "NOT_FOUND", "Assignment not found.");
  }

  await verifyMentorAccessToProgram(assignment.programId, userId);

  const resource = await prisma.assignmentResource.create({
    data: {
      assignmentId,
      title,
      url,
      type,
      sortOrder: sortOrder || 0,
    },
  });

  return {
    id: resource.id,
    title: resource.title,
    url: resource.url,
    type: resource.type,
    sortOrder: resource.sortOrder,
  };
}

export async function updateAssignmentResource(resourceId: string, userId: string, data: any) {
  const resource = await prisma.assignmentResource.findUnique({
    where: { id: resourceId },
    include: {
      assignment: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!resource) {
    throw new HttpError(404, "NOT_FOUND", "Resource not found.");
  }

  await verifyMentorAccessToProgram(resource.assignment.programId, userId);

  const updated = await prisma.assignmentResource.update({
    where: { id: resourceId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.type && { type: data.type }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    url: updated.url,
    type: updated.type,
    sortOrder: updated.sortOrder,
  };
}

export async function deleteAssignmentResource(resourceId: string, userId: string) {
  const resource = await prisma.assignmentResource.findUnique({
    where: { id: resourceId },
    include: {
      assignment: {
        include: {
          program: true,
        },
      },
    },
  });

  if (!resource) {
    throw new HttpError(404, "NOT_FOUND", "Resource not found.");
  }

  await verifyMentorAccessToProgram(resource.assignment.programId, userId);

  await prisma.assignmentResource.delete({
    where: { id: resourceId },
  });
}

// ─── Export All Functions ─────────────────────────────────────────────────────
// These are exported to make them available to the router

export const mentorService = {
  getMentorDashboard,
  getMentorBatches,
  getMentorBatch,
  getMentorCurriculum,
  createWeek,
  updateWeek,
  deleteWeek,
  reorderWeeks,
  createDay,
  updateDay,
  deleteDay,
  reorderDays,
  createVideo,
  updateVideo,
  deleteVideo,
  createNote,
  updateNote,
  deleteNote,
  createResource,
  updateResource,
  deleteResource,
  getBatchStudents,
  getBatchAttendance,
  markAttendance,
  getPendingSubmissions,
  getSubmissionDetails,
  reviewSubmission,
  getDdpResults,
  getBatchAnnouncements,
  createAnnouncement,
  getMentorDdp,
  createDdp,
  updateDdp,
  deleteDdp,
  createDdpQuestion,
  updateDdpQuestion,
  deleteDdpQuestion,
  createDdpOption,
  updateDdpOption,
  deleteDdpOption,
  reorderDdpQuestions,
  getMentorAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createAssignmentRequirement,
  updateAssignmentRequirement,
  deleteAssignmentRequirement,
  createAssignmentResource,
  updateAssignmentResource,
  deleteAssignmentResource,
};

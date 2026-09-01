import { prisma } from "@tesseracareerbridge/database";
import { HttpError } from "../../lib/http.js";

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

async function getDdp(ddpId: string, programId: string) {
  const ddp = await prisma.ddp.findFirst({
    where: {
      id: ddpId,
      programId,
      status: "PUBLISHED",
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found or not published.");
  }

  return ddp;
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

export async function getDdpForDay(enrollmentId: string, dayId: string, userId: string) {
  const enrollment = await getEnrollment(enrollmentId, userId);
  const day = await getDay(dayId, enrollment.programId);

  // Check day availability
  const dayProgress = await prisma.progress.findUnique({
    where: {
      enrollmentId_dayId: {
        enrollmentId,
        dayId,
      },
    },
  });

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

  // Get DDP for this day
  const ddp = await prisma.ddp.findFirst({
    where: {
      dayId,
      status: "PUBLISHED",
    },
    include: {
      questions: {
        where: { status: "PUBLISHED" },
        orderBy: { sortOrder: "asc" },
        include: {
          options: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      _count: {
        select: { questions: true },
      },
    },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "No DDP configured for this day.");
  }

  // Get attempt count for this student
  const attempts = await prisma.ddpAttempt.findMany({
    where: {
      ddpId: ddp.id,
      enrollmentId,
    },
    orderBy: { attemptNumber: "desc" },
  });

  const attemptsUsed = attempts.length;
  const attemptsRemaining = ddp.maxAttempts - attemptsUsed;

  // Check if there's an active attempt
  const activeAttempt = attempts.find((a) => a.status === "IN_PROGRESS");

  return {
    ddp: {
      id: ddp.id,
      title: ddp.title,
      description: ddp.description,
      instructions: ddp.instructions,
      durationMinutes: ddp.durationMinutes,
      passingScore: ddp.passingScore,
      maxAttempts: ddp.maxAttempts,
      questionCount: ddp._count.questions,
    },
    attempts: {
      used: attemptsUsed,
      remaining: attemptsRemaining,
      history: attempts.map((a) => ({
        id: a.id,
        attemptNumber: a.attemptNumber,
        status: a.status,
        score: a.score,
        percentage: a.percentage ? Number(a.percentage) : null,
        passed: a.passed,
        submittedAt: a.submittedAt,
      })),
    },
    activeAttempt: activeAttempt ? {
      attemptId: activeAttempt.id,
      attemptNumber: activeAttempt.attemptNumber,
      startedAt: activeAttempt.startedAt,
    } : null,
  };
}

export async function startDdpAttempt(enrollmentId: string, dayId: string, ddpId: string, userId: string) {
  const enrollment = await getEnrollment(enrollmentId, userId);
  await getDay(dayId, enrollment.programId);
  const ddp = await getDdp(ddpId, enrollment.programId);

  // Check attempt limit
  const existingAttempts = await prisma.ddpAttempt.findMany({
    where: {
      ddpId,
      enrollmentId,
    },
  });

  if (existingAttempts.length >= ddp.maxAttempts) {
    throw new HttpError(403, "FORBIDDEN", "You have reached the maximum number of attempts for this DDP.");
  }

  // Check for active attempt
  const activeAttempt = existingAttempts.find((a) => a.status === "IN_PROGRESS");
  if (activeAttempt) {
    return {
      attemptId: activeAttempt.id,
      attemptNumber: activeAttempt.attemptNumber,
      startedAt: activeAttempt.startedAt,
    };
  }

  // Create new attempt
  const attemptNumber = existingAttempts.length + 1;
  const attempt = await prisma.ddpAttempt.create({
    data: {
      ddpId,
      enrollmentId,
      attemptNumber,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });

  return {
    attemptId: attempt.id,
    attemptNumber: attempt.attemptNumber,
    startedAt: attempt.startedAt,
  };
}

export async function getDdpQuestions(attemptId: string, enrollmentId: string, _userId: string) {
  const attempt = await prisma.ddpAttempt.findUnique({
    where: { id: attemptId },
    include: {
      ddp: {
        include: {
          questions: {
            where: { status: "PUBLISHED" },
            orderBy: { sortOrder: "asc" },
            include: {
              options: {
                select: {
                  id: true,
                  text: true,
                  sortOrder: true,
                },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new HttpError(404, "NOT_FOUND", "Attempt not found.");
  }

  if (attempt.enrollmentId !== enrollmentId) {
    throw new HttpError(403, "FORBIDDEN", "You do not have access to this attempt.");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new HttpError(400, "BAD_REQUEST", "This attempt is not active.");
  }

  // Get existing answers
  const existingAnswers = await prisma.ddpAnswer.findMany({
    where: { attemptId },
  });

  const answersMap = new Map(
    existingAnswers.map((a) => [a.questionId, a.selectedOptionIds])
  );

  return {
    ddp: {
      id: attempt.ddp.id,
      title: attempt.ddp.title,
      durationMinutes: attempt.ddp.durationMinutes,
      passingScore: attempt.ddp.passingScore,
    },
    attempt: {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      startedAt: attempt.startedAt,
    },
    questions: attempt.ddp.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      type: q.type,
      points: q.points,
      sortOrder: q.sortOrder,
      options: q.options.map((o) => ({
        id: o.id,
        text: o.text,
        sortOrder: o.sortOrder,
      })),
      selectedOptionIds: answersMap.get(q.id) || [],
    })),
  };
}

export async function saveDdpAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionIds: string[],
  enrollmentId: string
) {
  const attempt = await prisma.ddpAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw new HttpError(404, "NOT_FOUND", "Attempt not found.");
  }

  if (attempt.enrollmentId !== enrollmentId) {
    throw new HttpError(403, "FORBIDDEN", "You do not have access to this attempt.");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new HttpError(400, "BAD_REQUEST", "This attempt is not active.");
  }

  // Check if time has expired
  const ddp = await prisma.ddp.findUnique({
    where: { id: attempt.ddpId },
  });

  if (!ddp) {
    throw new HttpError(404, "NOT_FOUND", "DDP not found.");
  }

  const timeElapsed = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000 / 60);
  if (timeElapsed > ddp.durationMinutes) {
    // Auto-submit if time expired
    await submitDdpAttempt(attemptId, enrollmentId, true);
    throw new HttpError(400, "BAD_REQUEST", "Time has expired. Your DDP has been auto-submitted.");
  }

  // Upsert answer
  await prisma.ddpAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    update: {
      selectedOptionIds,
      answeredAt: new Date(),
    },
    create: {
      attemptId,
      questionId,
      selectedOptionIds,
      answeredAt: new Date(),
    },
  });

  return { success: true };
}

export async function submitDdpAttempt(attemptId: string, enrollmentId: string, autoSubmit = false) {
  const attempt = await prisma.ddpAttempt.findUnique({
    where: { id: attemptId },
    include: {
      ddp: {
        include: {
          questions: {
            where: { status: "PUBLISHED" },
            include: {
              options: true,
            },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    throw new HttpError(404, "NOT_FOUND", "Attempt not found.");
  }

  if (attempt.enrollmentId !== enrollmentId) {
    throw new HttpError(403, "FORBIDDEN", "You do not have access to this attempt.");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new HttpError(400, "BAD_REQUEST", "This attempt has already been submitted.");
  }

  // Calculate score
  let totalPoints = 0;
  let earnedPoints = 0;

  for (const question of attempt.ddp.questions) {
    totalPoints += question.points;
    const answer = attempt.answers.find((a) => a.questionId === question.id);

    if (!answer || !answer.selectedOptionIds || answer.selectedOptionIds.length === 0) {
      continue;
    }

    const correctOptions = question.options.filter((o) => o.isCorrect).map((o) => o.id);
    const selectedOptions = answer.selectedOptionIds;

    let isCorrect = false;

    if (question.type === "MCQ_SINGLE") {
      isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
    } else if (question.type === "MCQ_MULTIPLE") {
      // Full points only if exact match
      isCorrect =
        selectedOptions.length === correctOptions.length &&
        selectedOptions.every((id) => correctOptions.includes(id));
    } else if (question.type === "TRUE_FALSE") {
      isCorrect = selectedOptions.length === 1 && correctOptions.includes(selectedOptions[0]);
    }

    if (isCorrect) {
      earnedPoints += question.points;
    }

    // Update answer with result
    await prisma.ddpAnswer.update({
      where: { id: answer.id },
      data: {
        isCorrect,
        pointsAwarded: isCorrect ? question.points : 0,
      },
    });
  }

  const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const passed = percentage >= attempt.ddp.passingScore;
  const timeSpent = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000 / 60);

  // Update attempt
  await prisma.ddpAttempt.update({
    where: { id: attemptId },
    data: {
      status: autoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED",
      submittedAt: new Date(),
      score: earnedPoints,
      percentage,
      passed,
      timeSpent,
    },
  });

  // Update day progress if passed
  if (passed) {
    const dayProgress = await prisma.progress.findUnique({
      where: {
        enrollmentId_dayId: {
          enrollmentId,
          dayId: attempt.ddp.dayId || "",
        },
      },
    });

    if (dayProgress) {
      // Update activity progress for DDP
      await prisma.studentActivityProgress.upsert({
        where: {
          enrollmentId_contentType_contentId: {
            enrollmentId,
            contentType: "DDP",
            contentId: attempt.ddpId,
          },
        },
        update: {
          status: "COMPLETED",
          progressPercent: 100,
          completedAt: new Date(),
        },
        create: {
          enrollmentId,
          progressId: dayProgress.id,
          contentType: "DDP",
          contentId: attempt.ddpId,
          status: "COMPLETED",
          progressPercent: 100,
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
      });
    }
  }

  return {
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    timeSpent,
    status: autoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED",
  };
}

export async function getDdpResult(attemptId: string, enrollmentId: string) {
  const attempt = await prisma.ddpAttempt.findUnique({
    where: { id: attemptId },
    include: {
      ddp: {
        include: {
          questions: {
            where: { status: "PUBLISHED" },
            orderBy: { sortOrder: "asc" },
            include: {
              options: true,
            },
          },
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    throw new HttpError(404, "NOT_FOUND", "Attempt not found.");
  }

  if (attempt.enrollmentId !== enrollmentId) {
    throw new HttpError(403, "FORBIDDEN", "You do not have access to this attempt.");
  }

  if (attempt.status === "IN_PROGRESS") {
    throw new HttpError(400, "BAD_REQUEST", "This attempt has not been submitted yet.");
  }

  return {
    attempt: {
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      status: attempt.status,
      score: attempt.score,
      percentage: attempt.percentage ? Number(attempt.percentage) : null,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      submittedAt: attempt.submittedAt,
    },
    ddp: {
      id: attempt.ddp.id,
      title: attempt.ddp.title,
      passingScore: attempt.ddp.passingScore,
    },
    questions: attempt.ddp.questions.map((q) => {
      const answer = attempt.answers.find((a) => a.questionId === q.id);
      const correctOptions = q.options.filter((o) => o.isCorrect).map((o) => ({
        id: o.id,
        text: o.text,
      }));

      return {
        id: q.id,
        prompt: q.prompt,
        explanation: q.explanation,
        type: q.type,
        points: q.points,
        yourAnswer: answer?.selectedOptionIds || [],
        correctAnswer: correctOptions,
        isCorrect: answer?.isCorrect || false,
        pointsAwarded: answer?.pointsAwarded || 0,
      };
    }),
  };
}

export async function getDdpAttemptHistory(ddpId: string, enrollmentId: string, userId: string) {
  const enrollment = await getEnrollment(enrollmentId, userId);
  const ddp = await getDdp(ddpId, enrollment.programId);

  const attempts = await prisma.ddpAttempt.findMany({
    where: {
      ddpId,
      enrollmentId,
    },
    orderBy: { attemptNumber: "desc" },
  });

  return {
    ddp: {
      id: ddp.id,
      title: ddp.title,
      maxAttempts: ddp.maxAttempts,
      passingScore: ddp.passingScore,
    },
    attempts: attempts.map((a) => ({
      id: a.id,
      attemptNumber: a.attemptNumber,
      status: a.status,
      score: a.score,
      percentage: a.percentage ? Number(a.percentage) : null,
      passed: a.passed,
      timeSpent: a.timeSpent,
      submittedAt: a.submittedAt,
    })),
  };
}

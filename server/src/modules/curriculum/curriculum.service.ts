import { prisma } from "@tesseracareerbridge/database";
import type { InternshipCurriculumDto, InternshipWeekDto, InternshipDayDto, DayAvailability } from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";

function formatDate(date: Date | null): string {
  return date ? date.toISOString() : "";
}

function calculateDayAvailability(
  dayProgress: { status: string } | null,
  previousDayCompleted: boolean,
  isFirstDay: boolean
): DayAvailability {
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

export async function getInternshipCurriculum(enrollmentId: string, userId: string): Promise<InternshipCurriculumDto> {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: enrollmentId,
      userId,
    },
    include: {
      batch: {
        select: {
          name: true,
          startsAt: true,
          endsAt: true,
        },
      },
      program: {
        select: {
          id: true,
          title: true,
        },
      },
      progress: {
        include: {
          day: {
            select: {
              id: true,
              weekId: true,
              index: true,
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new HttpError(404, "NOT_FOUND", "Enrollment not found.");
  }

  const programId = enrollment.program.id;

  const weeks = await prisma.week.findMany({
    where: {
      programId,
      status: "PUBLISHED",
    },
    include: {
      days: {
        where: {
          status: "PUBLISHED",
        },
        orderBy: {
          index: "asc",
        },
      },
    },
    orderBy: {
      index: "asc",
    },
  });

  const progressMap = new Map(
    enrollment.progress.map((p) => [p.dayId, { status: p.status, completedAt: p.completedAt }])
  );

  let totalDays = 0;
  let completedDays = 0;
  let currentWeek: number | null = null;
  let currentDay: number | null = null;

  const internshipWeeks: InternshipWeekDto[] = weeks.map((week) => {
    const weekDays: InternshipDayDto[] = week.days.map((day, dayIndex) => {
      totalDays++;
      const dayProgress = progressMap.get(day.id);
      const isFirstDay = totalDays === 1;
      const previousDayIndex = dayIndex > 0 ? week.days[dayIndex - 1] : null;
      const previousDayCompleted = previousDayIndex
        ? progressMap.get(previousDayIndex.id)?.status === "COMPLETED"
        : false;

      const availability = calculateDayAvailability(dayProgress || null, previousDayCompleted, isFirstDay);

      if (dayProgress?.status === "COMPLETED") {
        completedDays++;
      }

      if (availability === "IN_PROGRESS" && !currentDay) {
        currentWeek = week.index + 1;
        currentDay = day.index + 1;
      } else if (availability === "AVAILABLE" && !currentDay && !currentWeek) {
        currentWeek = week.index + 1;
        currentDay = day.index + 1;
      }

      return {
        id: day.id,
        dayNumber: day.index + 1,
        title: day.title,
        description: day.description,
        objective: day.objective,
        estimatedDuration: day.estimatedDuration,
        availability,
        progress: dayProgress?.status === "COMPLETED" ? 100 : dayProgress?.status === "IN_PROGRESS" ? 50 : 0,
        isCurrent: availability === "IN_PROGRESS" || (availability === "AVAILABLE" && !currentDay),
        completedAt: formatDate(dayProgress?.completedAt || null),
      };
    });

    const weekCompletedDays = weekDays.filter((d) => d.availability === "COMPLETED").length;
    const weekProgress = weekDays.length > 0 ? Math.round((weekCompletedDays / weekDays.length) * 100) : 0;

    return {
      id: week.id,
      weekNumber: week.index + 1,
      title: week.title,
      description: week.description,
      progress: weekProgress,
      completedDays: weekCompletedDays,
      totalDays: weekDays.length,
      days: weekDays,
    };
  });

  const overallProgress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  return {
    enrollmentId: enrollment.id,
    programId: enrollment.programId,
    programTitle: enrollment.program.title,
    batchId: enrollment.batchId,
    batchName: enrollment.batch.name,
    status: enrollment.status,
    startsAt: formatDate(enrollment.batch.startsAt),
    endsAt: formatDate(enrollment.batch.endsAt),
    overallProgress,
    currentWeek,
    currentDay,
    totalDays,
    completedDays,
    weeks: internshipWeeks,
  };
}

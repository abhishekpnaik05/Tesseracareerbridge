import { prisma } from "@tesseracareerbridge/database";
import type { BatchDto } from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";

function formatDate(date: Date | null): string {
  return date ? date.toISOString() : "";
}

export async function listProgramBatches(programKey: string): Promise<BatchDto[]> {
  const program = await prisma.program.findFirst({
    where: {
      status: "PUBLISHED",
      OR: [{ slug: programKey }, { id: programKey }],
    },
    select: { id: true, title: true },
  });

  if (!program) {
    throw new HttpError(404, "NOT_FOUND", "Program not found.");
  }

  const batches = await prisma.batch.findMany({
    where: {
      programId: program.id,
      status: { in: ["UPCOMING", "OPEN"] },
    },
    include: {
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: [{ status: "desc" }, { startsAt: "asc" }],
  });

  return batches.map((batch) => ({
    id: batch.id,
    slug: batch.slug || batch.id,
    name: batch.name,
    programId: program.id,
    programTitle: program.title,
    startsAt: formatDate(batch.startsAt),
    endsAt: formatDate(batch.endsAt),
    enrollmentOpenDate: formatDate(batch.enrollmentOpenDate),
    enrollmentCloseDate: formatDate(batch.enrollmentCloseDate),
    capacity: batch.capacity,
    enrolledCount: batch._count.enrollments,
    status: batch.status,
    description: batch.description,
  }));
}

export async function getBatch(id: string): Promise<BatchDto> {
  const batch = await prisma.batch.findFirst({
    where: {
      id,
      program: { status: "PUBLISHED" },
    },
    include: {
      program: { select: { id: true, title: true } },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  if (!batch) {
    throw new HttpError(404, "NOT_FOUND", "Batch not found.");
  }

  return {
    id: batch.id,
    slug: batch.slug || batch.id,
    name: batch.name,
    programId: batch.program.id,
    programTitle: batch.program.title,
    startsAt: formatDate(batch.startsAt),
    endsAt: formatDate(batch.endsAt),
    enrollmentOpenDate: formatDate(batch.enrollmentOpenDate),
    enrollmentCloseDate: formatDate(batch.enrollmentCloseDate),
    capacity: batch.capacity,
    enrolledCount: batch._count.enrollments,
    status: batch.status,
    description: batch.description,
  };
}

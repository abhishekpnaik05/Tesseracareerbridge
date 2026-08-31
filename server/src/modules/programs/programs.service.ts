import { prisma } from "@tesseracareerbridge/database";
import type {
  ProgramDetailDto,
  ProgramListItemDto,
  ProgramListResponse,
  ProgramSort,
} from "@tesseracareerbridge/shared";
import { PROGRAM_SORTS } from "@tesseracareerbridge/shared";
import { HttpError } from "../../lib/http.js";

const listInclude = {
  skills: { orderBy: { sortOrder: "asc" as const } },
};

function visualTone(value: string | null | undefined): ProgramListItemDto["visualTone"] {
  if (value === "b" || value === "c" || value === "d") return value;
  return "a";
}

function toListItem(program: {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  durationLabel: string | null;
  durationWeeks: number | null;
  level: string | null;
  category: string | null;
  featured: boolean;
  availability: string;
  visualTone: string;
  skills: { name: string }[];
}): ProgramListItemDto {
  return {
    id: program.id,
    slug: program.slug,
    title: program.title,
    summary: program.summary ?? "",
    durationLabel: program.durationLabel ?? (program.durationWeeks ? `${program.durationWeeks} weeks` : "Duration TBA"),
    durationWeeks: program.durationWeeks,
    level: program.level ?? "Beginner",
    category: program.category ?? "General",
    skills: program.skills.map((skill) => skill.name),
    featured: program.featured,
    availability: program.availability,
    visualTone: visualTone(program.visualTone),
  };
}

function parsePage(value: unknown) {
  const n = Number(value ?? 1);
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, "VALIDATION", "Page must be a positive integer.");
  return n;
}

function parseSearch(value: unknown) {
  if (value == null || value === "") return "";
  if (typeof value !== "string") throw new HttpError(400, "VALIDATION", "Search must be text.");
  return value.trim().slice(0, 100);
}

function parseLimit(value: unknown) {
  const n = Number(value ?? 12);
  if (!Number.isInteger(n) || n < 1 || n > 24) {
    throw new HttpError(400, "VALIDATION", "Limit must be between 1 and 24.");
  }
  return n;
}

function parseSort(value: unknown): ProgramSort {
  const sort = typeof value === "string" ? value : "featured";
  if (!(PROGRAM_SORTS as readonly string[]).includes(sort)) {
    throw new HttpError(400, "VALIDATION", "Unsupported sort option.");
  }
  return sort as ProgramSort;
}

function orderBy(sort: ProgramSort) {
  if (sort === "newest") return [{ createdAt: "desc" as const }];
  if (sort === "duration") return [{ durationWeeks: "asc" as const }, { title: "asc" as const }];
  if (sort === "name") return [{ title: "asc" as const }];
  return [{ featured: "desc" as const }, { createdAt: "desc" as const }];
}

export async function listPublishedPrograms(query: Record<string, unknown>): Promise<ProgramListResponse> {
  const search = parseSearch(query.search);
  const category = typeof query.category === "string" ? query.category.trim().slice(0, 80) : "";
  const level = typeof query.level === "string" ? query.level.trim().slice(0, 80) : "";
  const duration = typeof query.duration === "string" ? query.duration.trim().slice(0, 80) : "";
  const availability = typeof query.availability === "string" ? query.availability.trim().slice(0, 40) : "";
  const featured = query.featured === "true" || query.featured === true;
  const pageRequested = parsePage(query.page);
  const pageSize = parseLimit(query.limit);
  const sort = parseSort(query.sort);

  const where = {
    status: "PUBLISHED" as const,
    ...(category && category !== "all" ? { category } : {}),
    ...(level && level !== "all" ? { level } : {}),
    ...(duration && duration !== "all" ? { durationLabel: duration } : {}),
    ...(availability && availability !== "all" ? { availability } : {}),
    ...(featured ? { featured: true } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { summary: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { category: { contains: search, mode: "insensitive" as const } },
            { skills: { some: { name: { contains: search, mode: "insensitive" as const } } } },
          ],
        }
      : {}),
  };

  const [total, published] = await Promise.all([
    prisma.program.count({ where }),
    prisma.program.findMany({
      where: { status: "PUBLISHED" },
      select: { category: true, level: true, durationLabel: true, availability: true },
    }),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / pageSize) || 1);
  const page = total === 0 ? 1 : Math.min(pageRequested, lastPage);

  const items = await prisma.program.findMany({
    where,
    include: listInclude,
    orderBy: orderBy(sort),
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const facets = {
    categories: [...new Set(published.map((row) => row.category).filter(Boolean))] as string[],
    levels: [...new Set(published.map((row) => row.level).filter(Boolean))] as string[],
    durations: [...new Set(published.map((row) => row.durationLabel).filter(Boolean))] as string[],
    availabilities: [...new Set(published.map((row) => row.availability).filter(Boolean))],
  };

  return {
    items: items.map(toListItem),
    total,
    page,
    pageSize,
    facets,
  };
}

export async function getPublishedProgram(key: string): Promise<ProgramDetailDto> {
  const slug = key.trim();
  if (!slug || slug.length > 120) throw new HttpError(400, "VALIDATION", "Program not found.");

  const program = await prisma.program.findFirst({
    where: {
      status: "PUBLISHED",
      OR: [{ slug }, { id: slug }],
    },
    include: {
      skills: { orderBy: { sortOrder: "asc" } },
      outcomes: { orderBy: { sortOrder: "asc" } },
      requirements: { orderBy: { sortOrder: "asc" } },
      benefits: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      projectPreviews: { orderBy: { sortOrder: "asc" } },
      weeks: {
        orderBy: { index: "asc" },
        include: { days: { orderBy: { index: "asc" }, select: { index: true, title: true } } },
      },
    },
  });

  if (!program) throw new HttpError(404, "NOT_FOUND", "Program not found.");

  return {
    ...toListItem(program),
    description: program.description ?? "",
    audience: program.audience ?? "",
    learningApproach: program.learningApproach ?? "",
    learningDaysPerWeek: program.learningDaysPerWeek,
    outcomes: program.outcomes.map((item) => item.body),
    requirements: program.requirements.map((item) => item.body),
    benefits: program.benefits.map((item) => ({ title: item.title, body: item.body })),
    faqs: program.faqs.map((item) => ({ id: item.id, title: item.title, body: item.body })),
    weeks: program.weeks.map((week) => ({
      index: week.index,
      title: week.title,
      days: week.days.map((day) => ({ index: day.index, title: day.title })),
    })),
    projects: program.projectPreviews.map((item) => ({
      title: item.title,
      type: item.type,
      description: item.description ?? "",
      difficulty: item.difficulty,
      skills: item.skills,
    })),
  };
}

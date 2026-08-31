import type { ProgramDetailDto, ProgramListItemDto, ProgramListResponse, ProgramSort } from "@tesseracareerbridge/shared";
import { apiGet, ApiRequestError } from "./api";

export type ProgramListQuery = {
  search?: string;
  category?: string;
  level?: string;
  duration?: string;
  availability?: string;
  featured?: boolean;
  sort?: ProgramSort;
  page?: number;
  limit?: number;
};

export function programAvailabilityLabel(availability: string) {
  if (availability === "COMING_SOON") return "Coming soon";
  if (availability === "CLOSED") return "Closed";
  return "Open";
}

export function programEnrollPath(slug: string, role?: string | null) {
  if (role === "STUDENT") return `/programs/${slug}/enroll`;
  return `/register?program=${encodeURIComponent(slug)}`;
}

export function programCardProps(program: ProgramListItemDto) {
  return {
    title: program.title,
    description: program.summary,
    duration: program.durationLabel,
    level: program.level,
    skills: program.skills.slice(0, 8),
    enrollmentStatus: programAvailabilityLabel(program.availability),
    category: program.category,
    visualTone: program.visualTone,
    to: `/programs/${program.slug}`,
  };
}

function listPath(query: ProgramListQuery) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.category && query.category !== "all") params.set("category", query.category);
  if (query.level && query.level !== "all") params.set("level", query.level);
  if (query.duration && query.duration !== "all") params.set("duration", query.duration);
  if (query.availability && query.availability !== "all") params.set("availability", query.availability);
  if (query.featured) params.set("featured", "true");
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  const qs = params.toString();
  return qs ? `/programs?${qs}` : "/programs";
}

export async function listPublicPrograms(query: ProgramListQuery = {}): Promise<ProgramListResponse> {
  return apiGet<ProgramListResponse>(listPath(query));
}

export async function getPublicProgram(key: string): Promise<ProgramDetailDto | null> {
  try {
    return await apiGet<ProgramDetailDto>(`/programs/${encodeURIComponent(key)}`);
  } catch (error) {
    if (error instanceof ApiRequestError && (error.status === 404 || error.status === 400)) {
      return null;
    }
    throw error;
  }
}

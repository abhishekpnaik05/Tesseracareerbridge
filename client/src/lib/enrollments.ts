import type {
  BatchDto,
  EnrollmentDto,
  EnrollmentListResponse,
  InternshipCurriculumDto,
  DayDetailDto,
  VideoDto,
  NoteDto,
  ResourceDto,
  PracticeTaskDto,
  DdpDto,
  AssignmentDto,
  AssignmentDetailDto,
  AssignmentSubmissionDto,
  UpdateActivityProgressRequest,
  DdpDataDto,
  DdpQuestionsDto,
  DdpResultDto,
  DdpHistoryDto,
} from "@tesseracareerbridge/shared";
import { apiGet, apiPost, apiPut } from "./api";

export async function listProgramBatches(programKey: string): Promise<BatchDto[]> {
  return apiGet<BatchDto[]>(`/batches/programs/${programKey}`);
}

export async function getBatch(id: string): Promise<BatchDto> {
  return apiGet<BatchDto>(`/batches/${id}`);
}

export async function createEnrollment(batchId: string): Promise<EnrollmentDto> {
  return apiPost<EnrollmentDto>("/enrollments", { batchId });
}

export async function listUserEnrollments(): Promise<EnrollmentListResponse> {
  return apiGet<EnrollmentListResponse>("/enrollments/me");
}

export async function getEnrollment(id: string): Promise<EnrollmentDto> {
  return apiGet<EnrollmentDto>(`/enrollments/${id}`);
}

export async function cancelEnrollment(id: string): Promise<EnrollmentDto> {
  return apiPost<EnrollmentDto>(`/enrollments/${id}/cancel`, {});
}

export async function getInternshipCurriculum(enrollmentId: string): Promise<InternshipCurriculumDto> {
  return apiGet<InternshipCurriculumDto>(`/enrollments/${enrollmentId}/curriculum`);
}

export function batchStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    UPCOMING: "Coming Soon",
    OPEN: "Enrollment Open",
    FULL: "Full",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };
  return labels[status] || status;
}

export function enrollmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: "Pending",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    WITHDRAWN: "Withdrawn",
    SUSPENDED: "Suspended",
  };
  return labels[status] || status;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "TBA";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return "TBA";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Day content APIs
export async function getDayDetail(enrollmentId: string, dayId: string): Promise<DayDetailDto> {
  return apiGet<DayDetailDto>(`/enrollments/${enrollmentId}/days/${dayId}`);
}

export async function getVideoDetail(enrollmentId: string, dayId: string, videoId: string): Promise<VideoDto> {
  return apiGet<VideoDto>(`/enrollments/${enrollmentId}/days/${dayId}/videos/${videoId}`);
}

export async function getNoteDetail(enrollmentId: string, dayId: string, noteId: string): Promise<NoteDto> {
  return apiGet<NoteDto>(`/enrollments/${enrollmentId}/days/${dayId}/notes/${noteId}`);
}

export async function getResourceDetail(enrollmentId: string, dayId: string, resourceId: string): Promise<ResourceDto> {
  return apiGet<ResourceDto>(`/enrollments/${enrollmentId}/days/${dayId}/resources/${resourceId}`);
}

export async function getPracticeTaskDetail(enrollmentId: string, dayId: string, practiceId: string): Promise<PracticeTaskDto> {
  return apiGet<PracticeTaskDto>(`/enrollments/${enrollmentId}/days/${dayId}/practice/${practiceId}`);
}

export async function getDdpDetail(enrollmentId: string, dayId: string, ddpId: string): Promise<DdpDto> {
  return apiGet<DdpDto>(`/enrollments/${enrollmentId}/days/${dayId}/ddps/${ddpId}`);
}

export async function getAssignmentDetail(enrollmentId: string, dayId: string, assignmentId: string): Promise<AssignmentDto> {
  return apiGet<AssignmentDto>(`/enrollments/${enrollmentId}/days/${dayId}/assignments/${assignmentId}`);
}

export async function updateActivityProgress(
  enrollmentId: string,
  dayId: string,
  request: UpdateActivityProgressRequest
): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`/enrollments/${enrollmentId}/days/${dayId}/progress`, request);
}

// DDP APIs
export async function getDdpForDay(enrollmentId: string, dayId: string): Promise<DdpDataDto> {
  return apiGet<DdpDataDto>(`/ddp/days/${dayId}?enrollmentId=${enrollmentId}`);
}

export async function startDdpAttempt(ddpId: string, enrollmentId: string, dayId: string): Promise<{
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
}> {
  return apiPost<{
    attemptId: string;
    attemptNumber: number;
    startedAt: string;
  }>(`/ddp/${ddpId}/start`, { enrollmentId, dayId });
}

export async function getDdpQuestions(attemptId: string, enrollmentId: string): Promise<DdpQuestionsDto> {
  return apiGet<DdpQuestionsDto>(`/ddp/attempts/${attemptId}/questions?enrollmentId=${enrollmentId}`);
}

export async function saveDdpAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionIds: string[],
  enrollmentId: string
): Promise<{ success: boolean }> {
  return apiPut<{ success: boolean }>(
    `/ddp/attempts/${attemptId}/answers/${questionId}`,
    { enrollmentId, selectedOptionIds }
  );
}

export async function submitDdpAttempt(attemptId: string, enrollmentId: string): Promise<{
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  status: string;
}> {
  return apiPost<{
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    status: string;
  }>(`/ddp/attempts/${attemptId}/submit`, { enrollmentId });
}

export async function getDdpResult(attemptId: string, enrollmentId: string): Promise<DdpResultDto> {
  return apiGet<DdpResultDto>(`/ddp/attempts/${attemptId}/result?enrollmentId=${enrollmentId}`);
}

export async function getDdpHistory(ddpId: string, enrollmentId: string): Promise<DdpHistoryDto> {
  return apiGet<DdpHistoryDto>(`/ddp/${ddpId}/history?enrollmentId=${enrollmentId}`);
}

// ─── Assignment APIs ──────────────────────────────────────────────────────────

export async function getAssignmentFullDetail(
  assignmentId: string,
  enrollmentId: string
): Promise<AssignmentDetailDto> {
  return apiGet<AssignmentDetailDto>(`/assignments/${assignmentId}?enrollmentId=${enrollmentId}`);
}

export async function saveDraft(
  assignmentId: string,
  enrollmentId: string,
  payload: { textAnswer?: string; linkUrl?: string }
): Promise<AssignmentSubmissionDto> {
  return apiPost<AssignmentSubmissionDto>(`/assignments/${assignmentId}/draft`, {
    enrollmentId,
    ...payload,
  });
}

export async function submitAssignment(
  assignmentId: string,
  enrollmentId: string,
  payload: { textAnswer?: string; linkUrl?: string }
): Promise<AssignmentSubmissionDto> {
  return apiPost<AssignmentSubmissionDto>(`/assignments/${assignmentId}/submit`, {
    enrollmentId,
    ...payload,
  });
}

export async function getSubmissionHistory(
  assignmentId: string,
  enrollmentId: string
): Promise<AssignmentSubmissionDto[]> {
  return apiGet<AssignmentSubmissionDto[]>(`/assignments/${assignmentId}/history?enrollmentId=${enrollmentId}`);
}

// Re-export AssignmentDto for backwards compatibility (used in AssignmentCard)
export type { AssignmentDto, AssignmentDetailDto, AssignmentSubmissionDto };

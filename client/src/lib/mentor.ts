import type {
  BatchDto,
  CurriculumStatus,
  QuestionType,
  AssignmentType,
  AssignmentStatus,
  SubmissionStatus,
} from "@tesseracareerbridge/shared";
import { apiGet, apiPost, apiPatch, apiDelete } from "./api";

// Re-export CurriculumStatus for use in components
export type { CurriculumStatus };

// ─── Mentor Dashboard & Batches ──────────────────────────────────────────────

export interface MentorDashboardDto {
  mentorName: string;
  assignedBatches: number;
  totalStudents: number;
  pendingReviews: number;
  todayAttendance: {
    present: number;
    total: number;
  };
  recentActivity: Array<{
    type: string;
    title: string;
    time: string;
  }>;
}

export interface MentorBatchDto extends BatchDto {
  programTitle: string;
  studentCount: number;
  mentorName: string;
  contentProgress: {
    totalWeeks: number;
    publishedWeeks: number;
    totalDays: number;
    publishedDays: number;
  };
}

export async function getMentorDashboard(): Promise<MentorDashboardDto> {
  return apiGet<MentorDashboardDto>("/mentor/dashboard");
}

export async function getMentorBatches(): Promise<MentorBatchDto[]> {
  return apiGet<MentorBatchDto[]>("/mentor/batches");
}

export async function getMentorBatch(id: string): Promise<MentorBatchDto> {
  return apiGet<MentorBatchDto>(`/mentor/batches/${id}`);
}

// ─── Curriculum Management (Mentor can see and edit DRAFT content) ─────────────

export interface MentorWeekDto {
  id: string;
  weekNumber: number;
  title: string;
  description: string | null;
  status: CurriculumStatus;
  daysCount: number;
  publishedDaysCount: number;
}

export interface MentorDayDto {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  objective: string | null;
  estimatedDuration: number | null;
  status: CurriculumStatus;
  weekId: string;
  weekNumber: number;
}

export interface MentorCurriculumDto {
  programId: string;
  programTitle: string;
  batchId: string;
  batchName: string;
  weeks: MentorWeekDto[];
}

export async function getMentorCurriculum(programId: string): Promise<MentorCurriculumDto> {
  return apiGet<MentorCurriculumDto>(`/mentor/curriculum/${programId}`);
}

// ─── Week Management ───────────────────────────────────────────────────────────

export interface CreateWeekRequest {
  programId: string;
  weekNumber: number;
  title: string;
  description?: string;
  status?: CurriculumStatus;
}

export interface UpdateWeekRequest {
  title?: string;
  description?: string;
  status?: CurriculumStatus;
}

export async function createWeek(request: CreateWeekRequest): Promise<MentorWeekDto> {
  return apiPost<MentorWeekDto>("/mentor/weeks", request);
}

export async function updateWeek(weekId: string, request: UpdateWeekRequest): Promise<MentorWeekDto> {
  return apiPatch<MentorWeekDto>(`/mentor/weeks/${weekId}`, request);
}

export async function deleteWeek(weekId: string): Promise<void> {
  return apiDelete<void>(`/mentor/weeks/${weekId}`);
}

export async function reorderWeeks(programId: string, weekIds: string[]): Promise<void> {
  return apiPost<void>(`/mentor/curriculum/${programId}/weeks/reorder`, { weekIds });
}

// ─── Day Management ───────────────────────────────────────────────────────────

export interface CreateDayRequest {
  weekId: string;
  dayNumber: number;
  title: string;
  description?: string;
  objective?: string;
  estimatedDuration?: number;
  status?: CurriculumStatus;
}

export interface UpdateDayRequest {
  title?: string;
  description?: string;
  objective?: string;
  estimatedDuration?: number;
  status?: CurriculumStatus;
}

export async function createDay(request: CreateDayRequest): Promise<MentorDayDto> {
  return apiPost<MentorDayDto>("/mentor/days", request);
}

export async function updateDay(dayId: string, request: UpdateDayRequest): Promise<MentorDayDto> {
  return apiPatch<MentorDayDto>(`/mentor/days/${dayId}`, request);
}

export async function deleteDay(dayId: string): Promise<void> {
  return apiDelete<void>(`/mentor/days/${dayId}`);
}

export async function reorderDays(weekId: string, dayIds: string[]): Promise<void> {
  return apiPost<void>(`/mentor/weeks/${weekId}/days/reorder`, { dayIds });
}

// ─── Content Management ────────────────────────────────────────────────────────

export interface MentorVideoDto {
  id: string;
  title: string;
  storageObjectId: string | null;
  storageUrl: string | null;
  durationSeconds: number | null;
  sortOrder: number;
}

export interface MentorNoteDto {
  id: string;
  title: string;
  body: string | null;
  sortOrder: number;
}

export interface MentorResourceDto {
  id: string;
  title: string;
  storageObjectId: string | null;
  storageUrl: string | null;
  type: string;
  sortOrder: number;
}

export interface CreateVideoRequest {
  dayId: string;
  title: string;
  storageObjectId?: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export interface UpdateVideoRequest {
  title?: string;
  storageObjectId?: string;
  durationSeconds?: number;
  sortOrder?: number;
}

export async function createVideo(request: CreateVideoRequest): Promise<MentorVideoDto> {
  return apiPost<MentorVideoDto>("/mentor/videos", request);
}

export async function updateVideo(videoId: string, request: UpdateVideoRequest): Promise<MentorVideoDto> {
  return apiPatch<MentorVideoDto>(`/mentor/videos/${videoId}`, request);
}

export async function deleteVideo(videoId: string): Promise<void> {
  return apiDelete<void>(`/mentor/videos/${videoId}`);
}

export interface CreateNoteRequest {
  dayId: string;
  title: string;
  body?: string;
  sortOrder?: number;
}

export interface UpdateNoteRequest {
  title?: string;
  body?: string;
  sortOrder?: number;
}

export async function createNote(request: CreateNoteRequest): Promise<MentorNoteDto> {
  return apiPost<MentorNoteDto>("/mentor/notes", request);
}

export async function updateNote(noteId: string, request: UpdateNoteRequest): Promise<MentorNoteDto> {
  return apiPatch<MentorNoteDto>(`/mentor/notes/${noteId}`, request);
}

export async function deleteNote(noteId: string): Promise<void> {
  return apiDelete<void>(`/mentor/notes/${noteId}`);
}

export interface CreateResourceRequest {
  dayId: string;
  title: string;
  storageObjectId?: string;
  type?: string;
  sortOrder?: number;
}

export interface UpdateResourceRequest {
  title?: string;
  storageObjectId?: string;
  type?: string;
  sortOrder?: number;
}

export async function createResource(request: CreateResourceRequest): Promise<MentorResourceDto> {
  return apiPost<MentorResourceDto>("/mentor/resources", request);
}

export async function updateResource(resourceId: string, request: UpdateResourceRequest): Promise<MentorResourceDto> {
  return apiPatch<MentorResourceDto>(`/mentor/resources/${resourceId}`, request);
}

export async function deleteResource(resourceId: string): Promise<void> {
  return apiDelete<void>(`/mentor/resources/${resourceId}`);
}

// ─── DDP Management ───────────────────────────────────────────────────────────

export interface MentorDdpDto {
  id: string;
  programId: string;
  dayId: string | null;
  dayTitle: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  required: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  questions: MentorDdpQuestionDto[];
}

export interface MentorDdpQuestionDto {
  id: string;
  prompt: string;
  explanation: string | null;
  type: QuestionType;
  points: number;
  sortOrder: number;
  difficulty: string | null;
  status: string;
  options: MentorDdpOptionDto[];
}

export interface MentorDdpOptionDto {
  id: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface CreateDdpRequest {
  programId: string;
  dayId?: string;
  title: string;
  description?: string;
  instructions?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  required?: boolean;
  status?: string;
}

export interface UpdateDdpRequest {
  title?: string;
  description?: string;
  instructions?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  required?: boolean;
  status?: string;
}

export interface CreateDdpQuestionRequest {
  ddpId: string;
  prompt: string;
  explanation?: string;
  type: QuestionType;
  points?: number;
  sortOrder?: number;
  difficulty?: string;
  status?: string;
}

export interface UpdateDdpQuestionRequest {
  prompt?: string;
  explanation?: string;
  type?: QuestionType;
  points?: number;
  sortOrder?: number;
  difficulty?: string;
  status?: string;
}

export interface CreateDdpOptionRequest {
  questionId: string;
  text: string;
  isCorrect: boolean;
  sortOrder?: number;
}

export interface UpdateDdpOptionRequest {
  text?: string;
  isCorrect?: boolean;
  sortOrder?: number;
}

export async function getMentorDdp(ddpId: string): Promise<MentorDdpDto> {
  return apiGet<MentorDdpDto>(`/mentor/ddp/${ddpId}`);
}

export async function createDdp(request: CreateDdpRequest): Promise<MentorDdpDto> {
  return apiPost<MentorDdpDto>("/mentor/ddp", request);
}

export async function updateDdp(ddpId: string, request: UpdateDdpRequest): Promise<MentorDdpDto> {
  return apiPatch<MentorDdpDto>(`/mentor/ddp/${ddpId}`, request);
}

export async function deleteDdp(ddpId: string): Promise<void> {
  return apiDelete<void>(`/mentor/ddp/${ddpId}`);
}

export async function createDdpQuestion(request: CreateDdpQuestionRequest): Promise<MentorDdpQuestionDto> {
  return apiPost<MentorDdpQuestionDto>("/mentor/ddp/questions", request);
}

export async function updateDdpQuestion(questionId: string, request: UpdateDdpQuestionRequest): Promise<MentorDdpQuestionDto> {
  return apiPatch<MentorDdpQuestionDto>(`/mentor/ddp/questions/${questionId}`, request);
}

export async function deleteDdpQuestion(questionId: string): Promise<void> {
  return apiDelete<void>(`/mentor/ddp/questions/${questionId}`);
}

export async function createDdpOption(request: CreateDdpOptionRequest): Promise<MentorDdpOptionDto> {
  return apiPost<MentorDdpOptionDto>("/mentor/ddp/options", request);
}

export async function updateDdpOption(optionId: string, request: UpdateDdpOptionRequest): Promise<MentorDdpOptionDto> {
  return apiPatch<MentorDdpOptionDto>(`/mentor/ddp/options/${optionId}`, request);
}

export async function deleteDdpOption(optionId: string): Promise<void> {
  return apiDelete<void>(`/mentor/ddp/options/${optionId}`);
}

export async function reorderDdpQuestions(ddpId: string, questionIds: string[]): Promise<void> {
  return apiPost<void>(`/mentor/ddp/${ddpId}/questions/reorder`, { questionIds });
}

// ─── Assignment Management ─────────────────────────────────────────────────────

export interface MentorAssignmentDto {
  id: string;
  programId: string;
  dayId: string | null;
  dayTitle: string | null;
  dayNumber: number | null;
  title: string;
  brief: string | null;
  description: string | null;
  instructions: string | null;
  type: AssignmentType;
  assignmentStatus: AssignmentStatus;
  maxScore: number;
  passingScore: number | null;
  estimatedTime: number | null;
  isRequired: boolean;
  maxAttempts: number;
  dueAt: string | null;
  requirements: AssignmentRequirementDto[];
  resources: AssignmentResourceDto[];
}

export interface AssignmentRequirementDto {
  id: string;
  body: string;
  sortOrder: number;
}

export interface AssignmentResourceDto {
  id: string;
  title: string;
  url: string | null;
  type: string;
  sortOrder: number;
}

export interface CreateAssignmentRequest {
  programId: string;
  dayId?: string;
  title: string;
  brief?: string;
  description?: string;
  instructions?: string;
  type?: AssignmentType;
  maxScore?: number;
  passingScore?: number;
  estimatedTime?: number;
  isRequired?: boolean;
  maxAttempts?: number;
  dueAt?: string;
  status?: AssignmentStatus;
}

export interface UpdateAssignmentRequest {
  title?: string;
  brief?: string;
  description?: string;
  instructions?: string;
  type?: AssignmentType;
  maxScore?: number;
  passingScore?: number;
  estimatedTime?: number;
  isRequired?: boolean;
  maxAttempts?: number;
  dueAt?: string;
  status?: AssignmentStatus;
}

export async function getMentorAssignment(assignmentId: string): Promise<MentorAssignmentDto> {
  return apiGet<MentorAssignmentDto>(`/mentor/assignments/${assignmentId}`);
}

export async function createAssignment(request: CreateAssignmentRequest): Promise<MentorAssignmentDto> {
  return apiPost<MentorAssignmentDto>("/mentor/assignments", request);
}

export async function updateAssignment(assignmentId: string, request: UpdateAssignmentRequest): Promise<MentorAssignmentDto> {
  return apiPatch<MentorAssignmentDto>(`/mentor/assignments/${assignmentId}`, request);
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  return apiDelete<void>(`/mentor/assignments/${assignmentId}`);
}

export interface CreateAssignmentRequirementRequest {
  assignmentId: string;
  body: string;
  sortOrder?: number;
}

export interface UpdateAssignmentRequirementRequest {
  body?: string;
  sortOrder?: number;
}

export async function createAssignmentRequirement(request: CreateAssignmentRequirementRequest): Promise<AssignmentRequirementDto> {
  return apiPost<AssignmentRequirementDto>("/mentor/assignments/requirements", request);
}

export async function updateAssignmentRequirement(requirementId: string, request: UpdateAssignmentRequirementRequest): Promise<AssignmentRequirementDto> {
  return apiPatch<AssignmentRequirementDto>(`/mentor/assignments/requirements/${requirementId}`, request);
}

export async function deleteAssignmentRequirement(requirementId: string): Promise<void> {
  return apiDelete<void>(`/mentor/assignments/requirements/${requirementId}`);
}

export interface CreateAssignmentResourceRequest {
  assignmentId: string;
  title: string;
  url?: string;
  type?: string;
  sortOrder?: number;
}

export interface UpdateAssignmentResourceRequest {
  title?: string;
  url?: string;
  type?: string;
  sortOrder?: number;
}

export async function createAssignmentResource(request: CreateAssignmentResourceRequest): Promise<AssignmentResourceDto> {
  return apiPost<AssignmentResourceDto>("/mentor/assignments/resources", request);
}

export async function updateAssignmentResource(resourceId: string, request: UpdateAssignmentResourceRequest): Promise<AssignmentResourceDto> {
  return apiPatch<AssignmentResourceDto>(`/mentor/assignments/resources/${resourceId}`, request);
}

export async function deleteAssignmentResource(resourceId: string): Promise<void> {
  return apiDelete<void>(`/mentor/assignments/resources/${resourceId}`);
}

// ─── Student Management ───────────────────────────────────────────────────────

export interface MentorStudentDto {
  id: string;
  name: string;
  email: string;
  programTitle: string;
  batchName: string;
  enrollmentId: string;
  progressPercent: number;
  attendanceRate: number;
  ddpAverage: number | null;
  assignmentStatus: string;
}

export async function getMentorStudents(batchId: string): Promise<MentorStudentDto[]> {
  return apiGet<MentorStudentDto[]>(`/mentor/batches/${batchId}/students`);
}

export async function getMentorStudent(enrollmentId: string): Promise<MentorStudentDto> {
  return apiGet<MentorStudentDto>(`/mentor/students/${enrollmentId}`);
}

// ─── Attendance Management ─────────────────────────────────────────────────────

export interface AttendanceRecordDto {
  studentId: string;
  studentName: string;
  status: string;
}

export interface MarkAttendanceRequest {
  batchId: string;
  date: string;
  attendance: Array<{
    studentProfileId: string;
    status: string;
  }>;
}

export async function getAttendance(batchId: string, date: string): Promise<AttendanceRecordDto[]> {
  return apiGet<AttendanceRecordDto[]>(`/mentor/batches/${batchId}/attendance?date=${date}`);
}

export async function markAttendance(request: MarkAttendanceRequest): Promise<void> {
  return apiPost<void>("/mentor/attendance", request);
}

// ─── Assignment Review ───────────────────────────────────────────────────────

export interface PendingSubmissionDto {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  status: SubmissionStatus;
  textAnswer: string | null;
  linkUrl: string | null;
  fileOriginalName: string | null;
}

export interface ReviewSubmissionRequest {
  score: number;
  feedback?: string;
  status: SubmissionStatus;
}

export async function getPendingSubmissions(batchId: string): Promise<PendingSubmissionDto[]> {
  return apiGet<PendingSubmissionDto[]>(`/mentor/batches/${batchId}/submissions/pending`);
}

export async function getSubmissionDetails(submissionId: string): Promise<PendingSubmissionDto> {
  return apiGet<PendingSubmissionDto>(`/mentor/submissions/${submissionId}`);
}

export async function reviewSubmission(submissionId: string, request: ReviewSubmissionRequest): Promise<void> {
  return apiPost<void>(`/mentor/submissions/${submissionId}/review`, request);
}

// ─── DDP Results ─────────────────────────────────────────────────────────────

export interface DdpResultSummaryDto {
  studentName: string;
  studentEmail: string;
  ddpTitle: string;
  attemptNumber: number;
  score: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

export async function getDdpResults(batchId: string): Promise<DdpResultSummaryDto[]> {
  return apiGet<DdpResultSummaryDto[]>(`/mentor/batches/${batchId}/ddp-results`);
}

// ─── Announcements ───────────────────────────────────────────────────────────

export interface AnnouncementDto {
  id: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
  authorName: string;
}

export async function getMentorAnnouncements(batchId: string): Promise<AnnouncementDto[]> {
  return apiGet<AnnouncementDto[]>(`/mentor/batches/${batchId}/announcements`);
}

export interface CreateAnnouncementRequest {
  batchId: string;
  title: string;
  body: string;
  priority?: string;
}

export async function createAnnouncement(request: CreateAnnouncementRequest): Promise<AnnouncementDto> {
  return apiPost<AnnouncementDto>("/mentor/announcements", request);
}

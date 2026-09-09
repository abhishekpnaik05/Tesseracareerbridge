import { apiGet, apiPost, apiPatch, apiDelete } from "./api";
import type { Paginated } from "@tesseracareerbridge/shared";
import type {
  AdminDashboardDto,
  AdminStudentListItem,
  AdminStudentDetail,
  AdminMentorListItem,
  AdminMentorDetail,
  AdminProgramListItem,
  AdminProgramDetail,
  AdminBatchListItem,
  AdminBatchDetail,
  AdminEnrollmentListItem,
  AdminEnrollmentDetail,
  TodayAttendanceDto,
  BatchAttendanceDto,
  StudentAttendanceHistoryDto,
  AdminAnnouncementListItem,
  AttendanceReportDto,
  DdpReportDto,
  AssignmentReportDto,
  InternshipProgressReportDto,
  CreateInternshipRequest,
  MentorInfo
} from "@tesseracareerbridge/shared";

// Re-export types for backward compatibility
export type {
  AdminDashboardDto,
  AdminStudentListItem,
  AdminStudentDetail,
  AdminMentorListItem,
  AdminMentorDetail,
  AdminProgramListItem,
  AdminProgramDetail,
  AdminBatchListItem,
  AdminBatchDetail,
  AdminEnrollmentListItem,
  AdminEnrollmentDetail,
  TodayAttendanceDto,
  BatchAttendanceDto,
  StudentAttendanceHistoryDto,
  AdminAnnouncementListItem,
  AttendanceReportDto,
  DdpReportDto,
  AssignmentReportDto,
  InternshipProgressReportDto,
  CreateInternshipRequest,
  MentorInfo
};

// Admin Dashboard
export async function getAdminDashboard(): Promise<AdminDashboardDto> {
  return apiGet<AdminDashboardDto>("/admins/dashboard");
}

// Student Management
export interface StudentListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  program?: string;
  batch?: string;
  status?: string;
}

export async function getAdminStudents(query: StudentListQuery = {}): Promise<Paginated<AdminStudentListItem>> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", query.page.toString());
  if (query.pageSize) params.set("pageSize", query.pageSize.toString());
  if (query.search) params.set("search", query.search);
  if (query.program) params.set("program", query.program);
  if (query.batch) params.set("batch", query.batch);
  if (query.status) params.set("status", query.status);
  
  const queryString = params.toString();
  return apiGet<Paginated<AdminStudentListItem>>(`/admins/students${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminStudent(studentId: string): Promise<AdminStudentDetail> {
  return apiGet<AdminStudentDetail>(`/admins/students/${studentId}`);
}

// Mentor Management
export interface MentorListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
}

export async function getAdminMentors(query: MentorListQuery = {}): Promise<Paginated<AdminMentorListItem>> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", query.page.toString());
  if (query.pageSize) params.set("pageSize", query.pageSize.toString());
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  
  const queryString = params.toString();
  return apiGet<Paginated<AdminMentorListItem>>(`/admins/mentors${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminMentor(mentorId: string): Promise<AdminMentorDetail> {
  return apiGet<AdminMentorDetail>(`/admins/mentors/${mentorId}`);
}

export async function assignMentorToBatch(batchId: string, mentorId: string): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>(`/admins/batches/${batchId}/assign-mentor`, { mentorId });
}

// Program Management
export interface CreateProgramRequest {
  title: string;
  summary?: string;
  description?: string;
  durationWeeks?: number;
  durationLabel?: string;
  level?: string;
  category?: string;
  audience?: string;
  learningApproach?: string;
  learningDaysPerWeek?: number;
  skills?: string[];
  outcomes?: string[];
  requirements?: string[];
}

export interface UpdateProgramRequest extends Partial<CreateProgramRequest> {
  status?: string;
  featured?: boolean;
  availability?: string;
}

export interface ProgramListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  category?: string;
}

export async function getAdminPrograms(query: ProgramListQuery = {}): Promise<Paginated<AdminProgramListItem>> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", query.page.toString());
  if (query.pageSize) params.set("pageSize", query.pageSize.toString());
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.category) params.set("category", query.category);
  
  const queryString = params.toString();
  return apiGet<Paginated<AdminProgramListItem>>(`/admins/programs${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminProgram(programId: string): Promise<AdminProgramDetail> {
  return apiGet<AdminProgramDetail>(`/admins/programs/${programId}`);
}

export async function createAdminProgram(data: CreateProgramRequest): Promise<AdminProgramDetail> {
  return apiPost<AdminProgramDetail>("/admins/programs", data);
}

export async function updateAdminProgram(programId: string, data: UpdateProgramRequest): Promise<AdminProgramDetail> {
  return apiPatch<AdminProgramDetail>(`/admins/programs/${programId}`, data);
}

// Batch/Internship Management
export interface CreateBatchRequest {
  programId: string;
  name: string;
  slug?: string;
  startsAt?: string;
  endsAt?: string;
  enrollmentOpenDate?: string;
  enrollmentCloseDate?: string;
  capacity?: number;
  description?: string;
}

export interface UpdateBatchRequest extends Partial<CreateBatchRequest> {
  status?: string;
}

export interface BatchListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  programId?: string;
  status?: string;
}

export async function getAdminBatches(query: BatchListQuery = {}): Promise<Paginated<AdminBatchListItem>> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", query.page.toString());
  if (query.pageSize) params.set("pageSize", query.pageSize.toString());
  if (query.search) params.set("search", query.search);
  if (query.programId) params.set("programId", query.programId);
  if (query.status) params.set("status", query.status);
  
  const queryString = params.toString();
  return apiGet<Paginated<AdminBatchListItem>>(`/admins/batches${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminBatch(batchId: string): Promise<AdminBatchDetail> {
  return apiGet<AdminBatchDetail>(`/admins/batches/${batchId}`);
}

export async function createAdminBatch(data: CreateBatchRequest): Promise<AdminBatchDetail> {
  return apiPost<AdminBatchDetail>("/admins/batches", data);
}

export async function updateAdminBatch(batchId: string, data: UpdateBatchRequest): Promise<AdminBatchDetail> {
  return apiPatch<AdminBatchDetail>(`/admins/batches/${batchId}`, data);
}

// Enrollment Management
export interface EnrollmentListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  programId?: string;
  batchId?: string;
  status?: string;
}

export async function getAdminEnrollments(query: EnrollmentListQuery = {}): Promise<Paginated<AdminEnrollmentListItem>> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", query.page.toString());
  if (query.pageSize) params.set("pageSize", query.pageSize.toString());
  if (query.search) params.set("search", query.search);
  if (query.programId) params.set("programId", query.programId);
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.status) params.set("status", query.status);
  
  const queryString = params.toString();
  return apiGet<Paginated<AdminEnrollmentListItem>>(`/admins/enrollments${queryString ? `?${queryString}` : ""}`);
}

export async function getAdminEnrollment(enrollmentId: string): Promise<AdminEnrollmentDetail> {
  return apiGet<AdminEnrollmentDetail>(`/admins/enrollments/${enrollmentId}`);
}

// Attendance Management
export interface AttendanceQuery {
  date?: string;
  programId?: string;
  batchId?: string;
  studentId?: string;
  status?: string;
}

export async function getTodayAttendance(): Promise<TodayAttendanceDto> {
  return apiGet<TodayAttendanceDto>("/admins/attendance/today");
}

export async function getBatchAttendance(batchId: string, date: string): Promise<BatchAttendanceDto> {
  return apiGet<BatchAttendanceDto>(`/admins/attendance/batches/${batchId}?date=${date}`);
}

export async function getStudentAttendance(studentId: string): Promise<StudentAttendanceHistoryDto> {
  return apiGet<StudentAttendanceHistoryDto>(`/admins/attendance/students/${studentId}`);
}

export async function getAttendanceOverview(query: AttendanceQuery = {}): Promise<{
  byDate: Array<{ date: string; present: number; absent: number; percentage: number }>;
  byBatch: Array<{ batchId: string; batchName: string; percentage: number }>;
  byStudent: Array<{ studentId: string; studentName: string; percentage: number }>;
}> {
  const params = new URLSearchParams();
  if (query.date) params.set("date", query.date);
  if (query.programId) params.set("programId", query.programId);
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.studentId) params.set("studentId", query.studentId);
  if (query.status) params.set("status", query.status);
  
  const queryString = params.toString();
  return apiGet(`/admins/attendance/overview${queryString ? `?${queryString}` : ""}`);
}

// Announcements
export interface CreateAnnouncementRequest {
  title: string;
  body: string;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  audience: "ALL" | "STUDENTS" | "MENTORS" | "SPECIFIC_BATCH";
  batchId?: string;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}

export async function getAdminAnnouncements(query: { page?: number; pageSize?: number } = {}): Promise<Paginated<AdminAnnouncementListItem>> {
  const params = new URLSearchParams();
  if (query.page) params.set("page", query.page.toString());
  if (query.pageSize) params.set("pageSize", query.pageSize.toString());
  
  const queryString = params.toString();
  return apiGet<Paginated<AdminAnnouncementListItem>>(`/admins/announcements${queryString ? `?${queryString}` : ""}`);
}

export async function createAdminAnnouncement(data: CreateAnnouncementRequest): Promise<AdminAnnouncementListItem> {
  return apiPost<AdminAnnouncementListItem>("/admins/announcements", data);
}

export async function updateAdminAnnouncement(announcementId: string, data: UpdateAnnouncementRequest): Promise<AdminAnnouncementListItem> {
  return apiPatch<AdminAnnouncementListItem>(`/admins/announcements/${announcementId}`, data);
}

export async function deleteAdminAnnouncement(announcementId: string): Promise<{ success: boolean }> {
  return apiDelete<{ success: boolean }>(`/admins/announcements/${announcementId}`);
}

// Reports
export async function getAttendanceReport(query: { batchId?: string; studentId?: string; startDate?: string; endDate?: string } = {}): Promise<AttendanceReportDto> {
  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.studentId) params.set("studentId", query.studentId);
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  
  const queryString = params.toString();
  return apiGet<AttendanceReportDto>(`/admins/reports/attendance${queryString ? `?${queryString}` : ""}`);
}

export async function getDdpReport(query: { batchId?: string; ddpId?: string } = {}): Promise<DdpReportDto> {
  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.ddpId) params.set("ddpId", query.ddpId);
  
  const queryString = params.toString();
  return apiGet<DdpReportDto>(`/admins/reports/ddp${queryString ? `?${queryString}` : ""}`);
}

export async function getAssignmentReport(query: { batchId?: string; assignmentId?: string } = {}): Promise<AssignmentReportDto> {
  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  if (query.assignmentId) params.set("assignmentId", query.assignmentId);
  
  const queryString = params.toString();
  return apiGet<AssignmentReportDto>(`/admins/reports/assignments${queryString ? `?${queryString}` : ""}`);
}

export async function getInternshipProgressReport(query: { batchId?: string } = {}): Promise<InternshipProgressReportDto> {
  const params = new URLSearchParams();
  if (query.batchId) params.set("batchId", query.batchId);
  
  const queryString = params.toString();
  return apiGet<InternshipProgressReportDto>(`/admins/reports/internship-progress${queryString ? `?${queryString}` : ""}`);
}

// Internship Creation
export async function getAvailableMentors(): Promise<MentorInfo[]> {
  return apiGet<MentorInfo[]>("/admins/internships/mentors/available");
}

export async function createInternship(data: CreateInternshipRequest): Promise<{ batchId: string; programId: string }> {
  return apiPost<{ batchId: string; programId: string }>("/admins/internships", data);
}

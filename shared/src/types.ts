import type { UserRole } from "./roles.js";

export type Id = string;

export const ACCOUNT_STATUSES = [
  "PENDING_VERIFICATION",
  "ACTIVE",
  "SUSPENDED",
  "DISABLED",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthUser {
  id: Id;
  email: string;
  role: UserRole;
  displayName: string;
  status: AccountStatus;
  emailVerified: boolean;
  phone: string | null;
}

export interface JwtPayload {
  sub: Id;
  role: UserRole;
  email: string;
  sid: string;
}

export interface StudentProfileDto {
  university: string | null;
  usn: string | null;
  branch: string | null;
  semester: number | null;
  phone: string | null;
  college: string | null;
  graduationYear: number | null;
  city: string | null;
  state: string | null;
}

export interface MentorProfileDto {
  title: string | null;
  bio: string | null;
  phone: string | null;
  skills: string | null;
  experience: string | null;
  linkedin: string | null;
  github: string | null;
}

export const NOTIFICATION_CATEGORIES = [
  "LEARNING",
  "ASSIGNMENT",
  "DDP",
  "TEST",
  "MENTOR",
  "ANNOUNCEMENT",
  "CERTIFICATE",
  "ACCOUNT",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH"] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export interface NotificationDto {
  id: Id;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  href: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface StudentPreferences {
  notifyAssignments: boolean;
  notifyTests: boolean;
  notifyMentor: boolean;
  notifyAnnouncements: boolean;
  language: string;
  appearance: "dark" | "system";
}

export interface ProfileCompletion {
  percent: number;
  missing: { key: string; label: string }[];
}

export interface StudentAccountDto {
  user: AuthUser;
  profile: StudentProfileDto;
  photoUrl: string | null;
  completion: ProfileCompletion;
  preferences: StudentPreferences;
  unreadNotificationCount: number;
}

export interface CurrentInternshipDto {
  enrollmentId: Id;
  programName: string;
  batchName: string;
  progressPercent: number;
  weekNumber: number | null;
  dayNumber: number | null;
  startsAt: string | null;
  endsAt: string | null;
}

export interface TodayLearningDto {
  dayNumber: number;
  topic: string;
  objective: string;
  contentCount: number;
  estimatedMinutes: number;
  progressPercent: number;
  steps: { id: string; label: string; done: boolean }[];
}

export interface ContinueLearningDto {
  title: string;
  detail: string;
  href: string;
}

export interface StudentProgressDto {
  overallPercent: number;
  days: { done: number; total: number };
  ddp: { done: number; total: number };
  assignments: { done: number; total: number };
  tests: { done: number; total: number };
  projects: { done: number; total: number };
}

export interface UpcomingActivityDto {
  id: Id;
  title: string;
  occursAt: string;
  type: string;
  status: string;
  href: string | null;
}

export interface AnnouncementDto {
  id: Id;
  title: string;
  body: string;
  createdAt: string;
  priority: NotificationPriority;
}

export interface StudentDashboardDto {
  studentName: string;
  currentInternship: CurrentInternshipDto | null;
  today: TodayLearningDto | null;
  continueLearning: ContinueLearningDto | null;
  progress: StudentProgressDto | null;
  upcoming: UpcomingActivityDto[];
  announcements: AnnouncementDto[];
  notificationPreview: NotificationDto[];
}

export interface AuthSessionDto {
  id: Id;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

export const PROGRAM_SORTS = ["featured", "newest", "duration", "name"] as const;
export type ProgramSort = (typeof PROGRAM_SORTS)[number];

export interface ProgramListItemDto {
  id: Id;
  slug: string;
  title: string;
  summary: string;
  durationLabel: string;
  durationWeeks: number | null;
  level: string;
  category: string;
  skills: string[];
  featured: boolean;
  availability: string;
  visualTone: "a" | "b" | "c" | "d";
}

export interface ProgramCurriculumDayDto {
  index: number;
  title: string;
}

export interface ProgramCurriculumWeekDto {
  index: number;
  title: string;
  days: ProgramCurriculumDayDto[];
}

export interface ProgramProjectPreviewDto {
  title: string;
  type: string;
  description: string;
  difficulty: string | null;
  skills: string[];
}

export interface ProgramDetailDto extends ProgramListItemDto {
  description: string;
  audience: string;
  learningApproach: string;
  learningDaysPerWeek: number | null;
  outcomes: string[];
  requirements: string[];
  benefits: { title: string; body: string | null }[];
  faqs: { id: string; title: string; body: string }[];
  weeks: ProgramCurriculumWeekDto[];
  projects: ProgramProjectPreviewDto[];
}

export interface ProgramListResponse {
  items: ProgramListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    categories: string[];
    levels: string[];
    durations: string[];
    availabilities: string[];
  };
}

export const BATCH_STATUSES = ["DRAFT", "UPCOMING", "OPEN", "FULL", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export type BatchStatus = (typeof BATCH_STATUSES)[number];

export interface BatchDto {
  id: string;
  slug: string;
  name: string;
  programId: string;
  programTitle: string;
  startsAt: string;
  endsAt: string;
  enrollmentOpenDate: string;
  enrollmentCloseDate: string;
  capacity: number | null;
  enrolledCount: number;
  status: BatchStatus;
  description: string | null;
}

export const ENROLLMENT_STATUSES = ["PENDING", "ACTIVE", "COMPLETED", "WITHDRAWN", "SUSPENDED"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export const CURRICULUM_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type CurriculumStatus = (typeof CURRICULUM_STATUSES)[number];

export const DAY_AVAILABILITY = ["LOCKED", "AVAILABLE", "IN_PROGRESS", "COMPLETED"] as const;
export type DayAvailability = (typeof DAY_AVAILABILITY)[number];

export interface EnrollmentDto {
  id: string;
  userId: string;
  programId: string;
  programTitle: string;
  batchId: string;
  batchName: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  progressPercent: number;
  currentDay: number | null;
  totalDays: number | null;
}

export interface CreateEnrollmentRequest {
  batchId: string;
}

export interface EnrollmentListResponse {
  items: EnrollmentDto[];
  total: number;
}

export interface InternshipCurriculumDto {
  enrollmentId: string;
  programId: string;
  programTitle: string;
  batchId: string;
  batchName: string;
  status: EnrollmentStatus;
  startsAt: string | null;
  endsAt: string | null;
  overallProgress: number;
  currentWeek: number | null;
  currentDay: number | null;
  totalDays: number;
  completedDays: number;
  weeks: InternshipWeekDto[];
}

export interface InternshipWeekDto {
  id: string;
  weekNumber: number;
  title: string;
  description: string | null;
  progress: number;
  completedDays: number;
  totalDays: number;
  days: InternshipDayDto[];
}

export interface InternshipDayDto {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  objective: string | null;
  estimatedDuration: number | null;
  availability: DayAvailability;
  progress: number;
  isCurrent: boolean;
  completedAt: string | null;
}

export const CONTENT_TYPES = ["VIDEO", "LESSON", "NOTE", "RESOURCE", "PRACTICE", "DDP", "ASSIGNMENT", "TEST"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export const ACTIVITY_STATUS = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type ActivityStatus = (typeof ACTIVITY_STATUS)[number];

export const QUESTION_TYPES = ["MCQ_SINGLE", "MCQ_MULTIPLE", "TRUE_FALSE"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const DDP_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type DdpStatus = (typeof DDP_STATUS)[number];

export const ATTEMPT_STATUS = ["IN_PROGRESS", "SUBMITTED", "AUTO_SUBMITTED", "EXPIRED"] as const;
export type AttemptStatus = (typeof ATTEMPT_STATUS)[number];

export interface LearningContentDto {
  id: string;
  title: string;
  description: string | null;
  type: ContentType;
  order: number;
  duration: number | null;
  status: ActivityStatus;
  progressPercent: number;
  isRequired: boolean;
  contentId: string;
}

export interface DayDetailDto {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  objective: string | null;
  objectives: string[];
  estimatedDuration: number | null;
  week: {
    id: string;
    weekNumber: number;
    title: string;
  };
  program: {
    id: string;
    title: string;
  };
  availability: DayAvailability;
  status: ActivityStatus;
  progress: number;
  content: LearningContentDto[];
  totalActivities: number;
  completedActivities: number;
  previousDayId: string | null;
  nextDayId: string | null;
}

export interface VideoDto {
  id: string;
  title: string;
  storageObjectId: string | null;
  storageUrl: string | null;
  durationSeconds: number | null;
  duration: string | null;
  progress: number;
  lastPosition: number | null;
  status: ActivityStatus;
}

export interface NoteDto {
  id: string;
  title: string;
  body: string | null;
  readingTime: number | null;
  status: ActivityStatus;
}

export interface ResourceDto {
  id: string;
  title: string;
  storageObjectId: string | null;
  storageUrl: string | null;
  type: string;
  description: string | null;
  status: ActivityStatus;
}

export interface PracticeTaskDto {
  id: string;
  title: string;
  instructions: string | null;
  status: ActivityStatus;
}

export interface DdpDto {
  id: string;
  title: string;
  prompt: string | null;
  questionCount: number;
  estimatedTime: number | null;
  status: ActivityStatus;
  attemptCount: number;
}

export const ASSIGNMENT_TYPES = ["TEXT", "FILE_UPLOAD", "LINK"] as const;
export type AssignmentType = (typeof ASSIGNMENT_TYPES)[number];

export const ASSIGNMENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const SUBMISSION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "EVALUATED",
  "RETURNED",
  "RESUBMISSION_REQUIRED",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const ASSIGNMENT_RESOURCE_TYPES = ["LINK", "PDF", "GITHUB", "DOC", "OTHER"] as const;
export type AssignmentResourceType = (typeof ASSIGNMENT_RESOURCE_TYPES)[number];

// Minimal DTO used on the Day page content list
export interface AssignmentDto {
  id: string;
  title: string;
  brief: string | null;
  type: AssignmentType;
  assignmentStatus: AssignmentStatus;
  dueAt: string | null;
  estimatedTime: number | null;
  isRequired: boolean;
  maxAttempts: number;
  status: ActivityStatus;
  submissionStatus: SubmissionStatus | null;
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
  type: AssignmentResourceType;
  sortOrder: number;
}

export interface AssignmentSubmissionDto {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  attemptNumber: number;
  status: SubmissionStatus;
  textAnswer: string | null;
  linkUrl: string | null;
  fileKey: string | null;
  fileOriginalName: string | null;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  reviewedAt: string | null;
  reviewedByName: string | null;
  isLate: boolean;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Full assignment detail for the assignment page
export interface AssignmentDetailDto {
  id: string;
  dayId: string | null;
  dayNumber: number | null;
  dayTitle: string | null;
  programId: string;
  programTitle: string;
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
  // Student-specific data
  activityStatus: ActivityStatus;
  currentSubmission: AssignmentSubmissionDto | null;
  submissionHistory: AssignmentSubmissionDto[];
  attemptCount: number;
  canSubmit: boolean;
  canResubmit: boolean;
}

export interface SaveDraftRequest {
  enrollmentId: string;
  textAnswer?: string;
  linkUrl?: string;
}

export interface SubmitAssignmentRequest {
  enrollmentId: string;
  textAnswer?: string;
  linkUrl?: string;
  // File submissions use multipart form, handled separately
}

export interface AssignmentListItemDto {
  id: string;
  title: string;
  type: AssignmentType;
  assignmentStatus: AssignmentStatus;
  dueAt: string | null;
  estimatedTime: number | null;
  submissionStatus: SubmissionStatus | null;
  dayTitle: string | null;
  dayNumber: number | null;
}


export interface UpdateActivityProgressRequest {
  contentType: ContentType;
  contentId: string;
  status: ActivityStatus;
  progressPercent?: number;
  metadata?: Record<string, unknown>;
}

// DDP Types
export interface DdpStartDto {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  durationMinutes: number;
  passingScore: number;
  maxAttempts: number;
  questionCount: number;
}

export interface DdpAttemptsDto {
  used: number;
  remaining: number;
  history: Array<{
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    percentage: number | null;
    passed: boolean | null;
    submittedAt: string | null;
  }>;
}

export interface DdpActiveAttemptDto {
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
}

export interface DdpDataDto {
  ddp: DdpStartDto;
  attempts: DdpAttemptsDto;
  activeAttempt: DdpActiveAttemptDto | null;
}

export interface DdpQuestionDto {
  id: string;
  prompt: string;
  type: QuestionType;
  points: number;
  sortOrder: number;
  options: Array<{
    id: string;
    text: string;
    sortOrder: number;
  }>;
  selectedOptionIds: string[];
}

export interface DdpQuestionsDto {
  ddp: {
    id: string;
    title: string;
    durationMinutes: number;
    passingScore: number;
  };
  attempt: {
    id: string;
    attemptNumber: number;
    startedAt: string;
  };
  questions: DdpQuestionDto[];
}

export interface DdpResultDto {
  attempt: {
    id: string;
    attemptNumber: number;
    status: string;
    score: number;
    percentage: number;
    passed: boolean;
    timeSpent: number | null;
    submittedAt: string | null;
  };
  ddp: {
    id: string;
    title: string;
    passingScore: number;
  };
  questions: Array<{
    id: string;
    prompt: string;
    explanation: string | null;
    type: QuestionType;
    points: number;
    yourAnswer: string[];
    correctAnswer: Array<{
      id: string;
      text: string;
    }>;
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
}

export interface DdpHistoryDto {
  ddp: {
    id: string;
    title: string;
    maxAttempts: number;
    passingScore: number;
  };
  attempts: Array<{
    id: string;
    attemptNumber: number;
    status: string;
    score: number | null;
    percentage: number | null;
    passed: boolean | null;
    timeSpent: number | null;
    submittedAt: string | null;
  }>;
}

// Admin Types
export interface AdminDashboardDto {
  totalStudents: number;
  activeStudents: number;
  totalMentors: number;
  activeMentors: number;
  totalPrograms: number;
  activePrograms: number;
  totalBatches: number;
  activeBatches: number;
  totalEnrollments: number;
  activeEnrollments: number;
  todayAttendance: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
  pendingReviews: number;
  recentAnnouncements: Array<{
    id: string;
    title: string;
    createdAt: string;
  }>;
}

export interface AdminStudentListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  program: string | null;
  batch: string | null;
  status: string;
  progress: number | null;
  attendance: number | null;
}

export interface AdminStudentDetail {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  university: string | null;
  branch: string | null;
  semester: number | null;
  status: string;
  enrollments: Array<{
    id: string;
    programTitle: string;
    batchName: string;
    status: string;
    enrolledAt: string;
    progress: number;
  }>;
  progress: {
    overallPercent: number;
    weeksCompleted: number;
    daysCompleted: number;
  };
  attendance: {
    present: number;
    absent: number;
    percentage: number;
  };
  ddpPerformance: {
    averageScore: number;
    completed: number;
    passed: number;
    failed: number;
  };
  assignmentPerformance: {
    submitted: number;
    pending: number;
    reviewed: number;
    averageScore: number;
  };
}

export interface AdminMentorListItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string | null;
  status: string;
  assignedBatches: number;
  assignedStudents: number;
}

export interface AdminMentorDetail {
  id: string;
  userId: string;
  name: string;
  email: string;
  title: string | null;
  bio: string | null;
  phone: string | null;
  skills: string | null;
  experience: string | null;
  linkedin: string | null;
  github: string | null;
  status: string;
  assignedInternships: Array<{
    id: string;
    programTitle: string;
    batchName: string;
    assignedAt: string;
  }>;
  assignedBatches: number;
  studentCount: number;
  recentActivity: Array<{
    type: string;
    description: string;
    createdAt: string;
  }>;
}

export interface AdminProgramListItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  durationWeeks: number | null;
  level: string | null;
  category: string | null;
  status: string;
  featured: boolean;
  batchCount: number;
  enrollmentCount: number;
}

export interface AdminProgramDetail {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  description: string | null;
  durationWeeks: number | null;
  durationLabel: string | null;
  level: string | null;
  category: string | null;
  audience: string | null;
  learningApproach: string | null;
  learningDaysPerWeek: number | null;
  status: string;
  featured: boolean;
  availability: string;
  skills: string[];
  outcomes: string[];
  requirements: string[];
  batchCount: number;
  enrollmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBatchListItem {
  id: string;
  name: string;
  slug: string | null;
  programId: string;
  programTitle: string;
  startsAt: string | null;
  endsAt: string | null;
  status: string;
  capacity: number | null;
  enrolledCount: number;
  mentor: {
    id: string;
    name: string;
  } | null;
}

export interface AdminBatchDetail {
  id: string;
  name: string;
  slug: string | null;
  programId: string;
  programTitle: string;
  startsAt: string | null;
  endsAt: string | null;
  enrollmentOpenDate: string | null;
  enrollmentCloseDate: string | null;
  status: string;
  capacity: number | null;
  enrolledCount: number;
  description: string | null;
  mentor: {
    id: string;
    name: string;
    email: string;
  } | null;
  students: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
    progress: number;
  }>;
}

export interface AdminEnrollmentListItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programId: string;
  programTitle: string;
  batchId: string;
  batchName: string;
  status: string;
  enrolledAt: string;
  progress: number;
}

export interface AdminEnrollmentDetail {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  programId: string;
  programTitle: string;
  batchId: string;
  batchName: string;
  mentorId: string | null;
  mentorName: string | null;
  status: string;
  enrolledAt: string;
  activatedAt: string | null;
  completedAt: string | null;
  progress: number;
  currentDay: number | null;
  totalDays: number | null;
  attendance: {
    present: number;
    absent: number;
    percentage: number;
  };
  ddpPerformance: {
    averageScore: number;
    completed: number;
    passed: number;
  };
  assignmentPerformance: {
    submitted: number;
    reviewed: number;
    averageScore: number;
  };
}

export interface TodayAttendanceDto {
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  percentage: number;
}

export interface BatchAttendanceDto {
  batchId: string;
  batchName: string;
  programId: string;
  programTitle: string;
  date: string;
  students: Array<{
    studentId: string;
    studentName: string;
    studentEmail: string;
    status: string;
    markedBy: string | null;
    updatedAt: string | null;
  }>;
}

export interface StudentAttendanceHistoryDto {
  studentId: string;
  studentName: string;
  records: Array<{
    date: string;
    status: string;
  }>;
  summary: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
  };
}

export interface AdminAnnouncementListItem {
  id: string;
  title: string;
  body: string;
  priority: string;
  audience: string;
  batchId: string | null;
  batchName: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface AttendanceReportDto {
  byBatch: Array<{
    batchId: string;
    batchName: string;
    present: number;
    absent: number;
    percentage: number;
  }>;
  byStudent: Array<{
    studentId: string;
    studentName: string;
    present: number;
    absent: number;
    percentage: number;
  }>;
  byDate: Array<{
    date: string;
    present: number;
    absent: number;
    percentage: number;
  }>;
}

export interface DdpReportDto {
  byDdp: Array<{
    ddpId: string;
    ddpTitle: string;
    attempts: number;
    averageScore: number;
    passRate: number;
  }>;
  byStudent: Array<{
    studentId: string;
    studentName: string;
    averageScore: number;
    completed: number;
    passed: number;
  }>;
}

export interface AssignmentReportDto {
  byAssignment: Array<{
    assignmentId: string;
    assignmentTitle: string;
    submissions: number;
    pendingReviews: number;
    reviewed: number;
    averageScore: number;
    resubmissions: number;
  }>;
  byStudent: Array<{
    studentId: string;
    studentName: string;
    submitted: number;
    averageScore: number;
  }>;
}

export interface InternshipProgressReportDto {
  byInternship: Array<{
    batchId: string;
    batchName: string;
    students: number;
    averageProgress: number;
    completedDays: number;
    ddpCompletion: number;
    assignmentCompletion: number;
  }>;
}

// Internship Creation Types
export const INTERNSHIP_STATUSES = ["DRAFT", "REGISTRATION_OPEN", "UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"] as const;
export type InternshipStatus = (typeof INTERNSHIP_STATUSES)[number];

export const INTERNSHIP_CATEGORIES = ["Software Development", "Data Science", "Cloud Computing", "DevOps", "Cybersecurity", "AI/ML", "Mobile Development", "Web Development", "Other"] as const;
export type InternshipCategory = (typeof INTERNSHIP_CATEGORIES)[number];

export const INTERNSHIP_TYPES = ["Full-time", "Part-time", "Remote", "Hybrid", "On-site"] as const;
export type InternshipType = (typeof INTERNSHIP_TYPES)[number];

export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const BATCH_ASSIGNMENT_METHODS = ["AUTOMATIC", "MANUAL", "PENDING_APPROVAL"] as const;
export type BatchAssignmentMethod = (typeof BATCH_ASSIGNMENT_METHODS)[number];

export interface InternshipBasicDetails {
  name: string;
  code: string;
  description: string;
  category: InternshipCategory;
  type: InternshipType;
  department: string;
  skillArea: string;
  difficultyLevel: DifficultyLevel;
  durationWeeks: number;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  maxStudents: number;
  status: InternshipStatus;
}

export interface InternshipProgramInfo {
  overview: string;
  objectives: string[];
  whatStudentsWillLearn: string[];
  skillsDeveloped: string[];
  prerequisites: string[];
  eligibilityCriteria: string[];
  expectedOutcomes: string[];
  certificateInfo: string;
  guidelines: string;
  termsConditions: string;
}

export interface WeekStructure {
  weekNumber: number;
  title: string;
  description: string;
}

export interface InternshipCurriculumStructure {
  totalWeeks: number;
  weeks: WeekStructure[];
}

export interface MentorInfo {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  currentInternships: number;
  currentStudentCount: number;
  availability: string;
}

export interface InternshipBatchSetup {
  batchName: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  maxCapacity: number;
  assignedMentorId: string;
  enrollmentStatus: string;
}

export interface InternshipEnrollmentConfig {
  whoCanEnroll: string;
  maxStudents: number;
  registrationRequirement: string;
  approvalRequired: boolean;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  eligibilityCriteria: string[];
  batchAssignmentMethod: BatchAssignmentMethod;
}

export interface InternshipResource {
  title: string;
  type: string;
  fileKey?: string;
  url?: string;
  description?: string;
}

export interface InternshipAnnouncementSetup {
  title: string;
  body: string;
  priority: "NORMAL" | "IMPORTANT" | "URGENT";
  targetAudience: "STUDENTS" | "SPECIFIC_PROGRAM" | "SPECIFIC_INTERNSHIP" | "SPECIFIC_BATCH";
  sendImmediately: boolean;
}

export interface CreateInternshipRequest {
  basicDetails: InternshipBasicDetails;
  programInfo: InternshipProgramInfo;
  curriculumStructure: InternshipCurriculumStructure;
  batchSetup: InternshipBatchSetup;
  enrollmentConfig: InternshipEnrollmentConfig;
  resources?: InternshipResource[];
  announcement?: InternshipAnnouncementSetup | null;
}

export interface InternshipCreationSummary {
  internship: {
    name: string;
    code: string;
    category: string;
    duration: number;
    startDate: string;
    endDate: string;
    status: string;
  };
  program: {
    description: string;
    objectives: string[];
    skills: string[];
    eligibility: string[];
  };
  structure: {
    totalWeeks: number;
    weekNames: string[];
  };
  mentor: {
    name: string;
    email: string;
  };
  batch: {
    name: string;
    dates: { start: string; end: string };
    capacity: number;
  };
  enrollment: {
    registrationDates: { start: string; end: string };
    maxStudents: number;
    approvalSettings: string;
  };
  resources: InternshipResource[];
}

export const API_PREFIX = "/api/v1";

export const API_ROUTES = {
  health: "/health",
  auth: "/auth",
  users: "/users",
  students: "/students",
  mentors: "/mentors",
  admins: "/admins",
  programs: "/programs",
  batches: "/batches",
  enrollments: "/enrollments",
  curriculum: "/curriculum",
  content: "/content",
  progress: "/progress",
  ddp: "/ddp",
  assignments: "/assignments",
  tests: "/tests",
  projects: "/projects",
  mentorship: "/mentorship",
  notifications: "/notifications",
  attendance: "/attendance",
  certificates: "/certificates",
  analytics: "/analytics",
  payments: "/payments",
} as const;

export const BATCH_ROUTES = {
  listProgramBatches: (programKey: string) => `/batches/programs/${programKey}`,
  getBatch: (id: string) => `/batches/${id}`,
} as const;

export const ENROLLMENT_ROUTES = {
  createEnrollment: "/enrollments",
  listUserEnrollments: "/enrollments/me",
  getEnrollment: (id: string) => `/enrollments/${id}`,
  cancelEnrollment: (id: string) => `/enrollments/${id}/cancel`,
  getInternshipCurriculum: (id: string) => `/enrollments/${id}/curriculum`,
} as const;

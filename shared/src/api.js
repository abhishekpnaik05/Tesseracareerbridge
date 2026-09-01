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
};
export const BATCH_ROUTES = {
    listProgramBatches: (programKey) => `/batches/programs/${programKey}`,
    getBatch: (id) => `/batches/${id}`,
};
export const ENROLLMENT_ROUTES = {
    createEnrollment: "/enrollments",
    listUserEnrollments: "/enrollments/me",
    getEnrollment: (id) => `/enrollments/${id}`,
    cancelEnrollment: (id) => `/enrollments/${id}/cancel`,
    getInternshipCurriculum: (id) => `/enrollments/${id}/curriculum`,
};

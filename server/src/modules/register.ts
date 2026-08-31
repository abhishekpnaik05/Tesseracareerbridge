import { Router } from "express";
import { API_ROUTES } from "@tesseracareerbridge/shared";
import { createModuleRouter } from "./_foundation.js";
import { authRouter } from "./auth/auth.router.js";
import { adminsRouter, mentorsRouter } from "./accounts/accounts.router.js";
import { studentsRouter } from "./students/students.router.js";
import { programsRouter } from "./programs/programs.router.js";
import { batchesRouter } from "./batches/batches.router.js";
import { enrollmentsRouter } from "./enrollments/enrollments.router.js";
import { curriculumRouter } from "./curriculum/curriculum.router.js";
import { ddpRouter } from "./ddp/ddp.router.js";
import { assignmentsRouter } from "./assignments/assignments.router.js";
import { notificationsRouter } from "./notifications/notifications.router.js";

export function registerModules(api: Router) {
  api.use(API_ROUTES.auth, authRouter);
  api.use(API_ROUTES.users, createModuleRouter("Users"));
  api.use(API_ROUTES.students, studentsRouter);
  api.use(API_ROUTES.mentors, mentorsRouter);
  api.use(API_ROUTES.admins, adminsRouter);
  api.use(API_ROUTES.programs, programsRouter);
  api.use(API_ROUTES.batches, batchesRouter);
  api.use(API_ROUTES.enrollments, enrollmentsRouter);
  api.use(API_ROUTES.curriculum, curriculumRouter);
  api.use(API_ROUTES.ddp, ddpRouter);
  api.use(API_ROUTES.content, createModuleRouter("Learning Content"));
  api.use(API_ROUTES.progress, createModuleRouter("Progress"));
  api.use(API_ROUTES.assignments, assignmentsRouter);
  api.use(API_ROUTES.tests, createModuleRouter("Tests"));
  api.use(API_ROUTES.projects, createModuleRouter("Projects"));
  api.use(API_ROUTES.mentorship, createModuleRouter("Mentorship"));
  api.use(API_ROUTES.notifications, notificationsRouter);
  api.use(API_ROUTES.attendance, createModuleRouter("Attendance"));
  api.use(API_ROUTES.certificates, createModuleRouter("Certificates"));
  api.use(API_ROUTES.analytics, createModuleRouter("Analytics"));
  api.use(API_ROUTES.payments, createModuleRouter("Payments"));
}

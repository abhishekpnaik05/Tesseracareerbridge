import { Router } from "express";
import { adminService } from "./admin.service.js";
import { requireAuth, requireActiveAccount, requireRoles, type AuthenticatedRequest } from "../../middleware/auth.js";
import { HttpError } from "../../lib/http.js";

export const adminRouter = Router();

// Dashboard
adminRouter.get(
  "/dashboard",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const dashboard = await adminService.getDashboard();
      res.json({ data: dashboard });
    } catch (error) {
      next(error);
    }
  }
);

// Student Management
adminRouter.get(
  "/students",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string | undefined,
        program: req.query.program as string | undefined,
        batch: req.query.batch as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await adminService.getStudents(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/students/:studentId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      // Try to find by studentProfileId first, if not found try by userId
      const student = await adminService.getStudent(req.params.studentId);
      res.json({ data: student });
    } catch (error) {
      next(error);
    }
  }
);

// Mentor Management
adminRouter.get(
  "/mentors",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await adminService.getMentors(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/mentors/:mentorId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const mentor = await adminService.getMentor(req.params.mentorId);
      res.json({ data: mentor });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/batches/:batchId/assign-mentor",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { mentorId } = req.body;
      if (!mentorId) {
        throw new HttpError(400, "INVALID_INPUT", "mentorId is required");
      }
      const result = await adminService.assignMentorToBatch(req.params.batchId, mentorId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Program Management
adminRouter.get(
  "/programs",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        category: req.query.category as string | undefined
      };
      const result = await adminService.getPrograms(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/programs/:programId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const program = await adminService.getProgram(req.params.programId);
      res.json({ data: program });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/programs",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const program = await adminService.createProgram(req.body);
      res.json({ data: program });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.patch(
  "/programs/:programId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const program = await adminService.updateProgram(req.params.programId, req.body);
      res.json({ data: program });
    } catch (error) {
      next(error);
    }
  }
);

// Batch Management
adminRouter.get(
  "/batches",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string | undefined,
        programId: req.query.programId as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await adminService.getBatches(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/batches/:batchId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const batch = await adminService.getBatch(req.params.batchId);
      res.json({ data: batch });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/batches",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const batch = await adminService.createBatch(req.body);
      res.json({ data: batch });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.patch(
  "/batches/:batchId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const batch = await adminService.updateBatch(req.params.batchId, req.body);
      res.json({ data: batch });
    } catch (error) {
      next(error);
    }
  }
);

// Internship Creation
adminRouter.post(
  "/internships",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const internship = await adminService.createInternship(req.body);
      res.json({ data: internship });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/internships",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await adminService.getInternships(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/internships/:internshipId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const internship = await adminService.getInternship(req.params.internshipId);
      res.json({ data: internship });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.patch(
  "/internships/:internshipId/status",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { status } = req.body;
      const result = await adminService.updateInternshipStatus(req.params.internshipId, status);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/internships/:internshipId/mentor",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { mentorId } = req.body;
      const result = await adminService.assignMentorToInternship(req.params.internshipId, mentorId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/internships/mentors/available",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const mentors = await adminService.getAvailableMentors();
      res.json({ data: mentors });
    } catch (error) {
      next(error);
    }
  }
);

// Enrollment Management
adminRouter.get(
  "/enrollments",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined,
        search: req.query.search as string | undefined,
        programId: req.query.programId as string | undefined,
        batchId: req.query.batchId as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await adminService.getEnrollments(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/enrollments/:enrollmentId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const enrollment = await adminService.getEnrollment(req.params.enrollmentId);
      res.json({ data: enrollment });
    } catch (error) {
      next(error);
    }
  }
);

// Attendance Management
adminRouter.get(
  "/attendance/today",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (_req: AuthenticatedRequest, res, next) => {
    try {
      const attendance = await adminService.getTodayAttendance();
      res.json({ data: attendance });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/attendance/batches/:batchId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== "string") {
        throw new HttpError(400, "INVALID_INPUT", "date query parameter is required");
      }
      const attendance = await adminService.getBatchAttendance(req.params.batchId, date);
      res.json({ data: attendance });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/attendance/students/:studentId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const attendance = await adminService.getStudentAttendance(req.params.studentId);
      res.json({ data: attendance });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/attendance/overview",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        date: req.query.date as string | undefined,
        programId: req.query.programId as string | undefined,
        batchId: req.query.batchId as string | undefined,
        studentId: req.query.studentId as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await adminService.getAttendanceReport(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Announcement Management
adminRouter.get(
  "/announcements",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined
      };
      const result = await adminService.getAnnouncements(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.post(
  "/announcements",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const announcement = await adminService.createAnnouncement(req.auth!.sub, req.body);
      res.json({ data: announcement });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.patch(
  "/announcements/:announcementId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const announcement = await adminService.updateAnnouncement(req.params.announcementId, req.body);
      res.json({ data: announcement });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.delete(
  "/announcements/:announcementId",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const result = await adminService.deleteAnnouncement(req.params.announcementId);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

// Reports
adminRouter.get(
  "/reports/attendance",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        batchId: req.query.batchId as string | undefined,
        studentId: req.query.studentId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined
      };
      const result = await adminService.getAttendanceReport(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/reports/ddp",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        batchId: req.query.batchId as string | undefined,
        ddpId: req.query.ddpId as string | undefined
      };
      const result = await adminService.getDdpReport(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/reports/assignments",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        batchId: req.query.batchId as string | undefined,
        assignmentId: req.query.assignmentId as string | undefined
      };
      const result = await adminService.getAssignmentReport(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);

adminRouter.get(
  "/reports/internship-progress",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const params = {
        batchId: req.query.batchId as string | undefined
      };
      const result = await adminService.getInternshipProgressReport(params);
      res.json({ data: result });
    } catch (error) {
      next(error);
    }
  }
);
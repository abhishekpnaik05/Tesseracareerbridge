import { Router } from "express";
import { HttpError } from "../../lib/http.js";
import { requireAuth, requireActiveAccount, type AuthenticatedRequest } from "../../middleware/auth.js";
import * as assignments from "./assignments.service.js";

export const assignmentsRouter = Router();
const guard = [requireAuth, requireActiveAccount] as const;

// GET /assignments/:assignmentId?enrollmentId=...
// Full assignment detail page data
assignmentsRouter.get("/:assignmentId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { assignmentId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;
    if (!enrollmentId) throw new HttpError(400, "VALIDATION", "enrollmentId query parameter is required.");
    const data = await assignments.getAssignmentDetail(assignmentId, enrollmentId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /assignments/:assignmentId/submission?enrollmentId=...
// Get student's latest submission
assignmentsRouter.get("/:assignmentId/submission", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { assignmentId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;
    if (!enrollmentId) throw new HttpError(400, "VALIDATION", "enrollmentId query parameter is required.");
    const data = await assignments.getMySubmission(assignmentId, enrollmentId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /assignments/:assignmentId/history?enrollmentId=...
// Get all submission attempts
assignmentsRouter.get("/:assignmentId/history", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { assignmentId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;
    if (!enrollmentId) throw new HttpError(400, "VALIDATION", "enrollmentId query parameter is required.");
    const data = await assignments.getSubmissionHistory(assignmentId, enrollmentId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /assignments/:assignmentId/draft
// Save or update a draft submission
assignmentsRouter.post("/:assignmentId/draft", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { assignmentId } = req.params;
    const body = req.body as { enrollmentId: string; textAnswer?: string; linkUrl?: string };
    if (!body.enrollmentId) throw new HttpError(400, "VALIDATION", "enrollmentId is required.");
    const data = await assignments.saveDraft(assignmentId, userId, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /assignments/:assignmentId/submit
// Final submission
assignmentsRouter.post("/:assignmentId/submit", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { assignmentId } = req.params;
    const body = req.body as { enrollmentId: string; textAnswer?: string; linkUrl?: string };
    if (!body.enrollmentId) throw new HttpError(400, "VALIDATION", "enrollmentId is required.");
    const data = await assignments.submitAssignment(assignmentId, userId, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

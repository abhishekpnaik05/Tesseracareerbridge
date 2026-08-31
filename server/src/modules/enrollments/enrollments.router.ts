import { Router } from "express";
import { HttpError, notImplemented } from "../../lib/http.js";
import { requireAuth, requireActiveAccount, type AuthenticatedRequest } from "../../middleware/auth.js";
import * as enrollments from "./enrollments.service.js";
import { getInternshipCurriculum } from "../curriculum/curriculum.service.js";
import {
  getDayDetail,
  getVideoDetail,
  getNoteDetail,
  getResourceDetail,
  getPracticeTaskDetail,
  getDdpDetail,
  getAssignmentDetail,
  updateActivityProgress,
} from "../curriculum/day.service.js";

export const enrollmentsRouter = Router();
const guard = [requireAuth, requireActiveAccount] as const;

enrollmentsRouter.post("/", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const body = req.body as { batchId: string };
    if (!body.batchId) throw new HttpError(400, "VALIDATION", "Batch ID is required.");
    const data = await enrollments.createEnrollment(userId, body.batchId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/me", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await enrollments.listUserEnrollments(userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.auth!.sub;
    if (!id) throw new HttpError(400, "VALIDATION", "Enrollment ID is required.");
    const data = await enrollments.getEnrollment(id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.post("/:id/cancel", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.auth!.sub;
    if (!id) throw new HttpError(400, "VALIDATION", "Enrollment ID is required.");
    const data = await enrollments.cancelEnrollment(id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:id/curriculum", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.auth!.sub;
    if (!id) throw new HttpError(400, "VALIDATION", "Enrollment ID is required.");
    const data = await getInternshipCurriculum(id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId } = req.params;
    console.log("Day detail request:", { userId, enrollmentId, dayId });
    const dayDetail = await getDayDetail(enrollmentId, dayId, userId);
    console.log("Day detail response:", dayDetail);
    res.json({ data: dayDetail });
  } catch (error) {
    console.error("Day detail error:", error);
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId/videos/:videoId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId, videoId } = req.params;
    const videoDetail = await getVideoDetail(enrollmentId, dayId, videoId, userId);
    res.json({ data: videoDetail });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId/notes/:noteId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId, noteId } = req.params;
    const noteDetail = await getNoteDetail(enrollmentId, dayId, noteId, userId);
    res.json({ data: noteDetail });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId/resources/:resourceId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId, resourceId } = req.params;
    const resourceDetail = await getResourceDetail(enrollmentId, dayId, resourceId, userId);
    res.json({ data: resourceDetail });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId/practice/:practiceId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId, practiceId } = req.params;
    const practiceDetail = await getPracticeTaskDetail(enrollmentId, dayId, practiceId, userId);
    res.json({ data: practiceDetail });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId/ddps/:ddpId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId, ddpId } = req.params;
    const ddpDetail = await getDdpDetail(enrollmentId, dayId, ddpId, userId);
    res.json({ data: ddpDetail });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.get("/:enrollmentId/days/:dayId/assignments/:assignmentId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId, assignmentId } = req.params;
    const assignmentDetail = await getAssignmentDetail(enrollmentId, dayId, assignmentId, userId);
    res.json({ data: assignmentDetail });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.post("/:enrollmentId/days/:dayId/progress", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { enrollmentId, dayId } = req.params;
    await updateActivityProgress(enrollmentId, dayId, req.body, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

enrollmentsRouter.all("*", notImplemented("Enrollments"));

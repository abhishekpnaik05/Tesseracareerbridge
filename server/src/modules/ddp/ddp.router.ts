import { Router } from "express";
import { requireAuth, requireActiveAccount, type AuthenticatedRequest } from "../../middleware/auth.js";
import * as ddpService from "./ddp.service.js";

export const ddpRouter = Router();
const guard = [requireAuth, requireActiveAccount] as const;

ddpRouter.get("/days/:dayId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const _userId = req.auth!.sub;
    const { dayId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;

    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const ddpData = await ddpService.getDdpForDay(enrollmentId, dayId, _userId);
    res.json({ data: ddpData });
  } catch (error) {
    next(error);
  }
});

ddpRouter.post("/:ddpId/start", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const _userId = req.auth!.sub;
    const { ddpId } = req.params;
    const { enrollmentId, dayId } = req.body;

    const attempt = await ddpService.startDdpAttempt(enrollmentId, dayId, ddpId, _userId);
    res.json({ data: attempt });
  } catch (error) {
    next(error);
  }
});

ddpRouter.get("/attempts/:attemptId/questions", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const _userId = req.auth!.sub;
    const { attemptId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;

    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const questions = await ddpService.getDdpQuestions(attemptId, enrollmentId, _userId);
    res.json({ data: questions });
  } catch (error) {
    next(error);
  }
});

ddpRouter.put("/attempts/:attemptId/answers/:questionId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { attemptId, questionId } = req.params;
    const { enrollmentId, selectedOptionIds } = req.body;

    const result = await ddpService.saveDdpAnswer(attemptId, questionId, selectedOptionIds, enrollmentId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

ddpRouter.post("/attempts/:attemptId/submit", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { attemptId } = req.params;
    const { enrollmentId } = req.body;

    const result = await ddpService.submitDdpAttempt(attemptId, enrollmentId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

ddpRouter.get("/attempts/:attemptId/result", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { attemptId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;

    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const result = await ddpService.getDdpResult(attemptId, enrollmentId);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

ddpRouter.get("/:ddpId/history", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const _userId = req.auth!.sub;
    const { ddpId } = req.params;
    const enrollmentId = req.query.enrollmentId as string;

    if (!enrollmentId) {
      throw new Error("Enrollment ID is required");
    }

    const history = await ddpService.getDdpAttemptHistory(ddpId, enrollmentId, _userId);
    res.json({ data: history });
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { HttpError, notImplemented } from "../../lib/http.js";
import { requireActiveAccount, requireAuth, requireRoles, type AuthenticatedRequest } from "../../middleware/auth.js";
import * as students from "../students/students.service.js";

export const notificationsRouter = Router();
const guard = [requireAuth, requireActiveAccount, requireRoles("STUDENT")] as const;

notificationsRouter.get("/", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const items = await students.listOwnNotifications(req.auth!.sub);
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: { items } });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.post("/read-all", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    await students.markAllNotificationsRead(req.auth!.sub);
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: { ok: true } });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.post("/:id/read", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = req.params.id;
    if (!id) throw new HttpError(400, "VALIDATION", "Notification is required.");
    await students.markNotificationRead(req.auth!.sub, id);
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: { ok: true } });
  } catch (error) {
    next(error);
  }
});

notificationsRouter.all("*", notImplemented("Notifications"));

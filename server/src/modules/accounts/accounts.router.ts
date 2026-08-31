import { Router } from "express";
import { prisma } from "@tesseracareerbridge/database";
import { notImplemented } from "../../lib/http.js";
import { requireActiveAccount, requireAuth, requireRoles, type AuthenticatedRequest } from "../../middleware/auth.js";

export const mentorsRouter = Router();

mentorsRouter.get(
  "/me",
  requireAuth,
  requireActiveAccount,
  requireRoles("MENTOR"),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const profile = await prisma.mentorProfile.findUnique({ where: { userId: req.auth!.sub } });
      res.setHeader("Cache-Control", "no-store");
      res.json({ data: { profile } });
    } catch (error) {
      next(error);
    }
  },
);

mentorsRouter.all("*", notImplemented("Mentors"));

export const adminsRouter = Router();

adminsRouter.get(
  "/ping",
  requireAuth,
  requireActiveAccount,
  requireRoles("ADMIN", "CONTENT_MANAGER"),
  (req: AuthenticatedRequest, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ data: { ok: true, role: req.auth!.role } });
  },
);

adminsRouter.all("*", notImplemented("Admins"));

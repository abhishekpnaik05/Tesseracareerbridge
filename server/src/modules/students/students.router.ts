import { Router } from "express";
import { HttpError, notImplemented } from "../../lib/http.js";
import { requireActiveAccount, requireAuth, requireRoles, type AuthenticatedRequest } from "../../middleware/auth.js";
import * as students from "./students.service.js";

export const studentsRouter = Router();
const guard = [requireAuth, requireActiveAccount, requireRoles("STUDENT")] as const;

function noStore(res: { setHeader: (k: string, v: string) => void }) {
  res.setHeader("Cache-Control", "no-store");
}

studentsRouter.get("/me", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await students.getStudentAccount(req.auth!.sub);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

studentsRouter.patch("/me", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await students.updateStudentAccount(req.auth!.sub, req.body ?? {});
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

studentsRouter.patch("/me/preferences", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await students.updatePreferences(req.auth!.sub, req.body ?? {});
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

studentsRouter.get("/me/dashboard", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await students.getDashboard(req.auth!.sub);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

studentsRouter.post("/me/photo", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "";
    const fileName = typeof req.body?.fileName === "string" ? req.body.fileName : "photo";
    const dataBase64 = typeof req.body?.dataBase64 === "string" ? req.body.dataBase64 : "";
    if (!dataBase64) {
      throw new HttpError(400, "VALIDATION", "Choose a photo to upload.");
    }
    const buffer = Buffer.from(dataBase64, "base64");
    const data = await students.savePhoto(req.auth!.sub, mimeType, fileName, buffer);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

studentsRouter.delete("/me/photo", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = await students.removePhoto(req.auth!.sub);
    noStore(res);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

studentsRouter.all("*", notImplemented("Students"));

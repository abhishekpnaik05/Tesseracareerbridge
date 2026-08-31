import { Router } from "express";
import { HttpError, notImplemented } from "../../lib/http.js";
import * as programs from "./programs.service.js";

export const programsRouter = Router();

programsRouter.get("/", async (req, res, next) => {
  try {
    const data = await programs.listPublishedPrograms(req.query as Record<string, unknown>);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

programsRouter.get("/:key", async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!key) throw new HttpError(400, "VALIDATION", "Program not found.");
    const data = await programs.getPublishedProgram(key);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

programsRouter.all("*", notImplemented("Programs"));

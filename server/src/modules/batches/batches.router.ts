import { Router } from "express";
import { HttpError, notImplemented } from "../../lib/http.js";
import * as batches from "./batches.service.js";

export const batchesRouter = Router();

batchesRouter.get("/programs/:programKey", async (req, res, next) => {
  try {
    const programKey = req.params.programKey;
    if (!programKey) throw new HttpError(400, "VALIDATION", "Program key is required.");
    const data = await batches.listProgramBatches(programKey);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

batchesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) throw new HttpError(400, "VALIDATION", "Batch ID is required.");
    const data = await batches.getBatch(id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

batchesRouter.all("*", notImplemented("Batches"));

import { Router } from "express";
import { requireAuth, type AuthenticatedRequest } from "../../middleware/auth.js";
import { getInternshipCurriculum } from "./curriculum.service.js";

const router = Router();

router.get("/enrollments/:id/curriculum", requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const curriculum = await getInternshipCurriculum(id, userId);
    res.json({ data: curriculum });
  } catch (error) {
    next(error);
  }
});

export const curriculumRouter = router;

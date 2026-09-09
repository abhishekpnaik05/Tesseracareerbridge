import { Router } from "express";
import { requireAuth, requireActiveAccount, requireMentorRole, type AuthenticatedRequest } from "../../middleware/auth.js";
import { mentorService } from "./mentor.service.js";

export const mentorRouter = Router();
const guard = [requireAuth, requireActiveAccount, requireMentorRole] as const;

// GET /mentor/dashboard
// Get mentor dashboard data
mentorRouter.get("/dashboard", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.getMentorDashboard(userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches
// Get all batches assigned to the mentor
mentorRouter.get("/batches", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.getMentorBatches(userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches/:id
// Get a specific batch assigned to the mentor
mentorRouter.get("/batches/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id: batchId } = req.params;
    const data = await mentorService.getMentorBatch(batchId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/curriculum/:programId
// Get curriculum for a program (includes DRAFT content for mentors)
mentorRouter.get("/curriculum/:programId", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { programId } = req.params;
    const data = await mentorService.getMentorCurriculum(programId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/weeks
// Create a new week
mentorRouter.post("/weeks", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createWeek(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/weeks/:id
// Update a week
mentorRouter.patch("/weeks/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateWeek(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/weeks/:id
// Delete a week
mentorRouter.delete("/weeks/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteWeek(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/curriculum/:programId/weeks/reorder
// Reorder weeks
mentorRouter.post("/curriculum/:programId/weeks/reorder", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { programId } = req.params;
    await mentorService.reorderWeeks(programId, userId, req.body);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/days
// Create a new day
mentorRouter.post("/days", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createDay(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/days/:id
// Update a day
mentorRouter.patch("/days/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateDay(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/days/:id
// Delete a day
mentorRouter.delete("/days/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteDay(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/weeks/:weekId/days/reorder
// Reorder days
mentorRouter.post("/weeks/:weekId/days/reorder", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { weekId } = req.params;
    await mentorService.reorderDays(weekId, userId, req.body);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/videos
// Create a video
mentorRouter.post("/videos", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createVideo(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/videos/:id
// Update a video
mentorRouter.patch("/videos/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateVideo(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/videos/:id
// Delete a video
mentorRouter.delete("/videos/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteVideo(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/notes
// Create a note
mentorRouter.post("/notes", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createNote(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/notes/:id
// Update a note
mentorRouter.patch("/notes/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateNote(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/notes/:id
// Delete a note
mentorRouter.delete("/notes/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteNote(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/resources
// Create a resource
mentorRouter.post("/resources", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createResource(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/resources/:id
// Update a resource
mentorRouter.patch("/resources/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateResource(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/resources/:id
// Delete a resource
mentorRouter.delete("/resources/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteResource(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches/:batchId/students
// Get students in a batch
mentorRouter.get("/batches/:batchId/students", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { batchId } = req.params;
    const data = await mentorService.getBatchStudents(batchId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches/:batchId/attendance
// Get attendance for a batch
mentorRouter.get("/batches/:batchId/attendance", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { batchId } = req.params;
    const date = req.query.date as string;
    const data = await mentorService.getBatchAttendance(batchId, date, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/attendance
// Mark attendance
mentorRouter.post("/attendance", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    await mentorService.markAttendance(userId, req.body);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches/:batchId/submissions/pending
// Get pending assignment submissions
mentorRouter.get("/batches/:batchId/submissions/pending", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { batchId } = req.params;
    const data = await mentorService.getPendingSubmissions(batchId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/submissions/:id
// Get submission details
mentorRouter.get("/submissions/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.getSubmissionDetails(id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/submissions/:id/review
// Review a submission
mentorRouter.post("/submissions/:id/review", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.reviewSubmission(id, userId, req.body);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches/:batchId/ddp-results
// Get DDP results for a batch
mentorRouter.get("/batches/:batchId/ddp-results", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { batchId } = req.params;
    const data = await mentorService.getDdpResults(batchId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/batches/:batchId/announcements
// Get announcements for a batch
mentorRouter.get("/batches/:batchId/announcements", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { batchId } = req.params;
    const data = await mentorService.getBatchAnnouncements(batchId, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/announcements
// Create an announcement
mentorRouter.post("/announcements", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createAnnouncement(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/ddp/:id
// Get DDP details for mentor
mentorRouter.get("/ddp/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.getMentorDdp(id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/ddp
// Create a DDP
mentorRouter.post("/ddp", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createDdp(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/ddp/:id
// Update a DDP
mentorRouter.patch("/ddp/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateDdp(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/ddp/:id
// Delete a DDP
mentorRouter.delete("/ddp/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteDdp(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/ddp/questions
// Create a DDP question
mentorRouter.post("/ddp/questions", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createDdpQuestion(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/ddp/questions/:id
// Update a DDP question
mentorRouter.patch("/ddp/questions/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateDdpQuestion(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/ddp/questions/:id
// Delete a DDP question
mentorRouter.delete("/ddp/questions/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteDdpQuestion(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/ddp/options
// Create a DDP option
mentorRouter.post("/ddp/options", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createDdpOption(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/ddp/options/:id
// Update a DDP option
mentorRouter.patch("/ddp/options/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateDdpOption(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/ddp/options/:id
// Delete a DDP option
mentorRouter.delete("/ddp/options/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteDdpOption(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/ddp/:id/questions/reorder
// Reorder DDP questions
mentorRouter.post("/ddp/:id/questions/reorder", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.reorderDdpQuestions(id, userId, req.body);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// GET /mentor/assignments/:id
// Get assignment details for mentor
mentorRouter.get("/assignments/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.getMentorAssignment(id, userId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/assignments
// Create an assignment
mentorRouter.post("/assignments", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createAssignment(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/assignments/:id
// Update an assignment
mentorRouter.patch("/assignments/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateAssignment(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/assignments/:id
// Delete an assignment
mentorRouter.delete("/assignments/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteAssignment(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/assignments/requirements
// Create an assignment requirement
mentorRouter.post("/assignments/requirements", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createAssignmentRequirement(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/assignments/requirements/:id
// Update an assignment requirement
mentorRouter.patch("/assignments/requirements/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateAssignmentRequirement(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/assignments/requirements/:id
// Delete an assignment requirement
mentorRouter.delete("/assignments/requirements/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteAssignmentRequirement(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

// POST /mentor/assignments/resources
// Create an assignment resource
mentorRouter.post("/assignments/resources", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const data = await mentorService.createAssignmentResource(userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /mentor/assignments/resources/:id
// Update an assignment resource
mentorRouter.patch("/assignments/resources/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    const data = await mentorService.updateAssignmentResource(id, userId, req.body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// DELETE /mentor/assignments/resources/:id
// Delete an assignment resource
mentorRouter.delete("/assignments/resources/:id", ...guard, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth!.sub;
    const { id } = req.params;
    await mentorService.deleteAssignmentResource(id, userId);
    res.json({ data: { success: true } });
  } catch (error) {
    next(error);
  }
});

import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  AlertCircle,
  ChevronRight,
  FileText,
  Link2,
  Upload,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Send,
  Save,
  Award,
  MessageSquare,
  History,
  Lock,
  Info,
} from "lucide-react";
import type { AssignmentDetailDto, AssignmentSubmissionDto } from "@tesseracareerbridge/shared";
import {
  getAssignmentFullDetail,
  saveDraft,
  submitAssignment,
} from "../../lib/enrollments";
import {
  LoadingState,
  ErrorState,
  Card,
  Badge,
  Button,
  Field,
  Input,
  Textarea,
  Modal,
  useToast,
} from "../../components/ui";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDueDate(dueAt: string | null): string {
  if (!dueAt) return "No deadline";
  const d = new Date(dueAt);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (diff < 0) return `Overdue · ${formatted}`;
  if (days === 0) return `Due today · ${formatted}`;
  if (days === 1) return `Due tomorrow · ${formatted}`;
  return `Due in ${days} days · ${formatted}`;
}

function formatSubmittedAt(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function submissionStatusLabel(status: string): { label: string; tone: "muted" | "info" | "danger" | "success" | "accent" } {
  const map: Record<string, { label: string; tone: "muted" | "info" | "danger" | "success" | "accent" }> = {
    DRAFT: { label: "Draft Saved", tone: "muted" },
    SUBMITTED: { label: "Submitted", tone: "info" },
    UNDER_REVIEW: { label: "Under Review", tone: "info" },
    EVALUATED: { label: "Reviewed", tone: "success" },
    RETURNED: { label: "Returned", tone: "danger" },
    RESUBMISSION_REQUIRED: { label: "Resubmit Required", tone: "danger" },
  };
  return map[status] || { label: status, tone: "muted" };
}

function resourceIcon(type: string) {
  if (type === "LINK") return <Link2 size={15} />;
  return <BookOpen size={15} />;
}

function typeIcon(type: string) {
  if (type === "LINK") return <Link2 size={16} />;
  if (type === "FILE_UPLOAD") return <Upload size={16} />;
  return <FileText size={16} />;
}

function typeLabel(type: string) {
  if (type === "LINK") return "URL Submission";
  if (type === "FILE_UPLOAD") return "File Upload";
  return "Written Answer";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentAssignmentPage() {
  const { enrollmentId, dayId, assignmentId } = useParams<{
    enrollmentId: string;
    dayId: string;
    assignmentId: string;
  }>();
  const navigate = useNavigate();
  const { push: toast } = useToast();

  const [assignment, setAssignment] = useState<AssignmentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [textAnswer, setTextAnswer] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);

  const [draftState, setDraftState] = useState<"idle" | "saving" | "saved">("idle");
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<"submission" | "history">("submission");

  // ─── Load ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!assignmentId || !enrollmentId) return;
    setLoading(true);
    setError(null);
    getAssignmentFullDetail(assignmentId, enrollmentId)
      .then((data) => {
        setAssignment(data);
        if (data.currentSubmission?.status === "DRAFT") {
          setTextAnswer(data.currentSubmission.textAnswer || "");
          setLinkUrl(data.currentSubmission.linkUrl || "");
        }
      })
      .catch(() => setError("Failed to load assignment."))
      .finally(() => setLoading(false));
  }, [assignmentId, enrollmentId]);

  // ─── Auto-save draft ─────────────────────────────────────────────────────
  const triggerAutosave = useCallback(
    (value: string, field: "text" | "link") => {
      if (!assignment || !enrollmentId || !assignmentId) return;
      if (!assignment.canSubmit && !assignment.canResubmit) return;
      if (draftTimer.current) clearTimeout(draftTimer.current);
      setDraftState("saving");
      draftTimer.current = setTimeout(async () => {
        try {
          await saveDraft(assignmentId, enrollmentId, {
            textAnswer: field === "text" ? value : textAnswer,
            linkUrl: field === "link" ? value : linkUrl,
          });
          setDraftState("saved");
          setTimeout(() => setDraftState("idle"), 2500);
        } catch {
          setDraftState("idle");
        }
      }, 1500);
    },
    [assignment, enrollmentId, assignmentId, textAnswer, linkUrl]
  );

  const handleTextChange = (v: string) => { setTextAnswer(v); triggerAutosave(v, "text"); };
  const handleLinkChange = (v: string) => { setLinkUrl(v); setLinkError(null); triggerAutosave(v, "link"); };

  function validateLink(url: string): boolean {
    if (!url.trim()) { setLinkError("Please enter a URL."); return false; }
    try {
      const u = new URL(url);
      if (!["https:", "http:"].includes(u.protocol)) { setLinkError("Only http/https URLs are allowed."); return false; }
    } catch { setLinkError("Please enter a valid URL (e.g. https://github.com/...)."); return false; }
    setLinkError(null);
    return true;
  }

  async function handleSubmit() {
    if (!assignment) return;
    if (assignment.type === "LINK" && !validateLink(linkUrl)) return;
    if (assignment.type === "TEXT" && !textAnswer.trim()) {
      toast("Please write your answer before submitting.", "warning");
      return;
    }
    setShowConfirm(true);
  }

  async function confirmSubmit() {
    if (!assignment || !enrollmentId || !assignmentId) return;
    setSubmitting(true);
    setShowConfirm(false);
    try {
      await submitAssignment(assignmentId, enrollmentId, {
        textAnswer: assignment.type === "TEXT" ? textAnswer : undefined,
        linkUrl: assignment.type === "LINK" ? linkUrl : undefined,
      });
      toast("Assignment submitted successfully!", "success");
      const updated = await getAssignmentFullDetail(assignmentId, enrollmentId);
      setAssignment(updated);
    } catch (err: any) {
      toast(err?.message || "Failed to submit. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  if (loading) return <LoadingState label="Loading assignment..." />;
  if (error || !assignment) return <ErrorState title="Could not load assignment" body={error || "Assignment not found."} />;

  const submission = assignment.currentSubmission;
  const isLocked = submission !== null && submission.status !== "DRAFT" && submission.status !== "RESUBMISSION_REQUIRED";
  const isDeadlinePassed = assignment.dueAt ? new Date() > new Date(assignment.dueAt) : false;
  const { label: statusLabel, tone: statusTone } = submission
    ? submissionStatusLabel(submission.status)
    : { label: "Not Submitted", tone: "muted" as const };
  const canAct = assignment.canSubmit || assignment.canResubmit;

  const panelProps = {
    assignment, submission, statusLabel, statusTone, isLocked, isDeadlinePassed,
    canAct, textAnswer, linkUrl, linkError, draftState, submitting, activeTab,
    onTabChange: setActiveTab, onTextChange: handleTextChange, onLinkChange: handleLinkChange,
    onSubmit: handleSubmit,
  };

  return (
    <div className="assignment-page-wrap">
      <div className="assignment-back">
        <button
          className="btn-ghost-sm"
          onClick={() => navigate(`/student/internship/${enrollmentId}/day/${dayId}`)}
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Back to Day</span>
        </button>
      </div>

      <div className="assignment-layout">
        <div className="assignment-main">
          {/* Header */}
          <div className="assignment-header">
            <div className="assignment-header__meta">
              {assignment.dayTitle && (
                <span className="assignment-breadcrumb">
                  <Link to={`/student/internship/${enrollmentId}/day/${dayId}`} className="assignment-breadcrumb__link">
                    {assignment.dayTitle}
                  </Link>
                  <ChevronRight size={14} />
                  <span>Assignment</span>
                </span>
              )}
            </div>
            <h1 className="assignment-title">{assignment.title}</h1>
            <div className="assignment-tags">
              <span className="assignment-type-badge">
                {typeIcon(assignment.type)}
                {typeLabel(assignment.type)}
              </span>
              {assignment.isRequired && <Badge tone="danger">Required</Badge>}
              {assignment.estimatedTime && (
                <span className="assignment-meta-item"><Clock size={14} />{assignment.estimatedTime} min</span>
              )}
              {assignment.dueAt && (
                <span className={`assignment-meta-item ${isDeadlinePassed ? "assignment-meta-item--overdue" : ""}`}>
                  <Calendar size={14} />{formatDueDate(assignment.dueAt)}
                </span>
              )}
            </div>
          </div>

          {assignment.brief && (
            <Card className="assignment-section">
              <p className="assignment-brief">{assignment.brief}</p>
            </Card>
          )}
          {assignment.description && (
            <Card className="assignment-section">
              <h2 className="assignment-section__title">About this Assignment</h2>
              <div className="assignment-prose">{assignment.description}</div>
            </Card>
          )}
          {assignment.instructions && (
            <Card className="assignment-section">
              <h2 className="assignment-section__title">Instructions</h2>
              <div className="assignment-instructions">{assignment.instructions}</div>
            </Card>
          )}
          {assignment.requirements.length > 0 && (
            <Card className="assignment-section">
              <h2 className="assignment-section__title">Requirements</h2>
              <ul className="assignment-requirements">
                {assignment.requirements.map((req) => (
                  <li key={req.id} className="assignment-requirement">
                    <span className="assignment-requirement__icon"><CheckCircle2 size={16} /></span>
                    <span>{req.body}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {assignment.resources.length > 0 && (
            <Card className="assignment-section">
              <h2 className="assignment-section__title">Resources</h2>
              <ul className="assignment-resources">
                {assignment.resources.map((res) => (
                  <li key={res.id} className="assignment-resource">
                    <span className="assignment-resource__icon">{resourceIcon(res.type)}</span>
                    {res.url ? (
                      <a href={res.url} target="_blank" rel="noopener noreferrer" className="assignment-resource__link">
                        {res.title}<ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="assignment-resource__title">{res.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Mobile submission panel */}
          <div className="assignment-sidebar--mobile">
            <SubmissionPanel {...panelProps} />
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="assignment-sidebar--desktop">
          <SubmissionPanel {...panelProps} />
        </aside>
      </div>

      <Modal open={showConfirm} onClose={() => setShowConfirm(false)} title="Submit Assignment">
        <div className="assignment-confirm">
          <div className="assignment-confirm__icon"><Send size={28} /></div>
          <p className="assignment-confirm__text">
            Are you sure you want to submit? Once submitted, you{" "}
            {assignment.maxAttempts > 1
              ? `will use one of your ${assignment.maxAttempts} allowed attempts.`
              : "cannot make changes unless your mentor requests a resubmission."}
          </p>
          {assignment.passingScore && (
            <p className="assignment-confirm__hint">
              Passing score: {assignment.passingScore}/{assignment.maxScore}
            </p>
          )}
          <div className="assignment-confirm__actions">
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmSubmit} loading={submitting}>Submit Assignment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Submission Panel ─────────────────────────────────────────────────────────

interface SubmissionPanelProps {
  assignment: AssignmentDetailDto;
  submission: AssignmentSubmissionDto | null;
  statusLabel: string;
  statusTone: "muted" | "info" | "danger" | "success" | "accent";
  isLocked: boolean;
  isDeadlinePassed: boolean;
  canAct: boolean;
  textAnswer: string;
  linkUrl: string;
  linkError: string | null;
  draftState: "idle" | "saving" | "saved";
  submitting: boolean;
  activeTab: "submission" | "history";
  onTabChange: (t: "submission" | "history") => void;
  onTextChange: (v: string) => void;
  onLinkChange: (v: string) => void;
  onSubmit: () => void;
}

function SubmissionPanel({
  assignment, submission, statusLabel, statusTone, isLocked, isDeadlinePassed,
  canAct, textAnswer, linkUrl, linkError, draftState, submitting,
  activeTab, onTabChange, onTextChange, onLinkChange, onSubmit,
}: SubmissionPanelProps) {
  return (
    <div className="submission-panel">
      <Card className={`submission-status-card submission-status-card--${statusTone}`}>
        <div className="submission-status-card__header">
          <StatusIcon status={submission?.status} />
          <div>
            <div className="submission-status-card__label">{statusLabel}</div>
            {submission?.submittedAt && (
              <div className="submission-status-card__time">
                Submitted {formatSubmittedAt(submission.submittedAt)}
                {submission.isLate && <span className="submission-status-card__late"> · Late</span>}
              </div>
            )}
          </div>
        </div>

        {submission?.score != null && (
          <div className="submission-score">
            <Award size={16} />
            <span>Score: <strong>{submission.score}/{submission.maxScore}</strong></span>
            {assignment.passingScore && submission.score >= assignment.passingScore && (
              <Badge tone="success">Passed</Badge>
            )}
          </div>
        )}
        {assignment.maxAttempts > 1 && (
          <div className="submission-attempts">
            <Info size={14} />
            Attempt {assignment.attemptCount}/{assignment.maxAttempts}
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="submission-tabs">
        <button type="button" id="tab-submission"
          className={`submission-tab ${activeTab === "submission" ? "is-active" : ""}`}
          onClick={() => onTabChange("submission")}>
          <FileText size={15} />Your Work
        </button>
        {assignment.submissionHistory.length > 1 && (
          <button type="button" id="tab-history"
            className={`submission-tab ${activeTab === "history" ? "is-active" : ""}`}
            onClick={() => onTabChange("history")}>
            <History size={15} />History ({assignment.submissionHistory.length})
          </button>
        )}
      </div>

      {activeTab === "submission" ? (
        <div className="submission-content">
          {submission?.feedback && (
            <Card className="submission-feedback">
              <div className="submission-feedback__header">
                <MessageSquare size={15} />
                <span>Mentor Feedback</span>
                {submission.reviewedByName && (
                  <span className="submission-feedback__by">by {submission.reviewedByName}</span>
                )}
              </div>
              <p className="submission-feedback__text">{submission.feedback}</p>
            </Card>
          )}
          {isDeadlinePassed && !submission && (
            <div className="submission-warning">
              <AlertCircle size={15} />
              The deadline for this assignment has passed.
            </div>
          )}
          {submission?.status === "RESUBMISSION_REQUIRED" && (
            <div className="submission-resubmit-notice">
              <RefreshCw size={15} />
              <span>Your mentor has requested changes. Update your work and resubmit.</span>
            </div>
          )}
          {isLocked && submission && (
            <div className="submission-locked">
              <div className="submission-locked__header"><Lock size={14} /><span>Your Submission</span></div>
              {submission.textAnswer && <div className="submission-locked__answer">{submission.textAnswer}</div>}
              {submission.linkUrl && (
                <a href={submission.linkUrl} target="_blank" rel="noopener noreferrer" className="submission-locked__link">
                  <Link2 size={14} />{submission.linkUrl}<ExternalLink size={13} />
                </a>
              )}
              {submission.fileOriginalName && (
                <div className="submission-locked__file"><Upload size={14} />{submission.fileOriginalName}</div>
              )}
            </div>
          )}
          {canAct && (
            <div className="submission-form">
              {assignment.type === "TEXT" && (
                <Field label="Your Answer" hint={`${textAnswer.length.toLocaleString()} / 20,000 characters`} htmlFor="text-answer">
                  <Textarea id="text-answer" value={textAnswer} onChange={(e) => onTextChange(e.target.value)}
                    rows={10} maxLength={20000} placeholder="Write your answer here…" />
                </Field>
              )}
              {assignment.type === "LINK" && (
                <Field label="Submission URL" hint="Paste your GitHub repo or project URL"
                  error={linkError || undefined} htmlFor="link-url">
                  <Input id="link-url" type="url" value={linkUrl} onChange={(e) => onLinkChange(e.target.value)}
                    placeholder="https://github.com/your-username/project" invalid={!!linkError} />
                </Field>
              )}
              {assignment.type === "FILE_UPLOAD" && (
                <div className="submission-file-notice">
                  <Upload size={20} />
                  <p>File upload is coming soon. Contact your mentor to submit.</p>
                </div>
              )}
              {draftState !== "idle" && (
                <div className="submission-draft-indicator">
                  {draftState === "saving" ? (
                    <><span className="draft-dot draft-dot--saving" />Saving draft…</>
                  ) : (
                    <><Save size={13} />Draft saved</>
                  )}
                </div>
              )}
              <Button id="btn-submit-assignment" variant="primary" block
                onClick={onSubmit} loading={submitting} disabled={assignment.type === "FILE_UPLOAD"}>
                <Send size={15} />
                {assignment.canResubmit ? "Resubmit Assignment" : "Submit Assignment"}
              </Button>
            </div>
          )}
          {!canAct && !submission && !isDeadlinePassed && (
            <div className="submission-warning">
              <Info size={15} />
              You have reached the maximum number of attempts.
            </div>
          )}
        </div>
      ) : (
        <div className="submission-history">
          {assignment.submissionHistory.map((hist) => (
            <HistoryItem key={hist.id} submission={hist} maxScore={assignment.maxScore} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status?: string }) {
  if (!status) return <Circle size={24} className="status-icon status-icon--idle" />;
  if (status === "SUBMITTED" || status === "UNDER_REVIEW") return <Send size={22} className="status-icon status-icon--submitted" />;
  if (status === "EVALUATED") return <Award size={22} className="status-icon status-icon--evaluated" />;
  if (status === "RESUBMISSION_REQUIRED" || status === "RETURNED") return <RefreshCw size={22} className="status-icon status-icon--resubmit" />;
  if (status === "DRAFT") return <Save size={22} className="status-icon status-icon--draft" />;
  return <CheckCircle2 size={22} className="status-icon status-icon--done" />;
}

function HistoryItem({ submission, maxScore }: { submission: AssignmentSubmissionDto; maxScore: number }) {
  const { label, tone } = submissionStatusLabel(submission.status);
  return (
    <Card className="history-item">
      <div className="history-item__header">
        <span className="history-item__attempt">Attempt #{submission.attemptNumber}</span>
        <Badge tone={tone}>{label}</Badge>
      </div>
      <div className="history-item__meta">
        {submission.submittedAt && <span className="history-item__date">Submitted {formatSubmittedAt(submission.submittedAt)}</span>}
        {submission.score != null && <span className="history-item__score">Score: {submission.score}/{maxScore}</span>}
      </div>
      {submission.feedback && <p className="history-item__feedback">{submission.feedback}</p>}
    </Card>
  );
}

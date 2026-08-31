import { useNavigate } from "react-router-dom";
import {
  FileText,
  Link2,
  Upload,
  Calendar,
  Clock,
  Send,
  Save,
  Award,
  RefreshCw,
  ChevronRight,
  Circle,
} from "lucide-react";
import { Card, Badge, Button } from "../ui";
import type { AssignmentDto } from "@tesseracareerbridge/shared";

interface AssignmentCardProps {
  enrollmentId: string;
  dayId: string;
  assignment: AssignmentDto;
  onComplete?: () => void;
}

function typeIcon(type: string) {
  if (type === "LINK") return <Link2 size={15} />;
  if (type === "FILE_UPLOAD") return <Upload size={15} />;
  return <FileText size={15} />;
}

function typeLabel(type: string) {
  if (type === "LINK") return "URL";
  if (type === "FILE_UPLOAD") return "File";
  return "Text";
}

function SubmissionStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="assignment-card-status assignment-card-status--idle">
        <Circle size={12} />
        Not Started
      </span>
    );
  }
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    DRAFT: { icon: <Save size={12} />, label: "Draft Saved", cls: "muted" },
    SUBMITTED: { icon: <Send size={12} />, label: "Submitted", cls: "info" },
    UNDER_REVIEW: { icon: <Clock size={12} />, label: "Under Review", cls: "warning" },
    EVALUATED: { icon: <Award size={12} />, label: "Reviewed", cls: "success" },
    RETURNED: { icon: <RefreshCw size={12} />, label: "Returned", cls: "danger" },
    RESUBMISSION_REQUIRED: { icon: <RefreshCw size={12} />, label: "Resubmit", cls: "danger" },
  };
  const info = map[status] || { icon: null, label: status, cls: "muted" };
  return (
    <span className={`assignment-card-status assignment-card-status--${info.cls}`}>
      {info.icon}
      {info.label}
    </span>
  );
}

function formatDueSoon(dueAt: string | null): { text: string; urgent: boolean } {
  if (!dueAt) return { text: "", urgent: false };
  const d = new Date(dueAt);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  const formatted = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (diff < 0) return { text: "Overdue", urgent: true };
  if (days <= 2) return { text: `Due ${formatted}`, urgent: true };
  return { text: `Due ${formatted}`, urgent: false };
}

export function AssignmentCard({ enrollmentId, dayId, assignment }: AssignmentCardProps) {
  const navigate = useNavigate();
  const { text: dueText, urgent: dueUrgent } = formatDueSoon(assignment.dueAt);

  const handleOpen = () => {
    navigate(`/student/internship/${enrollmentId}/day/${dayId}/assignment/${assignment.id}`);
  };

  const isCompleted =
    assignment.submissionStatus === "SUBMITTED" ||
    assignment.submissionStatus === "UNDER_REVIEW" ||
    assignment.submissionStatus === "EVALUATED";

  return (
    <Card className={`assignment-card ${isCompleted ? "assignment-card--done" : ""}`}>
      <div className="assignment-card__header">
        <div className="assignment-card__type">
          {typeIcon(assignment.type)}
          <span>{typeLabel(assignment.type)} Assignment</span>
        </div>
        <div className="assignment-card__badges">
          {assignment.isRequired && <Badge tone="danger">Required</Badge>}
          <Badge tone={isCompleted ? "success" : "accent"}>Assignment</Badge>
        </div>
      </div>

      <div className="assignment-card__body">
        <h3 className="assignment-card__title">{assignment.title}</h3>
        {assignment.brief && (
          <p className="assignment-card__brief">{assignment.brief}</p>
        )}
      </div>

      <div className="assignment-card__footer">
        <div className="assignment-card__meta">
          <SubmissionStatusBadge status={assignment.submissionStatus} />
          {assignment.estimatedTime && (
            <span className="assignment-card__time">
              <Clock size={12} />
              {assignment.estimatedTime} min
            </span>
          )}
          {dueText && (
            <span className={`assignment-card__due ${dueUrgent ? "is-urgent" : ""}`}>
              <Calendar size={12} />
              {dueText}
            </span>
          )}
        </div>

        <Button
          id={`open-assignment-${assignment.id}`}
          variant={isCompleted ? "outline" : "primary"}
          size="sm"
          onClick={handleOpen}
        >
          {isCompleted ? "View Submission" : "Open Assignment"}
          <ChevronRight size={14} />
        </Button>
      </div>
    </Card>
  );
}

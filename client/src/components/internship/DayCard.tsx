import type { InternshipDayDto } from "@tesseracareerbridge/shared";
import { Badge, ButtonLink } from "../ui";

interface DayCardProps {
  day: InternshipDayDto;
  enrollmentId: string;
}

export function DayCard({ day, enrollmentId }: DayCardProps) {
  const isLocked = day.availability === "LOCKED";
  const isCompleted = day.availability === "COMPLETED";
  const isCurrent = day.isCurrent;
  const isInProgress = day.availability === "IN_PROGRESS";

  const getStatusIcon = () => {
    if (isLocked) return "🔒";
    if (isCompleted) return "✓";
    if (isCurrent || isInProgress) return "→";
    return "";
  };

  const getStatusLabel = () => {
    if (isLocked) return "Locked";
    if (isCompleted) return "Completed";
    if (isCurrent) return "Current";
    if (isInProgress) return "In Progress";
    return "Available";
  };

  const getTone = () => {
    if (isLocked) return "muted";
    if (isCompleted) return "success";
    if (isCurrent || isInProgress) return "accent";
    return "muted";
  };

  const handleClick = () => {
    if (isLocked) {
      alert("This day is not available yet. Complete the previous day to unlock it.");
      return;
    }
  };

  return (
    <div
      className={`day-card ${isCurrent ? "day-card--current" : ""} ${isLocked ? "day-card--locked" : ""}`}
    >
      <div className="day-card__header">
        <span className="day-card__icon">{getStatusIcon()}</span>
        <div className="day-card__info">
          <span className="day-card__number">Day {day.dayNumber}</span>
          <h4 className="day-card__title">{day.title}</h4>
        </div>
        <Badge tone={getTone()}>{getStatusLabel()}</Badge>
      </div>

      {day.description && <p className="day-card__description">{day.description}</p>}

      {day.estimatedDuration && (
        <p className="day-card__duration">Estimated: {day.estimatedDuration} minutes</p>
      )}

      <div className="day-card__actions">
        {isLocked ? (
          <button
            type="button"
            className="day-card__lock-btn"
            onClick={handleClick}
            disabled
          >
            Locked
          </button>
        ) : (
          <ButtonLink
            to={`/student/internship/${enrollmentId}/day/${day.id}`}
            variant={isCurrent ? "primary" : "secondary"}
            className="day-card__cta"
          >
            {isCompleted ? "Review" : isCurrent ? "Continue Learning" : "Start"}
          </ButtonLink>
        )}
      </div>

      {day.completedAt && (
        <p className="day-card__completed-date">Completed: {new Date(day.completedAt).toLocaleDateString()}</p>
      )}
    </div>
  );
}

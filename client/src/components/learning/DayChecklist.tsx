import { Card } from "../ui";
import type { LearningContentDto } from "@tesseracareerbridge/shared";

interface DayChecklistProps {
  content: LearningContentDto[];
}

export function DayChecklist({ content }: DayChecklistProps) {
  const completedCount = content.filter((c) => c.status === "COMPLETED").length;
  const totalCount = content.length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "✓";
      case "IN_PROGRESS":
        return "→";
      default:
        return "○";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completed";
      case "IN_PROGRESS":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  return (
    <Card className="day-checklist">
      <div className="day-checklist__header">
        <h3>Today's Journey</h3>
        <span className="day-checklist__progress">
          {completedCount} / {totalCount} completed
        </span>
      </div>

      <div className="day-checklist__items">
        {content.map((item) => (
          <div key={item.id} className={`day-checklist__item day-checklist__item--${item.status.toLowerCase()}`}>
            <span className="day-checklist__icon">{getStatusIcon(item.status)}</span>
            <div className="day-checklist__content">
              <span className="day-checklist__title">{item.title}</span>
              <span className="day-checklist__type">{item.type}</span>
            </div>
            <span className="day-checklist__status">{getStatusLabel(item.status)}</span>
          </div>
        ))}
      </div>

      {totalCount === 0 && (
        <p className="day-checklist__empty">No learning activities for this day yet.</p>
      )}
    </Card>
  );
}

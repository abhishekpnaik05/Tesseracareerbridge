import { useState } from "react";
import type { InternshipWeekDto } from "@tesseracareerbridge/shared";
import { ProgressBar, Badge } from "../ui";
import { DayCard } from "./DayCard";

interface WeekCardProps {
  week: InternshipWeekDto;
  enrollmentId: string;
}

export function WeekCard({ week, enrollmentId }: WeekCardProps) {
  const [isExpanded, setIsExpanded] = useState(week.days.some((d) => d.isCurrent));

  const completedDays = week.days.filter((d) => d.availability === "COMPLETED").length;

  return (
    <div className="week-card">
      <button
        type="button"
        className="week-card__header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <div className="week-card__header-left">
          <span className="week-card__number">Week {week.weekNumber}</span>
          <h3 className="week-card__title">{week.title}</h3>
        </div>
        <div className="week-card__header-right">
          <Badge tone={week.progress === 100 ? "success" : week.progress > 0 ? "accent" : "muted"}>
            {week.progress}%
          </Badge>
          <span className="week-card__toggle">{isExpanded ? "−" : "+"}</span>
        </div>
      </button>

      {isExpanded && (
        <div className="week-card__content">
          {week.description && <p className="week-card__description">{week.description}</p>}
          <div className="week-card__progress">
            <ProgressBar value={week.progress} label={`${completedDays}/${week.totalDays} days completed`} />
          </div>
          <div className="week-card__days">
            {week.days.map((day) => (
              <DayCard key={day.id} day={day} enrollmentId={enrollmentId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

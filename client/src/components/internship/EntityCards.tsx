import { Badge, Button, ButtonLink, Card, ProgressBar } from "../ui";
import { cn } from "../../lib/cn";

export function ProgramCard({
  title,
  description,
  duration,
  level,
  skills,
  enrollmentStatus,
  category,
  ctaLabel = "View program",
  onAction,
  to,
  visualTone = "a",
}: {
  title: string;
  description: string;
  duration: string;
  level: string;
  skills: string[];
  enrollmentStatus: string;
  category?: string;
  ctaLabel?: string;
  onAction?: () => void;
  to?: string;
  visualTone?: "a" | "b" | "c" | "d";
}) {
  return (
    <Card className="entity-card">
      <div
        className={`program-visual program-visual--${visualTone}`}
        role="img"
        aria-label={`${title} program visual`}
      />
      <div className="entity-card__top">
        <div>
          {category ? <p className="t-label">{category}</p> : null}
          <h3>{title}</h3>
        </div>
        <Badge tone={enrollmentStatus === "Coming soon" ? "muted" : "accent"}>{enrollmentStatus}</Badge>
      </div>
      <p>{description}</p>
      <div className="entity-meta">
        <span>{duration}</span>
        <span>{level}</span>
      </div>
      <div className="entity-skills">
        {skills.map((skill) => (
          <Badge key={skill} tone="muted">
            {skill}
          </Badge>
        ))}
      </div>
      {to ? (
        <ButtonLink to={to}>{ctaLabel}</ButtonLink>
      ) : (
        <Button onClick={onAction}>{ctaLabel}</Button>
      )}
    </Card>
  );
}

export function BatchCard({
  name,
  startDate,
  endDate,
  seatsStatus,
}: {
  name: string;
  startDate: string;
  endDate: string;
  seatsStatus: string;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>{name}</h3>
        <Badge tone="info">{seatsStatus}</Badge>
      </div>
      <div className="entity-meta">
        <span>Starts {startDate}</span>
        <span>Ends {endDate}</span>
      </div>
    </Card>
  );
}

export function WeekCard({
  weekNumber,
  title,
  progress,
  status,
}: {
  weekNumber: number;
  title: string;
  progress: number;
  status: string;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>
          Week {weekNumber}: {title}
        </h3>
        <Badge>{status}</Badge>
      </div>
      <ProgressBar value={progress} />
    </Card>
  );
}

export function DayCard({
  dayNumber,
  topic,
  date,
  progress,
  state = "default",
}: {
  dayNumber: number;
  topic: string;
  date: string;
  progress: number;
  state?: "default" | "locked" | "current" | "completed";
}) {
  return (
    <Card className={cn("entity-card", state !== "default" && `is-${state}`)}>
      <div className="entity-card__top">
        <h3>
          Day {dayNumber}: {topic}
        </h3>
        <Badge tone={state === "completed" ? "success" : state === "locked" ? "muted" : "accent"}>
          {state}
        </Badge>
      </div>
      <div className="entity-meta">
        <span>{date}</span>
      </div>
      <ProgressBar value={progress} />
    </Card>
  );
}

export function LessonCard({
  title,
  type,
  duration,
  completed,
}: {
  title: string;
  type: string;
  duration: string;
  completed: boolean;
}) {
  return (
    <Card className="entity-card" variant="subtle">
      <div className="entity-card__top">
        <h3>{title}</h3>
        <Badge tone={completed ? "success" : "muted"}>{completed ? "Complete" : type}</Badge>
      </div>
      <p>{duration}</p>
    </Card>
  );
}

export function DDPCard({
  title,
  questionCount,
  duration,
  status,
  score,
  ctaLabel = "Open DDP",
  onAction,
}: {
  title: string;
  questionCount: number;
  duration: string;
  status: string;
  score?: string;
  ctaLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>{title}</h3>
        <Badge>{status}</Badge>
      </div>
      <div className="entity-meta">
        <span>{questionCount} questions</span>
        <span>{duration}</span>
        {score ? <span>{score}</span> : null}
      </div>
      <Button onClick={onAction}>{ctaLabel}</Button>
    </Card>
  );
}

export function AssignmentCard({
  title,
  deadline,
  status,
  score,
  ctaLabel = "Open assignment",
  onAction,
}: {
  title: string;
  deadline: string;
  status: string;
  score?: string;
  ctaLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>{title}</h3>
        <Badge tone={status === "Under review" ? "info" : "accent"}>{status}</Badge>
      </div>
      <div className="entity-meta">
        <span>Due {deadline}</span>
        {score ? <span>{score}</span> : null}
      </div>
      <Button onClick={onAction}>{ctaLabel}</Button>
    </Card>
  );
}

export function TestCard({
  title,
  questions,
  duration,
  status,
  score,
}: {
  title: string;
  questions: number;
  duration: string;
  status: string;
  score?: string;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>{title}</h3>
        <Badge>{status}</Badge>
      </div>
      <div className="entity-meta">
        <span>{questions} questions</span>
        <span>{duration}</span>
        {score ? <span>{score}</span> : null}
      </div>
    </Card>
  );
}

export function ProjectCard({
  title,
  type,
  progress,
  status,
  description,
  skills,
  ctaLabel,
  onAction,
}: {
  title: string;
  type: string;
  progress?: number;
  status: string;
  description?: string;
  skills?: string[];
  ctaLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>{title}</h3>
        <Badge>{status}</Badge>
      </div>
      <p>{type}</p>
      {description ? <p>{description}</p> : null}
      {skills && skills.length > 0 ? (
        <div className="entity-skills">
          {skills.map((skill) => (
            <Badge key={skill} tone="muted">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}
      {typeof progress === "number" ? <ProgressBar value={progress} /> : null}
      {ctaLabel ? (
        <Button onClick={onAction} type="button">
          {ctaLabel}
        </Button>
      ) : null}
    </Card>
  );
}

export function ProgressCard({
  overall,
  days,
  ddps,
  assignments,
  tests,
  projects,
}: {
  overall: number;
  days: string;
  ddps: string;
  assignments: string;
  tests: string;
  projects: string;
}) {
  return (
    <Card className="entity-card" variant="highlight">
      <h3>Overall progress</h3>
      <ProgressBar value={overall} label="Day Progress" />
      <div className="stat-grid">
        <div>
          <span>Days</span>
          <strong>{days}</strong>
        </div>
        <div>
          <span>DDPs</span>
          <strong>{ddps}</strong>
        </div>
        <div>
          <span>Assignments</span>
          <strong>{assignments}</strong>
        </div>
        <div>
          <span>Tests</span>
          <strong>{tests}</strong>
        </div>
        <div>
          <span>Projects</span>
          <strong>{projects}</strong>
        </div>
      </div>
    </Card>
  );
}

export function CertificateCard({
  program,
  status,
  certificateId,
  verification,
}: {
  program: string;
  status: string;
  certificateId: string;
  verification: string;
}) {
  return (
    <Card className="entity-card">
      <div className="entity-card__top">
        <h3>{program}</h3>
        <Badge tone={status === "Issued" ? "success" : "muted"}>{status}</Badge>
      </div>
      <div className="entity-meta">
        <span>ID {certificateId}</span>
        <span>{verification}</span>
      </div>
    </Card>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="entity-card" variant="subtle">
      <span className="t-label">{label}</span>
      <strong className="stat-card__value">{value}</strong>
      {hint ? <p>{hint}</p> : null}
    </Card>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { StudentDashboardDto } from "@tesseracareerbridge/shared";
import { ProgressCard } from "../../components/internship";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  ProgressBar,
  Skeleton,
} from "../../components/ui";
import { apiGet, ApiRequestError } from "../../lib/api";
import { useAuth } from "../../auth/AuthProvider";
import { useStudentAccount } from "../../student/StudentAccountProvider";

function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function StudentDashboardPage() {
  const { user } = useAuth();
  const { account } = useStudentAccount();
  const [data, setData] = useState<StudentDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await apiGet<StudentDashboardDto>("/students/me/dashboard"));
    } catch (err) {
      setData(null);
      setError(err instanceof ApiRequestError ? err.message : "Unable to load your internship information.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const name = data?.studentName ?? account?.user.displayName ?? user?.displayName ?? "there";

  return (
    <div className="student-dash">
      <header className="student-dash__hero">
        <p className="t-label">{formatDate(new Date())}</p>
        <h1>
          {greeting()}, {name.split(" ")[0]}.
        </h1>
        <p>Your next internship step is here when you are enrolled.</p>
        {account && account.completion.percent < 100 ? (
          <Alert tone="info">
            Profile {account.completion.percent}% complete.{" "}
            <ButtonLink to="/student/profile" variant="link" size="sm">
              Complete profile
            </ButtonLink>
          </Alert>
        ) : null}
      </header>

      {error ? (
        <ErrorState title="Unable to load your internship information." body="Check your connection and try again.">
          <Button onClick={() => void load()}>Try again</Button>
        </ErrorState>
      ) : null}

      <div className="student-dash__grid">
        <section className="student-dash__primary" aria-labelledby="internship-heading">
          <h2 id="internship-heading" className="student-dash__h">
            Current internship
          </h2>
          {loading ? (
            <Card>
              <Skeleton style={{ height: 160 }} />
            </Card>
          ) : data?.currentInternship ? (
            <Card variant="highlight" className="entity-card">
              <div className="entity-card__top">
                <h3>{data.currentInternship.programName}</h3>
                <Badge>{data.currentInternship.batchName}</Badge>
              </div>
              <p>
                Week {data.currentInternship.weekNumber ?? "—"} • Day {data.currentInternship.dayNumber ?? "—"}
              </p>
              <ProgressBar value={data.currentInternship.progressPercent} label="Progress" />
              <div className="entity-meta">
                {data.currentInternship.startsAt ? <span>Starts {formatDate(data.currentInternship.startsAt)}</span> : null}
                {data.currentInternship.endsAt ? <span>Expected {formatDate(data.currentInternship.endsAt)}</span> : null}
              </div>
              <ButtonLink to="/student/internships">Continue learning</ButtonLink>
            </Card>
          ) : (
            <Card>
              <EmptyState title="No active internship yet." body="When you enroll, this card will show your batch, week, and progress.">
                <ButtonLink to="/student/programs">Explore programs</ButtonLink>
              </EmptyState>
            </Card>
          )}
        </section>

        <section className="student-dash__primary" aria-labelledby="today-heading">
          <h2 id="today-heading" className="student-dash__h">
            Today&apos;s learning
          </h2>
          {loading ? (
            <Card>
              <Skeleton style={{ height: 180 }} />
            </Card>
          ) : data?.today ? (
            <Card className="entity-card">
              <p className="t-label">Day {data.today.dayNumber}</p>
              <h3>{data.today.topic}</h3>
              <p>{data.today.objective}</p>
              <div className="entity-meta">
                <span>{data.today.contentCount} resources</span>
                <span>{data.today.estimatedMinutes} min</span>
              </div>
              <ProgressBar value={data.today.progressPercent} />
              <ol className="today-steps">
                {data.today.steps.map((step) => (
                  <li key={step.id} className={step.done ? "is-done" : undefined}>
                    {step.done ? "✓" : "○"} {step.label}
                  </li>
                ))}
              </ol>
              <ButtonLink to="/student/internships">Continue day</ButtonLink>
            </Card>
          ) : (
            <Card>
              <EmptyState
                title="Nothing scheduled for today."
                body="Daily lessons, DDP, and assignments appear here after you join a batch."
              />
            </Card>
          )}
        </section>

        {data?.continueLearning ? (
          <section className="student-dash__full" aria-labelledby="continue-heading">
            <h2 id="continue-heading" className="student-dash__h">
              Continue where you left off
            </h2>
            <Card className="entity-card">
              <h3>{data.continueLearning.title}</h3>
              <p>{data.continueLearning.detail}</p>
              <ButtonLink to={data.continueLearning.href}>Continue</ButtonLink>
            </Card>
          </section>
        ) : null}

        <section aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="student-dash__h">
            Progress
          </h2>
          {loading ? (
            <Card>
              <Skeleton style={{ height: 140 }} />
            </Card>
          ) : data?.progress ? (
            <ProgressCard
              overall={data.progress.overallPercent}
              days={`${data.progress.days.done} / ${data.progress.days.total}`}
              ddps={`${data.progress.ddp.done} / ${data.progress.ddp.total}`}
              assignments={`${data.progress.assignments.done} / ${data.progress.assignments.total}`}
              tests={`${data.progress.tests.done} / ${data.progress.tests.total}`}
              projects={`${data.progress.projects.done} / ${data.progress.projects.total}`}
            />
          ) : (
            <Card>
              <EmptyState title="Progress unlocks after enrollment." body="Days, DDP, assignments, tests, and projects will tally here." />
            </Card>
          )}
        </section>

        <section aria-labelledby="upcoming-heading">
          <h2 id="upcoming-heading" className="student-dash__h">
            Upcoming
          </h2>
          {loading ? (
            <Card>
              <Skeleton style={{ height: 120 }} />
            </Card>
          ) : data?.upcoming.length ? (
            <ul className="upcoming-list">
              {data.upcoming.map((item) => (
                <li key={item.id}>
                  <Card className="entity-card">
                    <div className="entity-card__top">
                      <h3>{item.title}</h3>
                      <Badge tone="muted">{item.type}</Badge>
                    </div>
                    <div className="entity-meta">
                      <span>{formatDate(item.occursAt)}</span>
                      <span>{item.status}</span>
                    </div>
                    {item.href ? (
                      <ButtonLink to={item.href} variant="outline" size="sm">
                        Open
                      </ButtonLink>
                    ) : null}
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <EmptyState title="No upcoming activities." body="Deadlines and sessions will show here once your internship is running." />
            </Card>
          )}
        </section>

        <section aria-labelledby="announce-heading">
          <h2 id="announce-heading" className="student-dash__h">
            Announcements
          </h2>
          {loading ? (
            <Card>
              <Skeleton style={{ height: 120 }} />
            </Card>
          ) : data?.announcements.length ? (
            <ul className="announce-list">
              {data.announcements.map((item) => (
                <li key={item.id}>
                  <Card className="entity-card">
                    <div className="entity-card__top">
                      <h3>{item.title}</h3>
                      <Badge tone={item.priority === "HIGH" ? "danger" : "info"}>{item.priority}</Badge>
                    </div>
                    <p>{item.body}</p>
                    <p className="t-caption">{formatDate(item.createdAt)}</p>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <Card>
              <EmptyState title="No announcements yet." body="Program and batch notices will appear here." />
            </Card>
          )}
        </section>

        <section className="student-dash__full" aria-labelledby="notes-heading">
          <h2 id="notes-heading" className="student-dash__h">
            Notifications
          </h2>
          {loading ? (
            <Card>
              <Skeleton style={{ height: 80 }} />
            </Card>
          ) : data?.notificationPreview.length ? (
            <Card className="entity-card">
              <ul className="notice-preview">
                {data.notificationPreview.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <span className="t-caption">{formatDate(item.createdAt)}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink to="/student/notifications" variant="outline">
                View all
              </ButtonLink>
            </Card>
          ) : (
            <Card>
              <EmptyState title="You are caught up." body="Learning and mentor notices will land here.">
                <ButtonLink to="/student/notifications" variant="ghost">
                  Notification inbox
                </ButtonLink>
              </EmptyState>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

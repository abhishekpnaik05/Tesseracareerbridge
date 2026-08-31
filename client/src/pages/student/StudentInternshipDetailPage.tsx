import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { InternshipCurriculumDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../../components/seo/PageMeta";
import { Badge, ButtonLink, Card, EmptyState, ErrorState, Skeleton, ProgressBar } from "../../components/ui";
import { WeekCard } from "../../components/internship/WeekCard";
import { getInternshipCurriculum, enrollmentStatusLabel, formatDate } from "../../lib/enrollments";

export function StudentInternshipDetailPage() {
  const { id } = useParams();
  const [curriculum, setCurriculum] = useState<InternshipCurriculumDto | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        const data = await getInternshipCurriculum(id || "");
        setCurriculum(data);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    }

    loadData();
  }, [id]);

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <Skeleton style={{ height: 120, marginTop: 16 }} />
        <Skeleton style={{ height: 400, marginTop: 24 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load internship curriculum." body="Try again in a moment.">
          <ButtonLink to="/student/internships">Back to My Internships</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !curriculum) {
    return (
      <div className="container page-hero">
        <EmptyState title="Internship not found." body="This internship does not exist or you don't have access to it.">
          <ButtonLink to="/student/internships">Back to My Internships</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const currentDay = curriculum.weeks
    .flatMap((w) => w.days)
    .find((d) => d.isCurrent);

  return (
    <>
      <PageMeta
        title={`${curriculum.programTitle} | My Internship`}
        description={`View your ${curriculum.programTitle} internship curriculum and progress.`}
      />
      <div className="container page-hero">
        <p className="t-label">My Internship</p>
        <h1>{curriculum.programTitle}</h1>
        <p className="pub-lead">{curriculum.batchName}</p>
        <div className="entity-meta">
          <span>Status: {enrollmentStatusLabel(curriculum.status)}</span>
          {curriculum.startsAt && <span>Start: {formatDate(curriculum.startsAt)}</span>}
          {curriculum.endsAt && <span>End: {formatDate(curriculum.endsAt)}</span>}
        </div>
        <Badge tone={curriculum.status === "ACTIVE" ? "success" : "muted"}>
          {enrollmentStatusLabel(curriculum.status)}
        </Badge>
      </div>

      <div className="container pub-page-end">
        <div className="split">
          <div>
            <Card className="internship-hero">
              <h2>Internship Progress</h2>
              <div className="internship-hero__progress">
                <ProgressBar value={curriculum.overallProgress} label={`${curriculum.completedDays}/${curriculum.totalDays} Days Completed`} />
              </div>
              {curriculum.currentWeek && curriculum.currentDay && (
                <div className="internship-hero__current">
                  <p className="t-label">Current Position</p>
                  <p className="internship-hero__position">
                    Week {curriculum.currentWeek} • Day {curriculum.currentDay}
                  </p>
                  {currentDay && (
                    <ButtonLink to={`/student/internship/${curriculum.enrollmentId}/day/${currentDay.id}`}>
                      Continue Learning
                    </ButtonLink>
                  )}
                </div>
              )}
            </Card>

            <Card>
              <h2>Schedule</h2>
              <div className="entity-meta">
                <span>Total Days: {curriculum.totalDays}</span>
                <span>Completed: {curriculum.completedDays}</span>
                <span>Remaining: {curriculum.totalDays - curriculum.completedDays}</span>
              </div>
            </Card>
          </div>

          <Card variant="subtle">
            <h2>Quick Actions</h2>
            <div className="stack">
              {currentDay && (
                <ButtonLink to={`/student/internship/${curriculum.enrollmentId}/day/${currentDay.id}`}>
                  Continue Learning
                </ButtonLink>
              )}
              <ButtonLink to="/student/internships" variant="ghost">
                Back to My Internships
              </ButtonLink>
            </div>
          </Card>
        </div>

        <div className="pub-section">
          <h2>Curriculum</h2>
          <p className="pub-lead">
            Your learning journey organized by weeks and days. Complete each day to unlock the next.
          </p>
          <div className="curriculum-list">
            {curriculum.weeks.map((week) => (
              <WeekCard key={week.id} week={week} enrollmentId={curriculum.enrollmentId} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

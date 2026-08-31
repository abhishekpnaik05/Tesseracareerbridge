import { useEffect, useState } from "react";
import type { EnrollmentDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../../components/seo/PageMeta";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, Skeleton } from "../../components/ui";
import { listUserEnrollments, enrollmentStatusLabel, formatDate } from "../../lib/enrollments";

export function StudentInternshipsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await listUserEnrollments();
        setEnrollments(data.items);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    }

    loadData();
  }, []);

  const activeEnrollments = enrollments.filter((e) => e.status === "ACTIVE");
  const upcomingEnrollments = enrollments.filter((e) => e.status === "PENDING");
  const completedEnrollments = enrollments.filter((e) => e.status === "COMPLETED");

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <Skeleton style={{ height: 80, marginTop: 16 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load your internships." body="Try again in a moment.">
          <Button type="button" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </ErrorState>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="My Internships | TesseraCareerBridge"
        description="View and manage your enrolled internship programs."
      />
      <div className="container page-hero">
        <p className="t-label">Student</p>
        <h1>My Internships</h1>
        <p className="pub-lead">View and manage your enrolled internship programs.</p>
        <ButtonLink to="/programs">Explore Programs</ButtonLink>
      </div>

      <div className="container pub-page-end">
        {enrollments.length === 0 ? (
          <EmptyState
            title="No internships yet"
            body="You haven't enrolled in any internship programs yet. Explore our available programs to get started."
          >
            <ButtonLink to="/programs">Browse Programs</ButtonLink>
          </EmptyState>
        ) : null}

        {activeEnrollments.length > 0 ? (
          <section className="pub-section">
            <h2>Active Internships</h2>
            <div className="card-grid">
              {activeEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="entity-card">
                  <div className="entity-card__top">
                    <h3>{enrollment.programTitle}</h3>
                    <Badge tone="success">{enrollmentStatusLabel(enrollment.status)}</Badge>
                  </div>
                  <p>{enrollment.batchName}</p>
                  <div className="entity-meta">
                    <span>Progress: {enrollment.progressPercent}%</span>
                  </div>
                  <ButtonLink to={`/student/internship/${enrollment.id}`}>
                    Start Internship
                  </ButtonLink>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {upcomingEnrollments.length > 0 ? (
          <section className="pub-section">
            <h2>Upcoming Internships</h2>
            <div className="card-grid">
              {upcomingEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="entity-card">
                  <div className="entity-card__top">
                    <h3>{enrollment.programTitle}</h3>
                    <Badge tone="muted">{enrollmentStatusLabel(enrollment.status)}</Badge>
                  </div>
                  <p>{enrollment.batchName}</p>
                  <div className="entity-meta">
                    <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                  </div>
                  <ButtonLink to={`/student/internship/${enrollment.id}`} variant="secondary">
                    View Internship
                  </ButtonLink>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {completedEnrollments.length > 0 ? (
          <section className="pub-section">
            <h2>Completed Internships</h2>
            <div className="card-grid">
              {completedEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="entity-card">
                  <div className="entity-card__top">
                    <h3>{enrollment.programTitle}</h3>
                    <Badge tone="accent">{enrollmentStatusLabel(enrollment.status)}</Badge>
                  </div>
                  <p>{enrollment.batchName}</p>
                  <div className="entity-meta">
                    <span>Completed: {formatDate(enrollment.completedAt || "")}</span>
                  </div>
                  <ButtonLink to={`/student/internship/${enrollment.id}`} variant="secondary">
                    View Certificate
                  </ButtonLink>
                </Card>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}

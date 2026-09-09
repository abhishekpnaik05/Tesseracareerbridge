import { useEffect, useState } from "react";
import { Plus, BookOpen, Users, CalendarCheck } from "lucide-react";
import { PageMeta } from "../../components/seo/PageMeta";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge } from "../../components/ui";
import { getMentorBatches, type MentorBatchDto } from "../../lib/mentor";
import { formatDate, batchStatusLabel } from "../../lib/enrollments";

export function MentorInternshipsPage() {
  const [batches, setBatches] = useState<MentorBatchDto[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMentorBatches();
        setBatches(data);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load mentor internships:", error);
        setStatus("error");
      }
    }

    loadData();
  }, []);

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <div className="grid" style={{ marginTop: 24, gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: 200 }} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load internships" body="Try again in a moment.">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </ErrorState>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="My Internships" description="View and manage your assigned internship batches" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>My Internships</h1>
        <p className="pub-lead">Manage your assigned internship batches and curriculum.</p>
      </div>

      <div className="container">
        {batches.length === 0 ? (
          <EmptyState title="No internships assigned" body="You haven't been assigned to any internship batches yet." />
        ) : (
          <div className="internship-list">
            {batches.map((batch) => (
              <Card key={batch.id} className="batch-card">
                <div className="batch-card__header">
                  <h3>{batch.programTitle}</h3>
                  <Badge tone={batch.status === "IN_PROGRESS" ? "success" : "muted"}>
                    {batchStatusLabel(batch.status)}
                  </Badge>
                </div>
                <p className="batch-card__name">{batch.name}</p>
                <div className="batch-card__meta">
                  <span><Users size={14} /> {batch.studentCount} Students</span>
                  {batch.startsAt && <span><CalendarCheck size={14} /> Start: {formatDate(batch.startsAt)}</span>}
                  {batch.endsAt && <span>End: {formatDate(batch.endsAt)}</span>}
                </div>
                <div className="batch-card__progress">
                  <p className="batch-card__progress-label">Content Progress</p>
                  <div className="batch-card__progress-stats">
                    <span>{batch.contentProgress.publishedWeeks} / {batch.contentProgress.totalWeeks} Weeks Published</span>
                    <span>{batch.contentProgress.publishedDays} / {batch.contentProgress.totalDays} Days Published</span>
                  </div>
                </div>
                <div className="batch-card__actions">
                  <ButtonLink to={`/mentor/internships/${batch.id}`} variant="primary">
                    <BookOpen size={16} />
                    Manage Internship
                  </ButtonLink>
                  <ButtonLink to={`/mentor/internships/${batch.programId}/design`} variant="outline">
                    <Plus size={16} />
                    Design Curriculum
                  </ButtonLink>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

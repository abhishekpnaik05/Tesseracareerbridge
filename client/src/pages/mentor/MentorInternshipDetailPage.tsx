import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Users, CalendarCheck, BookOpen, ClipboardList, Trophy, ArrowLeft } from "lucide-react";
import { PageMeta } from "../../components/seo/PageMeta";
import { Card, ButtonLink, Skeleton, EmptyState, ErrorState, Badge } from "../../components/ui";
import { getMentorBatch, type MentorBatchDto } from "../../lib/mentor";
import { formatDate, batchStatusLabel } from "../../lib/enrollments";

export function MentorInternshipDetailPage() {
  const { id } = useParams();
  const [batch, setBatch] = useState<MentorBatchDto | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");

  useEffect(() => {
    if (!id) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        const data = await getMentorBatch(id!);
        setBatch(data);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load internship:", error);
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
        <Skeleton style={{ height: 400, marginTop: 24 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load internship" body="Try again in a moment.">
          <ButtonLink to="/mentor/internships">Back to My Internships</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !batch) {
    return (
      <div className="container page-hero">
        <EmptyState title="Internship not found" body="This internship does not exist or you don't have access to it.">
          <ButtonLink to="/mentor/internships">Back to My Internships</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${batch.programTitle} | ${batch.name}`}
        description={`Manage ${batch.programTitle} - ${batch.name}`}
      />
      <div className="container page-hero">
        <ButtonLink to="/mentor/internships" variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Back to My Internships
        </ButtonLink>
        <p className="t-label">Internship Overview</p>
        <h1>{batch.programTitle}</h1>
        <p className="pub-lead">{batch.name}</p>
        <div className="internship-meta">
          <span>Status: {batchStatusLabel(batch.status)}</span>
          <span><Users size={14} /> {batch.studentCount} Students</span>
          {batch.startsAt && <span><CalendarCheck size={14} /> Start: {formatDate(batch.startsAt)}</span>}
          {batch.endsAt && <span>End: {formatDate(batch.endsAt)}</span>}
        </div>
        <Badge tone={batch.status === "IN_PROGRESS" ? "success" : "muted"}>
          {batchStatusLabel(batch.status)}
        </Badge>
      </div>

      <div className="container">
        <div className="internship-overview">
          <div>
            <Card>
              <h2>Content Status</h2>
              <div className="batch-card__progress">
                <p className="batch-card__progress-label">Curriculum Progress</p>
                <div className="batch-card__progress-stats">
                  <span>{batch.contentProgress.publishedWeeks} / {batch.contentProgress.totalWeeks} Weeks Published</span>
                  <span>{batch.contentProgress.publishedDays} / {batch.contentProgress.totalDays} Days Published</span>
                </div>
              </div>
            </Card>

            <div style={{ marginTop: 16 }}>
              <Card>
              <h2>Quick Actions</h2>
              <div className="stack">
                <ButtonLink to={`/mentor/internships/${batch.programId}/design`} variant="primary">
                  <BookOpen size={16} />
                  Design Curriculum
                </ButtonLink>
                <ButtonLink to={`/mentor/batches/${batch.id}/students`} variant="secondary">
                  <Users size={16} />
                  View Students
                </ButtonLink>
                <ButtonLink to={`/mentor/attendance?batchId=${batch.id}`} variant="outline">
                  <CalendarCheck size={16} />
                  Mark Attendance
                </ButtonLink>
                <ButtonLink to={`/mentor/assignments?batchId=${batch.id}`} variant="outline">
                  <ClipboardList size={16} />
                  Assignment Reviews
                </ButtonLink>
                <ButtonLink to={`/mentor/ddp-results?batchId=${batch.id}`} variant="outline">
                  <Trophy size={16} />
                  DDP Results
                </ButtonLink>
              </div>
              </Card>
            </div>
          </div>

          <Card variant="subtle">
            <h2>Internship Details</h2>
            <div className="stack">
              <div>
                <p className="t-label">Program</p>
                <p>{batch.programTitle}</p>
              </div>
              <div>
                <p className="t-label">Batch</p>
                <p>{batch.name}</p>
              </div>
              <div>
                <p className="t-label">Students Enrolled</p>
                <p>{batch.studentCount}</p>
              </div>
              {batch.startsAt && (
                <div>
                  <p className="t-label">Start Date</p>
                  <p>{formatDate(batch.startsAt)}</p>
                </div>
              )}
              {batch.endsAt && (
                <div>
                  <p className="t-label">End Date</p>
                  <p>{formatDate(batch.endsAt)}</p>
                </div>
              )}
              <div>
                <p className="t-label">Status</p>
                <p>{batchStatusLabel(batch.status)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

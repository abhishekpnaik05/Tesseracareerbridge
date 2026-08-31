import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import type { BatchDto, ProgramDetailDto } from "@tesseracareerbridge/shared";
import { useAuth } from "../auth";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Badge, Button, ButtonLink, Card, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { getPublicProgram } from "../lib/programs";
import { getBatch, batchStatusLabel, formatDate } from "../lib/enrollments";

export function EnrollmentSummaryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const batchId = searchParams.get("batch");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState<ProgramDetailDto | null>(null);
  const [batch, setBatch] = useState<BatchDto | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!slug || !batchId) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        const programData = await getPublicProgram(slug || "");
        const batchData = await getBatch(batchId || "");

        if (!programData || !batchData) {
          setStatus("missing");
          return;
        }

        setProgram(programData);
        setBatch(batchData);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    }

    loadData();
  }, [slug, batchId]);

  async function handleConfirmEnrollment() {
    if (!batch) return;

    setIsSubmitting(true);
    try {
      const { createEnrollment } = await import("../lib/enrollments");
      const enrollment = await createEnrollment(batch.id);
      navigate(`/programs/${slug}/enroll/success?enrollment=${enrollment.id}`);
    } catch (error) {
      setStatus("error");
      setIsSubmitting(false);
    }
  }

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
        <ErrorState title="Unable to load enrollment details." body="Try again in a moment.">
          <ButtonLink to={`/programs/${slug}/enroll`}>Back to batch selection</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !program || !batch) {
    return (
      <div className="container page-hero">
        <EmptyState title="Program or batch not found." body="The enrollment information is no longer available.">
          <ButtonLink to="/programs">Back to programs</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Confirm Enrollment | ${program.title}`}
        description="Review your enrollment details before confirming."
      />
      <div className="container page-hero">
        <p className="t-label">Enrollment Summary</p>
        <h1>Confirm your enrollment</h1>
        <p className="pub-lead">Review the details below before confirming your enrollment.</p>
      </div>

      <div className="container pub-page-end">
        <div className="split">
          <div>
            <Card>
              <h2>Program</h2>
              <h3>{program.title}</h3>
              <p>{program.summary}</p>
              <div className="entity-meta">
                <span>{program.durationLabel}</span>
                <span>{program.level}</span>
              </div>
            </Card>

            <Card>
              <h2>Batch</h2>
              <h3>{batch.name}</h3>
              <div className="entity-meta">
                <span>Start: {formatDate(batch.startsAt)}</span>
                <span>End: {formatDate(batch.endsAt)}</span>
              </div>
              <Badge tone={batch.status === "OPEN" ? "accent" : "muted"}>
                {batchStatusLabel(batch.status)}
              </Badge>
              {batch.capacity ? (
                <p className="t-caption">
                  {batch.capacity - batch.enrolledCount} seats remaining
                </p>
              ) : null}
            </Card>
          </div>

          <Card variant="subtle">
            <h2>Student Information</h2>
            <p>
              <strong>Name:</strong> {user?.displayName || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || "N/A"}
            </p>
            <Alert tone="info">
              By confirming enrollment, you agree to the program terms and conditions.
            </Alert>
            <div className="row">
              <ButtonLink
                to={`/programs/${slug}/enroll`}
                variant="secondary"
              >
                Change Batch
              </ButtonLink>
              <Button onClick={handleConfirmEnrollment} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Confirm Enrollment"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

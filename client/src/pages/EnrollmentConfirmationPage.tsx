import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { BatchDto, EnrollmentDto, ProgramDetailDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Badge, ButtonLink, Card, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { getPublicProgram } from "../lib/programs";
import { getEnrollment, getBatch, enrollmentStatusLabel, formatDate } from "../lib/enrollments";

export function EnrollmentConfirmationPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const enrollmentId = searchParams.get("enrollment");
  const [program, setProgram] = useState<ProgramDetailDto | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentDto | null>(null);
  const [batch, setBatch] = useState<BatchDto | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");

  useEffect(() => {
    if (!slug || !enrollmentId) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        const [programData, enrollmentData] = await Promise.all([
          getPublicProgram(slug || ""),
          getEnrollment(enrollmentId || ""),
        ]);

        if (!programData || !enrollmentData) {
          setStatus("missing");
          return;
        }

        setProgram(programData);
        setEnrollment(enrollmentData);

        // Load batch details
        if (enrollmentData.batchId) {
          try {
            const batchData = await getBatch(enrollmentData.batchId || "");
            setBatch(batchData);
          } catch (error) {
            // Batch load failure is not critical
          }
        }

        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    }

    loadData();
  }, [slug, enrollmentId]);

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
        <ErrorState title="Unable to load enrollment confirmation." body="Try again in a moment.">
          <ButtonLink to="/student/internships">Go to My Internships</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !program || !enrollment) {
    return (
      <div className="container page-hero">
        <EmptyState title="Enrollment not found." body="The enrollment information is no longer available.">
          <ButtonLink to="/student/internships">Go to My Internships</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Enrollment Confirmed | ${program.title}`}
        description="You have successfully enrolled in the program."
      />
      <div className="container page-hero">
        <Alert tone="success">You're enrolled!</Alert>
        <h1>{program.title}</h1>
        <p className="pub-lead">{enrollment.batchName}</p>
        <div className="entity-meta">
          <span>Status: {enrollmentStatusLabel(enrollment.status)}</span>
          {batch && <span>Starts: {formatDate(batch.startsAt)}</span>}
        </div>
        <Badge tone="success">{enrollmentStatusLabel(enrollment.status)}</Badge>
      </div>

      <div className="container pub-page-end">
        <Card variant="highlight">
          <h2>Next Steps</h2>
          <p>Your internship will begin on the start date. You can access your learning materials and track your progress from your student dashboard.</p>
          <div className="row">
            <ButtonLink to={`/student/internship/${enrollment.id}`}>
              Go to My Internship
            </ButtonLink>
            <ButtonLink to="/student" variant="secondary">
              View Dashboard
            </ButtonLink>
          </div>
        </Card>

        <div className="row">
          <ButtonLink to={`/programs/${slug}`} variant="ghost">
            Back to Program
          </ButtonLink>
          <ButtonLink to="/student/internships" variant="ghost">
            View All Internships
          </ButtonLink>
        </div>
      </div>
    </>
  );
}

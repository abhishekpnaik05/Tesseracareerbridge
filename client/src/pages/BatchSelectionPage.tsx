import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { BatchDto, ProgramDetailDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../components/seo/PageMeta";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, Skeleton } from "../components/ui";
import { getPublicProgram } from "../lib/programs";
import { listProgramBatches, batchStatusLabel, formatDate } from "../lib/enrollments";
import { cn } from "../lib/cn";

export function BatchSelectionPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState<ProgramDetailDto | null>(null);
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        const programData = await getPublicProgram(slug || "");
        const batchesData = await listProgramBatches(slug || "");

        if (!programData) {
          setStatus("missing");
          return;
        }

        setProgram(programData);
        setBatches(batchesData);
        setStatus("ready");
      } catch (error) {
        setStatus("error");
      }
    }

    loadData();
  }, [slug]);

  function handleSelectBatch(batchId: string) {
    setSelectedBatch(batchId);
    if (slug) {
      navigate(`/programs/${slug}/enroll/summary?batch=${encodeURIComponent(batchId)}`);
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
        <ErrorState title="Unable to load batches." body="Try again in a moment.">
          <ButtonLink to={`/programs/${slug}`}>Back to program</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !program) {
    return (
      <div className="container page-hero">
        <EmptyState title="Program not found." body="This program does not exist or is not available.">
          <ButtonLink to="/programs">Back to programs</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const availableBatches = batches.filter(
    (batch) => batch.status === "OPEN" || batch.status === "UPCOMING"
  );

  return (
    <>
      <PageMeta
        title={`Enroll in ${program.title} | TesseraCareerBridge`}
        description={`Select a batch to enroll in ${program.title}.`}
      />
      <div className="container page-hero">
        <p className="t-label">Enrollment</p>
        <h1>Select a batch for {program.title}</h1>
        <p className="pub-lead">Choose your preferred start date and schedule.</p>
        <ButtonLink to={`/programs/${slug}`} variant="ghost">
          Back to program
        </ButtonLink>
      </div>

      <div className="container pub-page-end">
        {status === "ready" && availableBatches.length === 0 ? (
          <EmptyState
            title="No upcoming batches available"
            body="There are currently no open or upcoming batches for this program. Check back later or contact us for more information."
          >
            <ButtonLink to="/contact">Contact us</ButtonLink>
          </EmptyState>
        ) : null}

        {status === "ready" && availableBatches.length > 0 ? (
          <div className="card-grid">
            {availableBatches.map((batch) => (
              <Card key={batch.id} className={cn("entity-card", selectedBatch === batch.id && "is-current")}>
                <div className="entity-card__top">
                  <h3>{batch.name}</h3>
                  <Badge tone={batch.status === "OPEN" ? "accent" : "muted"}>
                    {batchStatusLabel(batch.status)}
                  </Badge>
                </div>
                <div className="entity-meta">
                  <span>Starts: {formatDate(batch.startsAt)}</span>
                  <span>Ends: {formatDate(batch.endsAt)}</span>
                </div>
                {batch.capacity ? (
                  <div className="entity-meta">
                    <span>
                      {batch.capacity - batch.enrolledCount} seats remaining
                    </span>
                  </div>
                ) : null}
                {batch.description ? <p>{batch.description}</p> : null}
                <Button
                  onClick={() => handleSelectBatch(batch.id)}
                  disabled={batch.status === "FULL"}
                >
                  {batch.status === "FULL" ? "Batch Full" : "Select Batch"}
                </Button>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}

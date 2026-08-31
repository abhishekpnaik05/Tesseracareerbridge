import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { ProgramDetailDto } from "@tesseracareerbridge/shared";
import { useAuth } from "../auth";
import { PageMeta } from "../components/seo/PageMeta";
import {
  Accordion,
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
} from "../components/ui";
import { ProjectCard } from "../components/internship";
import { getPublicProgram, programAvailabilityLabel, programEnrollPath } from "../lib/programs";
import { listUserEnrollments } from "../lib/enrollments";

const MENTORSHIP = [
  { title: "Doubt support", body: "Ask questions about the day's work after you enroll." },
  { title: "Assignment feedback", body: "Reviewed work, not only a completion tick." },
  { title: "Project feedback", body: "Guidance on the builds that belong in your record." },
  { title: "Progress guidance", body: "A mentor who can see where you are in the batch." },
];

export function ProgramDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [program, setProgram] = useState<ProgramDetailDto | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!slug) {
      setStatus("missing");
      return;
    }
    let active = true;
    setStatus("loading");
    
    async function loadData() {
      try {
        const programData = await getPublicProgram(slug || "");
        const enrollmentsData = user ? await listUserEnrollments() : { items: [] };

        if (!active) return;
        if (!programData) {
          setStatus("missing");
          return;
        }

        setProgram(programData);
        
        // Check if user is already enrolled in this program
        if (programData?.id) {
          const enrolledProgramIds = enrollmentsData.items.map(e => e.programId);
          setIsEnrolled(enrolledProgramIds.includes(programData.id));
        }
        
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
      }
    }

    loadData();
    
    return () => {
      active = false;
    };
  }, [slug, reload, user]);

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <Skeleton style={{ height: 80, marginTop: 16 }} />
        <Skeleton style={{ height: 44, width: 180, marginTop: 24 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load this program." body="Try again in a moment.">
          <Button type="button" onClick={() => setReload((n) => n + 1)}>
            Try again
          </Button>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !program) {
    return (
      <div className="container page-hero">
        <EmptyState title="Program not found." body="This catalog entry is unpublished or does not exist.">
          <ButtonLink to="/programs" variant="secondary">
            Back to programs
          </ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const comingSoon = program.availability === "COMING_SOON";
  const enrollTo = programEnrollPath(program.slug, user?.role);
  const structure = [
    program.durationLabel,
    program.learningDaysPerWeek ? `${program.learningDaysPerWeek} learning days / week` : null,
    program.level,
    programAvailabilityLabel(program.availability),
  ].filter((item): item is string => Boolean(item));

  const curriculumItems = program.weeks.map((week) => ({
    id: `week-${week.index}`,
    title: `Week ${week.index}: ${week.title}`,
    body: (
      <ul className="reason-list">
        {week.days.map((day) => (
          <li key={day.index}>
            Day {day.index} — {day.title}
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <>
      <PageMeta
        title={`TesseraCareerBridge | ${program.title} Internship`}
        description={program.summary}
      />
      <div className="container page-hero program-detail-hero">
        <p className="t-label">{program.category}</p>
        <h1>{program.title}</h1>
        <p className="pub-lead">{program.summary}</p>
        <div className="entity-meta">
          <span>{program.durationLabel}</span>
          <span>{program.level}</span>
        </div>
        <div className="entity-skills">
          {program.skills.map((skill) => (
            <Badge key={skill} tone="muted">
              {skill}
            </Badge>
          ))}
        </div>
        {comingSoon ? (
          <Alert tone="info">This program is listed as coming soon. Enrollment is not open yet.</Alert>
        ) : (
          <Alert tone="info">
            Enrollment processing is not live yet. Enroll Now takes you to the account path for Prompt 7.
          </Alert>
        )}
        <div className="hero__actions">
          {comingSoon ? (
            <ButtonLink to="/contact">Ask about availability</ButtonLink>
          ) : isEnrolled ? (
            <ButtonLink to="/student/internships">Continue Internship</ButtonLink>
          ) : user ? (
            <ButtonLink to={`/programs/${program.slug}/enroll`}>Enroll Now</ButtonLink>
          ) : (
            <ButtonLink to={`/register?program=${program.slug}`}>Enroll Now</ButtonLink>
          )}
          <ButtonLink to="/programs" variant="ghost">
            All programs
          </ButtonLink>
        </div>
      </div>

      <section className="pub-section pub-section--surface">
        <div className="container split">
          <div>
            <h2>Overview</h2>
            <p>{program.description}</p>
            <h3>What you&apos;ll learn</h3>
            <ul className="reason-list">
              {program.outcomes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3>Learning approach</h3>
            <p>{program.learningApproach}</p>
          </div>
          <Card>
            <h3>Who this program is for</h3>
            <p>{program.audience}</p>
            <h3>Prerequisites</h3>
            <ul className="reason-list">
              {program.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="pub-section">
        <div className="container">
          <h2>Duration and structure</h2>
          <div className="practice-grid">
            {structure.map((item) => (
              <Card key={item} variant="subtle">
                <h3>{item}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <h2>Curriculum preview</h2>
          <p className="pub-lead">
            Public week and day titles only. Videos, notes, DDP, and assignment answers stay behind enrollment.
          </p>
          {program.weeks.length === 0 ? (
            <EmptyState title="Curriculum preview coming soon." body="Week titles will appear here when they are published." />
          ) : (
            <Accordion items={curriculumItems} allowMultiple />
          )}
        </div>
      </section>

      <section className="pub-section">
        <div className="container">
          <h2>Skills you&apos;ll build</h2>
          <div className="entity-skills">
            {program.skills.map((skill) => (
              <Badge key={skill} tone="muted">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <h2>By the end of this program, students should be able to…</h2>
          <ul className="reason-list">
            {program.outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="t-caption">These are skill outcomes from the program data. Employment is not guaranteed.</p>
        </div>
      </section>

      <section className="pub-section">
        <div className="container">
          <h2>What students get</h2>
          <div className="practice-grid">
            {program.benefits.map((item) => (
              <Card key={item.title} variant="subtle">
                <h3>{item.title}</h3>
                {item.body ? <p>{item.body}</p> : null}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <h2>Project preview</h2>
          <p className="pub-lead">Example builds associated with this program. Submission opens after enrollment.</p>
          {program.projects.length === 0 ? (
            <EmptyState title="No project previews yet." body="Project outlines will appear here when they are published." />
          ) : (
            <div className="card-grid">
              {program.projects.map((project) => (
                <ProjectCard
                  key={project.title}
                  title={project.title}
                  type={project.difficulty ? `${project.type} · ${project.difficulty}` : project.type}
                  status="Preview"
                  description={project.description}
                  skills={project.skills}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pub-section">
        <div className="container">
          <h2>Mentorship</h2>
          <p className="pub-lead">
            Enrolled students can receive mentor guidance. Communication tools are not part of this catalog step.
          </p>
          <div className="card-grid">
            {MENTORSHIP.map((item) => (
              <Card key={item.title} variant="subtle">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <h2>FAQ</h2>
          <Accordion items={program.faqs} />
          <p className="t-caption">
            More questions? See the <Link to="/faq">full FAQ</Link>.
          </p>
        </div>
      </section>

      <section className="pub-section">
        <div className="container cta-band">
          <h2>Ready to build your next skill?</h2>
          <p className="pub-lead">
            {comingSoon
              ? "This listing is not open for enrollment yet."
              : "Create an account now. Batch selection and payment arrive in the next product step."}
          </p>
          {comingSoon ? (
            <ButtonLink to="/contact">Contact us</ButtonLink>
          ) : (
            <ButtonLink to={enrollTo}>Enroll Now</ButtonLink>
          )}
        </div>
      </section>
    </>
  );
}

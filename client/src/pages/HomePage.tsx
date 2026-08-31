import { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, FolderKanban, GraduationCap, MessageCircle, PlayCircle, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProgramListItemDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../components/seo/PageMeta";
import { ButtonLink, Card, EmptyState, Skeleton } from "../components/ui";
import { ProgramCard, ProgressCard } from "../components/internship";
import { JOURNEY_STEPS } from "../data/public-content";
import { listPublicPrograms, programCardProps } from "../lib/programs";

const values = [
  { icon: GraduationCap, title: "Structured Learning", body: "Weeks and days, not a pile of links." },
  { icon: FolderKanban, title: "Practical Projects", body: "Mini builds that lead to a major project." },
  { icon: MessageCircle, title: "Mentor Support", body: "Doubts and reviews from assigned mentors." },
  { icon: Sparkles, title: "Industry-Oriented Skills", body: "Work that belongs in a portfolio conversation." },
  { icon: Trophy, title: "Verified Certification", body: "Issued after evaluation — not on signup." },
];

const reasons = [
  "Structured internship curriculum",
  "Day-wise learning",
  "Daily practice",
  "DDP",
  "Assignments",
  "Projects",
  "Mentor guidance",
  "Assessments",
  "Certification",
];

const practice = [
  { icon: PlayCircle, title: "Videos" },
  { icon: BookOpen, title: "Notes" },
  { icon: ClipboardCheck, title: "Practice" },
  { icon: ClipboardCheck, title: "DDP" },
  { icon: FolderKanban, title: "Assignments" },
  { icon: FolderKanban, title: "Projects" },
  { icon: MessageCircle, title: "Mentor Feedback" },
];

export function HomePage() {
  const [featured, setFeatured] = useState<ProgramListItemDto[] | null>(null);

  useEffect(() => {
    let active = true;
    listPublicPrograms({ featured: true, sort: "featured", limit: 6 })
      .then((data) => {
        if (!active) return;
        setFeatured(data.items);
      })
      .catch(() => {
        if (!active) return;
        setFeatured([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | Structured internships"
        description="Structured internship programs for VTU students: daily learning, practice, projects, mentorship, and verified certificates."
      />
      <section className="pub-hero">
        <div className="pub-hero__grid" />
        <div className="container">
          <p className="t-label pub-kicker">Internship and career learning</p>
          <h1 className="t-display">Build the skill. Ship the work. Own the story.</h1>
          <p className="pub-lead">
            TesseraCareerBridge is a structured internship platform. Students follow a day-wise
            program with practice, DDP, assignments, mentor review, projects, and a certificate
            that follows evaluation — not a marketing PDF.
          </p>
          <div className="hero__actions">
            <ButtonLink to="/programs">Explore Programs</ButtonLink>
            <ButtonLink to="/how-it-works" variant="outline">
              How It Works
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container value-strip">
          {values.map((item) => (
            <article key={item.title}>
              <item.icon size={20} color="var(--color-amber)" aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pub-section">
        <div className="container split">
          <div>
            <p className="t-label">Why TesseraCareerBridge</p>
            <h2>Theory without a day plan stays theory.</h2>
            <p>
              Students often finish a course able to recall a definition and still unable to
              open an editor and finish a brief. Internships should close that gap with a
              calendar, a mentor, and work you can show.
            </p>
          </div>
          <ul className="reason-list">
            {reasons.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <p className="t-label">Programs</p>
          <h2>Internships with a syllabus, not a slogan.</h2>
          <p className="pub-lead">Featured internships from the published catalog — the same cards the programs page uses.</p>
          {featured === null ? (
            <div className="card-grid" aria-busy="true">
              <Skeleton style={{ height: 260 }} />
              <Skeleton style={{ height: 260 }} />
              <Skeleton style={{ height: 260 }} />
            </div>
          ) : featured.length === 0 ? (
            <EmptyState title="No featured programs available." body="Published featured internships will appear here.">
              <ButtonLink to="/programs" variant="secondary">
                View all programs
              </ButtonLink>
            </EmptyState>
          ) : (
            <div className="card-grid">
              {featured.map((program) => (
                <ProgramCard key={program.id} {...programCardProps(program)} ctaLabel="View program" />
              ))}
            </div>
          )}
          <div className="hero__actions">
            <ButtonLink to="/programs" variant="secondary">
              View All Programs
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="container">
          <p className="t-label">How the internship works</p>
          <h2>Eight steps from choice to certificate.</h2>
          <div className="timeline">
            {JOURNEY_STEPS.map((step) => (
              <article key={step.n}>
                <strong>{step.n}</strong>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <p className="t-label">Day-wise learning</p>
          <h2>A week is a rhythm, not a dump of files.</h2>
          <p className="pub-lead">
            This is a marketing illustration of the model. Live day titles come from each
            program’s curriculum — they are never hard-coded as a single syllabus in the interface.
          </p>
          <Card className="week-demo">
            <p className="t-label">Week 1</p>
            <div className="week-demo__days">
              <div>
                <strong>Day 01</strong>
                <p>Learn</p>
              </div>
              <div>
                <strong>Day 02</strong>
                <p>Practice</p>
              </div>
              <div>
                <strong>Day 03</strong>
                <p>Build</p>
              </div>
              <div>
                <strong>Day 04</strong>
                <p>Assess</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="pub-section">
        <div className="container">
          <p className="t-label">Practical learning</p>
          <h2>Every format has a job.</h2>
          <div className="practice-grid">
            {practice.map((item) => (
              <Card key={item.title} variant="highlight">
                <item.icon size={18} color="var(--color-amber)" aria-hidden="true" />
                <h3>{item.title}</h3>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container">
          <p className="t-label">Project-based learning</p>
          <h2>Watching is not the product. Building is.</h2>
          <ol className="project-flow">
            <li>
              <strong>Mini projects</strong>
              <p>Short builds that prove a week’s skills.</p>
            </li>
            <li>
              <strong>Major project</strong>
              <p>A piece of work you can defend in a review.</p>
            </li>
            <li>
              <strong>Portfolio</strong>
              <p>Write-ups and artifacts, not only a completion tick.</p>
            </li>
            <li>
              <strong>Career readiness</strong>
              <p>You can explain what you built and why it works.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="pub-section">
        <div className="container split">
          <div>
            <p className="t-label">Mentorship</p>
            <h2>A person who sees your batch.</h2>
            <p>Ask doubts. Get feedback. Assignment review. Project review. Progress guidance.</p>
            <ButtonLink to="/how-it-works">Learn About Mentorship</ButtonLink>
          </div>
          <Card>
            <ul className="reason-list">
              <li>Ask doubts</li>
              <li>Get feedback</li>
              <li>Assignment review</li>
              <li>Project review</li>
              <li>Progress guidance</li>
            </ul>
          </Card>
        </div>
      </section>

      <section className="pub-section pub-section--surface">
        <div className="container split">
          <div>
            <p className="t-label">Progress</p>
            <h2>Completion is visible. Eligibility is earned.</h2>
            <p>
              Conceptual snapshot of how a student sees work. Numbers here are illustrative, not a live account.
            </p>
            <ProgressCard overall={80} days="80%" ddps="12 / 15" assignments="8 / 10" tests="Pending" projects="2 / 3" />
          </div>
          <div>
            <p className="t-label">Certificate</p>
            <h2>The document comes last.</h2>
            <div className="cert-mock">
              <p className="t-label">Certificate preview</p>
              <h3>TesseraCareerBridge</h3>
              <p>Internship of record</p>
              <p className="t-caption">Complete internship → eligibility → final evaluation → verified certificate</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pub-section">
        <div className="container cta-band">
          <h2>Your internship should build more than a certificate.</h2>
          <p className="pub-lead">It should build your skills, projects, and the confidence to explain them.</p>
          <div className="hero__actions">
            <ButtonLink to="/programs">Explore Programs</ButtonLink>
            <ButtonLink to="/get-started" variant="outline">
              Get Started
            </ButtonLink>
          </div>
          <p className="t-caption">
            Prefer a conversation first? <Link to="/contact">Contact us</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

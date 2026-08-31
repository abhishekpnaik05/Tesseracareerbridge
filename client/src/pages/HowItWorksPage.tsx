import { PageMeta } from "../components/seo/PageMeta";
import { HOW_IT_WORKS_STAGES } from "../data/public-content";

export function HowItWorksPage() {
  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | How It Works"
        description="The TesseraCareerBridge internship journey: discover, enroll, learn, practice, DDP, projects, evaluation, certificate."
      />
      <div className="container page-hero">
        <p className="t-label">How it works</p>
        <h1>One path. Every stage has a job.</h1>
        <p className="pub-lead">
          Desktop and mobile use the same stages. The layout stacks on small screens and opens into
          a timeline on larger ones.
        </p>
      </div>
      <section className="pub-section">
        <div className="container timeline">
          {HOW_IT_WORKS_STAGES.map((stage, index) => (
            <article key={stage.id}>
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <h2>{stage.title}</h2>
              <p>{stage.body}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

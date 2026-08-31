import { PageMeta } from "../components/seo/PageMeta";
import { Card } from "../components/ui";

export function AboutPage() {
  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | About"
        description="Why TesseraCareerBridge exists: structured internships that turn study into finished work."
      />
      <div className="container page-hero">
        <p className="t-label">About</p>
        <h1>Internships should produce work, not just attendance.</h1>
        <p className="pub-lead">
          TesseraCareerBridge is built for VTU students who need a supervised path: a program, a
          batch, a day plan, a mentor, and a certificate that follows evaluation.
        </p>
      </div>
      <section className="pub-section pub-section--surface">
        <div className="container split">
          <div>
            <h2>The problem</h2>
            <p>
              Campus courses teach concepts. Many internships then ask students to “explore
              YouTube” or sit through unstructured tasks. The gap is not motivation. It is
              sequence, review, and a definition of done.
            </p>
          </div>
          <div>
            <h2>The approach</h2>
            <p>
              We treat an internship as an operated program. Curriculum lives as data. Mentors
              are assigned to batches. Progress is per day. Certificates are issued after
              eligibility — not as a welcome gift.
            </p>
          </div>
        </div>
      </section>
      <section className="pub-section">
        <div className="container">
          <h2>Learning philosophy</h2>
          <div className="card-grid">
            <Card>
              <h3>Practical experience</h3>
              <p>Video is a start. Practice, DDP, and assignments are how knowledge becomes a habit.</p>
            </Card>
            <Card>
              <h3>Mentorship</h3>
              <p>A named mentor for the batch. Doubts and reviews are part of the product, not an afterthought.</p>
            </Card>
            <Card>
              <h3>Career readiness</h3>
              <p>Projects and write-ups you can defend. We do not promise placements.</p>
            </Card>
            <Card>
              <h3>Certification</h3>
              <p>A verified record of a completed internship, after the evaluation is done.</p>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

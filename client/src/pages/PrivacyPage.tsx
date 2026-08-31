import { PageMeta } from "../components/seo/PageMeta";
import { PRIVACY_SECTIONS } from "../data/public-content";

export function PrivacyPage() {
  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | Privacy"
        description="Privacy structure for TesseraCareerBridge. This is a draft layout, not a certified legal policy."
      />
      <div className="container page-hero">
        <p className="t-label">Legal</p>
        <h1>Privacy</h1>
        <p className="pub-lead">Draft sections for later legal review. No compliance badges are claimed here.</p>
      </div>
      <div className="container legal-doc pub-page-end">
        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}

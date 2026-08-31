import { PageMeta } from "../components/seo/PageMeta";
import { TERMS_SECTIONS } from "../data/public-content";

export function TermsPage() {
  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | Terms"
        description="Terms of use structure for TesseraCareerBridge. Placeholder content pending legal review."
      />
      <div className="container page-hero">
        <p className="t-label">Legal</p>
        <h1>Terms</h1>
        <p className="pub-lead">Structured, editable sections. Not a finished contract.</p>
      </div>
      <div className="container legal-doc pub-page-end">
        {TERMS_SECTIONS.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </section>
        ))}
      </div>
    </>
  );
}

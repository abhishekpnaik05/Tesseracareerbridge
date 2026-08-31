import { PageMeta } from "../components/seo/PageMeta";
import { Accordion } from "../components/ui";
import { FAQ_CATEGORIES } from "../data/public-content";

export function FaqPage() {
  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | FAQ"
        description="Answers about programs, enrollment, learning, assignments, projects, mentorship, and certificates."
      />
      <div className="container page-hero">
        <p className="t-label">FAQ</p>
        <h1>Straight answers before you enroll.</h1>
      </div>
      <div className="container pub-page-end">
        {FAQ_CATEGORIES.map((category) => (
          <section key={category.id} className="pub-section">
            <h2>{category.title}</h2>
            <Accordion items={category.items} />
          </section>
        ))}
      </div>
    </>
  );
}

import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorAssignmentsPage() {
  return (
    <>
      <PageMeta title="Assignment Reviews" description="Review and grade student assignments" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Assignment Reviews</h1>
        <p className="pub-lead">Review and grade student assignment submissions.</p>
      </div>
      <div className="container">
        <EmptyState title="Select an internship" body="Please select an internship from My Internships to view assignment reviews." />
      </div>
    </>
  );
}

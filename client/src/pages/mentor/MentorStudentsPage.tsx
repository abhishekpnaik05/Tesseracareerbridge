import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorStudentsPage() {
  return (
    <>
      <PageMeta title="Students" description="View and manage your assigned students" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Students</h1>
        <p className="pub-lead">View and manage students assigned to your internships.</p>
      </div>
      <div className="container">
        <EmptyState title="Select an internship" body="Please select an internship from My Internships to view students." />
      </div>
    </>
  );
}

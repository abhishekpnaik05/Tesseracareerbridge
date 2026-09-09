import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorAnnouncementsPage() {
  return (
    <>
      <PageMeta title="Announcements" description="View and create announcements" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Announcements</h1>
        <p className="pub-lead">View and create announcements for your students.</p>
      </div>
      <div className="container">
        <EmptyState title="Select an internship" body="Please select an internship from My Internships to view and create announcements." />
      </div>
    </>
  );
}

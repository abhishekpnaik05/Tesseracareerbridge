import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorAttendancePage() {
  return (
    <>
      <PageMeta title="Attendance" description="Mark and view student attendance" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Attendance</h1>
        <p className="pub-lead">Mark and view student attendance for your internships.</p>
      </div>
      <div className="container">
        <EmptyState title="Select an internship" body="Please select an internship from My Internships to mark attendance." />
      </div>
    </>
  );
}

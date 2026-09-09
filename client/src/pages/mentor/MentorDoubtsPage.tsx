import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorDoubtsPage() {
  return (
    <>
      <PageMeta title="Doubts" description="Manage student doubts and questions" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Doubts</h1>
        <p className="pub-lead">View and respond to student doubts and questions.</p>
      </div>
      <div className="container">
        <EmptyState title="No doubts yet" body="Students' doubts and questions will appear here." />
      </div>
    </>
  );
}

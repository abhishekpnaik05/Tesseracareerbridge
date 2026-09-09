import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorDdpResultsPage() {
  return (
    <>
      <PageMeta title="DDP Results" description="View student DDP performance" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>DDP Results</h1>
        <p className="pub-lead">View student DDP performance and results.</p>
      </div>
      <div className="container">
        <EmptyState title="Select an internship" body="Please select an internship from My Internships to view DDP results." />
      </div>
    </>
  );
}

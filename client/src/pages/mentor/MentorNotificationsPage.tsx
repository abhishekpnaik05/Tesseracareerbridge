import { PageMeta } from "../../components/seo/PageMeta";
import { EmptyState } from "../../components/ui";

export function MentorNotificationsPage() {
  return (
    <>
      <PageMeta title="Notifications" description="View your mentor notifications" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Notifications</h1>
        <p className="pub-lead">View your notifications and updates.</p>
      </div>
      <div className="container">
        <EmptyState title="No notifications" body="You don't have any notifications yet." />
      </div>
    </>
  );
}

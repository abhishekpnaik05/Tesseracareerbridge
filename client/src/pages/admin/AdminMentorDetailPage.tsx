import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Briefcase, BookOpen, Users, Link as LinkIcon } from "lucide-react";
import { getAdminMentor, type AdminMentorDetail } from "../../lib/admin";
import { LoadingState, EmptyState } from "../../components/ui";

export function AdminMentorDetailPage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const [mentor, setMentor] = useState<AdminMentorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMentor() {
      if (!mentorId) return;
      try {
        setLoading(true);
        setError(null);
        const mentorData = await getAdminMentor(mentorId);
        setMentor(mentorData);
      } catch (err) {
        setError("Failed to load mentor details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMentor();
  }, [mentorId]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading mentor details" />
        </div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load mentor"
            body={error || "Something went wrong"}
          >
            <button className="btn btn-primary" onClick={() => window.history.back()}>
              Go back
            </button>
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <Link to="/admin/mentors" className="btn-back">
            <ArrowLeft />
            Back to Mentors
          </Link>
          <h1>{mentor.name}</h1>
          <p className="text-muted">{mentor.email}</p>
        </div>

        <div className="detail-grid">
          {/* Profile Section */}
          <section className="detail-section">
            <h2>Profile</h2>
            <div className="detail-card">
              <DetailRow label="Name" value={mentor.name} />
              <DetailRow label="Email" value={mentor.email} icon={Mail} />
              <DetailRow label="Phone" value={mentor.phone || "Not provided"} icon={Phone} />
              <DetailRow label="Title" value={mentor.title || "Not provided"} icon={Briefcase} />
              <DetailRow label="Status" value={mentor.status} badge />
            </div>
          </section>

          {/* About Section */}
          <section className="detail-section">
            <h2>About</h2>
            <div className="detail-card">
              <DetailRow label="Bio" value={mentor.bio || "Not provided"} multiline />
              <DetailRow label="Skills" value={mentor.skills || "Not provided"} multiline />
              <DetailRow label="Experience" value={mentor.experience || "Not provided"} multiline />
            </div>
          </section>

          {/* Links Section */}
          <section className="detail-section">
            <h2>Links</h2>
            <div className="detail-card">
              {mentor.linkedin ? (
                <DetailRow label="LinkedIn" value={mentor.linkedin} icon={LinkIcon} link />
              ) : (
                <DetailRow label="LinkedIn" value="Not provided" />
              )}
              {mentor.github ? (
                <DetailRow label="GitHub" value={mentor.github} icon={LinkIcon} link />
              ) : (
                <DetailRow label="GitHub" value="Not provided" />
              )}
            </div>
          </section>

          {/* Assignment Stats */}
          <section className="detail-section">
            <h2>Assignment Stats</h2>
            <div className="detail-card">
              <DetailRow label="Assigned Batches" value={mentor.assignedBatches.toString()} icon={BookOpen} />
              <DetailRow label="Total Students" value={mentor.studentCount.toString()} icon={Users} />
            </div>
          </section>

          {/* Assigned Internships */}
          <section className="detail-section">
            <h2>Assigned Internships</h2>
            {mentor.assignedInternships.length > 0 ? (
              <div className="card-list">
                {mentor.assignedInternships.map((internship) => (
                  <div key={internship.id} className="card-list-item">
                    <div className="card-list-item-content">
                      <h3>{internship.programTitle}</h3>
                      <p className="text-muted">{internship.batchName}</p>
                      <p className="text-muted text-sm">
                        Assigned {new Date(internship.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No assignments" body="This mentor is not assigned to any internships" />
            )}
          </section>

          {/* Recent Activity */}
          {mentor.recentActivity.length > 0 && (
            <section className="detail-section">
              <h2>Recent Activity</h2>
              <div className="card-list">
                {mentor.recentActivity.map((activity, index) => (
                  <div key={index} className="card-list-item">
                    <div className="card-list-item-content">
                      <h3>{activity.type}</h3>
                      <p className="text-muted">{activity.description}</p>
                      <p className="text-muted text-sm">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: boolean;
  link?: boolean;
  multiline?: boolean;
}

function DetailRow({ label, value, icon: Icon, badge, link, multiline }: DetailRowProps) {
  const content = (
    <>
      <span className="detail-row-label">
        {Icon && <Icon className="detail-row-icon" />}
        {label}
      </span>
      <span className={`detail-row-value ${badge ? "badge" : ""} ${badge ? `badge-${getStatusColor(value)}` : ""} ${multiline ? "detail-row-value-multiline" : ""}`}>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="link">
            {value}
          </a>
        ) : (
          value
        )}
      </span>
    </>
  );

  return <div className="detail-row">{content}</div>;
}

function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING":
      return "warning";
    case "SUSPENDED":
      return "danger";
    default:
      return "secondary";
  }
}

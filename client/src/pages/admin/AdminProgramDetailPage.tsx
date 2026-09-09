import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Edit, GraduationCap, BookOpen, Users, CalendarCheck, TrendingUp } from "lucide-react";
import { getAdminProgram, type AdminProgramDetail } from "../../lib/admin";
import { LoadingState, EmptyState } from "../../components/ui";

export function AdminProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [program, setProgram] = useState<AdminProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProgram() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const programData = await getAdminProgram(id);
        setProgram(programData);
      } catch (err) {
        setError("Failed to load program details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProgram();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading program details" />
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load program"
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
          <Link to="/admin/programs" className="btn-back">
            <ArrowLeft />
            Back to Programs
          </Link>
          <h1>{program.title}</h1>
          <p className="text-muted">{program.summary || program.description}</p>
          <Link to={`/admin/programs/${program.id}/edit`} className="btn btn-primary">
            <Edit />
            Edit Program
          </Link>
        </div>

        <div className="detail-grid">
          {/* Overview Section */}
          <section className="detail-section">
            <h2>Overview</h2>
            <div className="detail-card">
              <DetailRow label="Title" value={program.title} />
              <DetailRow label="Summary" value={program.summary || "Not provided"} multiline />
              <DetailRow label="Description" value={program.description || "Not provided"} multiline />
              <DetailRow label="Category" value={program.category || "Not specified"} icon={GraduationCap} />
              <DetailRow label="Level" value={program.level || "Not specified"} />
              <DetailRow label="Duration" value={program.durationLabel || `${program.durationWeeks || 0} weeks`} icon={CalendarCheck} />
              <DetailRow label="Status" value={program.status} badge />
              <DetailRow label="Featured" value={program.featured ? "Yes" : "No"} />
            </div>
          </section>

          {/* Learning Details Section */}
          <section className="detail-section">
            <h2>Learning Details</h2>
            <div className="detail-card">
              <DetailRow label="Target Audience" value={program.audience || "Not specified"} multiline />
              <DetailRow label="Learning Approach" value={program.learningApproach || "Not specified"} multiline />
              <DetailRow label="Learning Days/Week" value={program.learningDaysPerWeek ? program.learningDaysPerWeek.toString() : "Not specified"} />
            </div>
          </section>

          {/* Skills Section */}
          <section className="detail-section">
            <h2>Skills Covered</h2>
            <div className="detail-card">
              {program.skills.length > 0 ? (
                <div className="tags-container">
                  {program.skills.map((skill, index) => (
                    <span key={index} className="badge badge-info">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyState title="No skills specified" body="Skills covered in this program" />
              )}
            </div>
          </section>

          {/* Outcomes Section */}
          <section className="detail-section">
            <h2>Learning Outcomes</h2>
            <div className="detail-card">
              {program.outcomes.length > 0 ? (
                <ul className="list">
                  {program.outcomes.map((outcome, index) => (
                    <li key={index}>{outcome}</li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No outcomes specified" body="What students will achieve" />
              )}
            </div>
          </section>

          {/* Requirements Section */}
          <section className="detail-section">
            <h2>Requirements</h2>
            <div className="detail-card">
              {program.requirements.length > 0 ? (
                <ul className="list">
                  {program.requirements.map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="No requirements specified" body="Prerequisites for this program" />
              )}
            </div>
          </section>

          {/* Statistics Section */}
          <section className="detail-section">
            <h2>Statistics</h2>
            <div className="detail-card">
              <DetailRow label="Total Batches" value={program.batchCount.toString()} icon={BookOpen} />
              <DetailRow label="Total Enrollments" value={program.enrollmentCount.toString()} icon={Users} />
              <DetailRow label="Availability" value={program.availability} />
              <DetailRow 
                label="Created" 
                value={new Date(program.createdAt).toLocaleDateString()} 
                icon={CalendarCheck} 
              />
              <DetailRow 
                label="Last Updated" 
                value={new Date(program.updatedAt).toLocaleDateString()} 
                icon={TrendingUp} 
              />
            </div>
          </section>
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
  multiline?: boolean;
}

function DetailRow({ label, value, icon: Icon, badge, multiline }: DetailRowProps) {
  return (
    <div className="detail-row">
      <span className="detail-row-label">
        {Icon && <Icon className="detail-row-icon" />}
        {label}
      </span>
      <span className={`detail-row-value ${badge ? "badge" : ""} ${badge ? `badge-${getStatusColor(value)}` : ""} ${multiline ? "detail-row-value-multiline" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "DRAFT":
      return "warning";
    case "ARCHIVED":
      return "secondary";
    default:
      return "secondary";
  }
}
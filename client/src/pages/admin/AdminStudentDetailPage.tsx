import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, University, CalendarCheck, TrendingUp, ClipboardCheck, BookOpen } from "lucide-react";
import { getAdminStudent, type AdminStudentDetail } from "../../lib/admin";
import { LoadingState, EmptyState } from "../../components/ui";

export function AdminStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<AdminStudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudent() {
      if (!studentId) return;
      try {
        setLoading(true);
        setError(null);
        const studentData = await getAdminStudent(studentId);
        setStudent(studentData);
      } catch (err) {
        setError("Failed to load student details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading student details" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load student"
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
          <Link to="/admin/students" className="btn-back">
            <ArrowLeft />
            Back to Students
          </Link>
          <h1>{student.name}</h1>
          <p className="text-muted">{student.email}</p>
        </div>

        <div className="detail-grid">
          {/* Profile Section */}
          <section className="detail-section">
            <h2>Profile</h2>
            <div className="detail-card">
              <DetailRow label="Name" value={student.name} />
              <DetailRow label="Email" value={student.email} icon={Mail} />
              <DetailRow label="Phone" value={student.phone || "Not provided"} icon={Phone} />
              <DetailRow label="University" value={student.university || "Not provided"} icon={University} />
              <DetailRow label="Branch" value={student.branch || "Not provided"} />
              <DetailRow label="Semester" value={student.semester ? student.semester.toString() : "Not provided"} />
              <DetailRow label="Status" value={student.status} badge />
            </div>
          </section>

          {/* Enrollments Section */}
          <section className="detail-section">
            <h2>Enrollments</h2>
            {student.enrollments.length > 0 ? (
              <div className="card-list">
                {student.enrollments.map((enrollment) => (
                  <div key={enrollment.id} className="card-list-item">
                    <div className="card-list-item-content">
                      <h3>{enrollment.programTitle}</h3>
                      <p className="text-muted">{enrollment.batchName}</p>
                      <div className="card-list-item-meta">
                        <span className={`badge badge-${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                        <span className="text-muted text-sm">
                          Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="card-list-item-action">
                      <div className="progress-circle">
                        <svg viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={`${enrollment.progress}, 100`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>{enrollment.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No enrollments" body="This student is not enrolled in any programs" />
            )}
          </section>

          {/* Progress Section */}
          <section className="detail-section">
            <h2>Progress</h2>
            <div className="detail-card">
              <DetailRow label="Overall Progress" value={`${student.progress.overallPercent}%`} icon={TrendingUp} />
              <DetailRow label="Weeks Completed" value={`${student.progress.weeksCompleted}`} icon={BookOpen} />
              <DetailRow label="Days Completed" value={`${student.progress.daysCompleted}`} icon={CalendarCheck} />
            </div>
          </section>

          {/* Attendance Section */}
          <section className="detail-section">
            <h2>Attendance</h2>
            <div className="detail-card">
              <DetailRow label="Present" value={student.attendance.present.toString()} icon={CalendarCheck} />
              <DetailRow label="Absent" value={student.attendance.absent.toString()} />
              <DetailRow
                label="Attendance Percentage"
                value={`${student.attendance.percentage.toFixed(1)}%`}
                highlight
              />
            </div>
          </section>

          {/* DDP Performance Section */}
          <section className="detail-section">
            <h2>DDP Performance</h2>
            <div className="detail-card">
              <DetailRow label="Average Score" value={`${student.ddpPerformance.averageScore.toFixed(1)}%`} icon={ClipboardCheck} />
              <DetailRow label="DDPs Completed" value={student.ddpPerformance.completed.toString()} />
              <DetailRow label="Passed" value={student.ddpPerformance.passed.toString()} />
              <DetailRow label="Failed" value={student.ddpPerformance.failed.toString()} />
            </div>
          </section>

          {/* Assignment Performance Section */}
          <section className="detail-section">
            <h2>Assignment Performance</h2>
            <div className="detail-card">
              <DetailRow label="Submitted" value={student.assignmentPerformance.submitted.toString()} icon={ClipboardCheck} />
              <DetailRow label="Pending Review" value={student.assignmentPerformance.pending.toString()} />
              <DetailRow label="Reviewed" value={student.assignmentPerformance.reviewed.toString()} />
              <DetailRow
                label="Average Score"
                value={`${student.assignmentPerformance.averageScore.toFixed(1)}%`}
                highlight
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
  highlight?: boolean;
}

function DetailRow({ label, value, icon: Icon, badge, highlight }: DetailRowProps) {
  return (
    <div className={`detail-row ${highlight ? "detail-row-highlight" : ""}`}>
      <span className="detail-row-label">
        {Icon && <Icon className="detail-row-icon" />}
        {label}
      </span>
      <span className={`detail-row-value ${badge ? "badge" : ""} ${badge ? `badge-${getStatusColor(value)}` : ""}`}>
        {value}
      </span>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "PENDING":
      return "warning";
    case "COMPLETED":
      return "info";
    case "SUSPENDED":
      return "danger";
    default:
      return "secondary";
  }
}

import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, CalendarCheck, BookOpen, UserRound, Edit, Settings, ClipboardList, BarChart3, Bell, FolderKanban, FileText, LayoutList, Archive, PlayCircle, PauseCircle, XCircle, Plus } from "lucide-react";
import { getAdminBatch, type AdminBatchDetail } from "../../lib/admin";
import { LoadingState, EmptyState, Button } from "../../components/ui";

export function AdminInternshipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<AdminBatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function loadBatch() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const batchData = await getAdminBatch(id);
        setBatch(batchData);
      } catch (err) {
        setError("Failed to load internship details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBatch();
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading internship details" />
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load internship"
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
          <div className="page-header-content">
            <div>
              <Link to="/admin/internships" className="btn-back">
                <ArrowLeft />
                Back to Internships
              </Link>
              <h1>{batch.name}</h1>
              <p className="text-muted">{batch.programTitle}</p>
            </div>
            <div className="page-header-actions">
              <Button variant="outline" onClick={() => navigate(`/admin/batches/${batch.id}/edit`)}>
                <Edit />
                Edit Internship
              </Button>
              <Button variant="outline">
                <Settings />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon stat-card-icon-primary">
              <Users />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{batch.enrolledCount}</p>
              <p className="stat-card-title">Enrolled Students</p>
              <p className="stat-card-subtitle">Capacity: {batch.capacity || "Unlimited"}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon stat-card-icon-success">
              <CalendarCheck />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{batch.status}</p>
              <p className="stat-card-title">Status</p>
              <p className="stat-card-subtitle">
                {batch.startsAt ? new Date(batch.startsAt).toLocaleDateString() : "TBD"}
              </p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon stat-card-icon-info">
              <BookOpen />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{batch.programTitle}</p>
              <p className="stat-card-title">Program</p>
              <p className="stat-card-subtitle">{batch.name}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon stat-card-icon-accent">
              <UserRound />
            </div>
            <div className="stat-card-content">
              <p className="stat-card-value">{batch.mentor ? batch.mentor.name : "Unassigned"}</p>
              <p className="stat-card-title">Mentor</p>
              <p className="stat-card-subtitle">{batch.mentor ? batch.mentor.email : "No mentor assigned"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutList />
            Overview
          </button>
          <button
            className={`tab ${activeTab === "batches" ? "active" : ""}`}
            onClick={() => setActiveTab("batches")}
          >
            <FolderKanban />
            Batches
          </button>
          <button
            className={`tab ${activeTab === "mentor" ? "active" : ""}`}
            onClick={() => setActiveTab("mentor")}
          >
            <UserRound />
            Mentor
          </button>
          <button
            className={`tab ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            <Users />
            Students
          </button>
          <button
            className={`tab ${activeTab === "enrollment" ? "active" : ""}`}
            onClick={() => setActiveTab("enrollment")}
          >
            <ClipboardList />
            Enrollment
          </button>
          <button
            className={`tab ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <CalendarCheck />
            Attendance
          </button>
          <button
            className={`tab ${activeTab === "progress" ? "active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            <BarChart3 />
            Progress
          </button>
          <button
            className={`tab ${activeTab === "assignments" ? "active" : ""}`}
            onClick={() => setActiveTab("assignments")}
          >
            <FileText />
            Assignments
          </button>
          <button
            className={`tab ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            <Bell />
            Announcements
          </button>
          <button
            className={`tab ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <BarChart3 />
            Reports
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "overview" && (
            <div className="detail-grid">
              {/* Overview Section */}
              <section className="detail-section">
                <h2>Overview</h2>
                <div className="detail-card">
                  <DetailRow label="Batch Name" value={batch.name} />
                  <DetailRow label="Program" value={batch.programTitle} icon={BookOpen} />
                  <DetailRow 
                    label="Start Date" 
                    value={batch.startsAt ? new Date(batch.startsAt).toLocaleDateString() : "Not set"} 
                    icon={CalendarCheck} 
                  />
                  <DetailRow 
                    label="End Date" 
                    value={batch.endsAt ? new Date(batch.endsAt).toLocaleDateString() : "Not set"} 
                    icon={CalendarCheck} 
                  />
                  <DetailRow label="Status" value={batch.status} badge />
                  <DetailRow label="Capacity" value={batch.capacity ? batch.capacity.toString() : "Unlimited"} icon={Users} />
                  <DetailRow label="Enrolled Students" value={batch.enrolledCount.toString()} icon={Users} />
                  {batch.description && (
                    <DetailRow label="Description" value={batch.description} multiline />
                  )}
                </div>
              </section>

              {/* Enrollment Dates Section */}
              <section className="detail-section">
                <h2>Enrollment Period</h2>
                <div className="detail-card">
                  <DetailRow 
                    label="Enrollment Opens" 
                    value={batch.enrollmentOpenDate ? new Date(batch.enrollmentOpenDate).toLocaleDateString() : "Not set"} 
                    icon={CalendarCheck} 
                  />
                  <DetailRow 
                    label="Enrollment Closes" 
                    value={batch.enrollmentCloseDate ? new Date(batch.enrollmentCloseDate).toLocaleDateString() : "Not set"} 
                    icon={CalendarCheck} 
                  />
                </div>
              </section>
            </div>
          )}

          {activeTab === "mentor" && (
            <section className="detail-section">
              <h2>Mentor Information</h2>
              {batch.mentor ? (
                <div className="detail-card">
                  <DetailRow label="Name" value={batch.mentor.name} icon={UserRound} />
                  <DetailRow label="Email" value={batch.mentor.email} icon={UserRound} />
                  <div className="detail-actions">
                    <Link to={`/admin/mentors/${batch.mentor.id}`} className="btn btn-primary">
                      View Mentor Profile
                    </Link>
                    <Button variant="outline" onClick={() => navigate(`/admin/batches/${batch.id}/edit`)}>
                      <Edit />
                      Change Mentor
                    </Button>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  title="No mentor assigned" 
                  body="Assign a mentor to this batch to manage students"
                >
                  <Button onClick={() => navigate(`/admin/batches/${batch.id}/edit`)}>
                    <UserRound />
                    Assign Mentor
                  </Button>
                </EmptyState>
              )}
            </section>
          )}

          {activeTab === "students" && (
            <section className="detail-section">
              <div className="section-header">
                <h2>Students ({batch.students.length})</h2>
                <Button variant="outline">
                  <Plus />
                  Add Student
                </Button>
              </div>
              {batch.students.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batch.students.map((student) => (
                        <tr key={student.id}>
                          <td>
                            <div className="table-cell-primary">{student.name}</div>
                          </td>
                          <td className="text-muted">{student.email}</td>
                          <td>
                            <span className={`badge badge-${getStatusColor(student.status)}`}>
                              {student.status}
                            </span>
                          </td>
                          <td>{student.progress}%</td>
                          <td>
                            <Button variant="ghost" size="sm">
                              <Edit />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No students enrolled" body="This batch has no enrolled students yet" />
              )}
            </section>
          )}

          {activeTab === "enrollment" && (
            <section className="detail-section">
              <h2>Enrollment Management</h2>
              <div className="detail-card">
                <DetailRow 
                  label="Enrollment Opens" 
                  value={batch.enrollmentOpenDate ? new Date(batch.enrollmentOpenDate).toLocaleDateString() : "Not set"} 
                  icon={CalendarCheck} 
                />
                <DetailRow 
                  label="Enrollment Closes" 
                  value={batch.enrollmentCloseDate ? new Date(batch.enrollmentCloseDate).toLocaleDateString() : "Not set"} 
                  icon={CalendarCheck} 
                />
                <DetailRow label="Current Enrollment" value={`${batch.enrolledCount} / ${batch.capacity || "Unlimited"}`} icon={Users} />
                <div className="detail-actions">
                  <Button variant="success">
                    <PlayCircle />
                    Open Registration
                  </Button>
                  <Button variant="outline">
                    <PauseCircle />
                    Close Registration
                  </Button>
                  <Button variant="danger">
                    <XCircle />
                    Cancel Registration
                  </Button>
                </div>
              </div>
            </section>
          )}

          {activeTab === "attendance" && (
            <section className="detail-section">
              <h2>Attendance Management</h2>
              <EmptyState title="Attendance Tracking" body="Manage student attendance for this internship">
                <Button variant="primary">
                  <CalendarCheck />
                  Mark Attendance
                </Button>
              </EmptyState>
            </section>
          )}

          {activeTab === "progress" && (
            <section className="detail-section">
              <h2>Student Progress</h2>
              <EmptyState title="Progress Tracking" body="Monitor student progress through the internship curriculum">
                <Button variant="primary">
                  <BarChart3 />
                  View Progress Reports
                </Button>
              </EmptyState>
            </section>
          )}

          {activeTab === "assignments" && (
            <section className="detail-section">
              <h2>Assignments</h2>
              <EmptyState title="Assignment Management" body="Create and manage assignments for this internship">
                <Button variant="primary">
                  <FileText />
                  Create Assignment
                </Button>
              </EmptyState>
            </section>
          )}

          {activeTab === "announcements" && (
            <section className="detail-section">
              <h2>Announcements</h2>
              <EmptyState title="Announcement Management" body="Create and manage announcements for this internship">
                <Button variant="primary">
                  <Bell />
                  Create Announcement
                </Button>
              </EmptyState>
            </section>
          )}

          {activeTab === "reports" && (
            <section className="detail-section">
              <h2>Reports</h2>
              <EmptyState title="Internship Reports" body="Generate reports for this internship">
                <Button variant="primary">
                  <BarChart3 />
                  Generate Reports
                </Button>
              </EmptyState>
            </section>
          )}

          {activeTab === "batches" && (
            <section className="detail-section">
              <h2>Batch Management</h2>
              <div className="detail-card">
                <DetailRow label="Current Batch" value={batch.name} />
                <DetailRow label="Status" value={batch.status} badge />
                <div className="detail-actions">
                  <Button variant="outline">
                    <Plus />
                    Create New Batch
                  </Button>
                  <Button variant="outline">
                    <Edit />
                    Edit Batch
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <button className="quick-action-card" onClick={() => navigate(`/admin/batches/${batch.id}/edit`)}>
              <div className="quick-action-icon">
                <Edit />
              </div>
              <div className="quick-action-content">
                <h3>Edit Internship</h3>
                <p>Modify internship details</p>
              </div>
            </button>
            <button className="quick-action-card">
              <div className="quick-action-icon">
                <UserRound />
              </div>
              <div className="quick-action-content">
                <h3>Assign Mentor</h3>
                <p>Change internship mentor</p>
              </div>
            </button>
            <button className="quick-action-card">
              <div className="quick-action-icon">
                <FolderKanban />
              </div>
              <div className="quick-action-content">
                <h3>Create Batch</h3>
                <p>Add new batch</p>
              </div>
            </button>
            <button className="quick-action-card">
              <div className="quick-action-icon">
                <ClipboardList />
              </div>
              <div className="quick-action-content">
                <h3>Manage Enrollment</h3>
                <p>Control student enrollment</p>
              </div>
            </button>
            <button className="quick-action-card">
              <div className="quick-action-icon">
                <PlayCircle />
              </div>
              <div className="quick-action-content">
                <h3>Publish Registration</h3>
                <p>Open for enrollment</p>
              </div>
            </button>
            <button className="quick-action-card">
              <div className="quick-action-icon">
                <Archive />
              </div>
              <div className="quick-action-content">
                <h3>Archive Internship</h3>
                <p>Archive completed internship</p>
              </div>
            </button>
          </div>
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
    case "ACTIVE":
    case "IN_PROGRESS":
      return "success";
    case "PENDING":
    case "UPCOMING":
      return "warning";
    case "COMPLETED":
      return "info";
    case "SUSPENDED":
    case "CANCELLED":
      return "danger";
    default:
      return "secondary";
  }
}
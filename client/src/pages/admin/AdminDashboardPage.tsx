import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserRound, GraduationCap, BookOpen, CalendarCheck, ClipboardList, Bell, BarChart3, TrendingUp } from "lucide-react";
import { getAdminDashboard, type AdminDashboardDto } from "../../lib/admin";
import { LoadingState, EmptyState } from "../../components/ui";

export function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await getAdminDashboard();
        setData(dashboardData);
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading dashboard" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load dashboard"
            body={error || "Something went wrong"}
          >
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try again
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
          <h1>Admin Dashboard</h1>
          <p className="text-muted">Platform overview and operations</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatCard
            title="Students"
            value={data.totalStudents.toLocaleString()}
            subtitle={`${data.activeStudents.toLocaleString()} active`}
            icon={Users}
            color="primary"
            to="/admin/students"
          />
          <StatCard
            title="Mentors"
            value={data.totalMentors.toLocaleString()}
            subtitle={`${data.activeMentors.toLocaleString()} active`}
            icon={UserRound}
            color="secondary"
            to="/admin/mentors"
          />
          <StatCard
            title="Programs"
            value={data.totalPrograms.toLocaleString()}
            subtitle={`${data.activePrograms.toLocaleString()} active`}
            icon={GraduationCap}
            color="accent"
            to="/admin/programs"
          />
          <StatCard
            title="Batches"
            value={data.totalBatches.toLocaleString()}
            subtitle={`${data.activeBatches.toLocaleString()} active`}
            icon={BookOpen}
            color="success"
            to="/admin/batches"
          />
        </div>

        <div className="stats-grid">
          <StatCard
            title="Enrollments"
            value={data.totalEnrollments.toLocaleString()}
            subtitle={`${data.activeEnrollments.toLocaleString()} active`}
            icon={TrendingUp}
            color="info"
            to="/admin/enrollments"
          />
          <StatCard
            title="Today's Attendance"
            value={`${data.todayAttendance.percentage.toFixed(1)}%`}
            subtitle={`${data.todayAttendance.present}/${data.todayAttendance.total} present`}
            icon={CalendarCheck}
            color="warning"
            to="/admin/attendance"
          />
          <StatCard
            title="Pending Reviews"
            value={data.pendingReviews.toLocaleString()}
            subtitle="Assignments awaiting review"
            icon={ClipboardList}
            color="danger"
            to="/admin/reports"
          />
          <StatCard
            title="Announcements"
            value={data.recentAnnouncements.length.toString()}
            subtitle="Recent announcements"
            icon={Bell}
            color="purple"
            to="/admin/announcements"
          />
        </div>

        {/* Recent Announcements */}
        {data.recentAnnouncements.length > 0 && (
          <section className="section">
            <div className="section-header">
              <h2>Recent Announcements</h2>
              <Link to="/admin/announcements" className="btn-link">
                View All
              </Link>
            </div>
            <div className="card-list">
              {data.recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="card-list-item">
                  <div className="card-list-item-content">
                    <h3>{announcement.title}</h3>
                    <p className="text-muted text-sm">
                      Published {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Actions */}
        <section className="section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="action-grid">
            <QuickAction
              title="View Students"
              description="Manage student accounts and enrollments"
              icon={Users}
              to="/admin/students"
            />
            <QuickAction
              title="Manage Programs"
              description="Create and update internship programs"
              icon={GraduationCap}
              to="/admin/programs"
            />
            <QuickAction
              title="Assign Mentors"
              description="Assign mentors to batches"
              icon={UserRound}
              to="/admin/batches"
            />
            <QuickAction
              title="View Reports"
              description="Analytics and performance reports"
              icon={BarChart3}
              to="/admin/reports"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "primary" | "secondary" | "accent" | "success" | "info" | "warning" | "danger" | "purple";
  to?: string;
}

function StatCard({ title, value, subtitle, icon: Icon, color, to }: StatCardProps) {
  const content = (
    <>
      <div className={`stat-card-icon stat-card-icon-${color}`}>
        <Icon />
      </div>
      <div className="stat-card-content">
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-subtitle">{subtitle}</p>
      </div>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="stat-card">
        {content}
      </Link>
    );
  }

  return <div className="stat-card">{content}</div>;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
}

function QuickAction({ title, description, icon: Icon, to }: QuickActionProps) {
  return (
    <Link to={to} className="quick-action-card">
      <div className="quick-action-icon">
        <Icon />
      </div>
      <div className="quick-action-content">
        <h3>{title}</h3>
        <p className="text-muted">{description}</p>
      </div>
    </Link>
  );
}

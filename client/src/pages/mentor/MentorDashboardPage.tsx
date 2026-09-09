import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, CalendarCheck, TrendingUp, ArrowRight } from "lucide-react";
import { PageMeta } from "../../components/seo/PageMeta";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge } from "../../components/ui";
import { getMentorDashboard, getMentorBatches, type MentorDashboardDto, type MentorBatchDto } from "../../lib/mentor";
import { formatDate } from "../../lib/enrollments";

export function MentorDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<MentorDashboardDto | null>(null);
  const [batches, setBatches] = useState<MentorBatchDto[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    async function loadData() {
      try {
        const [dashboardData, batchesData] = await Promise.all([
          getMentorDashboard(),
          getMentorBatches(),
        ]);
        setDashboard(dashboardData);
        setBatches(batchesData);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load mentor dashboard:", error);
        setStatus("error");
      }
    }

    loadData();
  }, []);

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <div className="grid" style={{ marginTop: 24, gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={{ height: 120 }} />
          ))}
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load dashboard" body="Try again in a moment.">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </ErrorState>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="container page-hero">
        <EmptyState title="Dashboard not available" body="Unable to load your dashboard data." />
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Mentor Dashboard" description="Your mentor dashboard and overview" />
      <div className="container page-hero">
        <p className="t-label">Mentor Dashboard</p>
        <h1>Welcome back, {dashboard.mentorName}</h1>
        <p className="pub-lead">Manage your assigned internships and student progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="container">
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-card__icon">
              <Users size={24} />
            </div>
            <div className="stat-card__content">
              <p className="stat-card__label">Total Students</p>
              <p className="stat-card__value">{dashboard.totalStudents}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-card__icon">
              <ClipboardList size={24} />
            </div>
            <div className="stat-card__content">
              <p className="stat-card__label">Pending Reviews</p>
              <p className="stat-card__value">{dashboard.pendingReviews}</p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-card__icon">
              <CalendarCheck size={24} />
            </div>
            <div className="stat-card__content">
              <p className="stat-card__label">Today's Attendance</p>
              <p className="stat-card__value">
                {dashboard.todayAttendance.present} / {dashboard.todayAttendance.total}
              </p>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-card__icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-card__content">
              <p className="stat-card__label">Assigned Batches</p>
              <p className="stat-card__value">{dashboard.assignedBatches}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="container pub-section">
        <h2>Quick Actions</h2>
        <div className="quick-actions">
          {dashboard.pendingReviews > 0 && (
            <ButtonLink to="/mentor/assignments" variant="primary">
              <ClipboardList size={18} />
              Review {dashboard.pendingReviews} Pending Assignment{dashboard.pendingReviews > 1 ? "s" : ""}
            </ButtonLink>
          )}
          <ButtonLink to="/mentor/internships" variant="secondary">
            <Users size={18} />
            View My Internships
          </ButtonLink>
          <ButtonLink to="/mentor/attendance" variant="outline">
            <CalendarCheck size={18} />
            Mark Attendance
          </ButtonLink>
        </div>
      </div>

      {/* My Internships */}
      <div className="container pub-section">
        <div className="section-header">
          <h2>My Internships</h2>
          <ButtonLink to="/mentor/internships" variant="ghost" size="sm">
            View All <ArrowRight size={16} />
          </ButtonLink>
        </div>

        {batches.length === 0 ? (
          <EmptyState title="No internships assigned" body="You haven't been assigned to any internship batches yet." />
        ) : (
          <div className="batch-list">
            {batches.slice(0, 3).map((batch) => (
              <div key={batch.id} className="batch-card batch-card--interactive" onClick={() => navigate(`/mentor/internships/${batch.id}`)}>
                <Card>
                  <div className="batch-card__header">
                    <h3>{batch.programTitle}</h3>
                    <Badge tone={batch.status === "IN_PROGRESS" ? "success" : "muted"}>
                      {batch.status}
                    </Badge>
                  </div>
                  <p className="batch-card__name">{batch.name}</p>
                  <div className="batch-card__meta">
                    <span>{batch.studentCount} Students</span>
                    {batch.startsAt && <span>Start: {formatDate(batch.startsAt)}</span>}
                    {batch.endsAt && <span>End: {formatDate(batch.endsAt)}</span>}
                  </div>
                  <div className="batch-card__progress">
                    <p className="batch-card__progress-label">Content Progress</p>
                    <div className="batch-card__progress-stats">
                      <span>{batch.contentProgress.publishedWeeks} / {batch.contentProgress.totalWeeks} Weeks</span>
                      <span>{batch.contentProgress.publishedDays} / {batch.contentProgress.totalDays} Days</span>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {dashboard.recentActivity.length > 0 && (
        <div className="container pub-section">
          <h2>Recent Activity</h2>
          <Card>
            <div className="activity-list">
              {dashboard.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-item__type">{activity.type}</span>
                  <span className="activity-item__title">{activity.title}</span>
                  <span className="activity-item__time">{activity.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

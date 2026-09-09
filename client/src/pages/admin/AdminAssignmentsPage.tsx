import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardList, BookOpen, TrendingUp } from "lucide-react";
import { getAssignmentReport, getAdminBatches, type AssignmentReportDto, type AdminBatchListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button } from "../../components/ui";

export function AdminAssignmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [assignmentReport, setAssignmentReport] = useState<AssignmentReportDto | null>(null);
  const [batches, setBatches] = useState<AdminBatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const batchFilter = searchParams.get("batchId") || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [report, batchesData] = await Promise.all([
          getAssignmentReport({ batchId: batchFilter || undefined }),
          getAdminBatches({ pageSize: 100 }),
        ]) as [AssignmentReportDto, { items: AdminBatchListItem[] }];
        
        setAssignmentReport(report);
        setBatches(batchesData.items);
      } catch (err) {
        setError("Failed to load assignment data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [batchFilter]);

  function updateFilters(params: Record<string, string>) {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading assignment data" />
        </div>
      </div>
    );
  }

  if (error || !assignmentReport) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load assignment data"
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
          <h1>Assignment Monitoring</h1>
          <p className="text-muted">Monitor assignment submissions and review progress</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <select
              value={batchFilter}
              onChange={(e) => updateFilters({ batchId: e.target.value })}
              className="filter-select"
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} ({batch.programTitle})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignment Report */}
        <section className="section">
          <div className="section-header">
            <h2>Assignment Performance Overview</h2>
            <Button variant="ghost" size="sm">
              <TrendingUp />
              Export Report
            </Button>
          </div>

          <div className="report-sections">
            {/* Assignment Performance by Assignment */}
            <ReportSection title="By Assignment">
              {assignmentReport.byAssignment.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Assignment</th>
                        <th>Submissions</th>
                        <th>Pending Reviews</th>
                        <th>Reviewed</th>
                        <th>Average Score</th>
                        <th>Resubmissions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentReport.byAssignment.map((item) => (
                        <tr key={item.assignmentId}>
                          <td>
                            <div className="table-cell-primary">{item.assignmentTitle}</div>
                          </td>
                          <td>{item.submissions}</td>
                          <td>
                            <span className={`badge badge-${item.pendingReviews > 0 ? "warning" : "success"}`}>
                              {item.pendingReviews}
                            </span>
                          </td>
                          <td>{item.reviewed}</td>
                          <td>{item.averageScore.toFixed(1)}%</td>
                          <td>{item.resubmissions}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No assignment data" body="No assignment submissions recorded yet" />
              )}
            </ReportSection>

            {/* Assignment Performance by Student */}
            <ReportSection title="By Student">
              {assignmentReport.byStudent.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Submitted</th>
                        <th>Average Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentReport.byStudent.slice(0, 20).map((item) => (
                        <tr key={item.studentId}>
                          <td>
                            <div className="table-cell-primary">{item.studentName}</div>
                          </td>
                          <td>{item.submitted}</td>
                          <td>{item.averageScore.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No student data" body="No student assignment submissions recorded yet" />
              )}
            </ReportSection>
          </div>
        </section>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Assignments"
            value={assignmentReport.byAssignment.length.toString()}
            subtitle="Active assignments"
            icon={BookOpen}
            color="primary"
          />
          <StatCard
            title="Total Submissions"
            value={assignmentReport.byAssignment.reduce((sum, assignment) => sum + assignment.submissions, 0).toString()}
            subtitle="Across all assignments"
            icon={ClipboardList}
            color="info"
          />
          <StatCard
            title="Pending Reviews"
            value={assignmentReport.byAssignment.reduce((sum, assignment) => sum + assignment.pendingReviews, 0).toString()}
            subtitle="Awaiting mentor review"
            icon={ClipboardList}
            color="warning"
          />
          <StatCard
            title="Average Score"
            value={`${(assignmentReport.byAssignment.reduce((sum, assignment) => sum + assignment.averageScore, 0) / Math.max(assignmentReport.byAssignment.length, 1)).toFixed(1)}%`}
            subtitle="Overall performance"
            icon={TrendingUp}
            color="success"
          />
        </div>
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
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon stat-card-icon-${color}`}>
        <Icon />
      </div>
      <div className="stat-card-content">
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

interface ReportSectionProps {
  title: string;
  children: React.ReactNode;
}

function ReportSection({ title, children }: ReportSectionProps) {
  return (
    <div className="report-section">
      <h3>{title}</h3>
      {children}
    </div>
  );
}
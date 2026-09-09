import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ClipboardCheck, TrendingUp, BookOpen, Users } from "lucide-react";
import { getDdpReport, getAdminBatches, type DdpReportDto, type AdminBatchListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button } from "../../components/ui";

export function AdminDdpPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [ddpReport, setDdpReport] = useState<DdpReportDto | null>(null);
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
          getDdpReport({ batchId: batchFilter || undefined }),
          getAdminBatches({ pageSize: 100 }),
        ]) as [DdpReportDto, { items: AdminBatchListItem[] }];
        
        setDdpReport(report);
        setBatches(batchesData.items);
      } catch (err) {
        setError("Failed to load DDP data");
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
          <LoadingState label="Loading DDP data" />
        </div>
      </div>
    );
  }

  if (error || !ddpReport) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load DDP data"
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
          <h1>DDP Monitoring</h1>
          <p className="text-muted">Daily Development Practice performance and completion rates</p>
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

        {/* DDP Report */}
        <section className="section">
          <div className="section-header">
            <h2>DDP Performance Overview</h2>
            <Button variant="ghost" size="sm">
              <TrendingUp />
              Export Report
            </Button>
          </div>

          <div className="report-sections">
            {/* DDP Performance by DDP */}
            <ReportSection title="By DDP">
              {ddpReport.byDdp.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>DDP Title</th>
                        <th>Attempts</th>
                        <th>Average Score</th>
                        <th>Pass Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ddpReport.byDdp.map((item) => (
                        <tr key={item.ddpId}>
                          <td>
                            <div className="table-cell-primary">{item.ddpTitle}</div>
                          </td>
                          <td>{item.attempts}</td>
                          <td>{item.averageScore.toFixed(1)}%</td>
                          <td>
                            <span className={`badge badge-${item.passRate >= 70 ? "success" : item.passRate >= 50 ? "warning" : "danger"}`}>
                              {item.passRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No DDP data" body="No DDP attempts recorded yet" />
              )}
            </ReportSection>

            {/* DDP Performance by Student */}
            <ReportSection title="By Student">
              {ddpReport.byStudent.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Average Score</th>
                        <th>Completed</th>
                        <th>Passed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ddpReport.byStudent.slice(0, 20).map((item) => (
                        <tr key={item.studentId}>
                          <td>
                            <div className="table-cell-primary">{item.studentName}</div>
                          </td>
                          <td>{item.averageScore.toFixed(1)}%</td>
                          <td>{item.completed}</td>
                          <td>{item.passed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No student data" body="No student DDP attempts recorded yet" />
              )}
            </ReportSection>
          </div>
        </section>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total DDPs"
            value={ddpReport.byDdp.length.toString()}
            subtitle="Active DDPs"
            icon={BookOpen}
            color="primary"
          />
          <StatCard
            title="Total Attempts"
            value={ddpReport.byDdp.reduce((sum, ddp) => sum + ddp.attempts, 0).toString()}
            subtitle="Across all DDPs"
            icon={ClipboardCheck}
            color="info"
          />
          <StatCard
            title="Average Pass Rate"
            value={`${(ddpReport.byDdp.reduce((sum, ddp) => sum + ddp.passRate, 0) / Math.max(ddpReport.byDdp.length, 1)).toFixed(1)}%`}
            subtitle="Overall performance"
            icon={TrendingUp}
            color="success"
          />
          <StatCard
            title="Active Students"
            value={ddpReport.byStudent.length.toString()}
            subtitle="Students with attempts"
            icon={Users}
            color="accent"
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
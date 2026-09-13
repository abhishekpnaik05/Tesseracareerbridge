import { useEffect, useState } from "react";
import { Users, UserRound, GraduationCap, BookOpen, TrendingUp, Award, Calendar, BarChart3 } from "lucide-react";
import { Card, Skeleton, ErrorState, Field, Select } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminAnalyticsMetrics, AdminAnalyticsByProgram, AdminAnalyticsByBatch, AdminAnalyticsOverTime } from "@tesseracareerbridge/shared";

export function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<AdminAnalyticsMetrics | null>(null);
  const [byProgram, setByProgram] = useState<AdminAnalyticsByProgram[]>([]);
  const [byBatch, setByBatch] = useState<AdminAnalyticsByBatch[]>([]);
  const [overTime, setOverTime] = useState<AdminAnalyticsOverTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<number>(30);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsRes, programRes, batchRes, timeRes] = await Promise.all([
        fetch("/api/v1/admins/analytics/metrics"),
        fetch("/api/v1/admins/analytics/by-program"),
        fetch("/api/v1/admins/analytics/by-batch"),
        fetch(`/api/v1/admins/analytics/over-time?days=${timeRange}`)
      ]);

      if (!metricsRes.ok || !programRes.ok || !batchRes.ok || !timeRes.ok) {
        throw new Error("Failed to load analytics");
      }

      const [metricsData, programData, batchData, timeData] = await Promise.all([
        metricsRes.json(),
        programRes.json(),
        batchRes.json(),
        timeRes.json()
      ]);

      setMetrics(metricsData.data);
      setByProgram(programData.data);
      setByBatch(batchData.data);
      setOverTime(timeData.data);
    } catch (err) {
      setError("Failed to load analytics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Analytics Dashboard" description="Platform performance and engagement metrics" />
          <div className="page-header">
            <h1>Analytics Dashboard</h1>
            <p className="text-muted">Platform performance and engagement metrics</p>
          </div>
          <Skeleton />
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Analytics Dashboard" description="Platform performance and engagement metrics" />
          <div className="page-header">
            <h1>Analytics Dashboard</h1>
          </div>
          <ErrorState title="Error" body={error || "Failed to load analytics"} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Analytics Dashboard" description="Platform performance and engagement metrics" />
        <div className="page-header">
          <h1>Analytics Dashboard</h1>
          <p className="text-muted">Platform performance and engagement metrics</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <Field label="Time Range" htmlFor="time-range">
              <Select
                id="time-range"
                value={timeRange.toString()}
                onChange={(e) => setTimeRange(parseInt(e.target.value))}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </Select>
            </Field>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid">
          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <Users size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Total Students</div>
                <div className="stat-card__value">{metrics.totalStudents}</div>
                <div className="stat-card__sub">
                  <span className="text-success">{metrics.activeStudents} active</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <UserRound size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Total Mentors</div>
                <div className="stat-card__value">{metrics.totalMentors}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <GraduationCap size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Total Programs</div>
                <div className="stat-card__value">{metrics.totalPrograms}</div>
                <div className="stat-card__sub">
                  <span>{metrics.totalBatches} batches</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Total Enrollments</div>
                <div className="stat-card__value">{metrics.totalEnrollments}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Completion Rate</div>
                <div className="stat-card__value">{metrics.completionRate.toFixed(1)}%</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <Award size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Average Score</div>
                <div className="stat-card__value">{metrics.averageScore.toFixed(1)}</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <Calendar size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Attendance Rate</div>
                <div className="stat-card__value">{metrics.attendanceRate.toFixed(1)}%</div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="stat-card">
              <div className="stat-card__icon">
                <BarChart3 size={24} />
              </div>
              <div className="stat-card__content">
                <div className="stat-card__label">Certificates Issued</div>
                <div className="stat-card__value">{metrics.certificatesIssued}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics by Program */}
        <div className="section">
          <h2>Performance by Program</h2>
          <div className="grid">
            {byProgram.map((program) => (
              <Card key={program.programId}>
                <div className="card-header">
                  <h3>{program.programName}</h3>
                </div>
                <div className="card-body">
                  <div className="stats">
                    <div className="stat">
                      <span className="text-muted">Students:</span>
                      <strong>{program.totalStudents}</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Active:</span>
                      <strong>{program.activeStudents}</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Completion:</span>
                      <strong>{program.completionRate.toFixed(1)}%</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Avg Score:</span>
                      <strong>{program.averageScore.toFixed(1)}</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Attendance:</span>
                      <strong>{program.attendanceRate.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Analytics by Batch */}
        <div className="section">
          <h2>Performance by Batch</h2>
          <div className="grid">
            {byBatch.map((batch) => (
              <Card key={batch.batchId}>
                <div className="card-header">
                  <h3>{batch.batchName}</h3>
                  <p className="text-muted">{batch.programName}</p>
                </div>
                <div className="card-body">
                  <div className="stats">
                    <div className="stat">
                      <span className="text-muted">Students:</span>
                      <strong>{batch.totalStudents}</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Active:</span>
                      <strong>{batch.activeStudents}</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Completion:</span>
                      <strong>{batch.completionRate.toFixed(1)}%</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Avg Score:</span>
                      <strong>{batch.averageScore.toFixed(1)}</strong>
                    </div>
                    <div className="stat">
                      <span className="text-muted">Attendance:</span>
                      <strong>{batch.attendanceRate.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Over Time Trend */}
        <div className="section">
          <h2>Trends Over Time</h2>
          <Card>
            <div className="chart-wrapper">
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#3b82f6' }}></div>
                  <span>Enrollments</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#10b981' }}></div>
                  <span>Completions</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#f59e0b' }}></div>
                  <span>Certificates</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color" style={{ background: '#8b5cf6' }}></div>
                  <span>Avg Score</span>
                </div>
              </div>
              <div className="chart-bars">
                {overTime.map((data) => (
                  <div key={data.date} className="chart-bar-group">
                    <div className="chart-bar" style={{ height: `${(data.enrollments / 20) * 100}%`, background: '#3b82f6' }} title={`Enrollments: ${data.enrollments}`}></div>
                    <div className="chart-bar" style={{ height: `${(data.completions / 10) * 100}%`, background: '#10b981' }} title={`Completions: ${data.completions}`}></div>
                    <div className="chart-bar" style={{ height: `${(data.certificates / 5) * 100}%`, background: '#f59e0b' }} title={`Certificates: ${data.certificates}`}></div>
                    <div className="chart-bar" style={{ height: `${(data.averageScore / 100) * 100}%`, background: '#8b5cf6' }} title={`Avg Score: ${data.averageScore}`}></div>
                    <div className="chart-label">{new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
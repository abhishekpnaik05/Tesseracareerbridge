import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { getTodayAttendance, getBatchAttendance, getAdminBatches, type TodayAttendanceDto, type BatchAttendanceDto, type AdminBatchListItem } from "../../lib/admin";
import { LoadingState, EmptyState } from "../../components/ui";

export function AdminAttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendanceDto | null>(null);
  const [batches, setBatches] = useState<AdminBatchListItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [batchAttendance, setBatchAttendance] = useState<BatchAttendanceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const view = searchParams.get("view") || "today";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [todayData, batchesData] = await Promise.all([
          getTodayAttendance(),
          getAdminBatches({ pageSize: 100, status: "IN_PROGRESS" }),
        ]);
        
        setTodayAttendance(todayData);
        setBatches(batchesData.items);
      } catch (err) {
        setError("Failed to load attendance data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadBatchAttendance() {
      if (!selectedBatch || !selectedDate) return;
      try {
        setLoading(true);
        const data = await getBatchAttendance(selectedBatch, selectedDate);
        setBatchAttendance(data);
      } catch (err) {
        setError("Failed to load batch attendance");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBatchAttendance();
  }, [selectedBatch, selectedDate]);

  function handleViewChange(newView: string) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", newView);
    setSearchParams(newParams);
  }

  if (loading && !todayAttendance) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading attendance" />
        </div>
      </div>
    );
  }

  if (error && !todayAttendance) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load attendance"
            body={error}
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
          <h1>Attendance</h1>
          <p className="text-muted">Monitor platform-wide attendance</p>
        </div>

        {/* View Tabs */}
        <div className="tabs">
          <button
            className={`tab ${view === "today" ? "tab-active" : ""}`}
            onClick={() => handleViewChange("today")}
          >
            Today
          </button>
          <button
            className={`tab ${view === "batch" ? "tab-active" : ""}`}
            onClick={() => handleViewChange("batch")}
          >
            By Batch
          </button>
          <button
            className={`tab ${view === "student" ? "tab-active" : ""}`}
            onClick={() => handleViewChange("student")}
          >
            By Student
          </button>
          <button
            className={`tab ${view === "overview" ? "tab-active" : ""}`}
            onClick={() => handleViewChange("overview")}
          >
            Overview
          </button>
        </div>

        {view === "today" && todayAttendance && (
          <section className="section">
            <div className="section-header">
              <h2>Today's Attendance</h2>
              <p className="text-muted">{new Date(todayAttendance.date).toLocaleDateString()}</p>
            </div>
            <div className="stats-grid">
              <StatCard
                title="Total Students"
                value={todayAttendance.totalStudents.toString()}
                subtitle="Expected today"
              />
              <StatCard
                title="Present"
                value={todayAttendance.present.toString()}
                subtitle={`${((todayAttendance.present / todayAttendance.totalStudents) * 100).toFixed(1)}%`}
                color="success"
              />
              <StatCard
                title="Absent"
                value={todayAttendance.absent.toString()}
                subtitle={`${((todayAttendance.absent / todayAttendance.totalStudents) * 100).toFixed(1)}%`}
                color="danger"
              />
              <StatCard
                title="Attendance Rate"
                value={`${todayAttendance.percentage.toFixed(1)}%`}
                subtitle="Overall"
                color="primary"
              />
            </div>
          </section>
        )}

        {view === "batch" && (
          <section className="section">
            <div className="section-header">
              <h2>Batch Attendance</h2>
            </div>
            <div className="filters-bar">
              <div className="filter-group">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="filter-input"
                />
                <select
                  value={selectedBatch || ""}
                  onChange={(e) => setSelectedBatch(e.target.value || null)}
                  className="filter-select"
                >
                  <option value="">Select Batch</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name} ({batch.programTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {batchAttendance ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Marked By</th>
                      <th>Updated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchAttendance.students.map((student) => (
                      <tr key={student.studentId}>
                        <td>
                          <div className="table-cell-primary">{student.studentName}</div>
                        </td>
                        <td className="text-muted">{student.studentEmail}</td>
                        <td>
                          <span className={`badge badge-${getAttendanceColor(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>{student.markedBy || "-"}</td>
                        <td>
                          {student.updatedAt 
                            ? new Date(student.updatedAt).toLocaleString() 
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Select a batch"
                body="Choose a batch and date to view attendance"
              />
            )}
          </section>
        )}

        {view === "student" && (
          <section className="section">
            <div className="section-header">
              <h2>Student Attendance</h2>
            </div>
            <div className="filters-bar">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search student..."
                  className="search-input"
                />
              </div>
            </div>
            <EmptyState
              title="Search for a student"
              body="Enter student name or email to view attendance history"
            />
          </section>
        )}

        {view === "overview" && (
          <section className="section">
            <div className="section-header">
              <h2>Attendance Overview</h2>
            </div>
            <EmptyState
              title="Overview coming soon"
              body="Detailed attendance analytics will be available here"
            />
          </section>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  color?: "primary" | "success" | "danger";
}

function StatCard({ title, value, subtitle, color = "primary" }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon stat-card-icon-${color}`}>
        <Calendar />
      </div>
      <div className="stat-card-content">
        <h3 className="stat-card-value">{value}</h3>
        <p className="stat-card-title">{title}</p>
        <p className="stat-card-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

function getAttendanceColor(status: string): string {
  switch (status) {
    case "PRESENT":
      return "success";
    case "ABSENT":
      return "danger";
    case "LATE":
      return "warning";
    case "EXCUSED":
      return "info";
    default:
      return "secondary";
  }
}

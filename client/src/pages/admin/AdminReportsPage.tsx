import { useEffect, useState } from "react";
import { CalendarCheck, ClipboardCheck, BookOpen, TrendingUp, Download } from "lucide-react";
import { getAttendanceReport, getDdpReport, getAssignmentReport, getInternshipProgressReport, type AttendanceReportDto, type DdpReportDto, type AssignmentReportDto, type InternshipProgressReportDto } from "../../lib/admin";
import { LoadingState, EmptyState, Button } from "../../components/ui";

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"attendance" | "ddp" | "assignments" | "progress">("attendance");
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReportDto | null>(null);
  const [ddpReport, setDdpReport] = useState<DdpReportDto | null>(null);
  const [assignmentReport, setAssignmentReport] = useState<AssignmentReportDto | null>(null);
  const [progressReport, setProgressReport] = useState<InternshipProgressReportDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError(null);
        
        const [attendance, ddp, assignments, progress] = await Promise.all([
          getAttendanceReport(),
          getDdpReport(),
          getAssignmentReport(),
          getInternshipProgressReport(),
        ]);
        
        setAttendanceReport(attendance);
        setDdpReport(ddp);
        setAssignmentReport(assignments);
        setProgressReport(progress);
      } catch (err) {
        setError("Failed to load reports");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading reports" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load reports"
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
          <h1>Reports</h1>
          <p className="text-muted">Platform analytics and performance reports</p>
        </div>

        {/* Report Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "attendance" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <CalendarCheck />
            Attendance
          </button>
          <button
            className={`tab ${activeTab === "ddp" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("ddp")}
          >
            <ClipboardCheck />
            DDP
          </button>
          <button
            className={`tab ${activeTab === "assignments" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("assignments")}
          >
            <BookOpen />
            Assignments
          </button>
          <button
            className={`tab ${activeTab === "progress" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("progress")}
          >
            <TrendingUp />
            Progress
          </button>
        </div>

        {activeTab === "attendance" && attendanceReport && (
          <AttendanceReport report={attendanceReport} />
        )}

        {activeTab === "ddp" && ddpReport && (
          <DdpReport report={ddpReport} />
        )}

        {activeTab === "assignments" && assignmentReport && (
          <AssignmentReport report={assignmentReport} />
        )}

        {activeTab === "progress" && progressReport && (
          <ProgressReport report={progressReport} />
        )}
      </div>
    </div>
  );
}

interface AttendanceReportProps {
  report: AttendanceReportDto;
}

function AttendanceReport({ report }: AttendanceReportProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Attendance Report</h2>
        <Button variant="ghost" size="sm">
          <Download />
          Export
        </Button>
      </div>

      <div className="report-sections">
        <ReportSection title="By Batch">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.byBatch.map((item) => (
                  <tr key={item.batchId}>
                    <td>{item.batchName}</td>
                    <td>{item.present}</td>
                    <td>{item.absent}</td>
                    <td>
                      <span className={`badge badge-${item.percentage >= 80 ? "success" : item.percentage >= 60 ? "warning" : "danger"}`}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection title="By Student">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.byStudent.slice(0, 10).map((item) => (
                  <tr key={item.studentId}>
                    <td>{item.studentName}</td>
                    <td>{item.present}</td>
                    <td>{item.absent}</td>
                    <td>
                      <span className={`badge badge-${item.percentage >= 80 ? "success" : item.percentage >= 60 ? "warning" : "danger"}`}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection title="By Date">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.byDate.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.present}</td>
                    <td>{item.absent}</td>
                    <td>
                      <span className={`badge badge-${item.percentage >= 80 ? "success" : item.percentage >= 60 ? "warning" : "danger"}`}>
                        {item.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      </div>
    </section>
  );
}

interface DdpReportProps {
  report: DdpReportDto;
}

function DdpReport({ report }: DdpReportProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>DDP Performance Report</h2>
        <Button variant="ghost" size="sm">
          <Download />
          Export
        </Button>
      </div>

      <div className="report-sections">
        <ReportSection title="By DDP">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>DDP</th>
                  <th>Attempts</th>
                  <th>Average Score</th>
                  <th>Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {report.byDdp.map((item) => (
                  <tr key={item.ddpId}>
                    <td>{item.ddpTitle}</td>
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
        </ReportSection>

        <ReportSection title="By Student">
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
                {report.byStudent.slice(0, 10).map((item) => (
                  <tr key={item.studentId}>
                    <td>{item.studentName}</td>
                    <td>{item.averageScore.toFixed(1)}%</td>
                    <td>{item.completed}</td>
                    <td>{item.passed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      </div>
    </section>
  );
}

interface AssignmentReportProps {
  report: AssignmentReportDto;
}

function AssignmentReport({ report }: AssignmentReportProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Assignment Performance Report</h2>
        <Button variant="ghost" size="sm">
          <Download />
          Export
        </Button>
      </div>

      <div className="report-sections">
        <ReportSection title="By Assignment">
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
                {report.byAssignment.map((item) => (
                  <tr key={item.assignmentId}>
                    <td>{item.assignmentTitle}</td>
                    <td>{item.submissions}</td>
                    <td>{item.pendingReviews}</td>
                    <td>{item.reviewed}</td>
                    <td>{item.averageScore.toFixed(1)}%</td>
                    <td>{item.resubmissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>

        <ReportSection title="By Student">
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
                {report.byStudent.slice(0, 10).map((item) => (
                  <tr key={item.studentId}>
                    <td>{item.studentName}</td>
                    <td>{item.submitted}</td>
                    <td>{item.averageScore.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      </div>
    </section>
  );
}

interface ProgressReportProps {
  report: InternshipProgressReportDto;
}

function ProgressReport({ report }: ProgressReportProps) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>Internship Progress Report</h2>
        <Button variant="ghost" size="sm">
          <Download />
          Export
        </Button>
      </div>

      <div className="report-sections">
        <ReportSection title="By Internship">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch</th>
                  <th>Students</th>
                  <th>Average Progress</th>
                  <th>Completed Days</th>
                  <th>DDP Completion</th>
                  <th>Assignment Completion</th>
                </tr>
              </thead>
              <tbody>
                {report.byInternship.map((item) => (
                  <tr key={item.batchId}>
                    <td>{item.batchName}</td>
                    <td>{item.students}</td>
                    <td>{item.averageProgress.toFixed(1)}%</td>
                    <td>{item.completedDays}</td>
                    <td>{item.ddpCompletion.toFixed(1)}%</td>
                    <td>{item.assignmentCompletion.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ReportSection>
      </div>
    </section>
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

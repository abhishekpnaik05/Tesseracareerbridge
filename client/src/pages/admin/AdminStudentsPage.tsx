import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getAdminStudents, getAdminPrograms, getAdminBatches, type AdminStudentListItem, type AdminProgramListItem, type AdminBatchListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminStudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Paginated<AdminStudentListItem> | null>(null);
  const [programs, setPrograms] = useState<AdminProgramListItem[]>([]);
  const [batches, setBatches] = useState<AdminBatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const programFilter = searchParams.get("program") || "";
  const batchFilter = searchParams.get("batch") || "";
  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [studentsData, programsData, batchesData] = await Promise.all([
          getAdminStudents({ page, pageSize: 20, search, program: programFilter, batch: batchFilter, status: statusFilter }),
          getAdminPrograms({ pageSize: 100 }),
          getAdminBatches({ pageSize: 100 }),
        ]);
        
        setStudents(studentsData);
        setPrograms(programsData.items);
        setBatches(batchesData.items);
      } catch (err) {
        setError("Failed to load students");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, search, programFilter, batchFilter, statusFilter]);

  function updateFilters(params: Record<string, string>) {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.set("page", "1");
    setSearchParams(newParams);
  }

  function handleSearch(value: string) {
    updateFilters({ search: value });
  }

  function handlePageChange(newPage: number) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading students" />
        </div>
      </div>
    );
  }

  if (error || !students) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load students"
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
          <h1>Students</h1>
          <p className="text-muted">Manage student accounts and view enrollment details</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={programFilter}
              onChange={(e) => updateFilters({ program: e.target.value })}
              className="filter-select"
            >
              <option value="">All Programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
            
            <select
              value={batchFilter}
              onChange={(e) => updateFilters({ batch: e.target.value })}
              className="filter-select"
            >
              <option value="">All Batches</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          {students.total} student{students.total !== 1 ? "s" : ""} found
        </div>

        {/* Students Table */}
        {students.items.length > 0 ? (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Progress</th>
                    <th>Attendance</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.items.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="table-cell-primary">{student.name}</div>
                      </td>
                      <td className="text-muted">{student.email}</td>
                      <td>{student.program || "-"}</td>
                      <td>{student.batch || "-"}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(student.status)}`}>
                          {student.status}
                        </span>
                      </td>
                      <td>{student.progress != null ? `${student.progress}%` : "-"}</td>
                      <td>{student.attendance != null ? `${student.attendance}%` : "-"}</td>
                      <td>
                        <Link to={`/admin/students/${student.id}`} className="btn-icon">
                          <Eye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {students.total > students.pageSize && (
              <div className="pagination">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft />
                  Previous
                </Button>
                <span className="pagination-info">
                  Page {page} of {Math.ceil(students.total / students.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(students.total / students.pageSize)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No students found"
            body="Try adjusting your filters or search terms"
          />
        )}
      </div>
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

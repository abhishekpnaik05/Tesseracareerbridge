import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getAdminEnrollments, getAdminPrograms, getAdminBatches, type AdminEnrollmentListItem, type AdminProgramListItem, type AdminBatchListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminEnrollmentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [enrollments, setEnrollments] = useState<Paginated<AdminEnrollmentListItem> | null>(null);
  const [programs, setPrograms] = useState<AdminProgramListItem[]>([]);
  const [batches, setBatches] = useState<AdminBatchListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const programFilter = searchParams.get("programId") || "";
  const batchFilter = searchParams.get("batchId") || "";
  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [enrollmentsData, programsData, batchesData] = await Promise.all([
          getAdminEnrollments({ page, pageSize: 20, search, programId: programFilter, batchId: batchFilter, status: statusFilter }),
          getAdminPrograms({ pageSize: 100 }),
          getAdminBatches({ pageSize: 100 }),
        ]);
        
        setEnrollments(enrollmentsData);
        setPrograms(programsData.items);
        setBatches(batchesData.items);
      } catch (err) {
        setError("Failed to load enrollments");
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
          <LoadingState label="Loading enrollments" />
        </div>
      </div>
    );
  }

  if (error || !enrollments) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load enrollments"
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
          <h1>Enrollments</h1>
          <p className="text-muted">View and manage student enrollments</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search by student name or email..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={programFilter}
              onChange={(e) => updateFilters({ programId: e.target.value })}
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
              onChange={(e) => updateFilters({ batchId: e.target.value })}
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
              <option value="WITHDRAWN">Withdrawn</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          {enrollments.total} enrollment{enrollments.total !== 1 ? "s" : ""} found
        </div>

        {/* Enrollments Table */}
        {enrollments.items.length > 0 ? (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Batch</th>
                    <th>Status</th>
                    <th>Enrolled</th>
                    <th>Progress</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.items.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>
                        <div className="table-cell-primary">{enrollment.studentName}</div>
                      </td>
                      <td className="text-muted">{enrollment.studentEmail}</td>
                      <td>{enrollment.programTitle}</td>
                      <td>{enrollment.batchName}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(enrollment.status)}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td>
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td>{enrollment.progress}%</td>
                      <td>
                        <Link to={`/admin/enrollments/${enrollment.id}`} className="btn-icon">
                          <Eye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {enrollments.total > enrollments.pageSize && (
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
                  Page {page} of {Math.ceil(enrollments.total / enrollments.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(enrollments.total / enrollments.pageSize)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No enrollments found"
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
    case "WITHDRAWN":
      return "secondary";
    case "SUSPENDED":
      return "danger";
    default:
      return "secondary";
  }
}

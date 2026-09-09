import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Edit, UserRound } from "lucide-react";
import { getAdminBatches, getAdminPrograms, type AdminBatchListItem, type AdminProgramListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminBatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [batches, setBatches] = useState<Paginated<AdminBatchListItem> | null>(null);
  const [programs, setPrograms] = useState<AdminProgramListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const programFilter = searchParams.get("programId") || "";
  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [batchesData, programsData] = await Promise.all([
          getAdminBatches({ page, pageSize: 20, search, programId: programFilter, status: statusFilter }),
          getAdminPrograms({ pageSize: 100 }),
        ]);
        
        setBatches(batchesData);
        setPrograms(programsData.items);
      } catch (err) {
        setError("Failed to load batches");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [page, search, programFilter, statusFilter]);

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
          <LoadingState label="Loading batches" />
        </div>
      </div>
    );
  }

  if (error || !batches) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load batches"
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
          <h1>Batches</h1>
          <p className="text-muted">Manage internship batches and assign mentors</p>
          <Link to="/admin/batches/create" className="btn btn-primary">
            <Plus />
            Create Batch
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search batches..."
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
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="OPEN">Open</option>
              <option value="FULL">Full</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          {batches.total} batch{batches.total !== 1 ? "es" : ""} found
        </div>

        {/* Batches Table */}
        {batches.items.length > 0 ? (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Program</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Capacity</th>
                    <th>Enrolled</th>
                    <th>Mentor</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.items.map((batch) => (
                    <tr key={batch.id}>
                      <td>
                        <div className="table-cell-primary">{batch.name}</div>
                      </td>
                      <td>{batch.programTitle}</td>
                      <td>
                        {batch.startsAt 
                          ? new Date(batch.startsAt).toLocaleDateString() 
                          : "-"}
                      </td>
                      <td>
                        {batch.endsAt 
                          ? new Date(batch.endsAt).toLocaleDateString() 
                          : "-"}
                      </td>
                      <td>
                        <span className={`badge badge-${getStatusColor(batch.status)}`}>
                          {batch.status}
                        </span>
                      </td>
                      <td>{batch.capacity || "-"}</td>
                      <td>{batch.enrolledCount}</td>
                      <td>
                        {batch.mentor ? (
                          <Link to={`/admin/mentors/${batch.mentor.id}`} className="link">
                            {batch.mentor.name}
                          </Link>
                        ) : (
                          <Link 
                            to={`/admin/batches/${batch.id}/assign-mentor`}
                            className="btn btn-sm btn-outline"
                          >
                            <UserRound />
                            Assign
                          </Link>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/admin/batches/${batch.id}`} className="btn-icon" title="View">
                            <Eye />
                          </Link>
                          <Link to={`/admin/batches/${batch.id}/edit`} className="btn-icon" title="Edit">
                            <Edit />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {batches.total > batches.pageSize && (
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
                  Page {page} of {Math.ceil(batches.total / batches.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(batches.total / batches.pageSize)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No batches found"
            body="Try adjusting your filters or search terms"
          />
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "IN_PROGRESS":
      return "success";
    case "OPEN":
      return "info";
    case "UPCOMING":
      return "primary";
    case "FULL":
      return "warning";
    case "COMPLETED":
      return "secondary";
    case "CANCELLED":
      return "danger";
    case "DRAFT":
      return "secondary";
    default:
      return "secondary";
  }
}

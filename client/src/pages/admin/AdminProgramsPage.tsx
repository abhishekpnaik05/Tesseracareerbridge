import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Plus, Eye, Edit } from "lucide-react";
import { getAdminPrograms, type AdminProgramListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminProgramsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [programs, setPrograms] = useState<Paginated<AdminProgramListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const categoryFilter = searchParams.get("category") || "";

  useEffect(() => {
    async function loadPrograms() {
      try {
        setLoading(true);
        setError(null);
        const programsData = await getAdminPrograms({ page, pageSize: 20, search, status: statusFilter, category: categoryFilter });
        setPrograms(programsData);
      } catch (err) {
        setError("Failed to load programs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, [page, search, statusFilter, categoryFilter]);

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
          <LoadingState label="Loading programs" />
        </div>
      </div>
    );
  }

  if (error || !programs) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load programs"
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
          <h1>Programs</h1>
          <p className="text-muted">Create and manage internship programs</p>
          <Link to="/admin/programs/create" className="btn btn-primary">
            <Plus />
            Create Program
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search programs..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => updateFilters({ category: e.target.value })}
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="Full Stack">Full Stack</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Data Science">Data Science</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          {programs.total} program{programs.total !== 1 ? "s" : ""} found
        </div>

        {/* Programs Table */}
        {programs.items.length > 0 ? (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Batches</th>
                    <th>Enrollments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.items.map((program) => (
                    <tr key={program.id}>
                      <td>
                        <div className="table-cell-primary">{program.title}</div>
                        {program.summary && (
                          <div className="text-muted text-sm">{program.summary}</div>
                        )}
                      </td>
                      <td>{program.category || "-"}</td>
                      <td>{program.level || "-"}</td>
                      <td>{program.durationWeeks ? `${program.durationWeeks} weeks` : "-"}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(program.status)}`}>
                          {program.status}
                        </span>
                      </td>
                      <td>{program.batchCount}</td>
                      <td>{program.enrollmentCount}</td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/admin/programs/${program.id}`} className="btn-icon" title="View">
                            <Eye />
                          </Link>
                          <Link to={`/admin/programs/${program.id}/edit`} className="btn-icon" title="Edit">
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
            {programs.total > programs.pageSize && (
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
                  Page {page} of {Math.ceil(programs.total / programs.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(programs.total / programs.pageSize)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No programs found"
            body="Try adjusting your filters or search terms"
          />
        )}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "DRAFT":
      return "warning";
    case "ARCHIVED":
      return "secondary";
    default:
      return "secondary";
  }
}

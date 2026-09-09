import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { getAdminMentors, type AdminMentorListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminMentorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mentors, setMentors] = useState<Paginated<AdminMentorListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true);
        setError(null);
        const mentorsData = await getAdminMentors({ page, pageSize: 20, search, status: statusFilter });
        setMentors(mentorsData);
      } catch (err) {
        setError("Failed to load mentors");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMentors();
  }, [page, search, statusFilter]);

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
          <LoadingState label="Loading mentors" />
        </div>
      </div>
    );
  }

  if (error || !mentors) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load mentors"
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
          <h1>Mentors</h1>
          <p className="text-muted">Manage mentor accounts and assignments</p>
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
              value={statusFilter}
              onChange={(e) => updateFilters({ status: e.target.value })}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">
          {mentors.total} mentor{mentors.total !== 1 ? "s" : ""} found
        </div>

        {/* Mentors Table */}
        {mentors.items.length > 0 ? (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Assigned Batches</th>
                    <th>Assigned Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.items.map((mentor) => (
                    <tr key={mentor.id}>
                      <td>
                        <div className="table-cell-primary">{mentor.name}</div>
                      </td>
                      <td className="text-muted">{mentor.email}</td>
                      <td>{mentor.title || "-"}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(mentor.status)}`}>
                          {mentor.status}
                        </span>
                      </td>
                      <td>{mentor.assignedBatches}</td>
                      <td>{mentor.assignedStudents}</td>
                      <td>
                        <Link to={`/admin/mentors/${mentor.id}`} className="btn-icon">
                          <Eye />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {mentors.total > mentors.pageSize && (
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
                  Page {page} of {Math.ceil(mentors.total / mentors.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(mentors.total / mentors.pageSize)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No mentors found"
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
    case "SUSPENDED":
      return "danger";
    default:
      return "secondary";
  }
}

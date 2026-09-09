import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { getAdminAnnouncements, createAdminAnnouncement, updateAdminAnnouncement, deleteAdminAnnouncement, type AdminAnnouncementListItem, type CreateAnnouncementRequest } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminAnnouncementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [announcements, setAnnouncements] = useState<Paginated<AdminAnnouncementListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AdminAnnouncementListItem | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        setLoading(true);
        setError(null);
        const announcementsData = await getAdminAnnouncements({ page, pageSize: 20 });
        setAnnouncements(announcementsData);
      } catch (err) {
        setError("Failed to load announcements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnnouncements();
  }, [page]);

  function handlePageChange(newPage: number) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  }

  async function handleCreate(data: CreateAnnouncementRequest) {
    try {
      await createAdminAnnouncement(data);
      setShowCreateModal(false);
      // Reload announcements
      const announcementsData = await getAdminAnnouncements({ page, pageSize: 20 });
      setAnnouncements(announcementsData);
    } catch (err) {
      setError("Failed to create announcement");
      console.error(err);
    }
  }

  async function handleUpdate(id: string, data: Partial<CreateAnnouncementRequest>) {
    try {
      await updateAdminAnnouncement(id, data);
      setEditingAnnouncement(null);
      // Reload announcements
      const announcementsData = await getAdminAnnouncements({ page, pageSize: 20 });
      setAnnouncements(announcementsData);
    } catch (err) {
      setError("Failed to update announcement");
      console.error(err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAdminAnnouncement(id);
      // Reload announcements
      const announcementsData = await getAdminAnnouncements({ page, pageSize: 20 });
      setAnnouncements(announcementsData);
    } catch (err) {
      setError("Failed to delete announcement");
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading announcements" />
        </div>
      </div>
    );
  }

  if (error || !announcements) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load announcements"
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
          <h1>Announcements</h1>
          <p className="text-muted">Create and manage platform announcements</p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus />
            Create Announcement
          </Button>
        </div>

        {/* Announcements List */}
        {announcements.items.length > 0 ? (
          <>
            <div className="card-list">
              {announcements.items.map((announcement) => (
                <div key={announcement.id} className="card-list-item">
                  <div className="card-list-item-content">
                    <div className="card-list-item-header">
                      <h3>{announcement.title}</h3>
                      <span className={`badge badge-${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-muted">{announcement.body.substring(0, 150)}...</p>
                    <div className="card-list-item-meta">
                      <span className="text-muted text-sm">
                        Audience: {announcement.audience}
                      </span>
                      {announcement.batchName && (
                        <span className="text-muted text-sm">
                          Batch: {announcement.batchName}
                        </span>
                      )}
                      <span className="text-muted text-sm">
                        By {announcement.authorName}
                      </span>
                      <span className="text-muted text-sm">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="card-list-item-actions">
                    <button
                      className="btn-icon"
                      onClick={() => setEditingAnnouncement(announcement)}
                      title="Edit"
                    >
                      <Edit />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDelete(announcement.id)}
                      title="Delete"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {announcements.total > announcements.pageSize && (
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
                  Page {page} of {Math.ceil(announcements.total / announcements.pageSize)}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(announcements.total / announcements.pageSize)}
                >
                  Next
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No announcements"
            body="Create your first announcement to communicate with students and mentors"
          >
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Announcement
            </button>
          </EmptyState>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAnnouncement) && (
        <AnnouncementModal
          announcement={editingAnnouncement}
          onSave={(data) => {
            if (editingAnnouncement) {
              handleUpdate(editingAnnouncement.id, data);
            } else {
              handleCreate(data);
            }
          }}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAnnouncement(null);
          }}
        />
      )}
    </div>
  );
}

interface AnnouncementModalProps {
  announcement: AdminAnnouncementListItem | null;
  onSave: (data: CreateAnnouncementRequest) => void;
  onClose: () => void;
}

function AnnouncementModal({ announcement, onSave, onClose }: AnnouncementModalProps) {
  const [title, setTitle] = useState(announcement?.title || "");
  const [body, setBody] = useState(announcement?.body || "");
  const [priority, setPriority] = useState<"NORMAL" | "IMPORTANT" | "URGENT">(
    (announcement?.priority as "NORMAL" | "IMPORTANT" | "URGENT") || "NORMAL"
  );
  const [audience, setAudience] = useState<"ALL" | "STUDENTS" | "MENTORS" | "SPECIFIC_BATCH">(
    (announcement?.audience as "ALL" | "STUDENTS" | "MENTORS" | "SPECIFIC_BATCH") || "ALL"
  );
  const [batchId, setBatchId] = useState(announcement?.batchId || "");
  const [showPreview, setShowPreview] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ title, body, priority, audience, batchId: audience === "SPECIFIC_BATCH" ? batchId : undefined });
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{announcement ? "Edit Announcement" : "Create Announcement"}</h2>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>

        {showPreview ? (
          <div className="modal-body">
            <div className="announcement-preview">
              <div className={`announcement-preview-header announcement-preview-header-${priority.toLowerCase()}`}>
                <span className="badge">{priority}</span>
                <h3>{title}</h3>
              </div>
              <div className="announcement-preview-body">
                <p>{body}</p>
              </div>
              <div className="announcement-preview-footer">
                <p className="text-muted text-sm">
                  Audience: {audience === "ALL" ? "Everyone" : audience}
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setShowPreview(false)}>
                Back
              </Button>
              <Button onClick={handleSubmit}>
                Publish
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="body">Message</label>
              <textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                required
                className="textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as "NORMAL" | "IMPORTANT" | "URGENT")}
                className="select"
              >
                <option value="NORMAL">Normal</option>
                <option value="IMPORTANT">Important</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="audience">Audience</label>
              <select
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as "ALL" | "STUDENTS" | "MENTORS" | "SPECIFIC_BATCH")}
                className="select"
              >
                <option value="ALL">Everyone</option>
                <option value="STUDENTS">Students Only</option>
                <option value="MENTORS">Mentors Only</option>
                <option value="SPECIFIC_BATCH">Specific Batch</option>
              </select>
            </div>

            {audience === "SPECIFIC_BATCH" && (
              <div className="form-group">
                <label htmlFor="batchId">Batch ID</label>
                <Input
                  id="batchId"
                  type="text"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Enter batch ID"
                />
              </div>
            )}

            <div className="modal-actions">
              <Button variant="ghost" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="ghost" type="button" onClick={() => setShowPreview(true)}>
                Preview
              </Button>
              <Button type="submit">
                {announcement ? "Update" : "Publish"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "URGENT":
      return "danger";
    case "IMPORTANT":
      return "warning";
    case "NORMAL":
    default:
      return "secondary";
  }
}

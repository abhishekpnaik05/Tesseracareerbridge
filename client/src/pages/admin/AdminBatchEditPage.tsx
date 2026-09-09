import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import { getAdminBatch, updateAdminBatch, getAdminMentors, assignMentorToBatch, type AdminBatchDetail, type UpdateBatchRequest, type AdminMentorListItem } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";
import type { Paginated } from "@tesseracareerbridge/shared";

export function AdminBatchEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<AdminBatchDetail | null>(null);
  const [mentors, setMentors] = useState<AdminMentorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    startsAt: "",
    endsAt: "",
    enrollmentOpenDate: "",
    enrollmentCloseDate: "",
    capacity: 0,
    description: "",
    status: "DRAFT",
  });

  const [selectedMentorId, setSelectedMentorId] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const [batchData, mentorsData] = await Promise.all([
          getAdminBatch(id),
          getAdminMentors({ pageSize: 100, status: "ACTIVE" }),
        ]) as [AdminBatchDetail, Paginated<AdminMentorListItem>];

        setBatch(batchData);
        setMentors(mentorsData.items);

        setFormData({
          name: batchData.name,
          slug: batchData.slug || "",
          startsAt: batchData.startsAt ? batchData.startsAt.split('T')[0] : "",
          endsAt: batchData.endsAt ? batchData.endsAt.split('T')[0] : "",
          enrollmentOpenDate: batchData.enrollmentOpenDate ? batchData.enrollmentOpenDate.split('T')[0] : "",
          enrollmentCloseDate: batchData.enrollmentCloseDate ? batchData.enrollmentCloseDate.split('T')[0] : "",
          capacity: batchData.capacity || 0,
          description: batchData.description || "",
          status: batchData.status,
        });

        if (batchData.mentor) {
          setSelectedMentorId(batchData.mentor.id);
        }
      } catch (err) {
        setError("Failed to load batch details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      const updateData: UpdateBatchRequest = {
        name: formData.name,
        slug: formData.slug || undefined,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : undefined,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : undefined,
        enrollmentOpenDate: formData.enrollmentOpenDate ? new Date(formData.enrollmentOpenDate).toISOString() : undefined,
        enrollmentCloseDate: formData.enrollmentCloseDate ? new Date(formData.enrollmentCloseDate).toISOString() : undefined,
        capacity: formData.capacity || undefined,
        description: formData.description || undefined,
        status: formData.status,
      };

      await updateAdminBatch(id, updateData);
      navigate(`/admin/batches/${id}`);
    } catch (err) {
      setError("Failed to save batch");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignMentor() {
    if (!id || !selectedMentorId) return;

    try {
      setAssigning(true);
      setError(null);
      await assignMentorToBatch(id, selectedMentorId);
      // Reload batch data
      const batchData = await getAdminBatch(id);
      setBatch(batchData);
    } catch (err) {
      setError("Failed to assign mentor");
      console.error(err);
    } finally {
      setAssigning(false);
    }
  }

  function handleInputChange(field: keyof typeof formData, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading batch details" />
        </div>
      </div>
    );
  }

  if (error && !batch) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load batch"
            body={error}
          >
            <button className="btn btn-primary" onClick={() => window.history.back()}>
              Go back
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
          <Link to={`/admin/batches/${id}`} className="btn-back">
            <ArrowLeft />
            Back to Batch
          </Link>
          <h1>Edit Batch</h1>
          <p className="text-muted">{batch?.programTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="detail-section">
          <div className="detail-card">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="name">Batch Name *</label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug</label>
              <Input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                placeholder="URL-friendly identifier"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                className="textarea"
                placeholder="Batch description"
              />
            </div>

            {/* Schedule */}
            <h3>Schedule</h3>
            <div className="form-group">
              <label htmlFor="startsAt">Start Date</label>
              <Input
                id="startsAt"
                type="date"
                value={formData.startsAt}
                onChange={(e) => handleInputChange("startsAt", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endsAt">End Date</label>
              <Input
                id="endsAt"
                type="date"
                value={formData.endsAt}
                onChange={(e) => handleInputChange("endsAt", e.target.value)}
              />
            </div>

            {/* Enrollment Period */}
            <h3>Enrollment Period</h3>
            <div className="form-group">
              <label htmlFor="enrollmentOpenDate">Enrollment Opens</label>
              <Input
                id="enrollmentOpenDate"
                type="date"
                value={formData.enrollmentOpenDate}
                onChange={(e) => handleInputChange("enrollmentOpenDate", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="enrollmentCloseDate">Enrollment Closes</label>
              <Input
                id="enrollmentCloseDate"
                type="date"
                value={formData.enrollmentCloseDate}
                onChange={(e) => handleInputChange("enrollmentCloseDate", e.target.value)}
              />
            </div>

            {/* Capacity */}
            <h3>Capacity</h3>
            <div className="form-group">
              <label htmlFor="capacity">Maximum Students</label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                min="0"
                placeholder="0 for unlimited"
              />
            </div>

            {/* Status */}
            <h3>Status</h3>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="select"
              >
                <option value="DRAFT">Draft</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="OPEN">Open</option>
                <option value="FULL">Full</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Mentor Assignment */}
            <h3>Mentor Assignment</h3>
            <div className="form-group">
              <label htmlFor="mentor">Assign Mentor</label>
              <select
                id="mentor"
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="select"
              >
                <option value="">Select a mentor</option>
                {mentors.map((mentor) => (
                  <option key={mentor.id} value={mentor.id}>
                    {mentor.name} ({mentor.email})
                  </option>
                ))}
              </select>
            </div>

            {selectedMentorId && batch?.mentor?.id !== selectedMentorId && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAssignMentor}
                disabled={assigning}
              >
                <UserRound />
                {assigning ? "Assigning..." : "Assign Mentor"}
              </Button>
            )}

            {/* Current Mentor */}
            {batch?.mentor && (
              <div className="form-group">
                <label>Current Mentor</label>
                <div className="detail-row">
                  <span className="detail-row-label">
                    {batch.mentor.name}
                  </span>
                  <span className="detail-row-value">
                    {batch.mentor.email}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <Button variant="ghost" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
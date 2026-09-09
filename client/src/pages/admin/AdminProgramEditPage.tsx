import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getAdminProgram, updateAdminProgram, createAdminProgram, type AdminProgramDetail, type UpdateProgramRequest, type CreateProgramRequest } from "../../lib/admin";
import { LoadingState, EmptyState, Button, Input } from "../../components/ui";

export function AdminProgramEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [program, setProgram] = useState<AdminProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    description: "",
    durationWeeks: 0,
    durationLabel: "",
    level: "",
    category: "",
    audience: "",
    learningApproach: "",
    learningDaysPerWeek: 0,
    status: "DRAFT",
    featured: false,
    availability: "OPEN",
    skills: [] as string[],
    outcomes: [] as string[],
    requirements: [] as string[],
  });

  useEffect(() => {
    async function loadProgram() {
      if (!id) {
        // Create mode - don't load existing program
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const programData = await getAdminProgram(id);
        setProgram(programData);
        setFormData({
          title: programData.title,
          summary: programData.summary || "",
          description: programData.description || "",
          durationWeeks: programData.durationWeeks || 0,
          durationLabel: programData.durationLabel || "",
          level: programData.level || "",
          category: programData.category || "",
          audience: programData.audience || "",
          learningApproach: programData.learningApproach || "",
          learningDaysPerWeek: programData.learningDaysPerWeek || 0,
          status: programData.status,
          featured: programData.featured,
          availability: programData.availability,
          skills: programData.skills,
          outcomes: programData.outcomes,
          requirements: programData.requirements,
        });
      } catch (err) {
        setError("Failed to load program details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProgram();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const programData: CreateProgramRequest = {
        title: formData.title,
        summary: formData.summary || undefined,
        description: formData.description || undefined,
        durationWeeks: formData.durationWeeks || undefined,
        durationLabel: formData.durationLabel || undefined,
        level: formData.level || undefined,
        category: formData.category || undefined,
        audience: formData.audience || undefined,
        learningApproach: formData.learningApproach || undefined,
        learningDaysPerWeek: formData.learningDaysPerWeek || undefined,
        skills: formData.skills,
        outcomes: formData.outcomes,
        requirements: formData.requirements,
      };

      if (id) {
        // Update existing program
        const updateData: UpdateProgramRequest = {
          ...programData,
          status: formData.status,
          featured: formData.featured,
          availability: formData.availability,
        };
        await updateAdminProgram(id, updateData);
        navigate(`/admin/programs/${id}`);
      } else {
        // Create new program
        const newProgram = await createAdminProgram(programData);
        navigate(`/admin/programs/${newProgram.id}`);
      }
    } catch (err) {
      setError("Failed to save program");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function handleInputChange(field: keyof typeof formData, value: string | number | boolean) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleArrayChange(field: "skills" | "outcomes" | "requirements", value: string) {
    const items = value.split("\n").filter(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: items }));
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <LoadingState label="Loading program details" />
        </div>
      </div>
    );
  }

  if (error && id) {
    return (
      <div className="page">
        <div className="container">
          <EmptyState
            title="Unable to load program"
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
          <Link to="/admin/programs" className="btn-back">
            <ArrowLeft />
            Back to Programs
          </Link>
          <h1>{id ? "Edit Program" : "Create Program"}</h1>
          <p className="text-muted">{id ? "Update program information and settings" : "Create a new internship program"}</p>
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
              <label htmlFor="title">Title *</label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="summary">Summary</label>
              <textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
                rows={3}
                className="textarea"
                placeholder="Brief summary of the program"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={6}
                className="textarea"
                placeholder="Detailed description of the program"
              />
            </div>

            {/* Program Details */}
            <h3>Program Details</h3>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange("category", e.target.value)}
                className="select"
              >
                <option value="">Select category</option>
                <option value="Full Stack">Full Stack</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange("level", e.target.value)}
                className="select"
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="durationWeeks">Duration (weeks)</label>
              <Input
                id="durationWeeks"
                type="number"
                value={formData.durationWeeks}
                onChange={(e) => handleInputChange("durationWeeks", parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationLabel">Duration Label</label>
              <Input
                id="durationLabel"
                type="text"
                value={formData.durationLabel}
                onChange={(e) => handleInputChange("durationLabel", e.target.value)}
                placeholder="e.g., 3 months, 12 weeks"
              />
            </div>

            {/* Learning Settings */}
            <h3>Learning Settings</h3>
            <div className="form-group">
              <label htmlFor="audience">Target Audience</label>
              <textarea
                id="audience"
                value={formData.audience}
                onChange={(e) => handleInputChange("audience", e.target.value)}
                rows={3}
                className="textarea"
                placeholder="Who this program is for"
              />
            </div>

            <div className="form-group">
              <label htmlFor="learningApproach">Learning Approach</label>
              <textarea
                id="learningApproach"
                value={formData.learningApproach}
                onChange={(e) => handleInputChange("learningApproach", e.target.value)}
                rows={3}
                className="textarea"
                placeholder="How the learning is structured"
              />
            </div>

            <div className="form-group">
              <label htmlFor="learningDaysPerWeek">Learning Days per Week</label>
              <Input
                id="learningDaysPerWeek"
                type="number"
                value={formData.learningDaysPerWeek}
                onChange={(e) => handleInputChange("learningDaysPerWeek", parseInt(e.target.value) || 0)}
                min="0"
                max="7"
              />
            </div>

            {/* Skills */}
            <h3>Skills (one per line)</h3>
            <div className="form-group">
              <textarea
                value={formData.skills.join("\n")}
                onChange={(e) => handleArrayChange("skills", e.target.value)}
                rows={5}
                className="textarea"
                placeholder="Enter skills, one per line"
              />
            </div>

            {/* Outcomes */}
            <h3>Learning Outcomes (one per line)</h3>
            <div className="form-group">
              <textarea
                value={formData.outcomes.join("\n")}
                onChange={(e) => handleArrayChange("outcomes", e.target.value)}
                rows={5}
                className="textarea"
                placeholder="Enter learning outcomes, one per line"
              />
            </div>

            {/* Requirements */}
            <h3>Requirements (one per line)</h3>
            <div className="form-group">
              <textarea
                value={formData.requirements.join("\n")}
                onChange={(e) => handleArrayChange("requirements", e.target.value)}
                rows={5}
                className="textarea"
                placeholder="Enter requirements, one per line"
              />
            </div>

            {/* Publication Settings - only show when editing */}
            {id && (
              <>
                <h3>Publication Settings</h3>
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="select"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="availability">Availability</label>
                  <select
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => handleInputChange("availability", e.target.value)}
                    className="select"
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="INVITE_ONLY">Invite Only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange("featured", e.target.checked)}
                    />
                    <span>Featured Program</span>
                  </label>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <Button variant="ghost" type="button" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save />
                {saving ? "Saving..." : (id ? "Save Changes" : "Create Program")}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
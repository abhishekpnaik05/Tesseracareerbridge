import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { PageMeta } from "../../components/seo/PageMeta";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge, Modal, Field, Input, Textarea, Select } from "../../components/ui";
import { getMentorCurriculum, createWeek, type MentorCurriculumDto, type MentorWeekDto, CurriculumStatus } from "../../lib/mentor";

export function MentorInternshipDesignerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState<MentorCurriculumDto | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<MentorWeekDto | null>(null);
  const [showWeekModal, setShowWeekModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");
  const [weekForm, setWeekForm] = useState({ title: "", description: "", status: "DRAFT" as CurriculumStatus });
  const [dayForm, setDayForm] = useState({ title: "", description: "", objective: "", estimatedDuration: "", status: "DRAFT" as CurriculumStatus });

  useEffect(() => {
    if (!id) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        const data = await getMentorCurriculum(id!);
        setCurriculum(data);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load curriculum:", error);
        setStatus("error");
      }
    }

    loadData();
  }, [id]);

  const handleCreateWeek = async () => {
    if (!curriculum || !id) return;

    try {
      const weekNumber = curriculum.weeks.length + 1;
      await createWeek({
        programId: curriculum.programId,
        weekNumber,
        title: weekForm.title,
        description: weekForm.description,
        status: weekForm.status,
      });
      
      // Refresh curriculum
      const updatedCurriculum = await getMentorCurriculum(id);
      setCurriculum(updatedCurriculum);
      setShowWeekModal(false);
      setWeekForm({ title: "", description: "", status: "DRAFT" });
    } catch (error) {
      console.error("Failed to create week:", error);
    }
  };

  const handleCreateDay = async () => {
    if (!selectedWeek) return;

    try {
      // This would need a backend endpoint
      // For now, we'll navigate to a day creation page
      navigate(`/mentor/internships/${id}/weeks/${selectedWeek.id}/days/create`);
      setShowDayModal(false);
    } catch (error) {
      console.error("Failed to create day:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <Skeleton style={{ height: 400, marginTop: 24 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load curriculum" body="Try again in a moment.">
          <ButtonLink to="/mentor/internships">Back to My Internships</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !curriculum) {
    return (
      <div className="container page-hero">
        <EmptyState title="Curriculum not found" body="This curriculum does not exist or you don't have access to it.">
          <ButtonLink to="/mentor/internships">Back to My Internships</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Curriculum Designer | ${curriculum.programTitle}`}
        description="Design and manage curriculum weeks and days"
      />
      <div className="container page-hero">
        <ButtonLink to="/mentor/internships" variant="ghost" size="sm">
          <ArrowLeft size={16} />
          Back to My Internships
        </ButtonLink>
        <p className="t-label">Internship Designer</p>
        <h1>{curriculum.programTitle}</h1>
        <p className="pub-lead">{curriculum.batchName}</p>
      </div>

      <div className="container">
        {!selectedWeek ? (
          <>
            <div className="section-header">
              <h2>Weeks</h2>
              <Button variant="primary" onClick={() => setShowWeekModal(true)}>
                <Plus size={16} />
                Add Week
              </Button>
            </div>

            {curriculum.weeks.length === 0 ? (
              <EmptyState title="No weeks created" body="Start by creating your first week of curriculum.">
                <Button variant="primary" onClick={() => setShowWeekModal(true)}>
                  <Plus size={16} />
                  Create First Week
                </Button>
              </EmptyState>
            ) : (
              <div className="week-list">
                {curriculum.weeks.map((week) => (
                  <div key={week.id} className="week-card" onClick={() => setSelectedWeek(week)}>
                    <Card>
                      <div className="week-card__header">
                        <span className="week-card__number">WEEK {week.weekNumber}</span>
                        <Badge tone={week.status === "PUBLISHED" ? "success" : "muted"}>
                          {week.status}
                        </Badge>
                      </div>
                      <h3 className="week-card__title">{week.title}</h3>
                      {week.description && <p>{week.description}</p>}
                      <div className="week-card__stats">
                        <span>{week.daysCount} Days</span>
                        <span>{week.publishedDaysCount} Published</span>
                      </div>
                      <div className="week-card__actions">
                        <Button variant="outline" size="sm">
                          <Edit size={14} />
                          Edit Week
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="section-header">
              <Button variant="ghost" onClick={() => setSelectedWeek(null)}>
                <ArrowLeft size={16} />
                Back to Weeks
              </Button>
              <h2>Week {selectedWeek.weekNumber}: {selectedWeek.title}</h2>
              <Button variant="primary" onClick={() => setShowDayModal(true)}>
                <Plus size={16} />
                Add Day
              </Button>
            </div>

            {selectedWeek.description && (
              <div style={{ marginBottom: 16 }}>
                <Card>
                  <p>{selectedWeek.description}</p>
                </Card>
              </div>
            )}

            <div className="day-list">
              {/* Days would be loaded from a separate API call */}
              <EmptyState title="No days created" body="This week doesn't have any days yet.">
                <Button variant="primary" onClick={() => setShowDayModal(true)}>
                  <Plus size={16} />
                  Add First Day
                </Button>
              </EmptyState>
            </div>
          </>
        )}
      </div>

      {/* Create Week Modal */}
      <Modal open={showWeekModal} onClose={() => setShowWeekModal(false)} title="Create Week">
        <div className="stack">
          <Field label="Week Title" htmlFor="week-title">
            <Input
              id="week-title"
              value={weekForm.title}
              onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })}
              placeholder="e.g., Web Development Fundamentals"
            />
          </Field>
          <Field label="Description" htmlFor="week-description">
            <Textarea
              id="week-description"
              value={weekForm.description}
              onChange={(e) => setWeekForm({ ...weekForm, description: e.target.value })}
              placeholder="Describe what students will learn this week..."
              rows={3}
            />
          </Field>
          <Field label="Status" htmlFor="week-status">
            <Select
              id="week-status"
              value={weekForm.status}
              onChange={(e) => setWeekForm({ ...weekForm, status: e.target.value as CurriculumStatus })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setShowWeekModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateWeek}>
              Create Week
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Day Modal */}
      <Modal open={showDayModal} onClose={() => setShowDayModal(false)} title="Create Day">
        <div className="stack">
          <Field label="Day Title" htmlFor="day-title">
            <Input
              id="day-title"
              value={dayForm.title}
              onChange={(e) => setDayForm({ ...dayForm, title: e.target.value })}
              placeholder="e.g., Introduction to HTML"
            />
          </Field>
          <Field label="Description" htmlFor="day-description">
            <Textarea
              id="day-description"
              value={dayForm.description}
              onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })}
              placeholder="Describe the day's learning objectives..."
              rows={3}
            />
          </Field>
          <Field label="Learning Objectives" htmlFor="day-objective">
            <Textarea
              id="day-objective"
              value={dayForm.objective}
              onChange={(e) => setDayForm({ ...dayForm, objective: e.target.value })}
              placeholder="Key learning objectives (one per line)..."
              rows={3}
            />
          </Field>
          <Field label="Estimated Duration (minutes)" htmlFor="day-duration">
            <Input
              id="day-duration"
              type="number"
              value={dayForm.estimatedDuration}
              onChange={(e) => setDayForm({ ...dayForm, estimatedDuration: e.target.value })}
              placeholder="e.g., 60"
            />
          </Field>
          <Field label="Status" htmlFor="day-status">
            <Select
              id="day-status"
              value={dayForm.status}
              onChange={(e) => setDayForm({ ...dayForm, status: e.target.value as CurriculumStatus })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button variant="ghost" onClick={() => setShowDayModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateDay}>
              Create Day
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

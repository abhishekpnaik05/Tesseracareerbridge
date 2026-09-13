import { useEffect, useState } from "react";
import { Edit, Trash2, BookOpen, Calendar, TrendingUp } from "lucide-react";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge, Field, Select } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminCurriculumItem } from "@tesseracareerbridge/shared";

export function AdminCurriculumPage() {
  const [curriculum, setCurriculum] = useState<AdminCurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");

  useEffect(() => {
    loadCurriculum();
  }, [selectedProgram]);

  async function loadCurriculum() {
    try {
      setLoading(true);
      setError(null);
      const url = selectedProgram === "all" 
        ? "/api/v1/admins/curriculum"
        : `/api/v1/admins/curriculum?programId=${selectedProgram}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to load curriculum");
      const result = await response.json();
      setCurriculum(result.data);
    } catch (err) {
      setError("Failed to load curriculum");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Curriculum Management" description="Manage curriculum across all programs" />
          <div className="page-header">
            <h1>Curriculum Management</h1>
            <p className="text-muted">Manage curriculum across all programs</p>
          </div>
          <Skeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Curriculum Management" description="Manage curriculum across all programs" />
          <div className="page-header">
            <h1>Curriculum Management</h1>
          </div>
          <ErrorState title="Error" body={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Curriculum Management" description="Manage curriculum across all programs" />
        <div className="page-header">
          <h1>Curriculum Management</h1>
          <p className="text-muted">Manage curriculum weeks and content across all programs</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <Field label="Filter by Program" htmlFor="program-filter">
              <Select
                id="program-filter"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
              >
                <option value="all">All Programs</option>
                <option value="program1">Full Stack Development</option>
                <option value="program2">AI & Machine Learning</option>
                <option value="program3">Python Development</option>
              </Select>
            </Field>
          </div>
        </div>

        {curriculum.length === 0 ? (
          <EmptyState
            title="No curriculum found"
            body="Get started by creating curriculum weeks for your programs."
          />
        ) : (
          <div className="grid">
            {curriculum.map((item) => (
              <Card key={item.id} className="card-hover">
                <div className="card-header">
                  <div className="card-header__title">
                    <BookOpen size={20} />
                    <div>
                      <h3>{item.programName}</h3>
                      <p className="text-muted">Week {item.weekNumber}</p>
                    </div>
                  </div>
                  <Badge tone={item.status === "PUBLISHED" ? "success" : "muted"}>
                    {item.status}
                  </Badge>
                </div>
                <div className="card-body">
                  <h4>{item.title}</h4>
                  {item.description && <p className="text-muted">{item.description}</p>}
                  <div className="stats">
                    <div className="stat">
                      <Calendar size={16} />
                      <span>{item.daysCount} Days</span>
                    </div>
                    <div className="stat">
                      <TrendingUp size={16} />
                      <span>{item.publishedDaysCount} Published</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <ButtonLink to={`/admin/curriculum/${item.id}`} variant="outline" size="sm">
                    <Edit size={14} />
                    Edit
                  </ButtonLink>
                  <Button variant="ghost" size="sm">
                    <Trash2 size={14} />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Edit, Trash2, ClipboardList, Clock, Award } from "lucide-react";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge, Field, Select } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminTestItem } from "@tesseracareerbridge/shared";

export function AdminTestsPage() {
  const [tests, setTests] = useState<AdminTestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadTests();
  }, [selectedProgram, selectedStatus]);

  async function loadTests() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedProgram !== "all") params.append("programId", selectedProgram);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/v1/admins/tests?${params}`);
      if (!response.ok) throw new Error("Failed to load tests");
      const result = await response.json();
      setTests(result.data);
    } catch (err) {
      setError("Failed to load tests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Tests Management" description="Manage quizzes and assessments" />
          <div className="page-header">
            <h1>Tests Management</h1>
            <p className="text-muted">Manage quizzes and assessments</p>
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
          <PageMeta title="Tests Management" description="Manage quizzes and assessments" />
          <div className="page-header">
            <h1>Tests Management</h1>
          </div>
          <ErrorState title="Error" body={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Tests Management" description="Manage quizzes and assessments" />
        <div className="page-header">
          <h1>Tests Management</h1>
          <p className="text-muted">Manage quizzes, assessments, and exams</p>
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
            <Field label="Filter by Status" htmlFor="status-filter">
              <Select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>
          </div>
        </div>

        {tests.length === 0 ? (
          <EmptyState
            title="No tests found"
            body="Get started by creating assessments for your programs."
          />
        ) : (
          <div className="grid">
            {tests.map((test) => (
              <Card key={test.id} className="card-hover">
                <div className="card-header">
                  <div className="card-header__title">
                    <ClipboardList size={20} />
                    <div>
                      <h3>{test.title}</h3>
                      <p className="text-muted">{test.programName}</p>
                    </div>
                  </div>
                  <Badge tone={test.status === "PUBLISHED" ? "success" : "muted"}>
                    {test.status}
                  </Badge>
                </div>
                <div className="card-body">
                  {test.description && <p className="text-muted">{test.description}</p>}
                  <div className="stats">
                    <div className="stat">
                      <Clock size={16} />
                      <span>{test.duration} min</span>
                    </div>
                    <div className="stat">
                      <Award size={16} />
                      <span>{test.totalMarks} marks</span>
                    </div>
                    <div className="stat">
                      <span>Pass: {test.passingMarks}</span>
                    </div>
                    {test.weekNumber && (
                      <div className="stat">
                        <span>Week {test.weekNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <ButtonLink to={`/admin/tests/${test.id}`} variant="outline" size="sm">
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
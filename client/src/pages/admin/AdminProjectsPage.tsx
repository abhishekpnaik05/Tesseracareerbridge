import { useEffect, useState } from "react";
import { Edit, Trash2, FolderKanban, Users, Clock, TrendingUp } from "lucide-react";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge, Field, Select } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminProjectItem } from "@tesseracareerbridge/shared";

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  useEffect(() => {
    loadProjects();
  }, [selectedProgram, selectedStatus]);

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedProgram !== "all") params.append("programId", selectedProgram);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/v1/admins/projects?${params}`);
      if (!response.ok) throw new Error("Failed to load projects");
      const result = await response.json();
      setProjects(result.data);
    } catch (err) {
      setError("Failed to load projects");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Projects Management" description="Manage hands-on projects and assignments" />
          <div className="page-header">
            <h1>Projects Management</h1>
            <p className="text-muted">Manage hands-on projects and assignments</p>
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
          <PageMeta title="Projects Management" description="Manage hands-on projects and assignments" />
          <div className="page-header">
            <h1>Projects Management</h1>
          </div>
          <ErrorState title="Error" body={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Projects Management" description="Manage hands-on projects and assignments" />
        <div className="page-header">
          <h1>Projects Management</h1>
          <p className="text-muted">Manage hands-on projects and capstone assignments</p>
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

        {projects.length === 0 ? (
          <EmptyState
            title="No projects found"
            body="Get started by creating hands-on projects for your programs."
          />
        ) : (
          <div className="grid">
            {projects.map((project) => (
              <Card key={project.id} className="card-hover">
                <div className="card-header">
                  <div className="card-header__title">
                    <FolderKanban size={20} />
                    <div>
                      <h3>{project.title}</h3>
                      <p className="text-muted">{project.programName}</p>
                    </div>
                  </div>
                  <Badge tone={project.status === "PUBLISHED" ? "success" : "muted"}>
                    {project.status}
                  </Badge>
                </div>
                <div className="card-body">
                  {project.description && <p className="text-muted">{project.description}</p>}
                  <div className="stats">
                    <div className="stat">
                      <Clock size={16} />
                      <span>{project.duration} days</span>
                    </div>
                    <div className="stat">
                      <Users size={16} />
                      <span>Max {project.maxTeamSize}/team</span>
                    </div>
                    <div className="stat">
                      <span>{project.difficulty}</span>
                    </div>
                    <div className="stat">
                      <TrendingUp size={16} />
                      <span>{project.submissions} submissions</span>
                    </div>
                    {project.weekNumber && (
                      <div className="stat">
                        <span>Week {project.weekNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <ButtonLink to={`/admin/projects/${project.id}`} variant="outline" size="sm">
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
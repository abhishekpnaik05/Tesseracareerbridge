import { useEffect, useState } from "react";
import { Edit, Trash2, FileText, Play, Clock } from "lucide-react";
import { Card, Button, ButtonLink, Skeleton, EmptyState, ErrorState, Badge, Field, Select } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminContentItem } from "@tesseracareerbridge/shared";

export function AdminContentPage() {
  const [content, setContent] = useState<AdminContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    loadContent();
  }, [selectedProgram, selectedType]);

  async function loadContent() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedProgram !== "all") params.append("programId", selectedProgram);
      if (selectedType !== "all") params.append("type", selectedType);
      
      const response = await fetch(`/api/v1/admins/content?${params}`);
      if (!response.ok) throw new Error("Failed to load content");
      const result = await response.json();
      setContent(result.data);
    } catch (err) {
      setError("Failed to load content");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Content Management" description="Manage learning content across all programs" />
          <div className="page-header">
            <h1>Content Management</h1>
            <p className="text-muted">Manage learning content across all programs</p>
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
          <PageMeta title="Content Management" description="Manage learning content across all programs" />
          <div className="page-header">
            <h1>Content Management</h1>
          </div>
          <ErrorState title="Error" body={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Content Management" description="Manage learning content across all programs" />
        <div className="page-header">
          <h1>Content Management</h1>
          <p className="text-muted">Manage videos, documents, and learning resources</p>
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
            <Field label="Filter by Type" htmlFor="type-filter">
              <Select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
                <option value="INTERACTIVE">Interactive</option>
              </Select>
            </Field>
          </div>
        </div>

        {content.length === 0 ? (
          <EmptyState
            title="No content found"
            body="Get started by adding learning content to your programs."
          />
        ) : (
          <div className="grid">
            {content.map((item) => (
              <Card key={item.id} className="card-hover">
                <div className="card-header">
                  <div className="card-header__title">
                    <FileText size={20} />
                    <div>
                      <h3>{item.title}</h3>
                      <p className="text-muted">{item.programName}</p>
                    </div>
                  </div>
                  <Badge tone={item.status === "PUBLISHED" ? "success" : "muted"}>
                    {item.status}
                  </Badge>
                </div>
                <div className="card-body">
                  <div className="stats">
                    <div className="stat">
                      <Play size={16} />
                      <span>{item.contentType}</span>
                    </div>
                    {item.duration && (
                      <div className="stat">
                        <Clock size={16} />
                        <span>{item.duration} min</span>
                      </div>
                    )}
                    {item.weekNumber && (
                      <div className="stat">
                        <span>Week {item.weekNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-footer">
                  <ButtonLink to={`/admin/content/${item.id}`} variant="outline" size="sm">
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
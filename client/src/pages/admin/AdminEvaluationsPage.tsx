import { useEffect, useState } from "react";
import { Card, Button, Skeleton, EmptyState, ErrorState, Field, Input, Select, Table } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminEvaluationItem } from "@tesseracareerbridge/shared";

export function AdminEvaluationsPage() {
  const [evaluations, setEvaluations] = useState<AdminEvaluationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadEvaluations();
  }, [selectedProgram, selectedBatch, selectedStatus]);

  async function loadEvaluations() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedProgram !== "all") params.append("programId", selectedProgram);
      if (selectedBatch !== "all") params.append("batchId", selectedBatch);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/v1/admins/evaluations?${params}`);
      if (!response.ok) throw new Error("Failed to load evaluations");
      const result = await response.json();
      setEvaluations(result.data);
    } catch (err) {
      setError("Failed to load evaluations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredEvaluations = evaluations.filter(evaluation =>
    evaluation.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evaluation.batchName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Evaluations Management" description="Review and manage student evaluations" />
          <div className="page-header">
            <h1>Evaluations Management</h1>
            <p className="text-muted">Review and manage student evaluations</p>
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
          <PageMeta title="Evaluations Management" description="Review and manage student evaluations" />
          <div className="page-header">
            <h1>Evaluations Management</h1>
          </div>
          <ErrorState title="Error" body={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Evaluations Management" description="Review and manage student evaluations" />
        <div className="page-header">
          <h1>Evaluations Management</h1>
          <p className="text-muted">Review and manage student evaluations and assessments</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <Field label="Search" htmlFor="search">
              <Input
                id="search"
                placeholder="Search by student or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Field>
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
            <Field label="Filter by Batch" htmlFor="batch-filter">
              <Select
                id="batch-filter"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="all">All Batches</option>
                <option value="batch1">Batch 2024-01</option>
                <option value="batch2">Batch 2024-02</option>
              </Select>
            </Field>
            <Field label="Filter by Status" htmlFor="status-filter">
              <Select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="REVIEW">Under Review</option>
              </Select>
            </Field>
          </div>
        </div>

        {filteredEvaluations.length === 0 ? (
          <EmptyState
            title="No evaluations found"
            body="No evaluations match your current filters."
          >
            <Button variant="outline" onClick={() => {
              setSelectedProgram("all");
              setSelectedBatch("all");
              setSelectedStatus("all");
              setSearchQuery("");
            }}>
              Clear Filters
            </Button>
          </EmptyState>
        ) : (
          <Card>
            <Table
              headers={["Student", "Program", "Batch", "Week", "Type", "Score", "Status", "Evaluated By", "Actions"]}
              rows={filteredEvaluations.map(evaluation => [
                evaluation.studentName,
                evaluation.programName,
                evaluation.batchName,
                `Week ${evaluation.weekNumber}: ${evaluation.weekTitle}`,
                evaluation.type,
                `${evaluation.score}/${evaluation.maxScore} (${Math.round((evaluation.score / evaluation.maxScore) * 100)}%)`,
                evaluation.status,
                evaluation.evaluatedBy,
                "View"
              ])}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
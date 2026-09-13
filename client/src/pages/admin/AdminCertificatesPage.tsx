import { useEffect, useState } from "react";
import { Card, Button, Skeleton, EmptyState, ErrorState, Field, Input, Select, Table } from "../../components/ui";
import { PageMeta } from "../../components/seo/PageMeta";
import type { AdminCertificateItem } from "@tesseracareerbridge/shared";

export function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<AdminCertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    loadCertificates();
  }, [selectedProgram, selectedStatus]);

  async function loadCertificates() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (selectedProgram !== "all") params.append("programId", selectedProgram);
      if (selectedStatus !== "all") params.append("status", selectedStatus);
      
      const response = await fetch(`/api/v1/admins/certificates?${params}`);
      if (!response.ok) throw new Error("Failed to load certificates");
      const result = await response.json();
      setCertificates(result.data);
    } catch (err) {
      setError("Failed to load certificates");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredCertificates = certificates.filter(certificate =>
    certificate.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    certificate.batchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    certificate.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <PageMeta title="Certificates Management" description="Issue and manage program completion certificates" />
          <div className="page-header">
            <h1>Certificates Management</h1>
            <p className="text-muted">Issue and manage program completion certificates</p>
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
          <PageMeta title="Certificates Management" description="Issue and manage program completion certificates" />
          <div className="page-header">
            <h1>Certificates Management</h1>
          </div>
          <ErrorState title="Error" body={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <PageMeta title="Certificates Management" description="Issue and manage program completion certificates" />
        <div className="page-header">
          <h1>Certificates Management</h1>
          <p className="text-muted">Issue, view, and manage program completion certificates</p>
        </div>

        <div className="toolbar">
          <div className="toolbar-group">
            <Field label="Search" htmlFor="search">
              <Input
                id="search"
                placeholder="Search by student, batch, or certificate number..."
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
            <Field label="Filter by Status" htmlFor="status-filter">
              <Select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="ISSUED">Issued</option>
                <option value="PENDING">Pending</option>
                <option value="REVOKED">Revoked</option>
              </Select>
            </Field>
          </div>
        </div>

        {filteredCertificates.length === 0 ? (
          <EmptyState
            title="No certificates found"
            body="No certificates match your current filters."
          >
            <Button variant="outline" onClick={() => {
              setSelectedProgram("all");
              setSelectedStatus("all");
              setSearchQuery("");
            }}>
              Clear Filters
            </Button>
          </EmptyState>
        ) : (
          <Card>
            <Table
              headers={["Student", "Program", "Batch", "Certificate Number", "Issue Date", "Expiry Date", "Status", "Actions"]}
              rows={filteredCertificates.map(certificate => [
                certificate.studentName,
                certificate.programName,
                certificate.batchName,
                certificate.certificateNumber,
                new Date(certificate.issueDate).toLocaleDateString(),
                certificate.expiryDate ? new Date(certificate.expiryDate).toLocaleDateString() : "Never",
                certificate.status,
                certificate.url ? "View / Download" : "Download"
              ])}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
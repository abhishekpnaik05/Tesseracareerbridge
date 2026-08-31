import { useState, useEffect } from "react";
import { Button, Card } from "../ui";
import { getResourceDetail, updateActivityProgress } from "../../lib/enrollments";

interface ResourceCardProps {
  enrollmentId: string;
  dayId: string;
  resourceId: string;
  title: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onComplete: () => void;
}

export function ResourceCard({ enrollmentId, dayId, resourceId, title, status, onComplete }: ResourceCardProps) {
  const [resourceData, setResourceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(status === "COMPLETED");

  useEffect(() => {
    async function loadResource() {
      try {
        setLoading(true);
        const data = await getResourceDetail(enrollmentId, dayId, resourceId);
        setResourceData(data);
      } catch (error) {
        console.error("Failed to load resource:", error);
      } finally {
        setLoading(false);
      }
    }

    loadResource();
  }, [enrollmentId, dayId, resourceId]);

  useEffect(() => {
    setIsMarkedComplete(status === "COMPLETED");
  }, [status]);

  const handleOpenResource = () => {
    if (resourceData?.storageUrl) {
      window.open(resourceData.storageUrl, "_blank");
    }
  };

  const handleMarkComplete = async () => {
    try {
      await updateActivityProgress(enrollmentId, dayId, {
        contentType: "RESOURCE",
        contentId: resourceId,
        status: "COMPLETED",
        progressPercent: 100,
      });
      setIsMarkedComplete(true);
      onComplete();
    } catch (error) {
      console.error("Failed to mark as complete:", error);
    }
  };

  if (loading) {
    return (
      <Card className="resource-card" aria-busy="true">
        <div className="resource-card__skeleton" />
      </Card>
    );
  }

  return (
    <Card className="resource-card">
      <div className="resource-card__header">
        <h3>{title}</h3>
        {resourceData?.type && <span className="resource-card__type">{resourceData.type}</span>}
      </div>

      <div className="resource-card__content">
        {resourceData?.storageUrl ? (
          <div className="resource-card__file-info">
            <div className="resource-card__file-icon">📄</div>
            <div className="resource-card__file-details">
              <p className="resource-card__file-name">{title}</p>
              <p className="resource-card__file-type">{resourceData.type}</p>
            </div>
          </div>
        ) : (
          <p className="resource-card__empty">Resource file not available.</p>
        )}
      </div>

      <div className="resource-card__actions">
        {resourceData?.storageUrl && (
          <Button variant="secondary" onClick={handleOpenResource}>
            Open Resource
          </Button>
        )}
        {!isMarkedComplete && (
          <Button variant="outline" onClick={handleMarkComplete}>
            Mark as Viewed
          </Button>
        )}
        {isMarkedComplete && (
          <Button variant="success" disabled>
            ✓ Viewed
          </Button>
        )}
      </div>
    </Card>
  );
}

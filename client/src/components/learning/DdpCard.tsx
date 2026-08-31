import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "../ui";
import { getDdpForDay, updateActivityProgress } from "../../lib/enrollments";

interface DdpCardProps {
  enrollmentId: string;
  dayId: string;
  ddpId: string;
  title: string;
  description: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onComplete: () => void;
}

export function DdpCard({ enrollmentId, dayId, ddpId, title, description, status, onComplete }: DdpCardProps) {
  const navigate = useNavigate();
  const [ddpData, setDdpData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(status === "COMPLETED");

  useEffect(() => {
    async function loadDdp() {
      try {
        setLoading(true);
        const data = await getDdpForDay(enrollmentId, dayId);
        setDdpData(data);
      } catch (error) {
        console.error("Failed to load DDP:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDdp();
  }, [enrollmentId, dayId]);

  useEffect(() => {
    setIsMarkedComplete(status === "COMPLETED");
  }, [status]);

  const handleStartDdp = () => {
    navigate(`/student/internship/${enrollmentId}/ddp/${dayId}`);
  };

  const handleMarkComplete = async () => {
    try {
      await updateActivityProgress(enrollmentId, dayId, {
        contentType: "DDP",
        contentId: ddpId,
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
      <Card className="ddp-card" aria-busy="true">
        <div className="ddp-card__skeleton" />
      </Card>
    );
  }

  return (
    <Card className="ddp-card">
      <div className="ddp-card__header">
        <h3>{title}</h3>
        <Badge tone="accent">DDP</Badge>
      </div>

      <div className="ddp-card__content">
        {description && <p className="ddp-card__description">{description}</p>}

        <div className="ddp-card__info">
          {ddpData?.ddp?.questionCount && (
            <span className="ddp-card__info-item">
              Questions: {ddpData.ddp.questionCount}
            </span>
          )}
          {ddpData?.ddp?.durationMinutes && (
            <span className="ddp-card__info-item">
              Duration: {ddpData.ddp.durationMinutes} min
            </span>
          )}
          {ddpData?.ddp?.passingScore && (
            <span className="ddp-card__info-item">
              Passing Score: {ddpData.ddp.passingScore}%
            </span>
          )}
          {ddpData?.attempts && (
            <span className="ddp-card__info-item">
              Attempts: {ddpData.attempts.used} / {ddpData.ddp.maxAttempts}
            </span>
          )}
        </div>
      </div>

      <div className="ddp-card__actions">
        {isMarkedComplete ? (
          <Button variant="success" disabled>
            ✓ Completed
          </Button>
        ) : (
          <>
            <Button variant="primary" onClick={handleStartDdp}>
              Start DDP
            </Button>
            <Button variant="outline" onClick={handleMarkComplete}>
              Mark as Complete
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

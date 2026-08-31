import { useState } from "react";
import { Button, Card } from "../ui";
import { updateActivityProgress } from "../../lib/enrollments";

interface PracticeSectionProps {
  enrollmentId: string;
  dayId: string;
  practiceId: string;
  title: string;
  instructions: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onComplete: () => void;
}

export function PracticeSection({
  enrollmentId,
  dayId,
  practiceId,
  title,
  instructions,
  status,
  onComplete,
}: PracticeSectionProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(status === "COMPLETED");

  const handleStartPractice = () => {
    setIsStarted(true);
  };

  const handleMarkComplete = async () => {
    try {
      await updateActivityProgress(enrollmentId, dayId, {
        contentType: "PRACTICE",
        contentId: practiceId,
        status: "COMPLETED",
        progressPercent: 100,
      });
      setIsMarkedComplete(true);
      onComplete();
    } catch (error) {
      console.error("Failed to mark as complete:", error);
    }
  };

  return (
    <Card className="practice-section">
      <div className="practice-section__header">
        <h3>{title}</h3>
        <span className="practice-section__label">Practice</span>
      </div>

      <div className="practice-section__content">
        {instructions ? (
          <div className="practice-section__instructions">
            <h4>Instructions</h4>
            <p>{instructions}</p>
          </div>
        ) : (
          <p className="practice-section__empty">No instructions provided yet.</p>
        )}

        {!isStarted && !isMarkedComplete && (
          <div className="practice-section__placeholder">
            <p>Complete this practice exercise to reinforce your learning.</p>
            <Button variant="primary" onClick={handleStartPractice}>
              Start Practice
            </Button>
          </div>
        )}

        {isStarted && !isMarkedComplete && (
          <div className="practice-section__workspace">
            <div className="practice-section__workspace-placeholder">
              <p>Practice workspace</p>
              <p className="practice-section__workspace-text">
                The complete coding practice engine will be implemented in a future update.
                For now, complete this exercise in your development environment.
              </p>
            </div>
            <Button variant="primary" onClick={handleMarkComplete}>
              Mark as Complete
            </Button>
          </div>
        )}

        {isMarkedComplete && (
          <div className="practice-section__completed">
            <p>✓ Practice completed</p>
          </div>
        )}
      </div>
    </Card>
  );
}

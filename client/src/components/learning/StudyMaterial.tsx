import { useState, useEffect } from "react";
import { Button, Card } from "../ui";
import { updateActivityProgress } from "../../lib/enrollments";

interface StudyMaterialProps {
  title: string;
  content: string;
  readingTime: number | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onComplete: () => void;
  enrollmentId?: string;
  dayId?: string;
  contentId?: string;
  contentType?: "LESSON" | "NOTE";
}

export function StudyMaterial({ title, content, readingTime, status, onComplete, enrollmentId, dayId, contentId, contentType = "NOTE" }: StudyMaterialProps) {
  const [isReading, setIsReading] = useState(false);
  const [isMarkedComplete, setIsMarkedComplete] = useState(status === "COMPLETED");

  useEffect(() => {
    setIsMarkedComplete(status === "COMPLETED");
  }, [status]);

  const handleStartReading = () => {
    setIsReading(true);
  };

  const handleMarkComplete = async () => {
    try {
      if (enrollmentId && dayId && contentId) {
        await updateActivityProgress(enrollmentId, dayId, {
          contentType: contentType,
          contentId,
          status: "COMPLETED",
          progressPercent: 100,
        });
      }
      setIsMarkedComplete(true);
      onComplete();
    } catch (error) {
      console.error("Failed to mark as complete:", error);
    }
  };

  const formatContent = (text: string) => {
    // Simple markdown-like formatting
    return text
      .split("\n\n")
      .map((paragraph, index) => {
        if (paragraph.startsWith("# ")) {
          return <h2 key={index}>{paragraph.replace("# ", "")}</h2>;
        }
        if (paragraph.startsWith("## ")) {
          return <h3 key={index}>{paragraph.replace("## ", "")}</h3>;
        }
        if (paragraph.startsWith("- ")) {
          return (
            <ul key={index}>
              {paragraph
                .split("\n")
                .map((item, i) => item.startsWith("- ") && <li key={i}>{item.replace("- ", "")}</li>)}
            </ul>
          );
        }
        if (paragraph.match(/^\d+\./)) {
          return (
            <ol key={index}>
              {paragraph
                .split("\n")
                .map((item, i) => item.match(/^\d+\./) && <li key={i}>{item.replace(/^\d+\.\s/, "")}</li>)}
            </ol>
          );
        }
        // Check for code blocks
        if (paragraph.startsWith("```")) {
          return (
            <pre key={index}>
              <code>{paragraph.replace(/```\w*\n?/g, "")}</code>
            </pre>
          );
        }
        return <p key={index}>{paragraph}</p>;
      });
  };

  return (
    <Card className="study-material">
      <div className="study-material__header">
        <h3>{title}</h3>
        {readingTime && <span className="study-material__reading-time">{readingTime} min read</span>}
      </div>

      <div className="study-material__content">
        {content ? (
          <div className="study-material__body">{formatContent(content)}</div>
        ) : (
          <p className="study-material__empty">No content available yet.</p>
        )}
      </div>

      <div className="study-material__actions">
        {isMarkedComplete ? (
          <Button variant="success" disabled>
            ✓ Completed
          </Button>
        ) : isReading ? (
          <Button variant="primary" onClick={handleMarkComplete}>
            Mark as Complete
          </Button>
        ) : (
          <Button variant="secondary" onClick={handleStartReading}>
            Start Reading
          </Button>
        )}
      </div>
    </Card>
  );
}

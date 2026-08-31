import { Button, Card, Badge } from "../ui";
import type { DdpHistoryDto } from "@tesseracareerbridge/shared";

interface DdpAttemptHistoryProps {
  history: DdpHistoryDto;
  onStart?: () => void;
  onBack: () => void;
}

export function DdpAttemptHistory({ history, onStart, onBack }: DdpAttemptHistoryProps) {
  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  return (
    <div className="ddp-attempt-history">
      <Card className="ddp-attempt-history-card">
        <div className="ddp-attempt-history-card__header">
          <h1>Attempt History</h1>
          <Badge tone="accent">
            {history.attempts.length} attempt{history.attempts.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="ddp-attempt-history-card__info">
          <div className="ddp-attempt-history-card__info-item">
            <span className="ddp-attempt-history-card__info-label">DDP</span>
            <span className="ddp-attempt-history-card__info-value">{history.ddp.title}</span>
          </div>
          <div className="ddp-attempt-history-card__info-item">
            <span className="ddp-attempt-history-card__info-label">Max Attempts</span>
            <span className="ddp-attempt-history-card__info-value">{history.ddp.maxAttempts}</span>
          </div>
          <div className="ddp-attempt-history-card__info-item">
            <span className="ddp-attempt-history-card__info-label">Passing Score</span>
            <span className="ddp-attempt-history-card__info-value">{history.ddp.passingScore}%</span>
          </div>
        </div>

        {history.attempts.length > 0 ? (
          <div className="ddp-attempt-history-card__table">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Attempt</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Spent</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {history.attempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>#{attempt.attemptNumber}</td>
                    <td>
                      <Badge tone={attempt.passed ? "success" : attempt.status === "EXPIRED" ? "danger" : "accent"}>
                        {attempt.passed ? "Passed" : attempt.status}
                      </Badge>
                    </td>
                    <td>{attempt.score ?? "N/A"}</td>
                    <td>{attempt.percentage ?? "N/A"}%</td>
                    <td>{formatTime(attempt.timeSpent)}</td>
                    <td>{formatDate(attempt.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ddp-attempt-history-card__empty">
            <p>No attempts yet. Start your first attempt to track your progress.</p>
          </div>
        )}

        <div className="ddp-attempt-history-card__actions">
          <Button variant="outline" onClick={onBack}>
            Back to Day
          </Button>
          {onStart && (
            <Button variant="primary" onClick={onStart}>
              Start New Attempt
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

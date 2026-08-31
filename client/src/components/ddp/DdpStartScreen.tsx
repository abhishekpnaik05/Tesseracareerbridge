import { Button, Card, Badge } from "../ui";

interface DdpStartScreenProps {
  ddp: {
    id: string;
    title: string;
    description: string | null;
    instructions: string | null;
    durationMinutes: number;
    passingScore: number;
    maxAttempts: number;
    questionCount: number;
  };
  attempts: {
    used: number;
    remaining: number;
    history: Array<{
      id: string;
      attemptNumber: number;
      status: string;
      score: number | null;
      percentage: number | null;
      passed: boolean | null;
      submittedAt: string | null;
    }>;
  };
  onStart: () => void;
  onViewHistory?: () => void;
  loading: boolean;
}

export function DdpStartScreen({ ddp, attempts, onStart, onViewHistory, loading }: DdpStartScreenProps) {
  const hasAttempts = attempts.used > 0;
  const canRetry = attempts.remaining > 0;
  const bestAttempt = attempts.history.sort((a, b) => (b.percentage || 0) - (a.percentage || 0))[0];

  return (
    <div className="ddp-start-screen">
      <Card className="ddp-start-card">
        <div className="ddp-start-card__header">
          <h1>{ddp.title}</h1>
          <Badge tone="accent">DDP</Badge>
        </div>

        {ddp.description && <p className="ddp-start-card__description">{ddp.description}</p>}

        <div className="ddp-start-card__info">
          <div className="ddp-start-card__info-item">
            <span className="ddp-start-card__info-label">Questions</span>
            <span className="ddp-start-card__info-value">{ddp.questionCount}</span>
          </div>
          <div className="ddp-start-card__info-item">
            <span className="ddp-start-card__info-label">Duration</span>
            <span className="ddp-start-card__info-value">{ddp.durationMinutes} minutes</span>
          </div>
          <div className="ddp-start-card__info-item">
            <span className="ddp-start-card__info-label">Passing Score</span>
            <span className="ddp-start-card__info-value">{ddp.passingScore}%</span>
          </div>
          <div className="ddp-start-card__info-item">
            <span className="ddp-start-card__info-label">Attempts</span>
            <span className="ddp-start-card__info-value">
              {attempts.used} / {ddp.maxAttempts}
            </span>
          </div>
        </div>

        {ddp.instructions && (
          <div className="ddp-start-card__instructions">
            <h3>Instructions</h3>
            <p>{ddp.instructions}</p>
          </div>
        )}

        {hasAttempts && bestAttempt && (
          <div className="ddp-start-card__best-attempt">
            <h3>Best Attempt</h3>
            <div className="ddp-start-card__best-attempt-stats">
              <span>Score: {bestAttempt.score} / {ddp.questionCount}</span>
              <span>Percentage: {bestAttempt.percentage}%</span>
              <span>Status: {bestAttempt.passed ? "Passed" : "Not Passed"}</span>
            </div>
          </div>
        )}

        <div className="ddp-start-card__actions">
          {canRetry ? (
            <Button variant="primary" onClick={onStart} loading={loading}>
              Start DDP
            </Button>
          ) : (
            <Button variant="primary" disabled>
              No Attempts Remaining
            </Button>
          )}
          {onViewHistory && (
            <Button variant="outline" onClick={onViewHistory}>
              View History
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

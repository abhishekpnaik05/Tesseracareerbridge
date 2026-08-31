import { Button, Card, Badge } from "../ui";
import type { DdpResultDto } from "@tesseracareerbridge/shared";

interface DdpResultPageProps {
  result: DdpResultDto;
  attempts: {
    used: number;
    remaining: number;
  };
  onViewAnswers: () => void;
  onRetry?: () => void;
  onContinue: () => void;
}

export function DdpResultPage({ result, attempts, onViewAnswers, onRetry, onContinue }: DdpResultPageProps) {
  const passed = result.attempt.passed;
  const score = result.attempt.score;
  const totalPoints = result.questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = result.attempt.percentage;
  const timeSpent = result.attempt.timeSpent ? Math.floor(result.attempt.timeSpent / 60) : 0;

  return (
    <div className="ddp-result-page">
      <Card className={`ddp-result-card ${passed ? "ddp-result-card--passed" : "ddp-result-card--failed"}`}>
        <div className="ddp-result-card__header">
          <h1>{passed ? "🎉 Congratulations!" : "Keep Practicing!"}</h1>
          <Badge tone={passed ? "success" : "danger"}>
            {passed ? "Passed" : "Not Passed"}
          </Badge>
        </div>

        <div className="ddp-result-card__summary">
          <div className="ddp-result-card__score">
            <span className="ddp-result-card__score-label">Your Score</span>
            <span className="ddp-result-card__score-value">{score} / {totalPoints}</span>
            <span className="ddp-result-card__score-percentage">{percentage}%</span>
          </div>

          <div className="ddp-result-card__info">
            <div className="ddp-result-card__info-item">
              <span className="ddp-result-card__info-label">Passing Score</span>
              <span className="ddp-result-card__info-value">{result.ddp.passingScore}%</span>
            </div>
            <div className="ddp-result-card__info-item">
              <span className="ddp-result-card__info-label">Time Spent</span>
              <span className="ddp-result-card__info-value">{timeSpent} minutes</span>
            </div>
            <div className="ddp-result-card__info-item">
              <span className="ddp-result-card__info-label">Attempt</span>
              <span className="ddp-result-card__info-value">
                {result.attempt.attemptNumber} / {attempts.used + attempts.remaining}
              </span>
            </div>
          </div>
        </div>

        <div className="ddp-result-card__stats">
          <div className="ddp-result-card__stat">
            <span className="ddp-result-card__stat-label">Correct</span>
            <span className="ddp-result-card__stat-value ddp-result-card__stat-value--success">
              {result.questions.filter((q) => q.isCorrect).length}
            </span>
          </div>
          <div className="ddp-result-card__stat">
            <span className="ddp-result-card__stat-label">Incorrect</span>
            <span className="ddp-result-card__stat-value ddp-result-card__stat-value--danger">
              {result.questions.filter((q) => !q.isCorrect).length}
            </span>
          </div>
          <div className="ddp-result-card__stat">
            <span className="ddp-result-card__stat-label">Points Earned</span>
            <span className="ddp-result-card__stat-value">
              {result.questions.reduce((sum, q) => sum + q.pointsAwarded, 0)}
            </span>
          </div>
        </div>

        <div className="ddp-result-card__actions">
          <Button variant="outline" onClick={onViewAnswers}>
            Review Answers
          </Button>
          {onRetry && (
            <Button variant="accent" onClick={onRetry}>
              Try Again ({attempts.remaining} attempts left)
            </Button>
          )}
          <Button variant="primary" onClick={onContinue}>
            Continue Learning
          </Button>
        </div>
      </Card>
    </div>
  );
}

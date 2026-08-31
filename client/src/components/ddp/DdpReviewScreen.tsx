import { Button, Card, Badge } from "../ui";
import type { DdpQuestionDto } from "@tesseracareerbridge/shared";

interface DdpReviewScreenProps {
  questions: DdpQuestionDto[];
  currentIndex: number;
  onQuestionChange: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export function DdpReviewScreen({
  questions,
  currentIndex,
  onQuestionChange,
  onBack,
  onSubmit,
}: DdpReviewScreenProps) {
  const answeredCount = questions.filter((q) => q.selectedOptionIds.length > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const canSubmit = unansweredCount === 0;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="ddp-review-screen">
      <div className="ddp-review-screen__header">
        <h1>Review Your Answers</h1>
        <div className="ddp-review-screen__stats">
          <Badge tone={answeredCount === questions.length ? "success" : "accent"}>
            Answered: {answeredCount} / {questions.length}
          </Badge>
          {unansweredCount > 0 && (
            <Badge tone="danger">
              Unanswered: {unansweredCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="ddp-review-screen__content">
        <div className="ddp-review-screen__main">
          <Card className="ddp-review-card">
            <div className="ddp-review-card__header">
              <span className="ddp-review-card__number">Question {currentIndex + 1}</span>
              <span className="ddp-review-card__points">{currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}</span>
            </div>
            <h2 className="ddp-review-card__prompt">{currentQuestion.prompt}</h2>
            <div className="ddp-review-card__answers">
              {currentQuestion.selectedOptionIds.length > 0 ? (
                <div className="ddp-review-card__selected">
                  <p>Your answer:</p>
                  <ul>
                    {currentQuestion.selectedOptionIds.map((optionId) => {
                      const option = currentQuestion.options.find((o) => o.id === optionId);
                      return <li key={optionId}>{option?.text}</li>;
                    })}
                  </ul>
                </div>
              ) : (
                <p className="ddp-review-card__unanswered">No answer selected</p>
              )}
            </div>
          </Card>
        </div>

        <div className="ddp-review-screen__sidebar">
          <div className="ddp-review-list">
            <h3>Question Summary</h3>
            <div className="ddp-review-list__items">
              {questions.map((q, index) => (
                <button
                  key={index}
                  className={`ddp-review-item ${index === currentIndex ? "ddp-review-item--current" : ""} ${q.selectedOptionIds.length > 0 ? "ddp-review-item--answered" : "ddp-review-item--unanswered"}`}
                  onClick={() => onQuestionChange(index)}
                >
                  <span className="ddp-review-item__number">{index + 1}</span>
                  <span className="ddp-review-item__status">
                    {q.selectedOptionIds.length > 0 ? "Answered" : "Unanswered"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ddp-review-screen__footer">
        <Button variant="outline" onClick={onBack}>
          Back to Questions
        </Button>
        <Button
          variant={canSubmit ? "primary" : "accent"}
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {canSubmit ? "Submit DDP" : `Answer ${unansweredCount} Question${unansweredCount > 1 ? "s" : ""} First`}
        </Button>
      </div>
    </div>
  );
}

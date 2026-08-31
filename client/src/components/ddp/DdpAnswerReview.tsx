import { useState } from "react";
import { Button, Card, Badge } from "../ui";
import type { DdpResultDto } from "@tesseracareerbridge/shared";

interface DdpAnswerReviewProps {
  result: DdpResultDto;
  onBack: () => void;
  onContinue: () => void;
}

export function DdpAnswerReview({ result, onBack, onContinue }: DdpAnswerReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = result.questions[currentIndex];

  return (
    <div className="ddp-answer-review">
      <div className="ddp-answer-review__header">
        <h1>Answer Review</h1>
        <Badge tone="accent">
          Question {currentIndex + 1} of {result.questions.length}
        </Badge>
      </div>

      <div className="ddp-answer-review__content">
        <div className="ddp-answer-review__main">
          <Card className={`ddp-answer-review-card ${currentQuestion.isCorrect ? "ddp-answer-review-card--correct" : "ddp-answer-review-card--incorrect"}`}>
            <div className="ddp-answer-review-card__header">
              <span className="ddp-answer-review-card__number">Question {currentIndex + 1}</span>
              <Badge tone={currentQuestion.isCorrect ? "success" : "danger"}>
                {currentQuestion.isCorrect ? "Correct" : "Incorrect"}
              </Badge>
              <span className="ddp-answer-review-card__points">
                {currentQuestion.pointsAwarded} / {currentQuestion.points} points
              </span>
            </div>

            <h2 className="ddp-answer-review-card__prompt">{currentQuestion.prompt}</h2>

            <div className="ddp-answer-review-card__your-answer">
              <h3>Your Answer</h3>
              <ul>
                {currentQuestion.yourAnswer.map((answerId) => {
                  const option = currentQuestion.correctAnswer.find((o) => o.id === answerId);
                  return <li key={answerId}>{option?.text || answerId}</li>;
                })}
              </ul>
            </div>

            <div className="ddp-answer-review-card__correct-answer">
              <h3>Correct Answer</h3>
              <ul>
                {currentQuestion.correctAnswer.map((option) => (
                  <li key={option.id}>{option.text}</li>
                ))}
              </ul>
            </div>

            {currentQuestion.explanation && (
              <div className="ddp-answer-review-card__explanation">
                <h3>Explanation</h3>
                <p>{currentQuestion.explanation}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="ddp-answer-review__sidebar">
          <div className="ddp-answer-review-list">
            <h3>Question Navigator</h3>
            <div className="ddp-answer-review-list__items">
              {result.questions.map((q, index) => (
                <button
                  key={index}
                  className={`ddp-answer-review-item ${index === currentIndex ? "ddp-answer-review-item--current" : ""} ${q.isCorrect ? "ddp-answer-review-item--correct" : "ddp-answer-review-item--incorrect"}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <span className="ddp-answer-review-item__number">{index + 1}</span>
                  <span className="ddp-answer-review-item__status">
                    {q.isCorrect ? "✓" : "✗"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ddp-answer-review__footer">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.min(result.questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === result.questions.length - 1}
        >
          Next
        </Button>
        <Button variant="outline" onClick={onBack}>
          Back to Results
        </Button>
        <Button variant="primary" onClick={onContinue}>
          Continue Learning
        </Button>
      </div>
    </div>
  );
}

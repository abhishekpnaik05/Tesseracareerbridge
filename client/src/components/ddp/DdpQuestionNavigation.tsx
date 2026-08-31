import type { DdpQuestionDto } from "@tesseracareerbridge/shared";

interface DdpQuestionNavigationProps {
  questions: DdpQuestionDto[];
  currentIndex: number;
  onQuestionChange: (index: number) => void;
  flaggedQuestions: Set<number>;
}

export function DdpQuestionNavigation({
  questions,
  currentIndex,
  onQuestionChange,
  flaggedQuestions,
}: DdpQuestionNavigationProps) {
  const getStatusClass = (index: number) => {
    const question = questions[index];
    const isAnswered = question.selectedOptionIds.length > 0;
    const isFlagged = flaggedQuestions.has(index);
    const isCurrent = index === currentIndex;

    let classes = "ddp-nav-item";

    if (isCurrent) {
      classes += " ddp-nav-item--current";
    } else if (isFlagged) {
      classes += " ddp-nav-item--flagged";
    } else if (isAnswered) {
      classes += " ddp-nav-item--answered";
    } else {
      classes += " ddp-nav-item--unanswered";
    }

    return classes;
  };

  return (
    <div className="ddp-question-navigation">
      <div className="ddp-question-navigation__header">
        <h3>Question Navigator</h3>
        <div className="ddp-question-navigation__legend">
          <span className="ddp-nav-legend-item ddp-nav-legend-item--answered">Answered</span>
          <span className="ddp-nav-legend-item ddp-nav-legend-item--unanswered">Unanswered</span>
          <span className="ddp-nav-legend-item ddp-nav-legend-item--flagged">Flagged</span>
        </div>
      </div>
      <div className="ddp-question-navigation__grid">
        {questions.map((_, index) => (
          <button
            key={index}
            className={getStatusClass(index)}
            onClick={() => onQuestionChange(index)}
            aria-label={`Question ${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

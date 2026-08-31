import type { DdpQuestionDto } from "@tesseracareerbridge/shared";

interface McqSingleQuestionProps {
  question: DdpQuestionDto;
  onAnswerChange: (questionId: string, selectedOptionIds: string[]) => void;
}

export function McqSingleQuestion({ question, onAnswerChange }: McqSingleQuestionProps) {
  const handleOptionChange = (optionId: string) => {
    onAnswerChange(question.id, [optionId]);
  };

  return (
    <div className="ddp-question-answers">
      {question.options.map((option) => (
        <label key={option.id} className="ddp-answer-option">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.id}
            checked={question.selectedOptionIds.includes(option.id)}
            onChange={() => handleOptionChange(option.id)}
          />
          <span className="ddp-answer-option__text">{option.text}</span>
        </label>
      ))}
    </div>
  );
}

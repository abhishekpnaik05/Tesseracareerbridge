import type { DdpQuestionDto } from "@tesseracareerbridge/shared";

interface TrueFalseQuestionProps {
  question: DdpQuestionDto;
  onAnswerChange: (questionId: string, selectedOptionIds: string[]) => void;
}

export function TrueFalseQuestion({ question, onAnswerChange }: TrueFalseQuestionProps) {
  const handleOptionChange = (optionId: string) => {
    onAnswerChange(question.id, [optionId]);
  };

  return (
    <div className="ddp-question-answers">
      {question.options.map((option) => (
        <label key={option.id} className="ddp-answer-option ddp-answer-option--true-false">
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

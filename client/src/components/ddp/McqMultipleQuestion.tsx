import type { DdpQuestionDto } from "@tesseracareerbridge/shared";

interface McqMultipleQuestionProps {
  question: DdpQuestionDto;
  onAnswerChange: (questionId: string, selectedOptionIds: string[]) => void;
}

export function McqMultipleQuestion({ question, onAnswerChange }: McqMultipleQuestionProps) {
  const handleOptionChange = (optionId: string, checked: boolean) => {
    const selected = new Set(question.selectedOptionIds);
    if (checked) {
      selected.add(optionId);
    } else {
      selected.delete(optionId);
    }
    onAnswerChange(question.id, Array.from(selected));
  };

  return (
    <div className="ddp-question-answers">
      <p className="ddp-question-answers__hint">Select all that apply</p>
      {question.options.map((option) => (
        <label key={option.id} className="ddp-answer-option">
          <input
            type="checkbox"
            value={option.id}
            checked={question.selectedOptionIds.includes(option.id)}
            onChange={(e) => handleOptionChange(option.id, e.target.checked)}
          />
          <span className="ddp-answer-option__text">{option.text}</span>
        </label>
      ))}
    </div>
  );
}

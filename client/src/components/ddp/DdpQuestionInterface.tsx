import { useState, useEffect } from "react";
import { Button, Card, Badge } from "../ui";
import type { DdpQuestionsDto, DdpQuestionDto } from "@tesseracareerbridge/shared";
import { DdpTimer } from "./DdpTimer";
import { DdpQuestionNavigation } from "./DdpQuestionNavigation";
import { McqSingleQuestion } from "./McqSingleQuestion";
import { McqMultipleQuestion } from "./McqMultipleQuestion";
import { TrueFalseQuestion } from "./TrueFalseQuestion";

interface DdpQuestionInterfaceProps {
  questions: DdpQuestionsDto;
  currentIndex: number;
  onQuestionChange: (index: number) => void;
  onAnswerChange: (questionId: string, selectedOptionIds: string[]) => void;
  onReview: (updatedQuestions: DdpQuestionDto[]) => void;
  onSubmit: () => void;
}

export function DdpQuestionInterface({
  questions,
  currentIndex,
  onQuestionChange,
  onAnswerChange,
  onReview,
  onSubmit,
}: DdpQuestionInterfaceProps) {
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [localAnswers, setLocalAnswers] = useState<Map<string, string[]>>(new Map());

  const currentQuestion = questions.questions[currentIndex];

  // Initialize local answers from questions data
  useEffect(() => {
    const answersMap = new Map<string, string[]>();
    questions.questions.forEach((q) => {
      answersMap.set(q.id, q.selectedOptionIds);
    });
    setLocalAnswers(answersMap);
  }, [questions.questions]);

  const handleFlagToggle = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(currentIndex)) {
      newFlagged.delete(currentIndex);
    } else {
      newFlagged.add(currentIndex);
    }
    setFlaggedQuestions(newFlagged);
  };

  const handleReview = () => {
    // Pass the updated questions with local answers to the review screen
    const updatedQuestions = questions.questions.map((q) => ({
      ...q,
      selectedOptionIds: localAnswers.get(q.id) || q.selectedOptionIds,
    }));
    onReview(updatedQuestions);
  };

  const isFlagged = flaggedQuestions.has(currentIndex);

  const handleAnswerChange = (questionId: string, selectedOptionIds: string[]) => {
    // Update local state immediately for UI feedback
    setLocalAnswers((prev) => new Map(prev).set(questionId, selectedOptionIds));
    // Also call parent to save to server
    onAnswerChange(questionId, selectedOptionIds);
  };

  // Get the current selected options from local state
  const currentSelectedOptions = localAnswers.get(currentQuestion.id) || currentQuestion.selectedOptionIds;
  const currentQuestionWithLocalAnswer = { ...currentQuestion, selectedOptionIds: currentSelectedOptions };

  const getQuestionComponent = () => {
    switch (currentQuestionWithLocalAnswer.type) {
      case "MCQ_SINGLE":
        return (
          <McqSingleQuestion
            question={currentQuestionWithLocalAnswer}
            onAnswerChange={handleAnswerChange}
          />
        );
      case "MCQ_MULTIPLE":
        return (
          <McqMultipleQuestion
            question={currentQuestionWithLocalAnswer}
            onAnswerChange={handleAnswerChange}
          />
        );
      case "TRUE_FALSE":
        return (
          <TrueFalseQuestion
            question={currentQuestionWithLocalAnswer}
            onAnswerChange={handleAnswerChange}
          />
        );
      default:
        return <p>Unsupported question type: {currentQuestionWithLocalAnswer.type}</p>;
    }
  };

  return (
    <div className="ddp-question-interface">
      <div className="ddp-question-interface__header">
        <div className="ddp-question-interface__timer">
          <DdpTimer
            durationMinutes={questions.ddp.durationMinutes}
            startedAt={questions.attempt.startedAt}
            onExpire={onSubmit}
          />
        </div>
        <div className="ddp-question-interface__progress">
          <Badge tone="accent">
            Question {currentIndex + 1} of {questions.questions.length}
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFlagToggle}
          className={isFlagged ? "ddp-question-interface__flag-btn--flagged" : ""}
        >
          {isFlagged ? "🚩 Flagged" : "🚩 Flag for Review"}
        </Button>
      </div>

      <div className="ddp-question-interface__content">
        <div className="ddp-question-interface__main">
          <Card className="ddp-question-card">
            <div className="ddp-question-card__header">
              <span className="ddp-question-card__number">Question {currentIndex + 1}</span>
              <span className="ddp-question-card__points">{currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}</span>
            </div>
            <h2 className="ddp-question-card__prompt">{currentQuestion.prompt}</h2>
            <div className="ddp-question-card__answers">{getQuestionComponent()}</div>
          </Card>
        </div>

        <div className="ddp-question-interface__sidebar">
          <DdpQuestionNavigation
            questions={questions.questions.map((q) => ({
              ...q,
              selectedOptionIds: localAnswers.get(q.id) || q.selectedOptionIds,
            }))}
            currentIndex={currentIndex}
            onQuestionChange={onQuestionChange}
            flaggedQuestions={flaggedQuestions}
          />
        </div>
      </div>

      <div className="ddp-question-interface__footer">
        <Button
          variant="outline"
          onClick={() => onQuestionChange(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          onClick={() => onQuestionChange(Math.min(questions.questions.length - 1, currentIndex + 1))}
          disabled={currentIndex === questions.questions.length - 1}
        >
          Next
        </Button>
        <Button variant="accent" onClick={handleReview}>
          Review & Submit
        </Button>
      </div>
    </div>
  );
}

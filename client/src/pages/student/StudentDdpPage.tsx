import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { DdpDataDto, DdpQuestionsDto, DdpResultDto, DdpHistoryDto, DdpQuestionDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../../components/seo/PageMeta";
import { Button, ButtonLink, EmptyState, ErrorState, Skeleton, Badge, Modal } from "../../components/ui";
import {
  getDdpForDay,
  startDdpAttempt,
  getDdpQuestions,
  saveDdpAnswer,
  submitDdpAttempt,
  getDdpResult,
  getDdpHistory,
} from "../../lib/enrollments";
import { DdpStartScreen } from "../../components/ddp/DdpStartScreen";
import { DdpQuestionInterface } from "../../components/ddp/DdpQuestionInterface";
import { DdpReviewScreen } from "../../components/ddp/DdpReviewScreen";
import { DdpResultPage } from "../../components/ddp/DdpResultPage";
import { DdpAnswerReview } from "../../components/ddp/DdpAnswerReview";
import { DdpAttemptHistory } from "../../components/ddp/DdpAttemptHistory";

type DdpPageState = "loading" | "ready" | "error" | "missing" | "start" | "question" | "review" | "result" | "answer-review" | "history";

export function StudentDdpPage() {
  const { enrollmentId, dayId } = useParams();
  const navigate = useNavigate();
  const [ddpData, setDdpData] = useState<DdpDataDto | null>(null);
  const [questionsData, setQuestionsData] = useState<DdpQuestionsDto | null>(null);
  const [resultData, setResultData] = useState<DdpResultDto | null>(null);
  const [historyData, setHistoryData] = useState<DdpHistoryDto | null>(null);
  const [reviewQuestions, setReviewQuestions] = useState<DdpQuestionDto[] | null>(null);
  const [pageState, setPageState] = useState<DdpPageState>("loading");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDdp() {
      if (!enrollmentId || !dayId) {
        setPageState("missing");
        return;
      }
      try {
        const data = await getDdpForDay(enrollmentId, dayId);
        setDdpData(data);

        if (data.activeAttempt) {
          setAttemptId(data.activeAttempt.attemptId);
          await loadQuestions(data.activeAttempt.attemptId);
          setPageState("question");
        } else if (data.attempts.remaining > 0) {
          setPageState("start");
        } else {
          setPageState("history");
          await loadHistory(data.ddp.id);
        }
      } catch (error) {
        setPageState("error");
      }
    }

    loadDdp();
  }, [enrollmentId, dayId]);

  const loadQuestions = async (activeAttemptId: string) => {
    try {
      const data = await getDdpQuestions(activeAttemptId, enrollmentId!);
      setQuestionsData(data);
      setCurrentQuestionIndex(0);
    } catch (error) {
      console.error("Failed to load questions:", error);
    }
  };

  const loadHistory = async (ddpId: string) => {
    try {
      const data = await getDdpHistory(ddpId, enrollmentId!);
      setHistoryData(data);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleStartDdp = async () => {
    if (!ddpData) return;

    try {
      setLoading(true);
      const attempt = await startDdpAttempt(ddpData.ddp.id, enrollmentId!, dayId!);
      setAttemptId(attempt.attemptId);
      await loadQuestions(attempt.attemptId);
      setPageState("question");
    } catch (error) {
      console.error("Failed to start DDP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerChange = async (questionId: string, selectedOptionIds: string[]) => {
    if (!attemptId) return;

    try {
      await saveDdpAnswer(attemptId, questionId, selectedOptionIds, enrollmentId!);
    } catch (error) {
      console.error("Failed to save answer:", error);
    }
  };

  const handleReview = (updatedQuestions: DdpQuestionDto[]) => {
    setReviewQuestions(updatedQuestions);
    setPageState("review");
  };

  const handleSubmit = async () => {
    if (!attemptId) return;

    try {
      setLoading(true);
      const result = await submitDdpAttempt(attemptId, enrollmentId!);
      setResultData(result as unknown as DdpResultDto);
      setPageState("result");
    } catch (error) {
      console.error("Failed to submit DDP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnswers = async () => {
    if (!attemptId) return;

    try {
      setLoading(true);
      const result = await getDdpResult(attemptId, enrollmentId!);
      setResultData(result);
      setPageState("answer-review");
    } catch (error) {
      console.error("Failed to load result:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setAttemptId(null);
    setQuestionsData(null);
    setPageState("start");
  };

  const handleViewHistory = async () => {
    if (!ddpData) return;

    try {
      setLoading(true);
      await loadHistory(ddpData.ddp.id);
      setPageState("history");
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDay = () => {
    navigate(`/student/internship/${enrollmentId}/day/${dayId}`);
  };

  if (pageState === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <Skeleton style={{ height: 400, marginTop: 24 }} />
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load DDP." body="Try again in a moment.">
          <ButtonLink to="/student/internships">Back to My Internships</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (pageState === "missing" || !ddpData) {
    return (
      <div className="container page-hero">
        <EmptyState title="DDP not found." body="This DDP does not exist or you don't have access to it.">
          <ButtonLink to="/student/internships">Back to My Internships</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${ddpData.ddp.title} | DDP`}
        description={ddpData.ddp.description || "Daily Development Practice"}
      />
      <div className="container ddp-page">
        <div className="ddp-page__header">
          <ButtonLink to={`/student/internship/${enrollmentId}/day/${dayId}`} variant="ghost" size="sm">
            ← Back to Day
          </ButtonLink>
          <Badge tone="accent">DDP</Badge>
        </div>

        {pageState === "start" && (
          <DdpStartScreen
            ddp={ddpData.ddp}
            attempts={ddpData.attempts}
            onStart={handleStartDdp}
            onViewHistory={ddpData.attempts.used > 0 ? handleViewHistory : undefined}
            loading={loading}
          />
        )}

        {pageState === "question" && questionsData && (
          <DdpQuestionInterface
            questions={questionsData}
            currentIndex={currentQuestionIndex}
            onQuestionChange={handleQuestionChange}
            onAnswerChange={handleAnswerChange}
            onReview={handleReview}
            onSubmit={() => setShowSubmitModal(true)}
          />
        )}

        {pageState === "review" && reviewQuestions && (
          <DdpReviewScreen
            questions={reviewQuestions}
            currentIndex={currentQuestionIndex}
            onQuestionChange={handleQuestionChange}
            onBack={() => setPageState("question")}
            onSubmit={() => setShowSubmitModal(true)}
          />
        )}

        {pageState === "result" && resultData && (
          <DdpResultPage
            result={resultData}
            attempts={ddpData.attempts}
            onViewAnswers={handleViewAnswers}
            onRetry={ddpData.attempts.remaining > 0 ? handleRetry : undefined}
            onContinue={handleBackToDay}
          />
        )}

        {pageState === "answer-review" && resultData && (
          <DdpAnswerReview
            result={resultData}
            onBack={() => setPageState("result")}
            onContinue={handleBackToDay}
          />
        )}

        {pageState === "history" && historyData && (
          <DdpAttemptHistory
            history={historyData}
            onStart={ddpData.attempts.remaining > 0 ? () => setPageState("start") : undefined}
            onBack={handleBackToDay}
          />
        )}

        <Modal
          open={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          title="Submit DDP"
        >
          {questionsData && (
            <div className="ddp-submit-modal">
              <p>Are you sure you want to submit your DDP?</p>
              <div className="ddp-submit-modal__stats">
                <span>Total questions: {questionsData.questions.length}</span>
                <span>Answered: {questionsData.questions.filter((q) => q.selectedOptionIds.length > 0).length}</span>
              </div>
              <div className="ddp-submit-modal__actions">
                <Button variant="outline" onClick={() => setShowSubmitModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => { setShowSubmitModal(false); handleSubmit(); }} loading={loading}>
                  Submit
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { DayDetailDto, LearningContentDto } from "@tesseracareerbridge/shared";
import { PageMeta } from "../../components/seo/PageMeta";
import { Badge, Button, ButtonLink, Card, EmptyState, ErrorState, Skeleton, ProgressBar } from "../../components/ui";
import { getDayDetail, updateActivityProgress } from "../../lib/enrollments";
import { VideoLesson } from "../../components/learning/VideoLesson";
import { StudyMaterial } from "../../components/learning/StudyMaterial";
import { ResourceCard } from "../../components/learning/ResourceCard";
import { PracticeSection } from "../../components/learning/PracticeSection";
import { DdpCard } from "../../components/learning/DdpCard";
import { AssignmentCard } from "../../components/learning/AssignmentCard";
import { DayChecklist } from "../../components/learning/DayChecklist";

export function StudentDayPage() {
  const { id: enrollmentId, dayId } = useParams();
  const navigate = useNavigate();
  const [dayDetail, setDayDetail] = useState<DayDetailDto | null>(null);
  const [activeContent, setActiveContent] = useState<LearningContentDto | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">("loading");

  useEffect(() => {
    if (!enrollmentId || !dayId) {
      setStatus("missing");
      return;
    }

    async function loadData() {
      try {
        console.log("Loading day detail:", { enrollmentId, dayId });
        const data = await getDayDetail(enrollmentId!, dayId!);
        console.log("Day detail loaded:", data);
        setDayDetail(data);
        // Set first incomplete content as active, or first content if all complete
        const firstIncomplete = data.content.find((c) => c.status !== "COMPLETED");
        setActiveContent(firstIncomplete || data.content[0] || null);
        setStatus("ready");
      } catch (error) {
        console.error("Error loading day detail:", error);
        setStatus("error");
      }
    }

    loadData();
  }, [enrollmentId, dayId]);

  const handleContentClick = (content: LearningContentDto) => {
    setActiveContent(content);
  };

  const handleActivityComplete = async (contentType: string, contentId: string) => {
    if (!enrollmentId || !dayId) return;

    try {
      await updateActivityProgress(enrollmentId, dayId, {
        contentType: contentType as any,
        contentId,
        status: "COMPLETED",
        progressPercent: 100,
      });

      // Reload day data to update progress
      const data = await getDayDetail(enrollmentId, dayId);
      setDayDetail(data);

      // Move to next incomplete content
      const firstIncomplete = data.content.find((c) => c.status !== "COMPLETED");
      setActiveContent(firstIncomplete || data.content[0] || null);
    } catch (error) {
      console.error("Failed to update activity progress:", error);
    }
  };

  const handlePreviousDay = () => {
    if (dayDetail?.previousDayId) {
      navigate(`/student/internship/${enrollmentId}/day/${dayDetail.previousDayId}`);
    }
  };

  const handleNextDay = () => {
    if (dayDetail?.nextDayId) {
      navigate(`/student/internship/${enrollmentId}/day/${dayDetail.nextDayId}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="container page-hero" aria-busy="true">
        <Skeleton style={{ height: 28, width: 140 }} />
        <Skeleton style={{ height: 48, marginTop: 16 }} />
        <Skeleton style={{ height: 120, marginTop: 16 }} />
        <Skeleton style={{ height: 400, marginTop: 24 }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="container page-hero">
        <ErrorState title="Unable to load learning day." body="Try again in a moment.">
          <ButtonLink to="/student/internships">Back to My Internships</ButtonLink>
        </ErrorState>
      </div>
    );
  }

  if (status === "missing" || !dayDetail) {
    return (
      <div className="container page-hero">
        <EmptyState title="Learning day not found." body="This day does not exist or you don't have access to it.">
          <ButtonLink to="/student/internships">Back to My Internships</ButtonLink>
        </EmptyState>
      </div>
    );
  }

  const isDayCompleted = dayDetail.status === "COMPLETED";

  return (
    <>
      <PageMeta
        title={`Day ${dayDetail.dayNumber}: ${dayDetail.title} | ${dayDetail.program.title}`}
        description={dayDetail.description || `Day ${dayDetail.dayNumber} of your ${dayDetail.program.title} internship.`}
      />
      <div className="container day-page">
        {/* Breadcrumb and Context */}
        <div className="day-page__context">
          <p className="t-label">{dayDetail.program.title}</p>
          <div className="day-page__breadcrumb">
            <ButtonLink to="/student/internships" variant="ghost" size="sm">
              My Internship
            </ButtonLink>
            <span className="day-page__breadcrumb-separator">→</span>
            <span className="day-page__breadcrumb-item">Week {dayDetail.week.weekNumber}</span>
            <span className="day-page__breadcrumb-separator">→</span>
            <span className="day-page__breadcrumb-item">Day {dayDetail.dayNumber}</span>
          </div>
        </div>

        {/* Day Hero */}
        <div className="day-page__hero">
          <div className="day-page__hero-header">
            <Badge tone={isDayCompleted ? "success" : "accent"}>
              {isDayCompleted ? "Completed" : dayDetail.status === "IN_PROGRESS" ? "In Progress" : "Not Started"}
            </Badge>
            <div className="day-page__hero-title">
              <h1>Day {dayDetail.dayNumber}</h1>
              <h2>{dayDetail.title}</h2>
            </div>
          </div>

          {dayDetail.description && <p className="day-page__hero-description">{dayDetail.description}</p>}

          <div className="day-page__hero-meta">
            {dayDetail.estimatedDuration && (
              <span className="day-page__hero-duration">
                Estimated time: {dayDetail.estimatedDuration} minutes
              </span>
            )}
            <span className="day-page__hero-progress">
              {dayDetail.completedActivities} / {dayDetail.totalActivities} activities completed
            </span>
          </div>

          <div className="day-page__hero-progress-bar">
            <ProgressBar value={dayDetail.progress} label={`${dayDetail.progress}% complete`} />
          </div>

          {!isDayCompleted && (
            <Button
              variant="primary"
              onClick={() => {
                const firstIncomplete = dayDetail.content.find((c) => c.status !== "COMPLETED");
                if (firstIncomplete) {
                  setActiveContent(firstIncomplete);
                }
              }}
            >
              {dayDetail.status === "NOT_STARTED" ? "Start Learning" : "Continue Learning"}
            </Button>
          )}
        </div>

        {/* Objectives */}
        {dayDetail.objectives.length > 0 && (
          <div className="day-page__objectives">
            <h3>Today's Objectives</h3>
            <p className="day-page__objectives-intro">By the end of today, you should understand:</p>
            <ul className="day-page__objectives-list">
              {dayDetail.objectives.map((objective, index) => (
                <li key={index}>{objective}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content Area */}
        <div className="day-page__content">
          {/* Learning Content Navigation */}
          <div className="day-page__nav">
            <h3>Learning Content</h3>
            <div className="day-page__content-list">
              {dayDetail.content.map((content, index) => (
                <button
                  key={content.id}
                  type="button"
                  className={`day-page__content-item ${
                    activeContent?.id === content.id ? "day-page__content-item--active" : ""
                  }`}
                  onClick={() => handleContentClick(content)}
                >
                  <span className="day-page__content-number">{String(index + 1).padStart(2, "0")}</span>
                  <div className="day-page__content-info">
                    <span className="day-page__content-title">{content.title}</span>
                    <span className="day-page__content-type">{content.type}</span>
                  </div>
                  <div className="day-page__content-status">
                    {content.status === "COMPLETED" && <span className="day-page__status-icon">✓</span>}
                    {content.status === "IN_PROGRESS" && <span className="day-page__status-icon">→</span>}
                    {content.status === "NOT_STARTED" && <span className="day-page__status-icon">○</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Content Display */}
          <div className="day-page__active-content">
            {activeContent ? (
              <>
                {activeContent.type === "VIDEO" && (
                  <VideoLesson
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    contentId={activeContent.contentId}
                    title={activeContent.title}
                    duration={activeContent.duration}
                    progress={activeContent.progressPercent}
                    status={activeContent.status}
                    onComplete={() => handleActivityComplete("VIDEO", activeContent.contentId)}
                  />
                )}
                {activeContent.type === "LESSON" && (
                  <StudyMaterial
                    title={activeContent.title}
                    content={activeContent.description || ""}
                    readingTime={activeContent.duration}
                    status={activeContent.status}
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    contentId={activeContent.contentId}
                    contentType="LESSON"
                    onComplete={() => handleActivityComplete("LESSON", activeContent.contentId)}
                  />
                )}
                {activeContent.type === "NOTE" && (
                  <StudyMaterial
                    title={activeContent.title}
                    content={activeContent.description || ""}
                    readingTime={activeContent.duration}
                    status={activeContent.status}
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    contentId={activeContent.contentId}
                    contentType="NOTE"
                    onComplete={() => handleActivityComplete("NOTE", activeContent.contentId)}
                  />
                )}
                {activeContent.type === "RESOURCE" && (
                  <ResourceCard
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    resourceId={activeContent.contentId}
                    title={activeContent.title}
                    status={activeContent.status}
                    onComplete={() => handleActivityComplete("RESOURCE", activeContent.contentId)}
                  />
                )}
                {activeContent.type === "PRACTICE" && (
                  <PracticeSection
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    practiceId={activeContent.contentId}
                    title={activeContent.title}
                    instructions={activeContent.description || ""}
                    status={activeContent.status}
                    onComplete={() => handleActivityComplete("PRACTICE", activeContent.contentId)}
                  />
                )}
                {activeContent.type === "DDP" && (
                  <DdpCard
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    ddpId={activeContent.contentId}
                    title={activeContent.title}
                    description={activeContent.description || ""}
                    status={activeContent.status}
                    onComplete={() => handleActivityComplete("DDP", activeContent.contentId)}
                  />
                )}
                {activeContent.type === "ASSIGNMENT" && (
                  <AssignmentCard
                    enrollmentId={enrollmentId!}
                    dayId={dayId!}
                    assignment={{
                      id: activeContent.contentId,
                      title: activeContent.title,
                      brief: activeContent.description || null,
                      type: "TEXT",
                      assignmentStatus: "PUBLISHED",
                      dueAt: null,
                      estimatedTime: activeContent.duration,
                      isRequired: activeContent.isRequired,
                      maxAttempts: 1,
                      status: activeContent.status,
                      submissionStatus: null,
                    }}
                  />
                )}
              </>
            ) : (
              <EmptyState title="No content available" body="This day has no learning content yet." />
            )}
          </div>

          {/* Day Checklist */}
          <div className="day-page__checklist">
            <DayChecklist content={dayDetail.content} />
          </div>
        </div>

        {/* Day Completion Screen */}
        {isDayCompleted && (
          <div className="day-page__completion">
            <Card className="day-page__completion-card">
              <div className="day-page__completion-icon">✓</div>
              <h2>Day Completed!</h2>
              <p>Day {dayDetail.dayNumber}: {dayDetail.title}</p>
              <div className="day-page__completion-list">
                <div className="day-page__completion-item">
                  <span className="day-page__completion-check">✓</span>
                  <span>Learning complete</span>
                </div>
                <div className="day-page__completion-item">
                  <span className="day-page__completion-check">✓</span>
                  <span>Practice complete</span>
                </div>
                <div className="day-page__completion-item">
                  <span className="day-page__completion-check">✓</span>
                  <span>DDP complete</span>
                </div>
                <div className="day-page__completion-item">
                  <span className="day-page__completion-check">✓</span>
                  <span>Assignment submitted</span>
                </div>
              </div>
              {dayDetail.nextDayId ? (
                <Button variant="primary" onClick={handleNextDay}>
                  Continue to Next Day
                </Button>
              ) : (
                <p className="day-page__completion-message">
                  Your next learning day will become available soon.
                </p>
              )}
            </Card>
          </div>
        )}

        {/* Previous/Next Navigation */}
        <div className="day-page__navigation">
          {dayDetail.previousDayId ? (
            <Button variant="outline" onClick={handlePreviousDay}>
              ← Previous Day
            </Button>
          ) : (
            <div />
          )}
          {dayDetail.nextDayId ? (
            <Button variant="primary" onClick={handleNextDay} disabled={!isDayCompleted}>
              Next Day → {isDayCompleted ? "" : "🔒 Locked"}
            </Button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </>
  );
}

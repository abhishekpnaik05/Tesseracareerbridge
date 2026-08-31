import { useState, useEffect } from "react";
import { Button, ProgressBar, Card } from "../ui";
import { getVideoDetail, updateActivityProgress } from "../../lib/enrollments";

interface VideoLessonProps {
  enrollmentId: string;
  dayId: string;
  contentId: string;
  title: string;
  duration: number | null;
  progress: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  onComplete: () => void;
}

export function VideoLesson({
  enrollmentId,
  dayId,
  contentId,
  title,
  duration,
  progress,
  status,
  onComplete,
}: VideoLessonProps) {
  const [videoData, setVideoData] = useState<any>(null);
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      try {
        setLoading(true);
        const data = await getVideoDetail(enrollmentId, dayId, contentId);
        setVideoData(data);
        setCurrentProgress(data.progress);
        if (data.lastPosition) {
          setCurrentTime(data.lastPosition);
        }
      } catch (error) {
        console.error("Failed to load video:", error);
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, [enrollmentId, dayId, contentId]);

  const handlePlay = () => {
    if (status === "NOT_STARTED") {
      handleProgressUpdate("IN_PROGRESS", 0);
    }
  };

  const handlePause = () => {
    // Pause logic if needed
  };

  const handleProgressUpdate = async (newStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED", progressPercent: number) => {
    try {
      await updateActivityProgress(enrollmentId, dayId, {
        contentType: "VIDEO",
        contentId,
        status: newStatus,
        progressPercent,
        metadata: { lastPosition: currentTime },
      });

      setCurrentProgress(progressPercent);

      if (newStatus === "COMPLETED") {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to update video progress:", error);
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    if (videoData?.durationSeconds) {
      const percent = Math.round((time / videoData.durationSeconds) * 100);
      setCurrentProgress(percent);

      // Auto-mark as complete at 90%
      if (percent >= 90 && status !== "COMPLETED") {
        handleProgressUpdate("COMPLETED", percent);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <Card className="video-lesson">
        <div className="video-lesson__placeholder" aria-busy="true">
          <div className="video-lesson__skeleton" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="video-lesson">
      <div className="video-lesson__header">
        <h3>{title}</h3>
        {duration && <span className="video-lesson__duration">{duration} min</span>}
      </div>

      <div className="video-lesson__player">
        {videoData?.storageUrl ? (
          <video
            className="video-lesson__video"
            controls
            onPlay={handlePlay}
            onPause={handlePause}
            onTimeUpdate={(e) => handleTimeUpdate(e.currentTarget.currentTime)}
          >
            <source src={videoData.storageUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="video-lesson__placeholder">
            <div className="video-lesson__placeholder-content">
              <div className="video-lesson__placeholder-icon">▶</div>
              <p>Video Player</p>
              <p className="video-lesson__placeholder-text">
                {status === "COMPLETED"
                  ? "You have completed this video lesson."
                  : "Video content will be available here."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="video-lesson__progress">
        <ProgressBar value={currentProgress} label={`${currentProgress}% complete`} />
        {videoData?.durationSeconds && (
          <div className="video-lesson__time-info">
            <span>Progress: {formatTime(currentTime)}</span>
            <span>Duration: {formatTime(videoData.durationSeconds)}</span>
          </div>
        )}
      </div>

      <div className="video-lesson__actions">
        {status === "COMPLETED" ? (
          <Button variant="success" disabled>
            ✓ Completed
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => handleProgressUpdate("COMPLETED", 100)}
          >
            Mark as Complete
          </Button>
        )}
      </div>
    </Card>
  );
}

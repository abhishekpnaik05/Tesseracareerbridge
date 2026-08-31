import { useState, useEffect } from "react";

interface DdpTimerProps {
  durationMinutes: number;
  startedAt: string;
  onExpire: () => void;
}

export function DdpTimer({ durationMinutes, startedAt, onExpire }: DdpTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const startTime = new Date(startedAt).getTime();
    const totalSeconds = durationMinutes * 60;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = totalSeconds - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeRemaining(0);
        setIsExpired(true);
        onExpire();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [durationMinutes, startedAt, onExpire]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className={`ddp-timer ${isExpired ? "ddp-timer--expired" : ""}`}>
      <span className="ddp-timer__icon">⏱</span>
      <span className="ddp-timer__time">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {isExpired && <span className="ddp-timer__status">Time Expired</span>}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div>
      {label ? <p className="t-caption ui-progress-label">{label}</p> : null}
      <div className="ui-progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div className="ui-progress__bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function ProgressCircle({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;
  return (
    <svg className="ui-progress-circle" viewBox="0 0 72 72" aria-label={`${clamped} percent`}>
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-charcoal)" strokeWidth="6" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="var(--color-amber)"
        strokeWidth="6"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
    </svg>
  );
}

export function StepProgress({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="ui-steps" aria-label="Step progress">
      {Array.from({ length: steps }, (_, i) => {
        const index = i + 1;
        const state = index < current ? "is-done" : index === current ? "is-current" : "";
        return <span key={index} className={`ui-step ${state}`} />;
      })}
    </div>
  );
}

export function DayProgress({ value }: { value: number }) {
  return <ProgressBar value={value} label="Day progress" />;
}

export function SkillProgress({ label, value }: { label: string; value: number }) {
  return <ProgressBar value={value} label={label} />;
}

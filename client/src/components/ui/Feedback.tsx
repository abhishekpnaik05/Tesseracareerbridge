import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/cn";

export function Card({
  children,
  className,
  variant = "base",
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  variant?: "base" | "subtle" | "highlight";
  interactive?: boolean;
}) {
  return (
    <article
      className={cn(
        "ui-card",
        variant === "subtle" && "ui-card--subtle",
        variant === "highlight" && "ui-card--highlight",
        interactive && "ui-card--interactive",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function Badge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "muted" | "success" | "danger" | "info";
}) {
  return <span className={cn("ui-badge", tone !== "accent" && `ui-badge--${tone}`)}>{children}</span>;
}

export function Alert({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "error" | "warning";
}) {
  return <div className={cn("ui-alert", `ui-alert--${tone}`)}>{children}</div>;
}

export function Skeleton({ style }: { style?: CSSProperties }) {
  return <div className="ui-skeleton" style={style} />;
}

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="ui-state" role="status">
      <h3>{label}</h3>
      <p>Please wait.</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="ui-state">
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className="ui-state" role="alert">
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}

export function SuccessState({ title, body }: { title: string; body: string }) {
  return (
    <div className="ui-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function LockedState({ title = "Day locked", body = "Complete the previous day to continue." }: { title?: string; body?: string }) {
  return (
    <div className="ui-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function CompletedState({ title = "Day completed", body = "This item is complete." }: { title?: string; body?: string }) {
  return (
    <div className="ui-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function InProgressState({ title = "In progress", body = "Work is underway." }: { title?: string; body?: string }) {
  return (
    <div className="ui-state">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

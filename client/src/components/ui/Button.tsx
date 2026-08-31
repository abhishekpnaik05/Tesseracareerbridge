import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "link" | "accent" | "success";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  block?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  block = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "ui-btn",
        `ui-btn--${variant}`,
        size !== "md" && `ui-btn--${size}`,
        block && "ui-btn--block",
        loading && "is-loading",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span className="ui-btn__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
}: {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "ui-btn",
        `ui-btn--${variant}`,
        size !== "md" && `ui-btn--${size}`,
        block && "ui-btn--block",
        className,
      )}
    >
      {children}
    </Link>
  );
}

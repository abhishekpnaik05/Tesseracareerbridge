import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useState } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { cn } from "../../lib/cn";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, success, htmlFor, children }: FieldProps) {
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="ui-field__hint ui-field__hint--error" role="alert">
          {error}
        </span>
      ) : success ? (
        <span className="ui-field__hint ui-field__hint--success">{success}</span>
      ) : hint ? (
        <span className="ui-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; success?: boolean };

export function Input({ invalid, success, className, id, ...props }: InputProps) {
  return (
    <input
      id={id}
      className={cn("ui-input", success && "is-success", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function PasswordInput(props: InputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="ui-input-wrap">
      <Input {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="ui-input-wrap__action"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export function SearchInput(props: InputProps) {
  return (
    <div className="ui-input-wrap ui-input-wrap--search">
      <span className="ui-input-wrap__icon" aria-hidden="true">
        <Search size={16} />
      </span>
      <Input {...props} type="search" />
    </div>
  );
}

export function Textarea({ invalid, className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cn("ui-textarea", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Select({ invalid, className, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select className={cn("ui-select", className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Checkbox({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="ui-check">
      <input type="checkbox" {...props} />
      {label}
    </label>
  );
}

export function Radio({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="ui-radio">
      <input type="radio" {...props} />
      {label}
    </label>
  );
}

export function Switch({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="ui-switch">
      <input type="checkbox" role="switch" {...props} />
      <span className="ui-switch__track" />
      {label}
    </label>
  );
}

export function FileUpload({ label = "Choose file", ...props }: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="ui-file">
      <input type="file" {...props} />
      <span>{label}</span>
    </label>
  );
}

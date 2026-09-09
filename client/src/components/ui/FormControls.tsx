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

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled = false, autoFocus = false }: OtpInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(autoFocus ? 0 : -1);

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return; // Only allow digits
    
    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('').slice(0, length);
    onChange(result);
    
    // Auto-focus next input
    if (digit && index < length - 1) {
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      setFocusedIndex(pastedData.length);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  return (
    <div className="ui-otp-input">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          autoFocus={focusedIndex === index}
          className={cn(
            "ui-otp-input__digit",
            focusedIndex === index && "ui-otp-input__digit--focused"
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}

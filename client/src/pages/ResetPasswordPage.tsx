import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, Field, PasswordInput, ProgressBar } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { apiPost, ApiRequestError } from "../lib/api";
import { passwordIssue, passwordStrength } from "../lib/password";

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(password);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const issue = passwordIssue(password);
    if (issue) {
      setError(issue);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("This reset link is invalid or has expired.");
      return;
    }
    setLoading(true);
    try {
      await apiPost("/auth/reset-password", { token, password, confirmPassword });
      setSuccess(true);
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Reset password" description="Choose a new TesseraCareerBridge password." />
      <AuthScreen title="Choose a new password." lead="Use at least 8 characters with letters and a number.">
        <form className="auth-form" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">Password updated. Redirecting to login.</Alert> : null}
          <Field label="New password" htmlFor="reset-password">
            <PasswordInput id="reset-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          <ProgressBar value={(strength.score / 3) * 100} label={strength.label} />
          <Field label="Confirm password" htmlFor="reset-confirm">
            <PasswordInput id="reset-confirm" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </Field>
          <Button type="submit" block loading={loading} disabled={success}>
            Update password
          </Button>
          <p className="t-caption">
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </AuthScreen>
    </div>
  );
}

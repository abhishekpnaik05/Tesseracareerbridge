import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, Field, Input } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { apiPost, ApiRequestError } from "../lib/api";
import { EMAIL_PATTERN } from "../lib/password";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost<{ message: string; devResetToken?: string }>("/auth/forgot-password", { email });
      setDone(true);
      setDevToken(data.devResetToken ?? null);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not start a reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Forgot password" description="Reset your TesseraCareerBridge password." />
      <AuthScreen title="Reset your password." lead="Enter your email. If an account exists, we will issue reset instructions.">
        <form className="auth-form" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {done ? (
            <Alert tone="success">If an account exists for that email, we sent reset instructions.</Alert>
          ) : null}
          {devToken ? (
            <Alert tone="warning">
              Development: email is not configured. Use this reset link:{" "}
              <Link to={`/reset-password?token=${devToken}`}>Continue to reset</Link>
            </Alert>
          ) : null}
          <Field label="Email" htmlFor="forgot-email">
            <Input id="forgot-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Button type="submit" block loading={loading}>
            Send reset instructions
          </Button>
          <p className="t-caption">
            <Link to="/login">Back to login</Link>
          </p>
        </form>
      </AuthScreen>
    </div>
  );
}

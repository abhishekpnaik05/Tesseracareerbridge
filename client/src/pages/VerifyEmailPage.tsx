import { FormEvent, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, ButtonLink, Field, Input } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { apiPost, ApiRequestError } from "../lib/api";
import { EMAIL_PATTERN } from "../lib/password";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navState = (location.state ?? {}) as { email?: string; devOtp?: string; token?: string };
  const [email, setEmail] = useState(navState.email ?? params.get("email") ?? "");
  const [otp, setOtp] = useState(navState.devOtp ?? params.get("otp") ?? "");
  const [token] = useState(navState.token ?? params.get("token") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devHint, setDevHint] = useState(
    import.meta.env.DEV && (navState.devOtp || navState.token)
      ? "Development: a verification code was returned because email delivery is not configured."
      : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiPost("/auth/verify", { email, otp: otp || undefined, token: token || undefined });
      setSuccess("Your account is verified. You can log in now.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError(null);
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiPost<{ message: string; devOtp?: string }>("/auth/resend-verification", { email });
      setSuccess(data.message);
      if (data.devOtp) {
        setOtp(data.devOtp);
        setDevHint("Development: a new code was issued in this environment. Mail is not sent.");
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not resend a code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Verify email" description="Verify your TesseraCareerBridge account." />
      <AuthScreen title="Verify your email." lead="Enter the code from your verification message. If mail is not configured, use the development code shown after registration.">
        <form className="auth-form" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}
          {devHint ? <Alert tone="warning">{devHint}</Alert> : null}
          <Field label="Email" htmlFor="verify-email">
            <Input id="verify-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Verification code" htmlFor="verify-otp" hint="Six digits">
            <Input id="verify-otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </Field>
          <Button type="submit" block loading={loading}>
            Verify account
          </Button>
          <Button type="button" variant="ghost" block onClick={() => void resend()} disabled={loading}>
            Resend code
          </Button>
          {success ? (
            <ButtonLink to="/login" variant="outline" block>
              Continue to login
            </ButtonLink>
          ) : (
            <p className="t-caption">
              <Link to="/login">Back to login</Link>
            </p>
          )}
        </form>
      </AuthScreen>
    </div>
  );
}

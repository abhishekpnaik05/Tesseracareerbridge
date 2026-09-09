import { FormEvent, useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, ButtonLink, Field, Input, OtpInput } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { apiPost, ApiRequestError } from "../lib/api";
import { EMAIL_PATTERN } from "../lib/password";

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navState = (location.state ?? {}) as { email?: string; maskedEmail?: string; devOtp?: string; token?: string };
  const [email, setEmail] = useState(navState.email ?? params.get("email") ?? "");
  const [maskedEmail, setMaskedEmail] = useState(navState.maskedEmail ?? "");
  const [otp, setOtp] = useState(navState.devOtp ?? params.get("otp") ?? "");
  const [token] = useState(navState.token ?? params.get("token") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devHint, setDevHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Handle resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Mask email when email changes
  useEffect(() => {
    if (email && !maskedEmail) {
      const [localPart, domain] = email.split('@');
      if (localPart && domain && localPart.length > 2) {
        setMaskedEmail(`${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`);
      } else {
        setMaskedEmail(email);
      }
    }
  }, [email, maskedEmail]);

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
    if (!canResend) return;
    
    setLoading(true);
    try {
      const data = await apiPost<{ message: string; devOtp?: string }>("/auth/resend-verification", { email });
      setSuccess(data.message);
      if (data.devOtp) {
        setOtp(data.devOtp);
        setDevHint("Development: a verification code was returned because email delivery is not configured.");
      } else {
        setDevHint(null);
      }
      // Start cooldown
      setCanResend(false);
      setResendCooldown(60);
    } catch (err) {
      const errorMessage = err instanceof ApiRequestError ? err.message : "Could not resend a code.";
      setError(errorMessage);
      // If it's a cooldown error from server, respect it
      if (errorMessage.includes("wait") || errorMessage.includes("seconds")) {
        const match = errorMessage.match(/(\d+)\s+seconds/);
        if (match) {
          setCanResend(false);
          setResendCooldown(parseInt(match[1], 10));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Verify email" description="Verify your TesseraCareerBridge account." />
      <AuthScreen 
        title="Verify your email." 
        lead={`We've sent a 6-digit verification code to ${maskedEmail || email}`}
      >
        <form className="auth-form" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}
          {devHint ? <Alert tone="warning">{devHint}</Alert> : null}
          
          {!navState.email && (
            <Field label="Email" htmlFor="verify-email">
              <Input id="verify-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
          )}
          
          <Field label="Verification code" hint="Enter the 6-digit code from your email">
            <OtpInput 
              value={otp} 
              onChange={setOtp} 
              length={6} 
              disabled={loading}
              autoFocus={!success}
            />
          </Field>
          
          <Button type="submit" block loading={loading} disabled={otp.length !== 6}>
            Verify account
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            block 
            onClick={() => void resend()} 
            disabled={loading || !canResend}
          >
            {canResend ? "Resend code" : `Resend code in ${resendCooldown}s`}
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

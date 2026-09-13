import { FormEvent, useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, ButtonLink, Field, Input, OtpInput } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { apiPost, ApiRequestError } from "../lib/api";
import { PHONE_PATTERN } from "../lib/password";

export function VerifyPhonePage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navState = (location.state ?? {}) as { phone?: string; maskedPhone?: string; devOtp?: string; token?: string };
  const [phone, setPhone] = useState(navState.phone ?? params.get("phone") ?? "");
  const [maskedPhone, setMaskedPhone] = useState(navState.maskedPhone ?? "");
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

  // Mask phone when phone changes
  useEffect(() => {
    if (phone && !maskedPhone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length > 4) {
        const visibleStart = digits.slice(0, 2);
        const visibleEnd = digits.slice(-4);
        const masked = '*'.repeat(digits.length - 6);
        setMaskedPhone(`${visibleStart}${masked}${visibleEnd}`);
      } else {
        setMaskedPhone(phone);
      }
    }
  }, [phone, maskedPhone]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await apiPost("/auth/verify", { phone, otp: otp || undefined, token: token || undefined });
      setSuccess("Your account is verified. You can log in now.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setError(null);
    if (!PHONE_PATTERN.test(phone.trim())) {
      setError("Enter a valid phone number.");
      return;
    }
    if (!canResend) return;
    
    setLoading(true);
    try {
      const data = await apiPost<{ message: string; devOtp?: string }>("/auth/resend-verification", { phone });
      setSuccess(data.message);
      if (data.devOtp) {
        setOtp(data.devOtp);
        setDevHint("Development: a verification code was returned because SMS/WhatsApp delivery is not configured.");
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
      <PageMeta title="TesseraCareerBridge | Verify phone" description="Verify your TesseraCareerBridge account." />
      <AuthScreen 
        title="Verify your mobile number." 
        lead={`We've sent a 6-digit verification code to ${maskedPhone || phone}`}
      >
        <form className="auth-form" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}
          {devHint ? <Alert tone="warning">{devHint}</Alert> : null}
          
          {!navState.phone && (
            <Field label="Phone number" htmlFor="verify-phone">
              <Input id="verify-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </Field>
          )}
          
          <Field label="Verification code" hint="Enter the 6-digit code sent to your phone">
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

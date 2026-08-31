import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, Checkbox, Field, Input, PasswordInput, ProgressBar } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { apiPost, ApiRequestError } from "../lib/api";
import { EMAIL_PATTERN, PHONE_PATTERN, passwordIssue, passwordStrength } from "../lib/password";

export function RegisterPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromProgram = params.get("program");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(password);

  function validate() {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!EMAIL_PATTERN.test(email.trim())) next.email = "Enter a valid email.";
    if (phone.trim() && !PHONE_PATTERN.test(phone.trim())) next.phone = "Enter a valid phone number.";
    const issue = passwordIssue(password);
    if (issue) next.password = issue;
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    if (!terms) next.terms = "Accept the terms to continue.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiPost<{
        user: { email: string };
        devOtp?: string;
        devVerificationToken?: string;
      }>("/auth/register", {
        name,
        email,
        phone,
        password,
        confirmPassword,
        terms,
      });
      navigate("/verify-email", {
        state: {
          email: data.user.email,
          devOtp: data.devOtp,
          token: data.devVerificationToken,
        },
      });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Register" description="Create a student account to start your internship journey." />
      <AuthScreen title="Create your account." lead="Student registration first. You can complete your academic profile later.">
        <form className="auth-form" onSubmit={onSubmit} noValidate>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {fromProgram ? (
            <Alert tone="info">
              You started from a program page. Creating an account does not enroll you or process payment yet.
            </Alert>
          ) : null}
          <Field label="Full name" htmlFor="reg-name" error={fieldErrors.name}>
            <Input id="reg-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} invalid={Boolean(fieldErrors.name)} required />
          </Field>
          <Field label="Email" htmlFor="reg-email" error={fieldErrors.email}>
            <Input id="reg-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} invalid={Boolean(fieldErrors.email)} required />
          </Field>
          <Field label="Phone" htmlFor="reg-phone" hint="Optional for now" error={fieldErrors.phone}>
            <Input id="reg-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} invalid={Boolean(fieldErrors.phone)} />
          </Field>
          <Field label="Password" htmlFor="reg-password" error={fieldErrors.password}>
            <PasswordInput id="reg-password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={Boolean(fieldErrors.password)} required />
          </Field>
          <ProgressBar value={(strength.score / 3) * 100} label={strength.label} />
          <Field label="Confirm password" htmlFor="reg-confirm" error={fieldErrors.confirmPassword}>
            <PasswordInput id="reg-confirm" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} invalid={Boolean(fieldErrors.confirmPassword)} required />
          </Field>
          <Checkbox
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            label={
              <>
                I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>
              </>
            }
          />
          {fieldErrors.terms ? <p className="ui-field__hint ui-field__hint--error">{fieldErrors.terms}</p> : null}
          <Button type="submit" block loading={loading}>
            Create account
          </Button>
          <p className="t-caption">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </AuthScreen>
    </div>
  );
}

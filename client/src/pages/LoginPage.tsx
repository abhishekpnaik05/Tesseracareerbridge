import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, Checkbox, Field, Input, PasswordInput } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { useAuth } from "../auth/AuthProvider";
import { homePathForRole } from "../auth/home";
import { ApiRequestError } from "../lib/api";
import type { UserRole } from "@tesseracareerbridge/shared";

function resolvePostLoginPath(next: string | null, role: UserRole) {
  const home = homePathForRole(role);
  if (!next || !next.startsWith("/") || next.startsWith("//")) return home;
  if (role === "STUDENT" && next.startsWith("/student")) return next;
  if (role === "MENTOR" && next.startsWith("/mentor")) return next;
  if ((role === "ADMIN" || role === "CONTENT_MANAGER" || role === "SUPER_ADMIN") && next.startsWith("/admin")) {
    return next;
  }
  return home;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const user = await login(email, password, remember);
      setSuccess("Signed in.");
      const next = params.get("next");
      navigate(resolvePostLoginPath(next, user.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "VERIFICATION_REQUIRED") {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(err instanceof ApiRequestError ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Login" description="Sign in to continue your internship journey." />
      <AuthScreen title="Welcome back." lead="Continue your internship journey.">
        <form className="auth-form" onSubmit={onSubmit}>
          {error ? <Alert tone="error">{error}</Alert> : null}
          {success ? <Alert tone="success">{success}</Alert> : null}
          <Field label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="login-password">
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <div className="auth-form__row">
            <Checkbox label="Keep me signed in" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <Button type="submit" block loading={loading}>
            Login
          </Button>
          <p className="t-caption">
            Don&apos;t have an account? <Link to="/register">Create account</Link>
          </p>
        </form>
      </AuthScreen>
    </div>
  );
}

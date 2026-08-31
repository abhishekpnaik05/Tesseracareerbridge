import { FormEvent, useEffect, useState } from "react";
import type { AuthSessionDto, StudentAccountDto } from "@tesseracareerbridge/shared";
import { Alert, Button, Card, Field, Input, PasswordInput, Switch } from "../../components/ui";
import { apiGet, apiPatch, apiPost, ApiRequestError } from "../../lib/api";
import { passwordIssue } from "../../lib/password";
import { useStudentAccount } from "../../student/StudentAccountProvider";

export function StudentSettingsPage() {
  const { account, setAccount, reload } = useStudentAccount();
  const [sessions, setSessions] = useState<AuthSessionDto[] | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordOk, setPasswordOk] = useState<string | null>(null);
  const [prefError, setPrefError] = useState<string | null>(null);
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiGet<{ sessions: AuthSessionDto[] }>("/auth/sessions")
      .then((data) => {
        if (!cancelled) setSessions(data.sessions);
      })
      .catch((err) => {
        if (!cancelled) setSessionError(err instanceof ApiRequestError ? err.message : "Unable to load sessions.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordOk(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const issue = passwordIssue(newPassword);
    if (issue) {
      setPasswordError(issue);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSavingPass(true);
    try {
      await apiPost("/auth/change-password", {
        currentPassword: String(form.get("currentPassword") ?? ""),
        newPassword,
        confirmPassword,
      });
      setPasswordOk("Password updated. Other sessions were signed out.");
      event.currentTarget.reset();
    } catch (err) {
      setPasswordError(err instanceof ApiRequestError ? err.message : "Could not update your password.");
    } finally {
      setSavingPass(false);
    }
  }

  async function patchPref(patch: Partial<StudentAccountDto["preferences"]>) {
    setPrefError(null);
    try {
      const data = await apiPatch<StudentAccountDto>("/students/me/preferences", patch);
      setAccount(data);
    } catch (err) {
      setPrefError(err instanceof ApiRequestError ? err.message : "Could not save preferences.");
      await reload();
    }
  }

  const prefs = account?.preferences;

  return (
    <div className="student-page">
      <p className="t-label page-kicker">Account</p>
      <h1>Settings</h1>
      <p>Control sign-in, notices, and basic preferences.</p>

      <Card className="entity-card">
        <h2>Account</h2>
        <Field label="Name" htmlFor="settings-name">
          <Input id="settings-name" value={account?.user.displayName ?? ""} readOnly />
        </Field>
        <Field label="Email" htmlFor="settings-email">
          <Input id="settings-email" value={account?.user.email ?? ""} readOnly />
        </Field>
        <Field label="Phone" htmlFor="settings-phone" hint="Edit phone on your profile.">
          <Input id="settings-phone" value={account?.user.phone ?? ""} readOnly />
        </Field>
      </Card>

      <Card className="entity-card">
        <h2>Security</h2>
        {passwordOk ? <Alert tone="success">{passwordOk}</Alert> : null}
        {passwordError ? <Alert tone="error">{passwordError}</Alert> : null}
        <form className="student-form" onSubmit={onPassword}>
          <Field label="Current password" htmlFor="currentPassword">
            <PasswordInput id="currentPassword" name="currentPassword" autoComplete="current-password" required />
          </Field>
          <Field label="New password" htmlFor="newPassword">
            <PasswordInput id="newPassword" name="newPassword" autoComplete="new-password" required />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword">
            <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required />
          </Field>
          <Button type="submit" loading={savingPass}>
            Update password
          </Button>
        </form>
        <h3 className="settings-sub">Active sessions</h3>
        {sessionError ? <Alert tone="warning">{sessionError}</Alert> : null}
        {sessions ? (
          <ul className="session-list">
            {sessions.map((session) => (
              <li key={session.id}>
                {session.current ? "This device" : "Signed in"} · expires {new Date(session.expiresAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p className="t-caption">Loading sessions…</p>
        )}
      </Card>

      <Card className="entity-card">
        <h2>Notifications</h2>
        {prefError ? <Alert tone="error">{prefError}</Alert> : null}
        {prefs ? (
          <div className="settings-switches">
            <Switch
              label="Assignment reminders"
              checked={prefs.notifyAssignments}
              onChange={(event) => void patchPref({ notifyAssignments: event.target.checked })}
            />
            <Switch
              label="Test reminders"
              checked={prefs.notifyTests}
              onChange={(event) => void patchPref({ notifyTests: event.target.checked })}
            />
            <Switch
              label="Mentor messages"
              checked={prefs.notifyMentor}
              onChange={(event) => void patchPref({ notifyMentor: event.target.checked })}
            />
            <Switch
              label="Announcements"
              checked={prefs.notifyAnnouncements}
              onChange={(event) => void patchPref({ notifyAnnouncements: event.target.checked })}
            />
          </div>
        ) : (
          <p className="t-caption">Loading preferences…</p>
        )}
      </Card>

      <Card className="entity-card">
        <h2>Preferences</h2>
        <Field label="Language" htmlFor="language" hint="More languages will be added later.">
          <Input id="language" value="English" readOnly />
        </Field>
        <Field label="Appearance" htmlFor="appearance" hint="TesseraCareerBridge currently uses the dark theme.">
          <Input id="appearance" value="Dark" readOnly />
        </Field>
      </Card>
    </div>
  );
}

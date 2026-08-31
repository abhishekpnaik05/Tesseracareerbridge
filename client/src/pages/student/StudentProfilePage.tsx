import { FormEvent, useState } from "react";
import { Avatar, Alert, Button, ButtonLink, Card, Field, FileUpload, Input, ProgressBar } from "../../components/ui";
import { apiDelete, apiPatch, apiPost, ApiRequestError } from "../../lib/api";
import { useAuth } from "../../auth/AuthProvider";
import { useStudentAccount } from "../../student/StudentAccountProvider";
import { PHONE_PATTERN } from "../../lib/password";
import type { StudentAccountDto } from "@tesseracareerbridge/shared";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function StudentProfilePage() {
  const { refresh } = useAuth();
  const { account, loading, error, reload, setAccount } = useStudentAccount();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  if (loading && !account) {
    return <p>Loading your profile…</p>;
  }
  if (error || !account) {
    return (
      <Alert tone="error">
        {error ?? "Unable to load your profile."}{" "}
        <Button variant="ghost" onClick={() => void reload()}>
          Try again
        </Button>
      </Alert>
    );
  }

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const phone = String(form.get("phone") ?? "");
    if (phone && !PHONE_PATTERN.test(phone)) {
      setFormError("Enter a valid phone number.");
      return;
    }
    const semesterRaw = String(form.get("semester") ?? "");
    const yearRaw = String(form.get("graduationYear") ?? "");
    setSaving(true);
    try {
      const data = await apiPatch<StudentAccountDto>("/students/me", {
        displayName: String(form.get("displayName") ?? ""),
        phone,
        college: String(form.get("college") ?? ""),
        university: String(form.get("university") ?? ""),
        usn: String(form.get("usn") ?? ""),
        branch: String(form.get("branch") ?? ""),
        semester: semesterRaw ? Number(semesterRaw) : null,
        graduationYear: yearRaw ? Number(yearRaw) : null,
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? ""),
      });
      setAccount(data);
      await refresh();
      setMessage("Profile saved.");
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setFormError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFormError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setFormError("Keep the photo under 1 MB.");
      return;
    }
    const dataBase64 = await fileToBase64(file);
    setSaving(true);
    try {
      const data = await apiPost<StudentAccountDto>("/students/me/photo", {
        mimeType: file.type,
        fileName: file.name,
        dataBase64,
      });
      setAccount(data);
      setMessage("Photo updated.");
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Could not upload that photo.");
    } finally {
      setSaving(false);
    }
  }

  async function onRemovePhoto() {
    setSaving(true);
    setFormError(null);
    try {
      const data = await apiDelete<StudentAccountDto>("/students/me/photo");
      setAccount(data);
      setMessage("Photo removed.");
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : "Could not remove the photo.");
    } finally {
      setSaving(false);
    }
  }

  const { user, profile, completion, photoUrl } = account;

  return (
    <div className="student-page">
      <p className="t-label page-kicker">Account</p>
      <h1>Profile</h1>
      <p>Keep your academic details current. Email stays with your login.</p>

      <Card className="entity-card profile-complete">
        <h2>Profile completion</h2>
        <ProgressBar value={completion.percent} label={`${completion.percent}%`} />
        {completion.missing.length ? (
          <>
            <p>Still missing: {completion.missing.map((item) => item.label).join(", ")}.</p>
            <ButtonLink to="#photo">Complete profile</ButtonLink>
          </>
        ) : (
          <p>Your required profile fields are complete.</p>
        )}
      </Card>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <form className="student-form" onSubmit={onSave}>
        <section className="entity-card-wrap" id="photo">
        <Card className="entity-card">
          <h2>Profile photo</h2>
          <div className="profile-photo">
            <Avatar initials={initials(user.displayName)} src={photoUrl} alt="" size="lg" />
            <div className="stack">
              <FileUpload
                label="Upload photo"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => void onPhoto(event.target.files?.[0])}
              />
              {photoUrl ? (
                <Button type="button" variant="ghost" onClick={() => void onRemovePhoto()} disabled={saving}>
                  Remove photo
                </Button>
              ) : null}
              <p className="t-caption">JPEG, PNG, or WebP. Max 1 MB.</p>
            </div>
          </div>
        </Card>
        </section>

        <Card className="entity-card">
          <h2>Personal information</h2>
          <Field label="Full name" htmlFor="displayName">
            <Input id="displayName" name="displayName" defaultValue={user.displayName} required />
          </Field>
          <Field label="Email" htmlFor="email" hint="Email cannot be changed here.">
            <Input id="email" value={user.email} readOnly />
          </Field>
        </Card>

        <Card className="entity-card">
          <h2>Contact</h2>
          <Field label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? profile.phone ?? ""} />
          </Field>
          <Field label="City" htmlFor="city">
            <Input id="city" name="city" defaultValue={profile.city ?? ""} />
          </Field>
          <Field label="State" htmlFor="state">
            <Input id="state" name="state" defaultValue={profile.state ?? ""} />
          </Field>
        </Card>

        <Card className="entity-card">
          <h2>Academic information</h2>
          <Field label="College" htmlFor="college">
            <Input id="college" name="college" defaultValue={profile.college ?? ""} />
          </Field>
          <Field label="University" htmlFor="university">
            <Input id="university" name="university" defaultValue={profile.university ?? ""} />
          </Field>
          <Field label="VTU USN" htmlFor="usn">
            <Input id="usn" name="usn" defaultValue={profile.usn ?? ""} />
          </Field>
          <Field label="Branch" htmlFor="branch">
            <Input id="branch" name="branch" defaultValue={profile.branch ?? ""} />
          </Field>
          <Field label="Semester" htmlFor="semester">
            <Input id="semester" name="semester" type="number" min={1} max={8} defaultValue={profile.semester ?? ""} />
          </Field>
          <Field label="Graduation year" htmlFor="graduationYear">
            <Input id="graduationYear" name="graduationYear" type="number" min={2000} max={2040} defaultValue={profile.graduationYear ?? ""} />
          </Field>
        </Card>

        <Button type="submit" loading={saving}>
          Save profile
        </Button>
      </form>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

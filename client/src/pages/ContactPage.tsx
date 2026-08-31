import { type FormEvent, useState } from "react";
import { PageMeta } from "../components/seo/PageMeta";
import { Alert, Button, Card, Field, Input, Select, Textarea } from "../components/ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const subject = String(form.get("subject") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const next: Record<string, string> = {};
    if (name.length < 2) next.name = "Enter your name.";
    if (!emailPattern.test(email)) next.email = "Enter a valid email.";
    if (phone && !/^[0-9+\-\s]{8,}$/.test(phone)) next.phone = "Enter a valid phone number.";
    if (!subject) next.subject = "Choose a subject.";
    if (message.length < 10) next.message = "Write at least 10 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    window.setTimeout(() => {
      setStatus("success");
    }, 600);
  }

  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | Contact"
        description="Contact TesseraCareerBridge. This form validates locally; email delivery is not connected yet."
      />
      <div className="container page-hero">
        <p className="t-label">Contact</p>
        <h1>Talk to the team.</h1>
      </div>
      <div className="container contact-grid pub-page-end">
        <Card>
          <h2>Details</h2>
          <p>Email: hello@tesseracareerbridge.example</p>
          <p>Phone: +91 00000 00000</p>
          <p>Address: Bengaluru, Karnataka (placeholder)</p>
          <p className="t-caption">Placeholders until official channels are published.</p>
        </Card>
        <Card>
          <form className="stack" onSubmit={onSubmit} noValidate>
            <Field label="Name" htmlFor="name" error={errors.name}>
              <Input id="name" name="name" autoComplete="name" invalid={Boolean(errors.name)} />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" invalid={Boolean(errors.email)} />
            </Field>
            <Field label="Phone" htmlFor="phone" error={errors.phone} hint="Optional">
              <Input id="phone" name="phone" type="tel" autoComplete="tel" invalid={Boolean(errors.phone)} />
            </Field>
            <Field label="Subject" htmlFor="subject" error={errors.subject}>
              <Select id="subject" name="subject" invalid={Boolean(errors.subject)}>
                <option value="">Select</option>
                <option value="programs">Programs</option>
                <option value="enrollment">Enrollment</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Message" htmlFor="message" error={errors.message}>
              <Textarea id="message" name="message" invalid={Boolean(errors.message)} />
            </Field>
            {status === "error" ? <Alert tone="error">Fix the highlighted fields. Nothing was sent.</Alert> : null}
            {status === "success" ? (
              <Alert tone="success">
                The form is valid. It was not emailed — contact handling is not connected to a server yet.
              </Alert>
            ) : null}
            <Button type="submit" loading={status === "loading"} disabled={status === "success"}>
              Submit
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}

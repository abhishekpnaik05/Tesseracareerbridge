import { PageMeta } from "../../components/seo/PageMeta";
import { Card, Field, Input, Textarea, Button } from "../../components/ui";
import { useAuth } from "../../auth/AuthProvider";

export function MentorProfilePage() {
  const { user } = useAuth();

  return (
    <>
      <PageMeta title="Profile" description="Manage your mentor profile" />
      <div className="container page-hero">
        <p className="t-label">Mentor</p>
        <h1>Profile</h1>
        <p className="pub-lead">Manage your mentor profile and settings.</p>
      </div>
      <div className="container">
        <Card>
          <h2>Personal Information</h2>
          <div className="stack">
            <Field label="Name" htmlFor="name">
              <Input id="name" defaultValue={user?.displayName} />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" defaultValue={user?.email} disabled />
            </Field>
            <Field label="Title" htmlFor="title">
              <Input id="title" placeholder="e.g., Senior Software Engineer" />
            </Field>
            <Field label="Bio" htmlFor="bio">
              <Textarea id="bio" placeholder="Tell students about yourself..." rows={4} />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" placeholder="+91 98765 43210" />
            </Field>
            <Field label="Skills" htmlFor="skills">
              <Input id="skills" placeholder="e.g., React, Node.js, Python" />
            </Field>
            <Field label="Experience" htmlFor="experience">
              <Textarea id="experience" placeholder="Describe your experience..." rows={3} />
            </Field>
            <Field label="LinkedIn" htmlFor="linkedin">
              <Input id="linkedin" placeholder="https://linkedin.com/in/yourprofile" />
            </Field>
            <Field label="GitHub" htmlFor="github">
              <Input id="github" placeholder="https://github.com/yourusername" />
            </Field>
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>
      </div>
    </>
  );
}

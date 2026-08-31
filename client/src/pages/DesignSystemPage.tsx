import { useState } from "react";
import {
  Alert,
  Badge,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  CompletedState,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Field,
  FileUpload,
  InProgressState,
  Input,
  LoadingState,
  LockedState,
  Modal,
  PasswordInput,
  ProgressBar,
  ProgressCircle,
  Radio,
  SearchInput,
  Select,
  Skeleton,
  StepProgress,
  SuccessState,
  Switch,
  Tabs,
  Textarea,
  useToast,
} from "../components/ui";
import {
  AssignmentCard,
  BatchCard,
  CertificateCard,
  DayCard,
  DDPCard,
  LessonCard,
  ProgramCard,
  ProgressCard,
  ProjectCard,
  StatCard,
  TestCard,
  WeekCard,
} from "../components/internship";

const colors = [
  ["Background", "var(--color-bg)"],
  ["Warm black", "var(--color-bg-warm)"],
  ["Surface", "var(--color-surface)"],
  ["Charcoal", "var(--color-charcoal)"],
  ["Amber", "var(--color-amber)"],
  ["Amber bright", "var(--color-amber-bright)"],
  ["White", "var(--color-white)"],
  ["Muted", "var(--color-muted)"],
  ["Success", "var(--color-success)"],
  ["Danger", "var(--color-danger)"],
  ["Info", "var(--color-info)"],
  ["Border", "var(--color-border)"],
];

export function DesignSystemPage() {
  const { push } = useToast();
  const [tab, setTab] = useState("one");
  const [modal, setModal] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [sheet, setSheet] = useState(false);

  return (
    <div className="container ds-page">
      <p className="t-label">Development only</p>
      <h1>Design system</h1>
      <p>Visual verification for TesseraCareerBridge. This route is not in public navigation.</p>

      <section className="ds-section">
        <h2>Colors</h2>
        <div className="ds-swatches">
          {colors.map(([name, value]) => (
            <figure key={name} className="ds-swatch">
              <div className="ds-swatch__chip" style={{ background: value }} />
              <figcaption>{name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="ds-section">
        <h2>Typography</h2>
        <p className="t-display ds-type-sample">Display</p>
        <h1>Heading one</h1>
        <h2>Heading two</h2>
        <h3>Heading three</h3>
        <h4>Heading four</h4>
        <h5>Heading five</h5>
        <p className="t-body-lg">Body large — readable learning copy.</p>
        <p>Body — default interface text.</p>
        <p className="t-body-sm">Body small — secondary copy.</p>
        <p className="t-caption">Caption</p>
        <p className="t-label">Label</p>
      </section>

      <section className="ds-section">
        <h2>Buttons</h2>
        <div className="row">
          <Button>Get Started</Button>
          <Button variant="secondary">Explore Programs</Button>
          <Button variant="outline">Enroll Now</Button>
          <Button variant="ghost">Continue Learning</Button>
          <Button variant="danger">Remove</Button>
          <Button variant="link">Learn more</Button>
          <Button loading>Saving</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="ds-section">
        <h2>Inputs</h2>
        <div className="stack">
          <Field label="Email" htmlFor="ds-email">
            <Input id="ds-email" placeholder="you@college.edu" />
          </Field>
          <Field label="Password" htmlFor="ds-password">
            <PasswordInput id="ds-password" />
          </Field>
          <Field label="Search">
            <SearchInput placeholder="Search programs" />
          </Field>
          <Field label="Notes">
            <Textarea />
          </Field>
          <Field label="Batch">
            <Select>
              <option>Select a batch</option>
            </Select>
          </Field>
          <Checkbox label="I agree to the terms" />
          <Radio name="level" label="Beginner" defaultChecked />
          <Radio name="level" label="Intermediate" />
          <Switch label="Email notifications" />
          <FileUpload />
          <Field label="Error example" error="This field is required">
            <Input invalid />
          </Field>
          <Field label="Success example" success="Looks good">
            <Input success className="is-success" />
          </Field>
        </div>
      </section>

      <section className="ds-section">
        <h2>Cards, badges, tabs</h2>
        <div className="card-grid">
          <Card>
            <h3>Base card</h3>
            <p>Standard surface.</p>
          </Card>
          <Card variant="subtle">
            <h3>Subtle card</h3>
            <p>Quiet supporting surface.</p>
          </Card>
          <Card variant="highlight" interactive>
            <h3>Highlighted card</h3>
            <p>Accent border for current work.</p>
          </Card>
        </div>
        <div className="row">
          <Badge>Accent</Badge>
          <Badge tone="muted">Muted</Badge>
          <Badge tone="success">Complete</Badge>
          <Badge tone="danger">Overdue</Badge>
          <Badge tone="info">Review</Badge>
        </div>
        <Tabs
          tabs={[
            { id: "one", label: "Overview" },
            { id: "two", label: "Curriculum" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </section>

      <section className="ds-section">
        <h2>Progress</h2>
        <div className="row">
          <ProgressCircle value={64} />
          <div className="stack">
            <ProgressBar value={64} label="Overall" />
            <StepProgress steps={5} current={3} />
          </div>
        </div>
      </section>

      <section className="ds-section">
        <h2>Alerts and toasts</h2>
        <div className="stack">
          <Alert tone="success">Certificate pending review is complete.</Alert>
          <Alert tone="error">Submission failed.</Alert>
          <Alert tone="warning">Assignment under review.</Alert>
          <Alert tone="info">Loading dashboard.</Alert>
        </div>
        <div className="row">
          <Button size="sm" onClick={() => push("Saved", "success")}>
            Success toast
          </Button>
          <Button size="sm" variant="secondary" onClick={() => push("Something went wrong", "error")}>
            Error toast
          </Button>
          <Button size="sm" variant="outline" onClick={() => push("Deadline approaching", "warning")}>
            Warning toast
          </Button>
          <Button size="sm" variant="ghost" onClick={() => push("New announcement", "info")}>
            Info toast
          </Button>
        </div>
      </section>

      <section className="ds-section">
        <h2>Overlays</h2>
        <div className="row">
          <Button variant="secondary" onClick={() => setModal(true)}>
            Modal
          </Button>
          <Button variant="secondary" onClick={() => setConfirm(true)}>
            Confirm
          </Button>
          <Button variant="secondary" onClick={() => setSheet(true)}>
            Bottom sheet
          </Button>
        </div>
        <Modal open={modal} title="Modal" onClose={() => setModal(false)}>
          <p>Desktop dialog. On small screens this uses the overlay layout.</p>
          <Button onClick={() => setModal(false)}>Close</Button>
        </Modal>
        <ConfirmDialog
          open={confirm}
          title="Confirm action"
          body="This is a confirmation pattern only."
          onClose={() => setConfirm(false)}
          onConfirm={() => setConfirm(false)}
        />
        <BottomSheet open={sheet} title="Bottom sheet" onClose={() => setSheet(false)}>
          <p>Preferred for compact mobile actions.</p>
        </BottomSheet>
      </section>

      <section className="ds-section">
        <h2>States</h2>
        <div className="card-grid">
          <Card>
            <LoadingState label="Loading dashboard" />
          </Card>
          <Card>
            <EmptyState title="No internships yet" body="When you enroll, they will appear here." />
          </Card>
          <Card>
            <EmptyState title="No assignments available" body="Assignments are attached to curriculum days." />
          </Card>
          <Card>
            <ErrorState title="Could not load" body="Try again later." />
          </Card>
          <Card>
            <LockedState />
          </Card>
          <Card>
            <CompletedState />
          </Card>
          <Card>
            <InProgressState title="Assignment under review" body="A mentor will evaluate this submission." />
          </Card>
          <Card>
            <SuccessState title="Certificate pending" body="Issuance is queued after evaluation." />
          </Card>
          <Card>
            <Skeleton style={{ height: 72 }} />
          </Card>
        </div>
      </section>

      <section className="ds-section">
        <h2>Internship components</h2>
        <p className="t-caption">Sample props for visual verification. Not live product data.</p>
        <div className="card-grid">
          <ProgramCard
            title="Sample program"
            description="Description is supplied by the API."
            duration="8 weeks"
            level="Beginner"
            skills={["Skill one", "Skill two"]}
            enrollmentStatus="Open"
          />
          <BatchCard name="Morning batch" startDate="1 Sep" endDate="26 Oct" seatsStatus="24 seats" />
          <WeekCard weekNumber={1} title="Foundations" progress={40} status="In progress" />
          <DayCard dayNumber={1} topic="Curriculum topic" date="Mon 1 Sep" progress={80} state="current" />
          <DayCard dayNumber={2} topic="Locked topic" date="Tue 2 Sep" progress={0} state="locked" />
          <LessonCard title="Lesson title" type="Video" duration="12 min" completed={false} />
          <DDPCard title="Daily practice" questionCount={6} duration="20 min" status="Not started" />
          <AssignmentCard title="Assignment title" deadline="Fri 5 Sep" status="Under review" />
          <TestCard title="Checkpoint test" questions={20} duration="45 min" status="Available" />
          <ProjectCard title="Capstone" type="Team project" progress={25} status="In progress" ctaLabel="Open project" />
          <ProgressCard overall={42} days="12/30" ddps="8/20" assignments="3/6" tests="1/3" projects="0/1" />
          <CertificateCard program="Sample program" status="Pending" certificateId="TCB-000" verification="Unverified" />
          <StatCard label="Attendance" value="92%" hint="This batch" />
        </div>
      </section>
    </div>
  );
}

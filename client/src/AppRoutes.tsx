import { Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, RequireAuth } from "./auth";
import { PublicLayout } from "./layouts/PublicLayout";
import { StudentLayout } from "./layouts/StudentLayout";
import { MentorLayout } from "./layouts/MentorLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { DesignSystemPage } from "./pages/DesignSystemPage";
import { ProgramsPage } from "./pages/ProgramsPage";
import { ProgramDetailPage } from "./pages/ProgramDetailPage";
import { BatchSelectionPage } from "./pages/BatchSelectionPage";
import { EnrollmentSummaryPage } from "./pages/EnrollmentSummaryPage";
import { EnrollmentConfirmationPage } from "./pages/EnrollmentConfirmationPage";
import { AboutPage } from "./pages/AboutPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { FaqPage } from "./pages/FaqPage";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { GetStartedPage } from "./pages/GetStartedPage";
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { StudentProfilePage } from "./pages/student/StudentProfilePage";
import { StudentSettingsPage } from "./pages/student/StudentSettingsPage";
import { StudentNotificationsPage } from "./pages/student/StudentNotificationsPage";
import { StudentInternshipsPage } from "./pages/student/StudentInternshipsPage";
import { StudentInternshipDetailPage } from "./pages/student/StudentInternshipDetailPage";
import { StudentDayPage } from "./pages/student/StudentDayPage";
import { StudentDdpPage } from "./pages/student/StudentDdpPage";
import { StudentAssignmentPage } from "./pages/student/StudentAssignmentPage";
import { FoundationPage } from "./components/FoundationPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/programs" element={<ProgramsPage />} />
        <Route path="/programs/:slug" element={<ProgramDetailPage />} />
        <Route path="/programs/:slug/enroll" element={<BatchSelectionPage />} />
        <Route path="/programs/:slug/enroll/summary" element={<EnrollmentSummaryPage />} />
        <Route path="/programs/:slug/enroll/success" element={<EnrollmentConfirmationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/get-started" element={<GetStartedPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route path="/design-system" element={<DesignSystemPage />} />

      <Route element={<RequireAuth roles={["STUDENT"]} />}>
        <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboardPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="settings" element={<StudentSettingsPage />} />
        <Route path="notifications" element={<StudentNotificationsPage />} />
        <Route path="programs" element={<FoundationPageWrap area="Student" title="Programs" summary="Browse internship programs. Enrollment is not open in this step." cta={{ to: "/programs", label: "View public catalog" }} />} />
        <Route path="internships" element={<StudentInternshipsPage />} />
        <Route path="internship/:id" element={<StudentInternshipDetailPage />} />
        <Route path="internship/:id/schedule" element={<FoundationPageWrap area="Student" title="Schedule" summary="Week and day schedule from curriculum data." />} />
        <Route path="internship/:id/day/:dayId" element={<StudentDayPage />} />
        <Route path="internship/:enrollmentId/ddp/:dayId" element={<StudentDdpPage />} />
        <Route path="internship/:enrollmentId/day/:dayId/assignment/:assignmentId" element={<StudentAssignmentPage />} />
        <Route path="ddp" element={<FoundationPageWrap area="Student" title="DDP" summary="Daily development practice will open here." />} />
        <Route path="assignments" element={<FoundationPageWrap area="Student" title="Assignments" summary="Assignment list and submissions will open here." />} />
        <Route path="tests" element={<FoundationPageWrap area="Student" title="Tests" summary="Tests and attempts will open here." />} />
        <Route path="projects" element={<FoundationPageWrap area="Student" title="Projects" summary="Capstone and milestone work will open here." />} />
        <Route path="mentor" element={<FoundationPageWrap area="Student" title="Mentor" summary="Assigned mentor interaction will open here." />} />
        <Route path="doubts" element={<FoundationPageWrap area="Student" title="Doubts" summary="Questions and replies will open here." />} />
        <Route path="progress" element={<FoundationPageWrap area="Student" title="Progress" summary="Day-by-day completion will open here." />} />
        <Route path="attendance" element={<FoundationPageWrap area="Student" title="Attendance" summary="Attendance records for the batch will open here." />} />
        <Route path="documents" element={<FoundationPageWrap area="Student" title="Documents" summary="Internship documents from object storage will open here." />} />
        <Route path="certificates" element={<FoundationPageWrap area="Student" title="Certificates" summary="Issued certificates will open here." />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={["MENTOR"]} />}>
        <Route path="/mentor" element={<MentorLayout />}>
        <Route index element={<FoundationPageWrap area="Mentor" title="Overview" summary="Assigned batches and review queue." />} />
        <Route path="batches" element={<FoundationPageWrap area="Mentor" title="Batches" summary="Batches assigned to this mentor." />} />
        <Route path="students" element={<FoundationPageWrap area="Mentor" title="Students" summary="Students in assigned batches." />} />
        <Route path="doubts" element={<FoundationPageWrap area="Mentor" title="Doubts" summary="Doubt threads for assigned students." />} />
        <Route path="assignments" element={<FoundationPageWrap area="Mentor" title="Assignments" summary="Assignment review for assigned batches." />} />
        <Route path="projects" element={<FoundationPageWrap area="Mentor" title="Projects" summary="Project review for assigned batches." />} />
        <Route path="evaluations" element={<FoundationPageWrap area="Mentor" title="Evaluations" summary="Scores and feedback." />} />
        <Route path="sessions" element={<FoundationPageWrap area="Mentor" title="Sessions" summary="Mentorship sessions." />} />
        <Route path="notifications" element={<FoundationPageWrap area="Mentor" title="Notifications" summary="Mentor notifications." />} />
        <Route path="profile" element={<FoundationPageWrap area="Mentor" title="Profile" summary="Mentor profile." />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={["ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<FoundationPageWrap area="Admin" title="Overview" summary="Operations overview. Super Admin has full access." />} />
        <Route path="students" element={<FoundationPageWrap area="Admin" title="Students" summary="Student directory." />} />
        <Route path="programs" element={<FoundationPageWrap area="Admin" title="Programs" summary="Create and publish programs." />} />
        <Route path="batches" element={<FoundationPageWrap area="Admin" title="Batches" summary="Batch management." />} />
        <Route path="mentors" element={<FoundationPageWrap area="Admin" title="Mentors" summary="Mentor assignment." />} />
        <Route path="curriculum" element={<FoundationPageWrap area="Admin" title="Curriculum" summary="Weeks and days. Never hard-coded in the client." />} />
        <Route path="content" element={<FoundationPageWrap area="Admin" title="Content" summary="Videos, notes, and resources via object storage." />} />
        <Route path="ddp" element={<FoundationPageWrap area="Admin" title="DDP" summary="DDP authoring." />} />
        <Route path="assignments" element={<FoundationPageWrap area="Admin" title="Assignments" summary="Assignment authoring." />} />
        <Route path="tests" element={<FoundationPageWrap area="Admin" title="Tests" summary="Test authoring." />} />
        <Route path="projects" element={<FoundationPageWrap area="Admin" title="Projects" summary="Project authoring." />} />
        <Route path="evaluations" element={<FoundationPageWrap area="Admin" title="Evaluations" summary="Evaluation oversight." />} />
        <Route path="attendance" element={<FoundationPageWrap area="Admin" title="Attendance" summary="Attendance administration." />} />
        <Route path="certificates" element={<FoundationPageWrap area="Admin" title="Certificates" summary="Issuance and verification." />} />
        <Route path="notifications" element={<FoundationPageWrap area="Admin" title="Notifications" summary="Announcements and notifications." />} />
        <Route path="analytics" element={<FoundationPageWrap area="Admin" title="Analytics" summary="Platform analytics." />} />
        <Route path="reports" element={<FoundationPageWrap area="Admin" title="Reports" summary="Operational reports." />} />
        <Route path="settings" element={<FoundationPageWrap area="Admin" title="Settings" summary="System settings." />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function FoundationPageWrap(props: { area: string; title: string; summary: string; cta?: { to: string; label: string } }) {
  return <FoundationPage {...props} />;
}

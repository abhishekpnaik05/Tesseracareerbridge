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
import { MentorDashboardPage } from "./pages/mentor/MentorDashboardPage";
import { MentorInternshipsPage } from "./pages/mentor/MentorInternshipsPage";
import { MentorInternshipDetailPage } from "./pages/mentor/MentorInternshipDetailPage";
import { MentorInternshipDesignerPage } from "./pages/mentor/MentorInternshipDesignerPage";
import { MentorStudentsPage } from "./pages/mentor/MentorStudentsPage";
import { MentorAttendancePage } from "./pages/mentor/MentorAttendancePage";
import { MentorAssignmentsPage } from "./pages/mentor/MentorAssignmentsPage";
import { MentorDdpResultsPage } from "./pages/mentor/MentorDdpResultsPage";
import { MentorDoubtsPage } from "./pages/mentor/MentorDoubtsPage";
import { MentorAnnouncementsPage } from "./pages/mentor/MentorAnnouncementsPage";
import { MentorProfilePage } from "./pages/mentor/MentorProfilePage";
import { MentorNotificationsPage } from "./pages/mentor/MentorNotificationsPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminStudentsPage } from "./pages/admin/AdminStudentsPage";
import { AdminStudentDetailPage } from "./pages/admin/AdminStudentDetailPage";
import { AdminMentorsPage } from "./pages/admin/AdminMentorsPage";
import { AdminMentorDetailPage } from "./pages/admin/AdminMentorDetailPage";
import { AdminProgramsPage } from "./pages/admin/AdminProgramsPage";
import { AdminProgramDetailPage } from "./pages/admin/AdminProgramDetailPage";
import { AdminProgramEditPage } from "./pages/admin/AdminProgramEditPage";
import { AdminBatchesPage } from "./pages/admin/AdminBatchesPage";
import { AdminBatchEditPage } from "./pages/admin/AdminBatchEditPage";
import { AdminEnrollmentsPage } from "./pages/admin/AdminEnrollmentsPage";
import { AdminAttendancePage } from "./pages/admin/AdminAttendancePage";
import { AdminAnnouncementsPage } from "./pages/admin/AdminAnnouncementsPage";
import { AdminReportsPage } from "./pages/admin/AdminReportsPage";
import { AdminInternshipsPage } from "./pages/admin/AdminInternshipsPage";
import { AdminInternshipDetailPage } from "./pages/admin/AdminInternshipDetailPage";
import { AdminInternshipCreatePage } from "./pages/admin/AdminInternshipCreatePage";
import { AdminDdpPage } from "./pages/admin/AdminDdpPage";
import { AdminAssignmentsPage } from "./pages/admin/AdminAssignmentsPage";
import { AdminSettingsPage } from "./pages/admin/AdminSettingsPage";

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
        <Route index element={<MentorDashboardPage />} />
        <Route path="internships" element={<MentorInternshipsPage />} />
        <Route path="internships/:id" element={<MentorInternshipDetailPage />} />
        <Route path="internships/:id/design" element={<MentorInternshipDesignerPage />} />
        <Route path="internships/design" element={<MentorInternshipDesignerPage />} />
        <Route path="students" element={<MentorStudentsPage />} />
        <Route path="attendance" element={<MentorAttendancePage />} />
        <Route path="assignments" element={<MentorAssignmentsPage />} />
        <Route path="ddp-results" element={<MentorDdpResultsPage />} />
        <Route path="doubts" element={<MentorDoubtsPage />} />
        <Route path="announcements" element={<MentorAnnouncementsPage />} />
        <Route path="profile" element={<MentorProfilePage />} />
        <Route path="notifications" element={<MentorNotificationsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={["ADMIN", "CONTENT_MANAGER", "SUPER_ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="students" element={<AdminStudentsPage />} />
        <Route path="students/:studentId" element={<AdminStudentDetailPage />} />
        <Route path="programs" element={<AdminProgramsPage />} />
        <Route path="programs/create" element={<AdminProgramEditPage />} />
        <Route path="programs/:id" element={<AdminProgramDetailPage />} />
        <Route path="programs/:id/edit" element={<AdminProgramEditPage />} />
        <Route path="batches" element={<AdminBatchesPage />} />
        <Route path="batches/:id" element={<AdminInternshipDetailPage />} />
        <Route path="batches/:id/edit" element={<AdminBatchEditPage />} />
        <Route path="mentors" element={<AdminMentorsPage />} />
        <Route path="mentors/:mentorId" element={<AdminMentorDetailPage />} />
        <Route path="enrollments" element={<AdminEnrollmentsPage />} />
        <Route path="attendance" element={<AdminAttendancePage />} />
        <Route path="announcements" element={<AdminAnnouncementsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="internships" element={<AdminInternshipsPage />} />
        <Route path="internships/new" element={<AdminInternshipCreatePage />} />
        <Route path="internships/:id" element={<AdminInternshipDetailPage />} />
        <Route path="ddp" element={<AdminDdpPage />} />
        <Route path="assignments" element={<AdminAssignmentsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="curriculum" element={<FoundationPageWrap area="Admin" title="Curriculum" summary="Weeks and days. Never hard-coded in the client." />} />
        <Route path="content" element={<FoundationPageWrap area="Admin" title="Content" summary="Videos, notes, and resources via object storage." />} />
        <Route path="tests" element={<FoundationPageWrap area="Admin" title="Tests" summary="Test authoring." />} />
        <Route path="projects" element={<FoundationPageWrap area="Admin" title="Projects" summary="Project authoring." />} />
        <Route path="evaluations" element={<FoundationPageWrap area="Admin" title="Evaluations" summary="Evaluation oversight." />} />
        <Route path="certificates" element={<FoundationPageWrap area="Admin" title="Certificates" summary="Issuance and verification." />} />
        <Route path="notifications" element={<FoundationPageWrap area="Admin" title="Notifications" summary="Announcements and notifications." />} />
        <Route path="analytics" element={<FoundationPageWrap area="Admin" title="Analytics" summary="Platform analytics." />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function FoundationPageWrap(props: { area: string; title: string; summary: string; cta?: { to: string; label: string } }) {
  return <FoundationPage {...props} />;
}

import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  Home,
  LayoutList,
  MessageCircle,
  Settings,
  Trophy,
  UserRound,
} from "lucide-react";
import { StudentAccountProvider } from "../student/StudentAccountProvider";
import { AppShell, type AppNavGroup, type AppNavItem } from "./AppLayout";

const groups: AppNavGroup[] = [
  {
    label: "Learn",
    items: [
      { to: "/student", label: "Home", icon: Home, end: true },
      { to: "/student/internships", label: "My Internships", icon: Briefcase },
      { to: "/student/programs", label: "Programs", icon: GraduationCap },
      { to: "/student/ddp", label: "DDP", icon: LayoutList },
      { to: "/student/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/student/tests", label: "Tests", icon: FileText },
      { to: "/student/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    label: "Support",
    items: [
      { to: "/student/mentor", label: "Mentor", icon: UserRound },
      { to: "/student/doubts", label: "Doubts", icon: MessageCircle },
      { to: "/student/progress", label: "Progress", icon: Trophy },
      { to: "/student/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/student/documents", label: "Documents", icon: BookOpen },
      { to: "/student/certificates", label: "Certificates", icon: Award },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/student/profile", label: "Profile", icon: UserRound },
      { to: "/student/notifications", label: "Notifications", icon: Bell },
      { to: "/student/settings", label: "Settings", icon: Settings },
    ],
  },
];

const mobileLinks: AppNavItem[] = [
  { to: "/student", label: "Home", icon: Home, end: true },
  { to: "/student/internships", label: "Learn", icon: Briefcase },
  { to: "/student/assignments", label: "Tasks", icon: ClipboardList },
];

const accountLinks = [
  { to: "/student/profile", label: "Profile" },
  { to: "/student/settings", label: "Settings" },
  { to: "/student/notifications", label: "Notifications" },
];

export function StudentLayout() {
  return (
    <StudentAccountProvider>
      <AppShell
        role="Student"
        groups={groups}
        mobileLinks={mobileLinks}
        homeTo="/student"
        accountLinks={accountLinks}
        notificationsTo="/student/notifications"
      />
    </StudentAccountProvider>
  );
}

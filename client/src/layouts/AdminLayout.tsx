import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LayoutList,
  Settings,
  Trophy,
  Users,
  UserRound,
  Briefcase,
} from "lucide-react";
import { AppShell, type AppNavGroup, type AppNavItem } from "./AppLayout";

const groups: AppNavGroup[] = [
  {
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/students", label: "Students", icon: Users },
      { to: "/admin/mentors", label: "Mentors", icon: UserRound },
      { to: "/admin/programs", label: "Programs", icon: GraduationCap },
      { to: "/admin/internships", label: "Internships", icon: BookOpen },
      { to: "/admin/batches", label: "Batches", icon: BookOpen },
      { to: "/admin/enrollments", label: "Enrollments", icon: Users },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/admin/announcements", label: "Announcements", icon: Bell },
      { to: "/admin/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Learning",
    items: [
      { to: "/admin/ddp", label: "DDP", icon: LayoutList },
      { to: "/admin/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/admin/curriculum", label: "Curriculum", icon: LayoutList },
      { to: "/admin/content", label: "Content", icon: FileText },
      { to: "/admin/tests", label: "Tests", icon: FileText },
      { to: "/admin/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
      { to: "/admin/evaluations", label: "Evaluations", icon: ClipboardList },
      { to: "/admin/certificates", label: "Certificates", icon: Trophy },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
];

const mobileLinks: AppNavItem[] = [
  { to: "/admin", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/internships", label: "Internships", icon: Briefcase },
  { to: "/admin/reports", label: "Reports", icon: FileText },
];

export function AdminLayout() {
  return (
    <AppShell
      role="Admin"
      groups={groups}
      mobileLinks={mobileLinks}
      homeTo="/admin"
      accountLinks={[{ to: "/admin/settings", label: "Settings" }]}
      notificationsTo="/admin/notifications"
    />
  );
}

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
      { to: "/admin/programs", label: "Programs", icon: GraduationCap },
      { to: "/admin/batches", label: "Batches", icon: BookOpen },
      { to: "/admin/mentors", label: "Mentors", icon: UserRound },
    ],
  },
  {
    label: "Learning",
    items: [
      { to: "/admin/curriculum", label: "Curriculum", icon: LayoutList },
      { to: "/admin/content", label: "Content", icon: FileText },
      { to: "/admin/ddp", label: "DDP", icon: LayoutList },
      { to: "/admin/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/admin/tests", label: "Tests", icon: FileText },
      { to: "/admin/projects", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    label: "Operations",
    items: [
      { to: "/admin/evaluations", label: "Evaluations", icon: ClipboardList },
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/admin/certificates", label: "Certificates", icon: Trophy },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Analytics",
    items: [
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const mobileLinks: AppNavItem[] = [
  { to: "/admin", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/admin/programs", label: "Programs", icon: GraduationCap },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/analytics", label: "Insights", icon: BarChart3 },
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

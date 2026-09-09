import {
  Bell,
  BookOpen,
  ClipboardList,
  Home,
  LayoutDashboard,
  MessageCircle,
  Users,
  UserRound,
  CalendarCheck,
  Trophy,
} from "lucide-react";
import { AppShell, type AppNavGroup, type AppNavItem } from "./AppLayout";

const groups: AppNavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/mentor", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: "My Internships",
    items: [
      { to: "/mentor/internships", label: "My Internships", icon: Home },
      { to: "/mentor/internships/design", label: "Internship Designer", icon: BookOpen },
    ],
  },
  {
    label: "Students",
    items: [
      { to: "/mentor/students", label: "Students", icon: Users },
      { to: "/mentor/attendance", label: "Attendance", icon: CalendarCheck },
    ],
  },
  {
    label: "Reviews",
    items: [
      { to: "/mentor/assignments", label: "Assignment Reviews", icon: ClipboardList },
      { to: "/mentor/ddp-results", label: "DDP Results", icon: Trophy },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/mentor/doubts", label: "Doubts", icon: MessageCircle },
      { to: "/mentor/announcements", label: "Announcements", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/mentor/profile", label: "Profile", icon: UserRound },
      { to: "/mentor/notifications", label: "Notifications", icon: Bell },
    ],
  },
];

const mobileLinks: AppNavItem[] = [
  { to: "/mentor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/mentor/internships", label: "Internships", icon: Home },
  { to: "/mentor/students", label: "Students", icon: Users },
  { to: "/mentor/assignments", label: "Reviews", icon: ClipboardList },
];

export function MentorLayout() {
  return (
    <AppShell
      role="Mentor"
      groups={groups}
      mobileLinks={mobileLinks}
      homeTo="/mentor"
      accountLinks={[
        { to: "/mentor/profile", label: "Profile" },
        { to: "/mentor/notifications", label: "Notifications" },
      ]}
      notificationsTo="/mentor/notifications"
    />
  );
}

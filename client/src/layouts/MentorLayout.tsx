import {
  Bell,
  ClipboardList,
  FolderKanban,
  Home,
  LayoutDashboard,
  MessageCircle,
  Users,
  UserRound,
  Video,
} from "lucide-react";
import { AppShell, type AppNavGroup, type AppNavItem } from "./AppLayout";

const groups: AppNavGroup[] = [
  {
    items: [
      { to: "/mentor", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/mentor/batches", label: "My Batches", icon: Home },
      { to: "/mentor/students", label: "Students", icon: Users },
      { to: "/mentor/doubts", label: "Doubts", icon: MessageCircle },
      { to: "/mentor/assignments", label: "Assignments", icon: ClipboardList },
      { to: "/mentor/projects", label: "Projects", icon: FolderKanban },
      { to: "/mentor/evaluations", label: "Evaluations", icon: ClipboardList },
      { to: "/mentor/sessions", label: "Sessions", icon: Video },
      { to: "/mentor/notifications", label: "Notifications", icon: Bell },
      { to: "/mentor/profile", label: "Profile", icon: UserRound },
    ],
  },
];

const mobileLinks: AppNavItem[] = [
  { to: "/mentor", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/mentor/batches", label: "Batches", icon: Home },
  { to: "/mentor/evaluations", label: "Review", icon: ClipboardList },
  { to: "/mentor/students", label: "Students", icon: Users },
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

import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Bell, Menu, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { AccountMenu } from "../components/AccountMenu";
import { Brand } from "../components/Brand";
import { Drawer } from "../components/ui";
import { useOptionalStudentAccount } from "../student/StudentAccountProvider";

export interface AppNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface AppNavGroup {
  label?: string;
  items: AppNavItem[];
}

function NavList({ groups, onNavigate }: { groups: AppNavGroup[]; onNavigate?: () => void }) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.label ?? "main"} className={group.label ? "nav-group" : undefined}>
          {group.label ? <div className="nav-group__label">{group.label}</div> : null}
          {group.items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate}>
              <item.icon size={18} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </>
  );
}

export function AppShell({
  role,
  groups,
  mobileLinks,
  homeTo,
  accountLinks,
  notificationsTo,
}: {
  role: string;
  groups: AppNavGroup[];
  mobileLinks: AppNavItem[];
  homeTo: string;
  accountLinks: { to: string; label: string }[];
  notificationsTo?: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const student = useOptionalStudentAccount();
  const current =
    groups.flatMap((g) => g.items).find((item) =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to),
    )?.label ?? role;
  const nested = location.pathname !== homeTo;
  const unread = student?.account?.unreadNotificationCount ?? 0;

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        {nested ? (
          <button type="button" className="icon-btn back-btn" aria-label="Back" onClick={() => navigate(homeTo)}>
            <ArrowLeft size={20} />
          </button>
        ) : (
          <button type="button" className="icon-btn menu-btn" aria-label="Open navigation" onClick={() => setDrawerOpen(true)}>
            <Menu size={20} />
          </button>
        )}
        <Brand compact />
        <span className="app-header__title">{current}</span>
        <div className="app-header__actions">
          {notificationsTo ? (
            <NavLink to={notificationsTo} className="icon-btn icon-btn--link" aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}>
              <Bell size={18} />
              {unread > 0 ? <span className="icon-badge">{unread > 9 ? "9+" : unread}</span> : null}
            </NavLink>
          ) : null}
          <AccountMenu
            user={user}
            photoUrl={student?.account?.photoUrl}
            links={accountLinks}
            onLogout={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          />
        </div>
      </header>
      <div className="app-shell__body">
        <aside className="sidebar">
          <Brand />
          <nav aria-label={`${role} navigation`}>
            <NavList groups={groups} />
          </nav>
        </aside>
        <main id="main" className="main">
          <Outlet />
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Primary mobile">
        {mobileLinks.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            <item.icon size={18} aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
        <button type="button" className="bottom-nav__more" onClick={() => setDrawerOpen(true)}>
          <MoreHorizontal size={18} aria-hidden="true" />
          More
        </button>
      </nav>
      <Drawer open={drawerOpen} title={role} onClose={() => setDrawerOpen(false)}>
        <nav aria-label={`${role} menu`}>
          <NavList groups={groups} onNavigate={() => setDrawerOpen(false)} />
        </nav>
      </Drawer>
    </div>
  );
}

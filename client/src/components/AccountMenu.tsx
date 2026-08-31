import { Link } from "react-router-dom";
import type { AuthUser } from "@tesseracareerbridge/shared";
import { Avatar, Dropdown } from "./ui";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U"
  );
}

export function AccountMenu({
  user,
  photoUrl,
  links,
  onLogout,
}: {
  user: AuthUser | null;
  photoUrl?: string | null;
  links: { to: string; label: string }[];
  onLogout: () => void;
}) {
  return (
    <Dropdown
      trigger={
        <button type="button" className="account-menu__trigger" aria-label="Account menu" aria-haspopup="menu">
          <Avatar initials={initials(user?.displayName ?? "U")} src={photoUrl} alt="" size="sm" />
        </button>
      }
    >
      <p className="account-menu__name">{user?.displayName}</p>
      <p className="account-menu__email">{user?.email}</p>
      {links.map((link) => (
        <Link key={link.to} to={link.to} role="menuitem">
          {link.label}
        </Link>
      ))}
      <button type="button" role="menuitem" onClick={onLogout}>
        Log out
      </button>
    </Dropdown>
  );
}

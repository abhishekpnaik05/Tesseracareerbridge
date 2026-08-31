import { Menu } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { homePathForRole } from "../auth/home";
import { Brand } from "../components/Brand";
import { ButtonLink, Drawer } from "../components/ui";

const links = [
  { to: "/", label: "Home" },
  { to: "/programs", label: "Programs" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const appHome = user ? homePathForRole(user.role) : "/login";

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="public-header">
        <Brand />
        <nav className="public-nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="public-actions">
          <div className="public-actions__desktop">
            {user ? (
              <>
                <NavLink to={appHome}>Dashboard</NavLink>
                <button
                  type="button"
                  className="ui-btn ui-btn--ghost ui-btn--sm"
                  onClick={async () => {
                    await logout();
                    navigate("/", { replace: true });
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <ButtonLink to="/register" size="sm">
                  Get Started
                </ButtonLink>
              </>
            )}
          </div>
          <button type="button" className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
      </header>
      <Drawer open={open} title="Menu" onClose={() => setOpen(false)}>
        <nav aria-label="Mobile">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to={appHome} onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
              <button
                type="button"
                className="ui-btn ui-btn--ghost"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                  navigate("/", { replace: true });
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Login
              </NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>
                Get Started
              </NavLink>
            </>
          )}
        </nav>
      </Drawer>
      <main id="main">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="container footer-grid">
          <div>
            <Brand />
            <p>Structured internships for VTU students: daily learning, projects, mentorship, certification.</p>
          </div>
          <div>
            <h2>Programs</h2>
            <NavLink to="/programs">Programs</NavLink>
            <NavLink to="/how-it-works">How It Works</NavLink>
            <NavLink to="/about">About</NavLink>
          </div>
          <div>
            <h2>Company</h2>
            <NavLink to="/faq">FAQ</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          <div>
            <h2>Support</h2>
            <p>hello@tesseracareerbridge.example</p>
            <p>+91 00000 00000</p>
          </div>
          <div>
            <h2>Legal</h2>
            <NavLink to="/privacy">Privacy Policy</NavLink>
            <NavLink to="/terms">Terms</NavLink>
          </div>
        </div>
        <div className="container footer-note">
          © {new Date().getFullYear()} TesseraCareerBridge. Social channels: placeholders until official links are published.
        </div>
      </footer>
    </div>
  );
}

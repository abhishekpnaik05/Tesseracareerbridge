import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { UserRole } from "@tesseracareerbridge/shared";
import { LoadingState } from "../components/ui";
import { useAuth } from "./AuthProvider";
import { homePathForRole } from "./home";

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container auth-page">
        <LoadingState label="Checking your session" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (user.status === "PENDING_VERIFICATION" || !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (user.status === "SUSPENDED" || user.status === "DISABLED") {
    return <Navigate to="/login" replace />;
  }

  if (roles && user.role !== "SUPER_ADMIN" && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

export function GuestOnly() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container auth-page">
        <LoadingState label="Loading" />
      </div>
    );
  }

  if (user && user.emailVerified && user.status === "ACTIVE") {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}

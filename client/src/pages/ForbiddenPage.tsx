import { Link } from "react-router-dom";
import { PageMeta } from "../components/seo/PageMeta";
import { ButtonLink } from "../components/ui";
import { AuthScreen } from "../components/auth/AuthScreen";
import { useAuth } from "../auth/AuthProvider";
import { homePathForRole } from "../auth/home";

export function ForbiddenPage() {
  const { user } = useAuth();
  const home = user ? homePathForRole(user.role) : "/";

  return (
    <div className="container">
      <PageMeta title="TesseraCareerBridge | Access denied" description="You do not have access to this area." />
      <AuthScreen title="Access denied." lead="Your account does not have permission for that page.">
        <div className="auth-form">
          <ButtonLink to={home}>Go to your area</ButtonLink>
          <p className="t-caption">
            <Link to="/">Public site</Link>
          </p>
        </div>
      </AuthScreen>
    </div>
  );
}

import { PageMeta } from "../components/seo/PageMeta";
import { ButtonLink } from "../components/ui";
import { useSearchParams } from "react-router-dom";

export function GetStartedPage() {
  const [params] = useSearchParams();
  const program = params.get("program");
  const registerTo = program ? `/register?program=${encodeURIComponent(program)}` : "/register";

  return (
    <>
      <PageMeta
        title="TesseraCareerBridge | Get Started"
        description="Create a TesseraCareerBridge student account, then explore internship programs."
      />
      <div className="container page-hero pub-page-end">
        <p className="t-label">Get started</p>
        <h1>Choose a program first.</h1>
        <p className="pub-lead">
          Create a student account, verify your email, then sign in. Program enrollment comes in a later step.
          {program ? " You opened this page from a program listing." : ""}
        </p>
        <div className="hero__actions">
          <ButtonLink to={registerTo}>Create account</ButtonLink>
          <ButtonLink to="/programs" variant="outline">
            Browse programs
          </ButtonLink>
          <ButtonLink to="/login" variant="ghost">
            Login
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
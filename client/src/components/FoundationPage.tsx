import { Card } from "./ui";
import { ButtonLink } from "./ui";

export function FoundationPage({
  area,
  title,
  summary,
  cta,
}: {
  area: string;
  title: string;
  summary: string;
  cta?: { to: string; label: string };
}) {
  return (
    <section>
      <p className="t-label page-kicker">{area}</p>
      <h1>{title}</h1>
      <p>{summary}</p>
      <Card variant="subtle">
        <p>This area is prepared for a later product step. Nothing here is live yet.</p>
        {cta ? <ButtonLink to={cta.to}>{cta.label}</ButtonLink> : null}
      </Card>
    </section>
  );
}

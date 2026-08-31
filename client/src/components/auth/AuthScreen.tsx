import type { ReactNode } from "react";
import { Brand } from "../Brand";

export function AuthScreen({
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="auth-screen">
      <div className="auth-screen__panel">
        <p className="t-label">{eyebrow ?? "TesseraCareerBridge"}</p>
        <h1>{title}</h1>
        <p className="pub-lead">{lead}</p>
        {children}
      </div>
      <aside className="auth-screen__aside" aria-hidden={!aside}>
        {aside ?? (
          <>
            <Brand />
            <p>Structured internships, daily learning, and mentorship — in one account.</p>
          </>
        )}
      </aside>
    </div>
  );
}

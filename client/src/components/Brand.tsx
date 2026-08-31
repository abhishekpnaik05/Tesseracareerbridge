import { NavLink } from "react-router-dom";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <NavLink to="/" className="brand">
      <span className="brand__mark" aria-hidden="true">
        ◆
      </span>
      <span className="brand__name">{compact ? "TCB" : "TesseraCareerBridge"}</span>
    </NavLink>
  );
}

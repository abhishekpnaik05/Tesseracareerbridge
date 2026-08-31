import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "./Button";

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="ui-tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={`ui-tab ${value === tab.id ? "is-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Overlay({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="ui-overlay" role="presentation" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay onClose={onClose}>
      <div className="ui-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </Overlay>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay onClose={onClose}>
      <div className="ui-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{body}</p>
        <div className="row">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </Overlay>
  );
}

export function Drawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const first = panelRef.current?.querySelector<HTMLElement>("button, a, [tabindex]:not([tabindex='-1'])");
    first?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <button type="button" className="ui-drawer-backdrop" aria-label="Close menu" onClick={onClose} />
      <aside ref={panelRef} className="ui-drawer app-drawer is-open" role="dialog" aria-modal="true" aria-label={title ?? "Menu"}>
        <div className="ui-drawer__head">
          {title ? <h2>{title}</h2> : <span />}
          <button type="button" className="icon-btn" aria-label="Close menu" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}

export function BottomSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <Overlay onClose={onClose}>
      <div className="ui-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <h2 id="sheet-title">{title}</h2>
        {children}
      </div>
    </Overlay>
  );
}

export function Dropdown({
  label,
  trigger,
  children,
  align = "end",
}: {
  label?: string;
  trigger?: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("ui-dropdown", align === "start" && "ui-dropdown--start")} ref={rootRef}>
      {trigger ? (
        <div
          onClick={() => setOpen((v) => !v)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpen((v) => !v);
            }
          }}
        >
          {trigger}
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-haspopup="menu">
          {label}
        </Button>
      )}
      {open ? (
        <div className="ui-dropdown__menu" role="menu" onClick={() => setOpen(false)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>
          {item}
          {index < items.length - 1 ? " / " : ""}
        </span>
      ))}
    </nav>
  );
}

export function Pagination({
  page,
  pages,
  onPrevious,
  onNext,
}: {
  page: number;
  pages: number;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="ui-pagination">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={onPrevious} aria-label="Previous page">
        Previous
      </Button>
      <span className="ui-pagination__status">
        Page {page} of {pages}
      </span>
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={onNext} aria-label="Next page">
        Next
      </Button>
    </div>
  );
}

export function Avatar({
  initials,
  src,
  alt,
  size = "md",
}: {
  initials: string;
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className={cn("ui-avatar", size !== "md" && `ui-avatar--${size}`)} aria-hidden={!src && !alt}>
      {src ? <img src={src} alt={alt ?? ""} /> : initials}
    </div>
  );
}

export function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useId, useState, type ReactNode } from "react";

export function Accordion({
  items,
  allowMultiple = false,
}: {
  items: { id: string; title: string; body: ReactNode }[];
  allowMultiple?: boolean;
}) {
  const [openIds, setOpenIds] = useState<string[]>([]);
  const baseId = useId();

  function toggle(id: string) {
    setOpenIds((current) => {
      const isOpen = current.includes(id);
      if (allowMultiple) {
        return isOpen ? current.filter((item) => item !== id) : [...current, id];
      }
      return isOpen ? [] : [id];
    });
  }

  return (
    <div className="ui-accordion">
      {items.map((item) => {
        const open = openIds.includes(item.id);
        const panelId = `${baseId}-${item.id}`;
        return (
          <div key={item.id} className="ui-accordion__item">
            <h3>
              <button
                type="button"
                className="ui-accordion__trigger"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <span aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
            </h3>
            <div id={panelId} role="region" hidden={!open} className="ui-accordion__panel">
              {typeof item.body === "string" ? <p>{item.body}</p> : item.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}

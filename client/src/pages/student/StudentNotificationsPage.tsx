import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { NotificationDto } from "@tesseracareerbridge/shared";
import { Badge, Button, Card, EmptyState, ErrorState } from "../../components/ui";
import { apiGet, apiPost, ApiRequestError } from "../../lib/api";
import { useStudentAccount } from "../../student/StudentAccountProvider";

function formatWhen(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function StudentNotificationsPage() {
  const { reload } = useStudentAccount();
  const [items, setItems] = useState<NotificationDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("ALL");

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await apiGet<{ items: NotificationDto[] }>("/notifications");
      setItems(data.items);
    } catch (err) {
      setItems(null);
      setError(err instanceof ApiRequestError ? err.message : "Unable to load notifications.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markOne(id: string) {
    await apiPost(`/notifications/${id}/read`);
    await load();
    await reload();
  }

  async function markAll() {
    await apiPost("/notifications/read-all");
    await load();
    await reload();
  }

  const visible = (items ?? []).filter((item) => filter === "ALL" || item.category === filter);
  const categories = ["ALL", "LEARNING", "ASSIGNMENT", "DDP", "TEST", "MENTOR", "ANNOUNCEMENT", "CERTIFICATE", "ACCOUNT"];

  return (
    <div className="student-page">
      <p className="t-label page-kicker">Account</p>
      <h1>Notifications</h1>
      <div className="notice-toolbar">
        <label className="t-caption" htmlFor="notice-filter">
          Category
          <select id="notice-filter" className="ui-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "ALL" ? "All" : category.toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" size="sm" onClick={() => void markAll()} disabled={!items?.some((item) => !item.readAt)}>
          Mark all as read
        </Button>
      </div>

      {error ? (
        <ErrorState title="Unable to load notifications." body="Try again in a moment.">
          <Button onClick={() => void load()}>Try again</Button>
        </ErrorState>
      ) : null}

      {!error && items && visible.length === 0 ? (
        <Card>
          <EmptyState title="No notifications." body="You will see learning, mentor, and announcement updates here." />
        </Card>
      ) : null}

      <ul className="notice-list">
        {visible.map((item) => (
          <li key={item.id}>
            <Card className={item.readAt ? "entity-card" : "entity-card notice-unread"}>
              <div className="entity-card__top">
                {item.href ? <Link to={item.href}><h2>{item.title}</h2></Link> : <h2>{item.title}</h2>}
                <Badge tone={item.readAt ? "muted" : "accent"}>{item.readAt ? "Read" : "Unread"}</Badge>
              </div>
              <p>{item.body}</p>
              <div className="entity-meta">
                <span>{item.category.toLowerCase()}</span>
                <span>{item.priority.toLowerCase()}</span>
                <span>{formatWhen(item.createdAt)}</span>
              </div>
              {!item.readAt ? (
                <Button variant="ghost" size="sm" onClick={() => void markOne(item.id)}>
                  Mark as read
                </Button>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}

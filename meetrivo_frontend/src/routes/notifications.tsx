import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FiCheckCircle, FiBell } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";
import { notifications as notifApi } from "@/lib/apiClient";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Meetrivo" }] }),
  component: NotificationsPage,
});

const priorityStyles: Record<string, string> = {
  HIGH: "bg-destructive/15 text-destructive",
  NORMAL: "bg-primary/15 text-primary",
  LOW: "bg-surface text-muted-foreground",
  high: "bg-destructive/15 text-destructive",
  normal: "bg-primary/15 text-primary",
  low: "bg-surface text-muted-foreground",
};

function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const unread = items.filter((n: any) => !n.read).length;

  useEffect(() => {
    notifApi
      .getAll()
      .then((data) => {
        if (data && data.length > 0) {
          const mapped = data.map((n: any) => ({
            id: n.id,
            title: n.title,
            time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
            read: n.read,
            priority: n.type === "ALERT" ? "high" : n.type === "INFO" ? "low" : "normal",
          }));
          setItems(mapped as any);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    try {
      await notifApi.markAllRead();
    } catch (_) {}
    setItems((prev: any[]) => prev.map((n: any) => ({ ...n, read: true })));
  };

  const toggle = async (id: string) => {
    try {
      await notifApi.markRead(id);
    } catch (_) {}
    setItems((prev: any[]) => prev.map((n: any) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <AppShell>
      <Reveal>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Notifications</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unread} unread · {items.length} total
            </p>
          </div>
          <button
            onClick={markAll}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <FiCheckCircle className="h-4 w-4" /> Mark all read
          </button>
        </div>
      </Reveal>

      <div className="mt-6 space-y-2.5">
        {items.map((n, i) => (
          <Reveal key={n.id} delay={i * 0.04}>
            <button
              onClick={() => toggle(n.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                n.read ? "border-border bg-card/50" : "border-primary/30 bg-card"
              }`}
            >
              {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${n.read ? "text-muted-foreground" : "font-medium"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-muted-foreground">{n.time}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${priorityStyles[n.priority]}`}
              >
                {n.priority}
              </span>
            </button>
          </Reveal>
        ))}
      </div>
    </AppShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";
import { notifications as seed } from "@/data/mock";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Meetrivo" }] }),
  component: NotificationsPage,
});

const priorityStyles: Record<string, string> = {
  high: "bg-destructive/15 text-destructive",
  normal: "bg-primary/15 text-primary",
  low: "bg-surface text-muted-foreground",
};

function NotificationsPage() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((n) => !n.read).length;

  const markAll = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const toggle = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

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

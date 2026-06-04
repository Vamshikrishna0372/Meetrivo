import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FiSearch, FiVideo, FiInbox } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";
import { recentMeetings } from "@/data/mock";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Meeting history — Meetrivo" }] }),
  component: HistoryPage,
});

const filters = ["All", "Completed", "Missed"] as const;

function HistoryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const results = useMemo(() => {
    return recentMeetings.filter((m) => {
      const matchQ = m.title.toLowerCase().includes(query.toLowerCase());
      const matchF =
        filter === "All" ||
        (filter === "Completed" && m.status === "completed") ||
        (filter === "Missed" && m.status === "missed");
      return matchQ && matchF;
    });
  }, [query, filter]);

  return (
    <AppShell>
      <Reveal>
        <h1 className="text-2xl font-bold sm:text-3xl">Meeting history</h1>
        <p className="mt-1 text-sm text-muted-foreground">Search and revisit your past sessions.</p>
      </Reveal>

      <div className="mt-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search meetings..."
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-gradient-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {results.length === 0 ? (
          <Reveal>
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground">
                <FiInbox className="h-6 w-6" />
              </span>
              <p className="font-semibold">No meetings found</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          </Reveal>
        ) : (
          <div className="relative space-y-3 pl-5">
            <span className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
            {results.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <div className="relative rounded-2xl border border-border bg-card p-4">
                  <span
                    className={`absolute -left-[1.4rem] top-5 h-3 w-3 rounded-full ring-4 ring-background ${
                      m.status === "missed" ? "bg-destructive" : "bg-primary"
                    }`}
                  />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-primary">
                        <FiVideo className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{m.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.date} · {m.duration} · {m.participants} people
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${
                        m.status === "missed"
                          ? "bg-destructive/15 text-destructive"
                          : "bg-success/15 text-success"
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

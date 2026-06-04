import { createFileRoute } from "@tanstack/react-router";
import { FiEdit2, FiVideo, FiClock, FiLayers } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/data/mock";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Meetrivo" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const stats = [
    { icon: FiVideo, label: "Meetings", value: currentUser.stats.meetings },
    { icon: FiClock, label: "Hours", value: currentUser.stats.hours },
    { icon: FiLayers, label: "Workspaces", value: currentUser.stats.workspaces },
  ];

  return (
    <AppShell>
      <Reveal>
        <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information.</p>
      </Reveal>

      <div className="mt-6 space-y-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-[80px]" />
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
                {currentUser.initials}
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{currentUser.name}</h2>
                <p className="text-sm text-muted-foreground">{currentUser.role}</p>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
              </div>
              <Button variant="glass" size="sm">
                <FiEdit2 /> Edit profile
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-card p-5">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold">User information</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Full name", currentUser.name],
                ["Email", currentUser.email],
                ["Role", currentUser.role],
                ["Member since", "Jan 2024"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </AppShell>
  );
}

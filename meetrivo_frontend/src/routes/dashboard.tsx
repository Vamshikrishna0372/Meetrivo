import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiVideo,
  FiLogIn,
  FiArrowRight,
  FiClock,
  FiBell,
  FiActivity,
  FiTrendingUp,
  FiCalendar,
  FiUsers,
  FiCircle,
  FiHardDrive,
} from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  currentUser,
  recentMeetings,
  upcomingMeetings,
  notifications,
  activity,
  analytics,
  workspaceStatus,
} from "@/data/mock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Meetrivo" }] }),
  component: Dashboard,
});

const stagger = {
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

type PreviewMeeting = {
  title: string;
  meta: string;
  participants: number;
  host?: string;
  status?: string;
};

function Dashboard() {
  const [preview, setPreview] = useState<PreviewMeeting | null>(null);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell>
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
        {/* Welcome */}
        <motion.div
          variants={item}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-surface p-6 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-[80px]" />
          <p className="text-sm text-muted-foreground">Good to see you,</p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {currentUser.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            You have {unread} unread {unread === 1 ? "notification" : "notifications"} and{" "}
            {upcomingMeetings.length} meetings coming up today.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="hero" asChild>
              <Link to="/create">
                <FiVideo /> New meeting
              </Link>
            </Button>
            <Button variant="glass" asChild>
              <Link to="/join">
                <FiLogIn /> Join a room
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Quick actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div variants={item}>
            <ActionCard
              icon={FiVideo}
              title="Create Room"
              desc="Spin up an instant meeting room and invite your team."
              cta="Start now"
              to="/create"
              accent
            />
          </motion.div>
          <motion.div variants={item}>
            <ActionCard
              icon={FiLogIn}
              title="Join Room"
              desc="Enter a room code or scan a QR to join in seconds."
              cta="Join meeting"
              to="/join"
            />
          </motion.div>
        </div>

        {/* Workspace status */}
        <motion.div variants={item}>
          <Panel title="Workspace status" icon={FiUsers}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground">
                  {workspaceStatus.name.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold">{workspaceStatus.name}</p>
                  <p className="text-xs text-muted-foreground">{workspaceStatus.plan}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5">
                <FiCircle className="h-2.5 w-2.5 fill-success text-success" />
                <span className="text-xs font-medium">{workspaceStatus.online} online now</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat icon={FiUsers} label="Members" value={`${workspaceStatus.members}`} />
              <Stat icon={FiVideo} label="Active rooms" value={`${workspaceStatus.activeRooms}`} />
              <Stat icon={FiHardDrive} label="Storage" value={`${workspaceStatus.storageUsed}%`} />
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                <span>Storage used</span>
                <span>{workspaceStatus.storageUsed}% of 100 GB</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className="h-full rounded-full bg-gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${workspaceStatus.storageUsed}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </Panel>
        </motion.div>

        {/* Analytics preview */}
        <motion.div variants={item}>
          <Panel title="Meeting analytics" icon={FiTrendingUp}>
            <div className="grid gap-4 sm:grid-cols-3">
              {analytics.map((a) => (
                <div
                  key={a.label}
                  className="card-interactive rounded-xl border border-border bg-background/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{a.label}</p>
                    <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                      {a.trend}
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-bold">{a.value}</p>
                  <Sparkline data={a.spark} />
                </div>
              ))}
            </div>
          </Panel>
        </motion.div>

        {/* Upcoming meetings */}
        <motion.div variants={item}>
          <Panel title="Upcoming meetings" icon={FiCalendar} action={{ label: "Schedule", to: "/history" }}>
            <div className="grid gap-3 sm:grid-cols-2">
              {upcomingMeetings.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    setPreview({
                      title: m.title,
                      meta: `${m.time} · ${m.relative}`,
                      participants: m.participants,
                      host: m.host,
                      status: "upcoming",
                    })
                  }
                  className="card-interactive flex flex-col rounded-xl border border-border bg-background/50 p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                      {m.relative}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">{m.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Hosted by {m.host} · {m.participants} people
                  </p>
                </button>
              ))}
            </div>
          </Panel>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Recent meetings */}
          <motion.div variants={item} className="lg:col-span-2">
            <Panel title="Recent meetings" icon={FiClock} action={{ label: "View all", to: "/history" }}>
              <div className="space-y-2">
                {recentMeetings.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      setPreview({
                        title: m.title,
                        meta: `${m.date} · ${m.duration}`,
                        participants: m.participants,
                        status: m.status,
                      })
                    }
                    className="card-interactive flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-left"
                  >
                    <span
                      className={`h-9 w-1 rounded-full ${m.status === "missed" ? "bg-destructive" : "bg-primary"}`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.date} · {m.duration} · {m.participants} people
                      </p>
                    </div>
                    <FiArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Activity */}
          <motion.div variants={item}>
            <Panel title="Activity" icon={FiActivity}>
              <div className="space-y-4">
                {activity.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    <div>
                      <p className="text-sm">{a.text}</p>
                      <p className="text-xs text-muted-foreground">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={item} className="lg:col-span-2">
            <Panel title="Notifications" icon={FiBell} action={{ label: "Open", to: "/notifications" }}>
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3"
                  >
                    {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    <p className={`flex-1 text-sm ${n.read ? "text-muted-foreground" : ""}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-muted-foreground">{n.time}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </motion.div>

          {/* Profile shortcut */}
          <motion.div variants={item}>
            <Panel title="Your profile" icon={FiUsers}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-base font-semibold text-primary-foreground">
                  {currentUser.initials}
                </span>
                <div>
                  <p className="text-sm font-semibold">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                </div>
              </div>
              <Button variant="glass" className="mt-4 w-full" size="sm" asChild>
                <Link to="/profile">
                  View profile <FiArrowRight />
                </Link>
              </Button>
            </Panel>
          </motion.div>
        </div>
      </motion.div>

      {/* Meeting preview modal */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-6">{preview.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3">
                  <span className="text-sm text-muted-foreground">{preview.meta}</span>
                  {preview.status && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        preview.status === "missed"
                          ? "bg-destructive/15 text-destructive"
                          : preview.status === "upcoming"
                            ? "bg-primary/15 text-primary"
                            : "bg-success/15 text-success"
                      }`}
                    >
                      {preview.status}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Meta label="Participants" value={`${preview.participants} people`} />
                  {preview.host && <Meta label="Host" value={preview.host} />}
                </div>
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/room">
                    <FiVideo /> {preview.status === "upcoming" ? "Join when live" : "Open room"}
                  </Link>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ActionCard({
  icon: Icon,
  title,
  desc,
  cta,
  to,
  accent,
}: {
  icon: typeof FiVideo;
  title: string;
  desc: string;
  cta: string;
  to?: string;
  accent?: boolean;
}) {
  return (
    <div className="card-interactive flex h-full flex-col rounded-2xl border border-border bg-card p-6">
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${accent ? "bg-gradient-primary text-primary-foreground" : "bg-surface text-primary"}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{desc}</p>
      <Button variant={accent ? "hero" : "glass"} className="mt-4 w-full" asChild={!!to}>
        {to ? <Link to={to}>{cta}</Link> : cta}
      </Button>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof FiVideo; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-muted-foreground" />
      <p className="mt-1.5 text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface/40 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => `${i * step},${h - ((d - min) / range) * h}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-7 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: typeof FiVideo;
  action?: { label: string; to: string };
  children: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-muted-foreground" /> {title}
        </h3>
        {action && (
          <Link to={action.to} className="text-xs text-primary hover:underline">
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

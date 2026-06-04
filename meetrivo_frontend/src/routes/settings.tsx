import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FiMoon, FiBell, FiMic, FiShield } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Meetrivo" }] }),
  component: SettingsPage,
});

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-surface"}`}
      aria-pressed={on}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function SettingsPage() {
  const [prefs, setPrefs] = useState({
    dark: true,
    notifs: true,
    sound: true,
    hd: false,
    presence: true,
    readReceipts: false,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const sections = [
    {
      title: "Appearance",
      icon: FiMoon,
      rows: [{ label: "Dark theme", desc: "Premium dark interface", key: "dark" as const }],
    },
    {
      title: "Notifications",
      icon: FiBell,
      rows: [
        { label: "Push notifications", desc: "Meeting invites & mentions", key: "notifs" as const },
        { label: "Notification sound", desc: "Play a sound on new alerts", key: "sound" as const },
      ],
    },
    {
      title: "Devices",
      icon: FiMic,
      rows: [{ label: "Default HD video", desc: "Join meetings in high definition", key: "hd" as const }],
    },
    {
      title: "Privacy",
      icon: FiShield,
      rows: [
        { label: "Show presence", desc: "Let teammates see you're online", key: "presence" as const },
        { label: "Read receipts", desc: "Share when you've read messages", key: "readReceipts" as const },
      ],
    },
  ];

  return (
    <AppShell>
      <Reveal>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Customize your Meetrivo experience.</p>
      </Reveal>

      <div className="mt-6 space-y-5">
        {sections.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.05}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <s.icon className="h-4 w-4 text-primary" /> {s.title}
              </h3>
              <div className="mt-4 space-y-4">
                {s.rows.map((r) => (
                  <div key={r.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.desc}</p>
                    </div>
                    <Toggle on={prefs[r.key]} onClick={() => toggle(r.key)} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </AppShell>
  );
}

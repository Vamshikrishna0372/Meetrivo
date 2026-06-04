import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowRight,
  FiChevronLeft,
  FiLoader,
  FiLock,
  FiMaximize,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/Field";
import { cn } from "@/lib/utils";
import { currentUser, knownRooms } from "@/data/mock";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Join meeting — Meetrivo" }] }),
  component: JoinMeeting,
});

type Room = (typeof knownRooms)[string];
type Phase = "form" | "verifying" | "preview";

function JoinMeeting() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("form");
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState(currentUser.name);
  const [error, setError] = useState("");
  const [room, setRoom] = useState<Room | null>(null);

  const verify = () => {
    const id = roomId.trim().toUpperCase();
    if (!id) {
      setError("Enter a meeting ID to continue.");
      return;
    }
    if (!name.trim()) {
      setError("Add a display name so others recognise you.");
      return;
    }
    setError("");
    setPhase("verifying");
    setTimeout(() => {
      const found = knownRooms[id];
      if (!found) {
        setPhase("form");
        setError("We couldn't find that room. Try MTR-481-902 or MTR-204-115.");
        return;
      }
      setRoom(found);
      setPhase("preview");
    }, 1100);
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Join a meeting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verify the room, preview the workspace, then step in.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {phase !== "preview" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <Field
                label="Meeting ID"
                placeholder="MTR-481-902"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={phase === "verifying"}
              />
              <Field
                label="Display name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={phase === "verifying"}
                maxLength={40}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
                >
                  <FiAlertCircle className="h-4 w-4 shrink-0" /> {error}
                </motion.p>
              )}

              <Button
                variant="hero"
                className="w-full"
                onClick={verify}
                disabled={phase === "verifying"}
              >
                {phase === "verifying" ? (
                  <>
                    <FiLoader className="animate-spin" /> Verifying room…
                  </>
                ) : (
                  <>
                    Verify room <FiArrowRight />
                  </>
                )}
              </Button>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <Button variant="outline" className="w-full" disabled={phase === "verifying"}>
                <FiMaximize /> Join via QR scan
              </Button>
            </motion.div>
          )}

          {phase === "preview" && room && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{room.title}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">Hosted by {room.host}</p>
                  </div>
                  <StatusBadge status={room.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Meta icon={FiShield} label="Privacy" value={room.privacy} />
                  <Meta icon={FiUser} label="Room type" value={room.type} />
                </div>

                <div className="rounded-xl border border-border bg-surface/40 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <FiUsers className="h-3.5 w-3.5" /> {room.participants.length} in the room
                  </div>
                  <div className="flex -space-x-2">
                    {room.participants.map((p, i) => (
                      <span
                        key={i}
                        className="grid h-9 w-9 place-items-center rounded-full border-2 border-card bg-gradient-primary text-xs font-semibold text-primary-foreground"
                      >
                        {p.initials}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
                  <FiLock className="h-3.5 w-3.5" /> Secure workspace — your connection is encrypted.
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setPhase("form")}>
                  <FiChevronLeft /> Back
                </Button>
                <Button variant="hero" onClick={() => navigate({ to: "/lobby" })}>
                  Join workspace <FiArrowRight />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: Room["status"] }) {
  const map = {
    live: { label: "Live now", cls: "bg-success/15 text-success" },
    starting: { label: "Starting soon", cls: "bg-warning/15 text-warning" },
    scheduled: { label: "Scheduled", cls: "bg-primary/15 text-primary" },
  } as const;
  const s = map[status];
  return (
    <span className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.label}
    </span>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof FiUser; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

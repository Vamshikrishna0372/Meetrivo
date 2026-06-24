import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheck,
  FiChevronLeft,
  FiCopy,
  FiEdit2,
  FiLock,
  FiShield,
  FiUser,
  FiVideo,
  FiLoader,
} from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/Field";
import { QrCode } from "@/components/shared/QrCode";
import { cn } from "@/lib/utils";
import { meetingTypes, privacyLevels } from "@/data/mock";
import { meetings as meetingsApi, auth } from "@/lib/apiClient";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Create meeting — Meetrivo" }] }),
  component: CreateMeeting,
});

const steps = ["Configure", "Review", "Created"];

function genId() {
  const block = () => Math.floor(100 + Math.random() * 900);
  return `MTR-${block()}-${block()}`;
}

type Form = {
  title: string;
  description: string;
  type: string;
  privacy: string;
  passcode: string;
};

function CreateMeeting() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>({
    title: "",
    description: "",
    type: "video",
    privacy: "open",
    passcode: "",
  });
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<any>(null);

  const [generatedRoomId, setGeneratedRoomId] = useState(() => genId());
  const roomId = createdMeeting?.meetingCode || generatedRoomId;
  const link = typeof window !== 'undefined'
    ? `${window.location.origin}/lobby?code=${roomId}`
    : `https://meetrivo.com/j/${roomId}`;

  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        scheduled: false,
        passwordProtected: form.privacy === "passcode",
        meetingPassword: form.privacy === "passcode" ? form.passcode : undefined,
        visibility: form.privacy === "open" ? "PUBLIC" : "PRIVATE",
        maxParticipants: 100,
        waitingRoomEnabled: form.privacy === "locked",
        recordingEnabled: true,
        chatEnabled: true,
        screenShareEnabled: true,
      };
      const res = await meetingsApi.create(payload);
      setCreatedMeeting(res);
      if (res?.meetingCode) {
        localStorage.setItem("current_meeting_code", res.meetingCode);
        localStorage.setItem("current_meeting_id", res.id);
      }
      setStep(2);
    } catch (e: any) {
      alert(e.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  const errors = {
    title:
      form.title.trim().length === 0
        ? "Give your meeting a clear title."
        : form.title.trim().length < 3
          ? "Title should be at least 3 characters."
          : "",
    passcode:
      form.privacy === "passcode" && form.passcode.trim().length < 4
        ? "Passcode needs at least 4 characters."
        : "",
  };
  const valid = !errors.title && !errors.passcode;

  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Create a meeting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your room, review the details, and share it with your team.
          </p>
        </div>

        <Stepper step={step} />

        <AnimatePresence mode="wait">
          {step === 0 && (
            <Pane key="configure">
              <div className="space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div>
                  <Field
                    label="Meeting title"
                    placeholder="e.g. Q3 Roadmap Sync"
                    value={form.title}
                    onChange={(e) => set({ title: e.target.value })}
                    onBlur={() => setTouched(true)}
                    error={touched ? errors.title : undefined}
                    maxLength={80}
                  />
                  <Helper>{form.title.length}/80 — keep it short and recognisable.</Helper>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(e) => set({ description: e.target.value })}
                    placeholder="Add an agenda or context for participants (optional)."
                    rows={3}
                    maxLength={240}
                    className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/30"
                  />
                  <Helper>{form.description.length}/240 — visible to everyone who joins.</Helper>
                </label>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Meeting type</span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {meetingTypes.map((t) => (
                      <OptionCard
                        key={t.id}
                        selected={form.type === t.id}
                        onClick={() => set({ type: t.id })}
                        title={t.label}
                        desc={t.desc}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Privacy level</span>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {privacyLevels.map((p) => (
                      <OptionCard
                        key={p.id}
                        selected={form.privacy === p.id}
                        onClick={() => set({ privacy: p.id })}
                        title={p.label}
                        desc={p.desc}
                      />
                    ))}
                  </div>
                </div>

                {form.privacy === "passcode" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="overflow-hidden"
                  >
                    <Field
                      label="Passcode"
                      placeholder="Set a passcode"
                      value={form.passcode}
                      onChange={(e) => set({ passcode: e.target.value })}
                      onBlur={() => setTouched(true)}
                      error={touched ? errors.passcode : undefined}
                      maxLength={12}
                    />
                    <Helper>Share this passcode only with invited guests.</Helper>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })}>
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={() => {
                    setTouched(true);
                    if (valid) setStep(1);
                  }}
                >
                  Review meeting
                </Button>
              </div>
            </Pane>
          )}

          {step === 1 && (
            <Pane key="review">
              <div className="grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:p-6">
                <div className="space-y-4">
                  <ReviewRow label="Title" value={form.title} />
                  <ReviewRow label="Host" value={auth.getUser()?.fullName || auth.getUser()?.username || "Host"} icon={FiUser} />
                  <ReviewRow
                    label="Room type"
                    value={meetingTypes.find((t) => t.id === form.type)?.label ?? ""}
                    icon={FiVideo}
                  />
                  <ReviewRow
                    label="Privacy"
                    value={privacyLevels.find((p) => p.id === form.privacy)?.label ?? ""}
                    icon={FiShield}
                  />
                  <ReviewRow label="Meeting ID" value={roomId} mono />
                  {form.description && (
                    <ReviewRow label="Description" value={form.description} />
                  )}
                  <div className="rounded-xl border border-border bg-surface/40 p-3">
                    <p className="text-xs text-muted-foreground">Invite link</p>
                    <p className="mt-0.5 truncate text-sm font-medium">{link}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 p-4">
                  <QrCode value={link} size={140} />
                  <p className="text-xs text-muted-foreground">Scan to join</p>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(0)} disabled={loading}>
                  <FiChevronLeft /> Edit
                </Button>
                <Button variant="hero" onClick={handleCreate} disabled={loading}>
                  {loading && <FiLoader className="animate-spin mr-1" />}
                  {loading ? "Creating..." : "Create workspace"}
                </Button>
              </div>
            </Pane>
          )}

          {step === 2 && (
            <Pane key="created">
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
                <motion.span
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow"
                >
                  <FiCheck className="h-8 w-8" />
                </motion.span>
                <div>
                  <h2 className="text-xl font-bold">Workspace created</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    “{form.title}” is ready. Share the details below or step into the lobby.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-surface/40 p-4">
                  <QrCode value={link} size={150} />
                </div>

                <div className="flex items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-2 text-sm">
                  <FiLock className="h-3.5 w-3.5 text-success" />
                  <span className="font-mono font-medium">{roomId}</span>
                </div>

                <CopyButton value={link} label="Copy invite link" />

                <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row">
                  <Button
                    variant="glass"
                    className="flex-1"
                    onClick={() => navigate({ to: "/dashboard" })}
                  >
                    Back to dashboard
                  </Button>
                  <Button
                    variant="hero"
                    className="flex-1"
                    onClick={() => {
                      localStorage.setItem("current_meeting_code", roomId);
                      window.location.href = `/lobby?code=${roomId}`;
                    }}
                  >
                    Join workspace
                  </Button>
                </div>
              </div>
            </Pane>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {steps.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {done ? <FiCheck className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  "mx-2 h-px flex-1 transition-colors",
                  i < step ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Pane({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}

function Helper({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

function OptionCard({
  selected,
  onClick,
  title,
  desc,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border p-3 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-background/50 hover:border-primary/40",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        {selected && <FiCheck className="h-4 w-4 text-primary" />}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function ReviewRow({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon?: typeof FiUser;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-sm font-medium", mono && "font-mono")}>{value}</p>
      </div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
    >
      {copied ? <FiCheck className="text-success" /> : <FiCopy />}
      {copied ? "Copied" : label}
    </Button>
  );
}

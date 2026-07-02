import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { Y as FiUser, v as FiVideo, p as FiShield, Z as FiChevronLeft, h as FiLoader, i as FiCheck, q as FiLock, H as FiCopy } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-CrxzEjwx.mjs";
import { B as Button, c as cn } from "./button-ZuR0Bnki.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { Q as QrCode } from "./QrCode-BzUDxuvC.mjs";
import { m as meetingTypes, p as privacyLevels } from "./mock-CVf8oAvI.mjs";
import { auth, meetings } from "./apiClient-DSVPR1M2.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./Logo-zcoi619J.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const steps = ["Configure", "Review", "Created"];
function genId() {
  const block = () => Math.floor(100 + Math.random() * 900);
  return `MTR-${block()}-${block()}`;
}
function CreateMeeting() {
  const navigate = useNavigate();
  const [step, setStep] = reactExports.useState(0);
  const [form, setForm] = reactExports.useState({
    title: "",
    description: "",
    type: "video",
    privacy: "open",
    passcode: ""
  });
  const [touched, setTouched] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const [createdMeeting, setCreatedMeeting] = reactExports.useState(null);
  const [generatedRoomId, setGeneratedRoomId] = reactExports.useState(() => genId());
  const roomId = createdMeeting?.meetingCode || generatedRoomId;
  const link = typeof window !== "undefined" ? `${window.location.origin}/lobby?code=${roomId}` : `https://meetrivo.com/j/${roomId}`;
  const handleCreate = async () => {
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        scheduled: false,
        passwordProtected: form.privacy === "passcode",
        meetingPassword: form.privacy === "passcode" ? form.passcode : void 0,
        visibility: form.privacy === "open" ? "PUBLIC" : "PRIVATE",
        maxParticipants: 100,
        waitingRoomEnabled: form.privacy === "locked",
        recordingEnabled: true,
        chatEnabled: true,
        screenShareEnabled: true
      };
      const res = await meetings.create(payload);
      setCreatedMeeting(res);
      if (res?.meetingCode) {
        localStorage.setItem("current_meeting_code", res.meetingCode);
        localStorage.setItem("current_meeting_id", res.id);
      }
      setStep(2);
    } catch (e) {
      alert(e.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };
  const errors = {
    title: form.title.trim().length === 0 ? "Give your meeting a clear title." : form.title.trim().length < 3 ? "Title should be at least 3 characters." : "",
    passcode: form.privacy === "passcode" && form.passcode.trim().length < 4 ? "Passcode needs at least 4 characters." : ""
  };
  const valid = !errors.title && !errors.passcode;
  const set = (patch) => setForm((f) => ({
    ...f,
    ...patch
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-2xl space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Create a meeting" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Configure your room, review the details, and share it with your team." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Stepper, { step }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      step === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Pane, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Meeting title", placeholder: "e.g. Q3 Roadmap Sync", value: form.title, onChange: (e) => set({
              title: e.target.value
            }), onBlur: () => setTouched(true), error: touched ? errors.title : void 0, maxLength: 80 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Helper, { children: [
              form.title.length,
              "/80 — keep it short and recognisable."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.description, onChange: (e) => set({
              description: e.target.value
            }), placeholder: "Add an agenda or context for participants (optional).", rows: 3, maxLength: 240, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Helper, { children: [
              form.description.length,
              "/240 — visible to everyone who joins."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Meeting type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: meetingTypes.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(OptionCard, { selected: form.type === t.id, onClick: () => set({
              type: t.id
            }), title: t.label, desc: t.desc }, t.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Privacy level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2 sm:grid-cols-3", children: privacyLevels.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(OptionCard, { selected: form.privacy === p.id, onClick: () => set({
              privacy: p.id
            }), title: p.label, desc: p.desc }, p.id)) })
          ] }),
          form.privacy === "passcode" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
            opacity: 0,
            height: 0
          }, animate: {
            opacity: 1,
            height: "auto"
          }, className: "overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Passcode", placeholder: "Set a passcode", value: form.passcode, onChange: (e) => set({
              passcode: e.target.value
            }), onBlur: () => setTouched(true), error: touched ? errors.passcode : void 0, maxLength: 12 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Helper, { children: "Share this passcode only with invited guests." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => navigate({
            to: "/dashboard"
          }), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", onClick: () => {
            setTouched(true);
            if (valid) setStep(1);
          }, children: "Review meeting" })
        ] })
      ] }, "configure"),
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Pane, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Title", value: form.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Host", value: auth.getUser()?.fullName || auth.getUser()?.username || "Host", icon: FiUser }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Room type", value: meetingTypes.find((t) => t.id === form.type)?.label ?? "", icon: FiVideo }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Privacy", value: privacyLevels.find((p) => p.id === form.privacy)?.label ?? "", icon: FiShield }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Meeting ID", value: roomId, mono: true }),
            form.description && /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewRow, { label: "Description", value: form.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-surface/40 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Invite link" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 truncate text-sm font-medium", children: link })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface/40 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { value: link, size: 140 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Scan to join" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => setStep(0), disabled: loading, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiChevronLeft, {}),
            " Edit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", onClick: handleCreate, disabled: loading, children: [
            loading && /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin mr-1" }),
            loading ? "Creating..." : "Create workspace"
          ] })
        ] })
      ] }, "review"),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Pane, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-6 text-center sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { initial: {
          scale: 0,
          rotate: -20
        }, animate: {
          scale: 1,
          rotate: 0
        }, transition: {
          type: "spring",
          damping: 12,
          stiffness: 200
        }, className: "grid h-16 w-16 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "h-8 w-8" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Workspace created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
            "“",
            form.title,
            "” is ready. Share the details below or step into the lobby."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-surface/40 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { value: link, size: 150 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full border border-border bg-surface/40 px-4 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiLock, { className: "h-3.5 w-3.5 text-success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono font-medium", children: roomId })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CopyButton, { value: link, label: "Copy invite link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex w-full flex-col gap-2 sm:flex-row", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", className: "flex-1", onClick: () => navigate({
            to: "/dashboard"
          }), children: "Back to dashboard" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "flex-1", onClick: () => {
            localStorage.setItem("current_meeting_code", roomId);
            window.location.href = `/lobby?code=${roomId}`;
          }, children: "Join workspace" })
        ] })
      ] }) }, "created")
    ] })
  ] }) });
}
function Stepper({
  step
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: steps.map((label, i) => {
    const done = i < step;
    const active = i === step;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 items-center last:flex-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors", done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-border text-muted-foreground"), children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "h-4 w-4" }) : i + 1 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("hidden text-sm font-medium sm:inline", active ? "text-foreground" : "text-muted-foreground"), children: label })
      ] }),
      i < steps.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("mx-2 h-px flex-1 transition-colors", i < step ? "bg-primary" : "bg-border") })
    ] }, label);
  }) });
}
function Pane({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
    opacity: 0,
    y: 12
  }, animate: {
    opacity: 1,
    y: 0
  }, exit: {
    opacity: 0,
    y: -12
  }, transition: {
    duration: 0.3,
    ease: [0.22, 1, 0.36, 1]
  }, className: "space-y-4", children });
}
function Helper({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children });
}
function OptionCard({
  selected,
  onClick,
  title,
  desc
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick, className: cn("rounded-xl border p-3 text-left transition-all", selected ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-background/50 hover:border-primary/40"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: title }),
      selected && /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "h-4 w-4 text-primary" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: desc })
  ] });
}
function ReviewRow({
  label,
  value,
  icon: Icon,
  mono
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
    Icon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("text-sm font-medium", mono && "font-mono"), children: value })
    ] })
  ] });
}
function CopyButton({
  value,
  label
}) {
  const [copied, setCopied] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, children: [
    copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "text-success" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiCopy, {}),
    copied ? "Copied" : label
  ] });
}
export {
  CreateMeeting as component
};

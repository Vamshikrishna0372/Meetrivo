import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { V as FiAlertCircle, h as FiLoader, W as FiArrowRight, X as FiMaximize, p as FiShield, Y as FiUser, y as FiUsers, q as FiLock, Z as FiChevronLeft } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-CrxzEjwx.mjs";
import { B as Button, c as cn } from "./button-ZuR0Bnki.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
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
function JoinMeeting() {
  useNavigate();
  const [phase, setPhase] = reactExports.useState("form");
  const [roomId, setRoomId] = reactExports.useState("");
  const [name, setName] = reactExports.useState(() => auth.getUser()?.fullName || auth.getUser()?.username || "");
  const [error, setError] = reactExports.useState("");
  const [room, setRoom] = reactExports.useState(null);
  const verify = async () => {
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
    try {
      const results = await meetings.searchByCode(id);
      if (!results || results.length === 0) {
        setPhase("form");
        setError("We couldn't find that room. Make sure the code is correct.");
        return;
      }
      const found = results[0];
      setRoom({
        title: found.title,
        host: found.hostName || "Host",
        privacy: found.passwordProtected ? "Passcode" : found.waitingRoomEnabled ? "Locked" : "Open",
        type: found.visibility || "Public",
        status: found.status === "ACTIVE" ? "live" : found.status === "SCHEDULED" ? "scheduled" : "starting",
        participants: (found.participantCount || 0) > 0 ? Array.from({
          length: Math.min(found.participantCount, 6)
        }, (_, i) => ({
          initials: `P${i + 1}`
        })) : []
      });
      setPhase("preview");
    } catch (e) {
      setPhase("form");
      setError(e.message || "An error occurred while verifying the room.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-lg space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Join a meeting" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Verify the room, preview the workspace, then step in." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { mode: "wait", children: [
      phase !== "preview" && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, exit: {
        opacity: 0,
        y: -12
      }, className: "space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Meeting ID", placeholder: "MTR-481-902", value: roomId, onChange: (e) => setRoomId(e.target.value), disabled: phase === "verifying" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Display name", placeholder: "Your name", value: name, onChange: (e) => setName(e.target.value), disabled: phase === "verifying", maxLength: 40 }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.p, { initial: {
          opacity: 0
        }, animate: {
          opacity: 1
        }, className: "flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiAlertCircle, { className: "h-4 w-4 shrink-0" }),
          " ",
          error
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", onClick: verify, disabled: phase === "verifying", children: phase === "verifying" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin" }),
          " Verifying room…"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Verify room ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiArrowRight, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px flex-1 bg-border" }),
          " or ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px flex-1 bg-border" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "w-full", disabled: phase === "verifying", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiMaximize, {}),
          " Join via QR scan"
        ] })
      ] }, "form"),
      phase === "preview" && room && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 12
      }, animate: {
        opacity: 1,
        y: 0
      }, exit: {
        opacity: 0,
        y: -12
      }, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: room.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-sm text-muted-foreground", children: [
                "Hosted by ",
                room.host
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: room.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: FiShield, label: "Privacy", value: room.privacy }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: FiUser, label: "Room type", value: room.type })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-surface/40 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FiUsers, { className: "h-3.5 w-3.5" }),
              " ",
              room.participants.length,
              " in the room"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2", children: room.participants.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full border-2 border-card bg-gradient-primary text-xs font-semibold text-primary-foreground", children: p.initials }, i)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiLock, { className: "h-3.5 w-3.5" }),
            " Secure workspace — your connection is encrypted."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", onClick: () => setPhase("form"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiChevronLeft, {}),
            " Back"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", onClick: () => {
            localStorage.setItem("current_meeting_code", roomId);
            localStorage.setItem("join_display_name", name);
            window.location.href = `/lobby?code=${roomId}&name=${encodeURIComponent(name)}`;
          }, children: [
            "Join workspace ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiArrowRight, {})
          ] })
        ] })
      ] }, "preview")
    ] })
  ] }) });
}
function StatusBadge({
  status
}) {
  const map = {
    live: {
      label: "Live now",
      cls: "bg-success/15 text-success"
    },
    starting: {
      label: "Starting soon",
      cls: "bg-warning/15 text-warning"
    },
    scheduled: {
      label: "Scheduled",
      cls: "bg-primary/15 text-primary"
    }
  };
  const s = map[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", s.cls), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-current" }),
    " ",
    s.label
  ] });
}
function Meta({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-surface text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: value })
    ] })
  ] });
}
export {
  JoinMeeting as component
};

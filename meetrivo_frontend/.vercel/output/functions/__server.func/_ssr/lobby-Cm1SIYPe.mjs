import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { N as FiCheckCircle, w as FiVideoOff, o as FiMic, u as FiMicOff, v as FiVideo, O as FiVolume2, P as FiSettings } from "../_libs/react-icons.mjs";
import { B as Button, c as cn } from "./button-ZuR0Bnki.mjs";
import { L as Logo } from "./Logo-zcoi619J.mjs";
import { auth, meetings } from "./apiClient-BAZ_k_AE.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function Lobby() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = reactExports.useState(true);
  const [camOn, setCamOn] = reactExports.useState(true);
  const [name, setName] = reactExports.useState("");
  const [joining, setJoining] = reactExports.useState(false);
  const [error, setError] = reactExports.useState("");
  const [meetingCode, setMeetingCode] = reactExports.useState("");
  reactExports.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || localStorage.getItem("current_meeting_code") || "";
    const nameParam = params.get("name") || "";
    setMeetingCode(code);
    const user = auth.getUser();
    if (nameParam) {
      setName(nameParam);
    } else if (user) {
      setName(user.fullName || user.username || user.email || "Guest");
    }
  }, []);
  const handleJoin = async () => {
    if (!meetingCode) {
      navigate({
        to: "/join"
      });
      return;
    }
    setJoining(true);
    setError("");
    try {
      const result = await meetings.join(meetingCode);
      if (result?.meetingId || result?.id) {
        localStorage.setItem("current_meeting_id", result.meetingId || result.id);
      }
      if (meetingCode) {
        localStorage.setItem("current_meeting_code", meetingCode);
      }
    } catch (e) {
      console.warn("Join API failed:", e.message);
    } finally {
      setJoining(false);
    }
    localStorage.setItem("lobby_mic", micOn ? "true" : "false");
    localStorage.setItem("lobby_cam", camOn ? "true" : "false");
    localStorage.setItem("lobby_name", name);
    navigate({
      to: "/room"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen flex-col bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between px-4 py-4 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs text-success", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheckCircle, { className: "h-3.5 w-3.5" }),
        " Secure connection"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex flex-1 items-center justify-center px-4 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid w-full max-w-4xl gap-6 lg:grid-cols-[1.4fr_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 16
      }, animate: {
        opacity: 1,
        y: 0
      }, className: "relative aspect-video overflow-hidden rounded-3xl border border-border bg-gradient-surface", children: [
        camOn ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.32_0.06_264),transparent_70%)]" }) : null,
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center", children: camOn ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          scale: 0.9,
          opacity: 0
        }, animate: {
          scale: 1,
          opacity: 1
        }, className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow", children: name.slice(0, 2).toUpperCase() || "ME" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "Camera preview" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideoOff, { className: "mx-auto h-10 w-10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: "Your camera is off" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-4 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur-sm", children: name || "You" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleToggle, { on: micOn, onClick: () => setMicOn((v) => !v), label: "microphone", children: micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleToggle, { on: camOn, onClick: () => setCamOn((v) => !v), label: "camera", children: camOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideoOff, {}) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 16
      }, animate: {
        opacity: 1,
        y: 0
      }, transition: {
        delay: 0.05
      }, className: "flex flex-col rounded-3xl border border-border bg-card p-5 sm:p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Ready to join?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Check your devices before stepping into the workspace." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "mt-5 block space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Display name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: name, onChange: (e) => setName(e.target.value), maxLength: 40, className: "h-11 w-full rounded-xl border border-border bg-background/60 px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceRow, { icon: FiMic, label: "Microphone", ok: micOn, okText: "MacBook Mic", offText: "Muted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceRow, { icon: FiVideo, label: "Camera", ok: camOn, okText: "FaceTime HD", offText: "Off" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceRow, { icon: FiVolume2, label: "Speaker", ok: true, okText: "System Output", offText: "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto space-y-2 pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", size: "lg", className: "w-full", onClick: handleJoin, children: "Join now" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", className: "w-full", onClick: () => navigate({
            to: "/dashboard"
          }), children: "Cancel" })
        ] })
      ] })
    ] }) })
  ] });
}
function CircleToggle({
  on,
  onClick,
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { whileTap: {
    scale: 0.9
  }, onClick, "aria-label": `Toggle ${label}`, "aria-pressed": on, className: cn("grid h-12 w-12 place-items-center rounded-full text-lg transition-colors", on ? "bg-surface/80 text-foreground backdrop-blur-sm" : "bg-destructive text-destructive-foreground"), children });
}
function DeviceRow({
  icon: Icon,
  label,
  ok,
  okText,
  offText
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid h-8 w-8 place-items-center rounded-lg", ok ? "bg-success/15 text-success" : "bg-surface text-muted-foreground"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: ok ? okText : offText || "—" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FiSettings, { className: "h-4 w-4 text-muted-foreground" })
  ] });
}
export {
  Lobby as component
};

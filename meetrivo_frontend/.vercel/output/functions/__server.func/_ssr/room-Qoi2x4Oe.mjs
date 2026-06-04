import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { k as FiLock, l as FiShare2, m as FiClock, n as FiMonitor, o as FiX, i as FiMic, p as FiMicOff, q as FiVideo, r as FiVideoOff, T as TbHandStop, s as FiSmile, t as FiUsers, u as FiMessageSquare, v as FiFile, w as FiInfo, x as FiPhoneOff, y as FiCheck, z as FiCopy, A as FiSend, C as FiWifi } from "../_libs/react-icons.mjs";
import { p as participants, r as reactionEmojis, c as chatMessages, s as sharedFiles, a as autoReplies } from "./mock-DMa3Iuce.mjs";
import { B as Button, c as cn } from "./button-ZuR0Bnki.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-XbEnPBIB.mjs";
import { Q as QrCode } from "./QrCode-BzUDxuvC.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/lucide-react.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const ROOM_CODE = "MTR-481-902";
const ROOM_LINK = "https://meetrivo.com/j/MTR-481-902";
function RoomPage() {
  const [people] = reactExports.useState(participants);
  const [micOn, setMicOn] = reactExports.useState(true);
  const [camOn, setCamOn] = reactExports.useState(true);
  const [sharing, setSharing] = reactExports.useState(false);
  const [handUp, setHandUp] = reactExports.useState(false);
  const [drawer, setDrawer] = reactExports.useState(null);
  const [showReactions, setShowReactions] = reactExports.useState(false);
  const [flying, setFlying] = reactExports.useState([]);
  const [shareOpen, setShareOpen] = reactExports.useState(false);
  const sendReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFlying((f) => [...f, {
      id,
      emoji
    }]);
    setShowReactions(false);
    setTimeout(() => setFlying((f) => f.filter((x) => x.id !== id)), 2500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-screen w-full flex-col overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold", children: "Product Sync — Q3 Roadmap" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success sm:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-success" }),
            " Live"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiLock, { className: "h-3 w-3 text-success" }),
          " ",
          ROOM_CODE,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
            "· ",
            people.length,
            " participants"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MeetingTimer, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "glass", size: "sm", onClick: () => setShareOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiShare2, {}),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Invite" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative flex-1 overflow-hidden px-3 pb-3 sm:px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VideoGrid, { people, youCam: camOn, youMic: micOn, sharing }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: flying.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { initial: {
          opacity: 0,
          y: 0,
          x: "50%",
          scale: 0.6
        }, animate: {
          opacity: 1,
          y: -260,
          scale: 1.4
        }, exit: {
          opacity: 0
        }, transition: {
          duration: 2.4,
          ease: "easeOut"
        }, className: "absolute bottom-4 left-1/2 text-4xl", children: f.emoji }, f.id)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: drawer && /* @__PURE__ */ jsxRuntimeExports.jsx(RoomDrawer, { kind: drawer, people, onClose: () => setDrawer(null) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ControlDock, { micOn, camOn, sharing, handUp, drawer, showReactions, onMic: () => setMicOn((v) => !v), onCam: () => setCamOn((v) => !v), onShare: () => setSharing((v) => !v), onHand: () => setHandUp((v) => !v), onReactions: () => setShowReactions((v) => !v), onSendReaction: sendReaction, onDrawer: (d) => setDrawer((cur) => cur === d ? null : d) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShareDialog, { open: shareOpen, onClose: () => setShareOpen(false) })
  ] });
}
function MeetingTimer() {
  const [seconds, setSeconds] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1e3);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium tabular-nums", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FiClock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
    " ",
    mm,
    ":",
    ss
  ] });
}
function VideoGrid({
  people,
  youCam,
  youMic,
  sharing
}) {
  const count = people.length;
  const cols = count <= 1 ? "grid-cols-1" : count <= 4 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3";
  if (sharing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-3 lg:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiMonitor, { className: "mx-auto h-10 w-10 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium", children: "You are sharing your screen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-y-auto", children: people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 shrink-0 lg:w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantCard, { p: localized(p, youCam, youMic), compact: true }) }, p.id)) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid h-full auto-rows-fr gap-3", cols), children: people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantCard, { p: localized(p, youCam, youMic) }, p.id)) });
}
function localized(p, youCam, youMic) {
  if (!p.isYou) return p;
  return {
    ...p,
    cameraOn: youCam,
    micOn: youMic
  };
}
function ParticipantCard({
  p,
  compact
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, whileHover: {
    scale: compact ? 1 : 1.01
  }, className: cn("group relative flex items-center justify-center overflow-hidden rounded-2xl border bg-gradient-surface transition-shadow", p.speaking ? "border-primary shadow-glow" : "border-border", compact ? "aspect-video" : "min-h-32"), children: [
    p.cameraOn ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.3_0.05_264),transparent)]" }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid place-items-center rounded-full bg-gradient-primary font-semibold text-primary-foreground", compact ? "h-9 w-9 text-xs" : "h-16 w-16 text-xl", p.speaking && "ring-2 ring-primary ring-offset-2 ring-offset-background"), children: p.initials }) }),
    p.handRaised && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-warning text-warning-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TbHandStop, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("truncate font-medium", compact ? "text-[10px]" : "text-xs"), children: p.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Conn, { level: p.connection }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid place-items-center rounded-full p-1", p.micOn ? "text-foreground" : "bg-destructive/80 text-destructive-foreground"), children: p.micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, { className: "h-3 w-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, { className: "h-3 w-3" }) })
      ] })
    ] })
  ] });
}
function Conn({
  level
}) {
  const color = level === "excellent" ? "text-success" : level === "good" ? "text-warning" : "text-destructive";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FiWifi, { className: cn("h-3 w-3", color), title: `${level} connection` });
}
function ControlDock({
  micOn,
  camOn,
  sharing,
  handUp,
  drawer,
  showReactions,
  onMic,
  onCam,
  onShare,
  onHand,
  onReactions,
  onSendReaction,
  onDrawer
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-30 flex justify-center px-3 pb-4 pt-1 sm:pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showReactions && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      y: 10,
      scale: 0.9
    }, animate: {
      opacity: 1,
      y: 0,
      scale: 1
    }, exit: {
      opacity: 0,
      y: 10,
      scale: 0.9
    }, className: "glass absolute bottom-full mb-3 flex gap-1 rounded-2xl p-2", children: reactionEmojis.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSendReaction(e), className: "grid h-10 w-10 place-items-center rounded-xl text-xl transition-transform hover:scale-125 active:scale-95", children: e }, e)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass flex items-center gap-1.5 rounded-2xl px-2.5 py-2 sm:gap-2 sm:px-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: micOn ? "Mute" : "Unmute", active: micOn, danger: !micOn, onClick: onMic, children: micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: camOn ? "Stop video" : "Start video", active: camOn, danger: !camOn, onClick: onCam, children: camOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideoOff, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Share screen", active: sharing, onClick: onShare, className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiMonitor, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Raise hand", active: handUp, onClick: onHand, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TbHandStop, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Reactions", active: showReactions, onClick: onReactions, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiSmile, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-0.5 h-7 w-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Participants", active: drawer === "participants", onClick: () => onDrawer("participants"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiUsers, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Chat", active: drawer === "chat", onClick: () => onDrawer("chat"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiMessageSquare, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Files", active: drawer === "files", onClick: () => onDrawer("files"), className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiFile, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Info", active: drawer === "info", onClick: () => onDrawer("info"), className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiInfo, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-0.5 h-7 w-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "destructive", size: "icon", className: "rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/dashboard", "aria-label": "End meeting", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiPhoneOff, {}) }) })
    ] })
  ] });
}
function DockBtn({
  children,
  label,
  active,
  danger,
  onClick,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { whileTap: {
    scale: 0.88
  }, onClick, title: label, "aria-label": label, "aria-pressed": active, className: cn("grid h-10 w-10 place-items-center rounded-xl text-lg transition-colors sm:h-11 sm:w-11", danger ? "bg-destructive text-destructive-foreground" : active ? "bg-primary text-primary-foreground" : "bg-surface/70 text-foreground hover:bg-surface", className), children });
}
function RoomDrawer({
  kind,
  people,
  onClose
}) {
  const titles = {
    chat: "Chat",
    participants: `Participants (${people.length})`,
    files: "Shared files",
    info: "Meeting info"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, exit: {
      opacity: 0
    }, onClick: onClose, className: "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.aside, { initial: {
      x: "100%"
    }, animate: {
      x: 0
    }, exit: {
      x: "100%"
    }, transition: {
      type: "spring",
      damping: 30,
      stiffness: 300
    }, className: "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-card md:static md:z-auto md:my-0 md:w-80 md:max-w-none md:rounded-l-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: titles[kind] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, "aria-label": "Close", className: "rounded-lg p-1.5 hover:bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiX, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 flex-1", children: [
        kind === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, {}),
        kind === "participants" && /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantsPanel, { people }),
        kind === "files" && /* @__PURE__ */ jsxRuntimeExports.jsx(FilesPanel, {}),
        kind === "info" && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoPanel, {})
      ] })
    ] })
  ] });
}
function ChatPanel() {
  const [messages, setMessages] = reactExports.useState(chatMessages);
  const [text, setText] = reactExports.useState("");
  const [typing, setTyping] = reactExports.useState(false);
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, typing]);
  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [...m, {
      id: `me-${Date.now()}`,
      author: "You",
      initials: "JR",
      text: t,
      time: now(),
      self: true
    }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, {
        id: `bot-${Date.now()}`,
        author: "Maya Chen",
        initials: "MC",
        text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        time: now()
      }]);
    }, 1600);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: messages.map((m) => m.system ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0
      }, animate: {
        opacity: 1
      }, className: "text-center text-xs text-muted-foreground", children: [
        m.text,
        " · ",
        m.time
      ] }, m.id) : /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, className: cn("flex gap-2", m.self && "flex-row-reverse"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[10px] font-semibold", children: m.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("max-w-[75%]", m.self && "text-right"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("inline-block rounded-2xl px-3 py-2 text-sm", m.self ? "bg-gradient-primary text-primary-foreground" : "bg-surface text-foreground"), children: m.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground", children: [
            m.self ? "" : `${m.author} · `,
            m.time
          ] })
        ] })
      ] }, m.id)) }),
      typing && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-7 w-7 place-items-center rounded-full bg-surface text-[10px] font-semibold", children: "MC" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex gap-1 rounded-2xl bg-surface px-3 py-2.5", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { className: "h-1.5 w-1.5 rounded-full bg-muted-foreground", animate: {
          opacity: [0.3, 1, 0.3]
        }, transition: {
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2
        } }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), placeholder: "Type a message...", className: "h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", className: "rounded-xl", onClick: send, "aria-label": "Send", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiSend, {}) })
    ] })
  ] });
}
function ParticipantsPanel({
  people
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1 overflow-y-auto p-3", children: people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface/60", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground", children: p.initials }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-sm font-medium", children: [
        p.name,
        " ",
        p.role && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "· ",
          p.role
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] capitalize text-muted-foreground", children: [
        p.connection,
        " connection"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-muted-foreground", children: [
      p.handRaised && /* @__PURE__ */ jsxRuntimeExports.jsx(TbHandStop, { className: "h-4 w-4 text-warning" }),
      p.micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, { className: "h-4 w-4 text-destructive" }),
      p.cameraOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideoOff, { className: "h-4 w-4 text-destructive" })
    ] })
  ] }, p.id)) });
}
function FilesPanel() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 overflow-y-auto p-3", children: sharedFiles.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-surface text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiFile, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: f.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
        f.size,
        " · ",
        f.owner,
        " · ",
        f.time
      ] })
    ] })
  ] }, f.id)) });
}
function InfoPanel() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Meeting", value: "Product Sync — Q3 Roadmap" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Room code", value: ROOM_CODE }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Host", value: "Jordan Rivera" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Started", value: "Today, 10:30 AM" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Link", value: ROOM_LINK })
  ] });
}
function Info({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 break-words font-medium", children: value })
  ] });
}
function ShareDialog({
  open,
  onClose
}) {
  const [copied, setCopied] = reactExports.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(ROOM_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Invite people" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white p-3 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { value: ROOM_LINK, size: 180 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Scan the QR code to join instantly, or share the link below." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-sm", children: ROOM_LINK }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: copied ? "secondary" : "default", onClick: copy, children: [
          copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiCopy, {}),
          copied ? "Copied" : "Copy"
        ] })
      ] })
    ] })
  ] }) });
}
function now() {
  return (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}
export {
  RoomPage as component
};

import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { q as FiVideo, X as FiLogIn, t as FiUsers, c as FiCircle, Y as FiHardDrive, Z as FiTrendingUp, _ as FiCalendar, m as FiClock, K as FiArrowRight, $ as FiActivity, h as FiBell } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-aeN32L8H.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-XbEnPBIB.mjs";
import { n as notifications, b as currentUser, u as upcomingMeetings, w as workspaceStatus, e as analytics, d as recentMeetings, f as activity } from "./mock-DMa3Iuce.mjs";
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
import "./Logo-zcoi619J.mjs";
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
const stagger = {
  show: {
    transition: {
      staggerChildren: 0.05
    }
  }
};
const item = {
  hidden: {
    opacity: 0,
    y: 16
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};
function Dashboard() {
  const [preview, setPreview] = reactExports.useState(null);
  const unread = notifications.filter((n) => !n.read).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: stagger, initial: "hidden", animate: "show", className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { variants: item, className: "relative overflow-hidden rounded-3xl border border-border bg-gradient-surface p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-[80px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Good to see you," }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-1 text-2xl font-bold sm:text-3xl", children: [
          currentUser.name.split(" ")[0],
          " 👋"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: [
          "You have ",
          unread,
          " unread ",
          unread === 1 ? "notification" : "notifications",
          " and",
          " ",
          upcomingMeetings.length,
          " meetings coming up today."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/create", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, {}),
            " New meeting"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/join", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiLogIn, {}),
            " Join a room"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { icon: FiVideo, title: "Create Room", desc: "Spin up an instant meeting room and invite your team.", cta: "Start now", to: "/create", accent: true }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ActionCard, { icon: FiLogIn, title: "Join Room", desc: "Enter a room code or scan a QR to join in seconds.", cta: "Join meeting", to: "/join" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Workspace status", icon: FiUsers, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground", children: workspaceStatus.name.slice(0, 2).toUpperCase() }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: workspaceStatus.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: workspaceStatus.plan })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiCircle, { className: "h-2.5 w-2.5 fill-success text-success" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-medium", children: [
              workspaceStatus.online,
              " online now"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: FiUsers, label: "Members", value: `${workspaceStatus.members}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: FiVideo, label: "Active rooms", value: `${workspaceStatus.activeRooms}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { icon: FiHardDrive, label: "Storage", value: `${workspaceStatus.storageUsed}%` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1.5 flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Storage used" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              workspaceStatus.storageUsed,
              "% of 100 GB"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 overflow-hidden rounded-full bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full rounded-full bg-gradient-primary", initial: {
            width: 0
          }, animate: {
            width: `${workspaceStatus.storageUsed}%`
          }, transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1]
          } }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Meeting analytics", icon: FiTrendingUp, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: analytics.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-interactive rounded-xl border border-border bg-background/50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: a.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success", children: a.trend })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-2xl font-bold", children: a.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkline, { data: a.spark })
      ] }, a.label)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Upcoming meetings", icon: FiCalendar, action: {
        label: "Schedule",
        to: "/history"
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: upcomingMeetings.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPreview({
        title: m.title,
        meta: `${m.time} · ${m.relative}`,
        participants: m.participants,
        host: m.host,
        status: "upcoming"
      }), className: "card-interactive flex flex-col rounded-xl border border-border bg-background/50 p-4 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary", children: m.relative }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: m.time })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 truncate text-sm font-semibold", children: m.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
          "Hosted by ",
          m.host,
          " · ",
          m.participants,
          " people"
        ] })
      ] }, m.id)) }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-5 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Recent meetings", icon: FiClock, action: {
          label: "View all",
          to: "/history"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: recentMeetings.slice(0, 4).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPreview({
          title: m.title,
          meta: `${m.date} · ${m.duration}`,
          participants: m.participants,
          status: m.status
        }), className: "card-interactive flex w-full items-center gap-3 rounded-xl border border-border bg-background/50 p-3 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-9 w-1 rounded-full ${m.status === "missed" ? "bg-destructive" : "bg-primary"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: m.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              m.date,
              " · ",
              m.duration,
              " · ",
              m.participants,
              " people"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiArrowRight, { className: "h-4 w-4 shrink-0 text-muted-foreground" })
        ] }, m.id)) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Activity", icon: FiActivity, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: activity.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: a.text }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: a.time })
          ] })
        ] }, a.id)) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Panel, { title: "Notifications", icon: FiBell, action: {
          label: "Open",
          to: "/notifications"
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: notifications.slice(0, 3).map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3", children: [
          !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2 w-2 shrink-0 rounded-full bg-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `flex-1 text-sm ${n.read ? "text-muted-foreground" : ""}`, children: n.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: n.time })
        ] }, n.id)) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { variants: item, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Panel, { title: "Your profile", icon: FiUsers, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-base font-semibold text-primary-foreground", children: currentUser.initials }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: currentUser.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: currentUser.role })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", className: "mt-4 w-full", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/profile", children: [
            "View profile ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiArrowRight, {})
          ] }) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!preview, onOpenChange: (o) => !o && setPreview(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-md", children: preview && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "pr-6", children: preview.title }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-border bg-surface/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: preview.meta }),
          preview.status && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${preview.status === "missed" ? "bg-destructive/15 text-destructive" : preview.status === "upcoming" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`, children: preview.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { label: "Participants", value: `${preview.participants} people` }),
          preview.host && /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { label: "Host", value: preview.host })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/room", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, {}),
          " ",
          preview.status === "upcoming" ? "Join when live" : "Open room"
        ] }) })
      ] })
    ] }) }) })
  ] });
}
function ActionCard({
  icon: Icon,
  title,
  desc,
  cta,
  to,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-interactive flex h-full flex-col rounded-2xl border border-border bg-card p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid h-11 w-11 place-items-center rounded-xl ${accent ? "bg-gradient-primary text-primary-foreground" : "bg-surface text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 flex-1 text-sm text-muted-foreground", children: desc }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: accent ? "hero" : "glass", className: "mt-4 w-full", asChild: !!to, children: to ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, children: cta }) : cta })
  ] });
}
function Stat({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/50 p-3 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "mx-auto h-4 w-4 text-muted-foreground" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1.5 text-lg font-bold leading-none", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: label })
  ] });
}
function Meta({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-surface/40 p-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-medium", children: value })
  ] });
}
function Sparkline({
  data
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const step = w / (data.length - 1);
  const points = data.map((d, i) => `${i * step},${h - (d - min) / range * h}`).join(" ");
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: `0 0 ${w} ${h}`, className: "mt-3 h-7 w-full", preserveAspectRatio: "none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("polyline", { points, fill: "none", stroke: "var(--primary)", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", vectorEffect: "non-scaling-stroke" }) });
}
function Panel({
  title,
  icon: Icon,
  action,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }),
        " ",
        title
      ] }),
      action && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: action.to, className: "text-xs text-primary hover:underline", children: action.label })
    ] }),
    children
  ] });
}
export {
  Dashboard as component
};

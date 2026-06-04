import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { F as FiEdit2, q as FiVideo, m as FiClock, D as FiLayers } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-aeN32L8H.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { b as currentUser } from "./mock-DMa3Iuce.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
function ProfilePage() {
  const stats = [{
    icon: FiVideo,
    label: "Meetings",
    value: currentUser.stats.meetings
  }, {
    icon: FiClock,
    label: "Hours",
    value: currentUser.stats.hours
  }, {
    icon: FiLayers,
    label: "Workspaces",
    value: currentUser.stats.workspaces
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage your personal information." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-[80px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow", children: currentUser.initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: currentUser.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: currentUser.role }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: currentUser.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "glass", size: "sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiEdit2, {}),
            " Edit profile"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: stats.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-3xl font-extrabold", children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: s.label })
      ] }) }, s.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "User information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [["Full name", currentUser.name], ["Email", currentUser.email], ["Role", currentUser.role], ["Member since", "Jan 2024"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 text-sm font-medium", children: v })
        ] }, k)) })
      ] }) })
    ] })
  ] });
}
export {
  ProfilePage as component
};

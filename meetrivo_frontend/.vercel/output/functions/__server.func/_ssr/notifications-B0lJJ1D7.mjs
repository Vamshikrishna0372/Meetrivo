import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { E as FiCheckCircle } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-aeN32L8H.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { n as notifications } from "./mock-DMa3Iuce.mjs";
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
import "./button-ZuR0Bnki.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const priorityStyles = {
  high: "bg-destructive/15 text-destructive",
  normal: "bg-primary/15 text-primary",
  low: "bg-surface text-muted-foreground"
};
function NotificationsPage() {
  const [items, setItems] = reactExports.useState(notifications);
  const unread = items.filter((n) => !n.read).length;
  const markAll = () => setItems((prev) => prev.map((n) => ({
    ...n,
    read: true
  })));
  const toggle = (id) => setItems((prev) => prev.map((n) => n.id === id ? {
    ...n,
    read: !n.read
  } : n));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Notifications" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
          unread,
          " unread · ",
          items.length,
          " total"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: markAll, className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheckCircle, { className: "h-4 w-4" }),
        " Mark all read"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-2.5", children: items.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.04, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggle(n.id), className: `flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${n.read ? "border-border bg-card/50" : "border-primary/30 bg-card"}`, children: [
      !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 shrink-0 rounded-full bg-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${n.read ? "text-muted-foreground" : "font-medium"}`, children: n.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: n.time })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${priorityStyles[n.priority]}`, children: n.priority })
    ] }) }, n.id)) })
  ] });
}
export {
  NotificationsPage as component
};

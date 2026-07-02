import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { R as FiCheckCircle, h as FiLoader, n as FiBell, g as FiTrash2 } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-CrxzEjwx.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { notifications } from "./apiClient-DSVPR1M2.mjs";
import { t as toast } from "../_libs/sonner.mjs";
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
  HIGH: "bg-destructive/15 text-destructive",
  NORMAL: "bg-primary/15 text-primary",
  LOW: "bg-surface text-muted-foreground",
  high: "bg-destructive/15 text-destructive",
  normal: "bg-primary/15 text-primary",
  low: "bg-surface text-muted-foreground"
};
function NotificationsPage() {
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const unread = items.filter((n) => !n.read).length;
  reactExports.useEffect(() => {
    notifications.getAll().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          time: n.createdAt ? new Date(n.createdAt).toLocaleString() : "",
          read: n.read,
          priority: n.type === "ALERT" ? "high" : n.type === "INFO" ? "low" : "normal"
        }));
        setItems(mapped);
      }
    }).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  const markAll = async () => {
    try {
      await notifications.markAllRead();
      setItems((prev) => prev.map((n) => ({
        ...n,
        read: true
      })));
      toast.success("All notifications marked as read");
    } catch (_) {
      toast.error("Failed to mark all as read");
    }
  };
  const toggle = async (id) => {
    try {
      await notifications.markRead(id);
    } catch (_) {
    }
    setItems((prev) => prev.map((n) => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const deleteNotif = async (e, id) => {
    e.stopPropagation();
    try {
      await notifications.delete(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (_) {
      toast.error("Failed to delete notification");
    }
  };
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
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: markAll, className: "flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheckCircle, { className: "h-4 w-4" }),
        " Mark all read"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-2.5", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-6 w-6 animate-spin text-primary" }) }) : items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 py-16 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FiBell, { className: "h-8 w-8 text-muted-foreground/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No notifications yet" })
    ] }) : items.map((n, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.04, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => toggle(n.id), className: `group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${n.read ? "border-border bg-card/50" : "border-primary/30 bg-card"}`, children: [
      !n.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 shrink-0 rounded-full bg-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm ${n.read ? "text-muted-foreground" : "font-medium"}`, children: n.title }),
        n.message && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/80 mt-0.5 truncate", children: n.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: n.time })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${priorityStyles[n.priority]}`, children: n.priority }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => deleteNotif(e, n.id), title: "Delete notification", className: "ml-1 shrink-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiTrash2, { className: "h-4 w-4" }) })
    ] }) }, n.id)) })
  ] });
}
export {
  NotificationsPage as component
};

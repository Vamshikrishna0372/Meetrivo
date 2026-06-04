import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as FiSearch, P as FiInbox, q as FiVideo } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-aeN32L8H.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { d as recentMeetings } from "./mock-DMa3Iuce.mjs";
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
const filters = ["All", "Completed", "Missed"];
function HistoryPage() {
  const [query, setQuery] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("All");
  const results = reactExports.useMemo(() => {
    return recentMeetings.filter((m) => {
      const matchQ = m.title.toLowerCase().includes(query.toLowerCase());
      const matchF = filter === "All" || filter === "Completed" && m.status === "completed" || filter === "Missed" && m.status === "missed";
      return matchQ && matchF;
    });
  }, [query, filter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Meeting history" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Search and revisit your past sessions." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiSearch, { className: "absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search meetings...", className: "h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: filters.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${filter === f ? "bg-gradient-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`, children: f }, f)) })
      ] }),
      results.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiInbox, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "No meetings found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xs text-sm text-muted-foreground", children: "Try adjusting your search or filters to find what you're looking for." })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative space-y-3 pl-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-1.5 top-2 bottom-2 w-px bg-border" }),
        results.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl border border-border bg-card p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute -left-[1.4rem] top-5 h-3 w-3 rounded-full ring-4 ring-background ${m.status === "missed" ? "bg-destructive" : "bg-primary"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: m.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  m.date,
                  " · ",
                  m.duration,
                  " · ",
                  m.participants,
                  " people"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${m.status === "missed" ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`, children: m.status })
          ] })
        ] }) }, m.id))
      ] })
    ] })
  ] });
}
export {
  HistoryPage as component
};

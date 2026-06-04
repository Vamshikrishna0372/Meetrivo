import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { a2 as FiHome, a3 as FiEdit3, a4 as FiFolder, m as FiClock, h as FiBell, M as FiUser, H as FiSettings, q as FiVideo } from "../_libs/react-icons.mjs";
import { L as Logo } from "./Logo-zcoi619J.mjs";
import { b as currentUser } from "./mock-DMa3Iuce.mjs";
import { c as cn, B as Button } from "./button-ZuR0Bnki.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
const nav = [
  { label: "Dashboard", to: "/dashboard", icon: FiHome },
  { label: "Whiteboard", to: "/whiteboard", icon: FiEdit3 },
  { label: "Files", to: "/files", icon: FiFolder },
  { label: "History", to: "/history", icon: FiClock },
  { label: "Alerts", to: "/notifications", icon: FiBell },
  { label: "Profile", to: "/profile", icon: FiUser },
  { label: "Settings", to: "/settings", icon: FiSettings }
];
const mobileNav = [
  { label: "Home", to: "/dashboard", icon: FiHome },
  { label: "Files", to: "/files", icon: FiFolder },
  { label: "Board", to: "/whiteboard", icon: FiEdit3 },
  { label: "Alerts", to: "/notifications", icon: FiBell },
  { label: "Profile", to: "/profile", icon: FiUser }
];
function AppShell({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full bg-background md:flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-5 md:flex", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "mb-8" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-1 flex-col gap-1", children: nav.map((item) => {
        const active = pathname === item.to;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: item.to,
            className: cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-4.5 w-4.5" }),
              item.label,
              active && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.span,
                {
                  layoutId: "side-active",
                  className: "ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                }
              )
            ]
          },
          item.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 rounded-2xl border border-border bg-card p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/create", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, {}),
        " New meeting"
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground", children: currentUser.initials })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10 md:pt-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto w-full max-w-5xl", children }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex max-w-md items-center justify-around px-2 py-2", children: mobileNav.map((item) => {
      const active = pathname === item.to;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: item.to,
          className: cn(
            "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
            active ? "text-primary" : "text-muted-foreground"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-5 w-5" }),
            item.label
          ]
        },
        item.to
      );
    }) }) })
  ] });
}
export {
  AppShell as A
};

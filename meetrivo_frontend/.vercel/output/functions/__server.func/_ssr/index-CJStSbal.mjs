import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { R as FiArrowRight, ag as FiPlay, i as FiCheck, ah as FiMenu, j as FiX, ai as FiTwitter, aj as FiGithub, ak as FiLinkedin } from "../_libs/react-icons.mjs";
import { L as Logo } from "./Logo-zcoi619J.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { f as features, b as benefits } from "./mock-Crb9-ow8.mjs";
import { h as heroMockup } from "./router-CqhdGEZy.mjs";
import "../_libs/sonner.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const links = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/#features" },
  { label: "Product", to: "/#mobile" }
];
function Navbar() {
  const [open, setOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass border-b border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden items-center gap-8 md:flex", children: links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: l.to,
          className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
          children: l.label
        },
        l.label
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-2 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Login" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", size: "sm", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", children: "Get started" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "grid h-10 w-10 place-items-center rounded-lg hover:bg-surface md:hidden",
          onClick: () => setOpen(true),
          "aria-label": "Open menu",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiMenu, { className: "h-5 w-5" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          onClick: () => setOpen(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          className: "fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-6 border-l border-border bg-card p-6 md:hidden",
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" },
          transition: { type: "spring", damping: 26, stiffness: 260 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  className: "grid h-9 w-9 place-items-center rounded-lg hover:bg-surface",
                  onClick: () => setOpen(false),
                  "aria-label": "Close menu",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiX, { className: "h-5 w-5" })
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1", children: links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: l.to,
                onClick: () => setOpen(false),
                className: "rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground",
                children: l.label
              },
              l.label
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-auto flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", onClick: () => setOpen(false), children: "Login" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", onClick: () => setOpen(false), children: "Get started" }) })
            ] })
          ]
        }
      )
    ] }) })
  ] });
}
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border/60 bg-card/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 py-12 sm:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 sm:grid-cols-2 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xs text-sm text-muted-foreground", children: "Meet beyond meetings. A modern collaboration platform for smarter teamwork." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FooterCol,
        {
          title: "Product",
          items: [
            { label: "Features", to: "/#features" },
            { label: "Dashboard", to: "/dashboard" },
            { label: "Mobile", to: "/#mobile" }
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        FooterCol,
        {
          title: "Company",
          items: [
            { label: "Login", to: "/login" },
            { label: "Register", to: "/register" },
            { label: "Settings", to: "/settings" }
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: "Follow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3", children: [FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4" })
          },
          i
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Meetrivo. All rights reserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Connect. Collaborate. Create." })
    ] })
  ] }) });
}
function FooterCol({ title, items }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: items.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: it.to,
        className: "text-sm text-muted-foreground transition-colors hover:text-foreground",
        children: it.label
      }
    ) }, it.label)) })
  ] });
}
function Landing() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-0 h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 20
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1]
        }, className: "mx-auto max-w-3xl text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }),
            "Now in early access"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl", children: [
            "Meet ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "Beyond" }),
            " Meetings"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg", children: "A modern collaboration platform built for smarter communication, productivity, and teamwork — designed mobile-first for the way teams really work." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", size: "lg", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/dashboard", children: [
              "Create Meeting ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(FiArrowRight, {})
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", size: "lg", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FiPlay, {}),
              " Join Meeting"
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 40
        }, animate: {
          opacity: 1,
          y: 0
        }, transition: {
          duration: 0.7,
          delay: 0.15,
          ease: [0.22, 1, 0.36, 1]
        }, className: "relative mx-auto mt-14 max-w-4xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-2xl border border-border shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: heroMockup, alt: "Meetrivo meeting interface preview", width: 1280, height: 960, className: "w-full" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { animate: {
            y: [0, -10, 0]
          }, transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }, className: "absolute -left-3 top-10 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-soft backdrop-blur sm:block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Active now" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold", children: "6 participants" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { animate: {
            y: [0, 10, 0]
          }, transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }, className: "absolute -right-3 bottom-10 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-soft backdrop-blur sm:block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Latency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-success", children: "28ms" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "features", className: "mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { className: "mx-auto max-w-2xl text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold sm:text-4xl", children: "Everything your team needs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground", children: "A complete collaboration toolkit, thoughtfully designed and built to scale." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: features.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-soft", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary transition-colors group-hover:bg-gradient-primary group-hover:text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 text-lg font-semibold", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: f.desc })
      ] }) }, f.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "mobile", className: "scroll-mt-20 border-y border-border/60 bg-card/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-primary", children: "Mobile-first" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl font-bold sm:text-4xl", children: "Built thumb-first, for every screen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground", children: "Meetrivo feels native on mobile — sticky actions, thumb-zone navigation, and buttery transitions. The same premium experience scales seamlessly to tablet and desktop." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-6 space-y-3", children: ["Touch-friendly spacing", "Sticky quick actions", "Zero layout breaking", "Adaptive typography"].map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-5 w-5 place-items-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "h-3 w-3" }) }),
          item
        ] }, item)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: 0.1, className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-[460px] w-[230px] rounded-[2.4rem] border-4 border-border bg-background p-3 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full overflow-hidden rounded-[1.8rem] border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-card px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: "Meetrivo" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-7 w-7 rounded-full bg-gradient-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 bg-background p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-gradient-primary p-4 text-primary-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs opacity-80", children: "Welcome back" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold", children: "Start a meeting" })
          ] }),
          [1, 2, 3].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2/3 rounded bg-surface" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-2 w-1/3 rounded bg-surface" })
          ] }, n))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-around border-t border-border bg-card py-3", children: [0, 1, 2, 3].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-5 w-5 rounded-md ${n === 0 ? "bg-primary" : "bg-surface"}` }, n)) })
      ] }) }) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-4 py-20 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: benefits.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-extrabold text-gradient", children: b.stat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: b.label })
    ] }) }, b.label)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mx-auto max-w-6xl px-4 pb-24 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-border bg-gradient-surface p-10 text-center sm:p-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "relative text-3xl font-bold sm:text-4xl", children: "Start collaborating with Meetrivo" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "relative mx-auto mt-3 max-w-md text-muted-foreground", children: "Join teams already meeting beyond meetings. It only takes a few seconds." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", size: "lg", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/register", children: [
          "Create Meeting ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiArrowRight, {})
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", size: "lg", asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", children: "Explore Features" }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  Landing as component
};

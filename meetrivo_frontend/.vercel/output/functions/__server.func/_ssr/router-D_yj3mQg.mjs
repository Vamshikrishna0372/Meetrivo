import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
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
const appCss = "/assets/styles-CM6_1Doo.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-[7rem] font-extrabold leading-none text-gradient", children: "404" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-xl font-semibold text-foreground", children: "Lost in the meeting room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-7", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-flex h-11 items-center justify-center rounded-xl bg-gradient-primary px-6 text-sm font-medium text-primary-foreground shadow-glow transition-opacity hover:opacity-95",
          children: "Return Home"
        }
      ) })
    ] })
  ] });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$g = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Meetrivo — Meet Beyond Meetings" },
      { name: "description", content: "A modern, mobile-first collaboration platform. Connect. Collaborate. Create." },
      { name: "author", content: "Meetrivo" },
      { property: "og:title", content: "Meetrivo — Meet Beyond Meetings" },
      { property: "og:description", content: "A modern, mobile-first collaboration platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Meetrivo" }
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous"
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
      },
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$g.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", theme: "dark" })
  ] });
}
const $$splitComponentImporter$e = () => import("./whiteboard-OrGOA2lM.mjs");
const Route$f = createFileRoute("/whiteboard")({
  head: () => ({
    meta: [{
      title: "Whiteboard — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const BASE_URL = "";
const Route$e = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/login", changefreq: "monthly", priority: "0.6" },
          { path: "/register", changefreq: "monthly", priority: "0.6" },
          { path: "/forgot-password", changefreq: "monthly", priority: "0.4" },
          { path: "/dashboard", changefreq: "weekly", priority: "0.8" },
          { path: "/profile", changefreq: "monthly", priority: "0.5" },
          { path: "/settings", changefreq: "monthly", priority: "0.5" },
          { path: "/history", changefreq: "weekly", priority: "0.6" },
          { path: "/notifications", changefreq: "weekly", priority: "0.6" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$d = () => import("./settings-CFfFPWgr.mjs");
const Route$d = createFileRoute("/settings")({
  head: () => ({
    meta: [{
      title: "Settings — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./room-Qoi2x4Oe.mjs");
const Route$c = createFileRoute("/room")({
  head: () => ({
    meta: [{
      title: "Meeting room — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./register-DPuKvQ5B.mjs");
const Route$b = createFileRoute("/register")({
  head: () => ({
    meta: [{
      title: "Create account — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./profile-CHJLKXDm.mjs");
const Route$a = createFileRoute("/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./notifications-B0lJJ1D7.mjs");
const Route$9 = createFileRoute("/notifications")({
  head: () => ({
    meta: [{
      title: "Notifications — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./login-BgbHEUvQ.mjs");
const Route$8 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Login — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./lobby-BW7LV0E2.mjs");
const Route$7 = createFileRoute("/lobby")({
  head: () => ({
    meta: [{
      title: "Ready to join — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./join-BQt9SC-t.mjs");
const Route$6 = createFileRoute("/join")({
  head: () => ({
    meta: [{
      title: "Join meeting — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./history-BfousLik.mjs");
const Route$5 = createFileRoute("/history")({
  head: () => ({
    meta: [{
      title: "Meeting history — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./forgot-password-BCt_SvbU.mjs");
const Route$4 = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Reset password — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./files-CTt280cJ.mjs");
const Route$3 = createFileRoute("/files")({
  head: () => ({
    meta: [{
      title: "Files — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard-Cr6H2Aa-.mjs");
const Route$2 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./create-Don3Tcw-.mjs");
const Route$1 = createFileRoute("/create")({
  head: () => ({
    meta: [{
      title: "Create meeting — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const heroMockup = "/assets/hero-mockup-Bj_kLHfc.jpg";
const $$splitComponentImporter = () => import("./index-ryNZmXT4.mjs");
const Route = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Meetrivo — Meet Beyond Meetings"
    }, {
      name: "description",
      content: "Meetrivo is a modern collaboration platform built for smarter communication, productivity, and teamwork."
    }, {
      property: "og:title",
      content: "Meetrivo — Meet Beyond Meetings"
    }, {
      property: "og:description",
      content: "A premium, mobile-first collaboration platform. Connect. Collaborate. Create."
    }, {
      property: "og:image",
      content: heroMockup
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const WhiteboardRoute = Route$f.update({
  id: "/whiteboard",
  path: "/whiteboard",
  getParentRoute: () => Route$g
});
const SitemapDotxmlRoute = Route$e.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$g
});
const SettingsRoute = Route$d.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$g
});
const RoomRoute = Route$c.update({
  id: "/room",
  path: "/room",
  getParentRoute: () => Route$g
});
const RegisterRoute = Route$b.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$g
});
const ProfileRoute = Route$a.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$g
});
const NotificationsRoute = Route$9.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => Route$g
});
const LoginRoute = Route$8.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$g
});
const LobbyRoute = Route$7.update({
  id: "/lobby",
  path: "/lobby",
  getParentRoute: () => Route$g
});
const JoinRoute = Route$6.update({
  id: "/join",
  path: "/join",
  getParentRoute: () => Route$g
});
const HistoryRoute = Route$5.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => Route$g
});
const ForgotPasswordRoute = Route$4.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$g
});
const FilesRoute = Route$3.update({
  id: "/files",
  path: "/files",
  getParentRoute: () => Route$g
});
const DashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$g
});
const CreateRoute = Route$1.update({
  id: "/create",
  path: "/create",
  getParentRoute: () => Route$g
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$g
});
const rootRouteChildren = {
  IndexRoute,
  CreateRoute,
  DashboardRoute,
  FilesRoute,
  ForgotPasswordRoute,
  HistoryRoute,
  JoinRoute,
  LobbyRoute,
  LoginRoute,
  NotificationsRoute,
  ProfileRoute,
  RegisterRoute,
  RoomRoute,
  SettingsRoute,
  SitemapDotxmlRoute,
  WhiteboardRoute
};
const routeTree = Route$g._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  heroMockup as h,
  router as r
};

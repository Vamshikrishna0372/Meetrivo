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
const appCss = "/assets/styles-D6OxU_8D.css";
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
const Route$n = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Meetrivo — Meet Beyond Meetings" },
      { name: "description", content: "Meetrivo is a premium, AI-powered meeting and collaboration platform designed for high-performance teams. Connect, collaborate, and create with seamless video conferencing and workspace integration." },
      { name: "keywords", content: "Meetrivo, video conferencing, collaboration, startup, meetings, remote work, workspace" },
      { name: "author", content: "Meetrivo" },
      { property: "og:title", content: "Meetrivo — Meet Beyond Meetings" },
      { property: "og:description", content: "A modern, premium collaboration platform built for the future of work. Connect with your team like never before." },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Meetrivo" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Meetrivo" },
      { name: "twitter:creator", content: "@Meetrivo" },
      { name: "twitter:title", content: "Meetrivo — Meet Beyond Meetings" },
      { name: "twitter:description", content: "Meetrivo is the premium collaboration platform for modern startups. Meet beyond the basics." },
      { name: "twitter:image", content: "/og-image.png" },
      { name: "theme-color", content: "#0F172A" }
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
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png"
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png"
      },
      {
        rel: "manifest",
        href: "/site.webmanifest"
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
  const { queryClient } = Route$n.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { position: "top-center", theme: "dark" })
  ] });
}
const $$splitComponentImporter$l = () => import("./whiteboard-Cmj2i8wF.mjs");
const Route$m = createFileRoute("/whiteboard")({
  head: () => ({
    meta: [{
      title: "Whiteboard — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./verify-CW2rMM5Z.mjs");
const Route$l = createFileRoute("/verify")({
  head: () => ({
    meta: [{
      title: "Verify email — Meetrivo"
    }]
  }),
  validateSearch: (search) => ({
    token: search.token || ""
  }),
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./support-Bv0PTLdP.mjs");
const Route$k = createFileRoute("/support")({
  head: () => ({
    meta: [{
      title: "Support — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const BASE_URL = "";
const Route$j = createFileRoute("/sitemap.xml")({
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
const $$splitComponentImporter$i = () => import("./settings-BKsvv5yq.mjs");
const Route$i = createFileRoute("/settings")({
  head: () => ({
    meta: [{
      title: "Settings — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./room-Ca25ERxg.mjs");
const Route$h = createFileRoute("/room")({
  head: () => ({
    meta: [{
      title: "Meeting room — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./reset-password-DSLqil5V.mjs");
const Route$g = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Set new password — Meetrivo"
    }]
  }),
  validateSearch: (search) => ({
    token: search.token || ""
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./register-DF9ov1i4.mjs");
const Route$f = createFileRoute("/register")({
  head: () => ({
    meta: [{
      title: "Create account — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./profile-D0SQ56A4.mjs");
const Route$e = createFileRoute("/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./organizations-C-nOaK8y.mjs");
const Route$d = createFileRoute("/organizations")({
  head: () => ({
    meta: [{
      title: "Workspaces & Organizations — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./notifications-C3QoME0c.mjs");
const Route$c = createFileRoute("/notifications")({
  head: () => ({
    meta: [{
      title: "Notifications — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./login-i4MmHnhu.mjs");
const Route$b = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Login — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./lobby-LvgY2NCH.mjs");
const Route$a = createFileRoute("/lobby")({
  head: () => ({
    meta: [{
      title: "Ready to join — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./join-Lq8hIUjd.mjs");
const Route$9 = createFileRoute("/join")({
  head: () => ({
    meta: [{
      title: "Join meeting — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./history-SHkBmoB7.mjs");
const Route$8 = createFileRoute("/history")({
  head: () => ({
    meta: [{
      title: "Meeting history — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./forgot-password-uujJt3Vp.mjs");
const Route$7 = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Reset password — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./files-CiD7Coeq.mjs");
const Route$6 = createFileRoute("/files")({
  head: () => ({
    meta: [{
      title: "Files — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./feedback-BwRIefR5.mjs");
const Route$5 = createFileRoute("/feedback")({
  head: () => ({
    meta: [{
      title: "Feedback — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./dashboard-Dq5oraVi.mjs");
const Route$4 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./create-C7g2aSn9.mjs");
const Route$3 = createFileRoute("/create")({
  head: () => ({
    meta: [{
      title: "Create meeting — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./billing-CAHIK9Ce.mjs");
const Route$2 = createFileRoute("/billing")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin-QFE8ljrv.mjs");
const Route$1 = createFileRoute("/admin")({
  head: () => ({
    meta: [{
      title: "Admin Panel — Meetrivo"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const heroMockup = "/assets/hero-mockup-Bj_kLHfc.jpg";
const $$splitComponentImporter = () => import("./index-DYBg1MgX.mjs");
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
const WhiteboardRoute = Route$m.update({
  id: "/whiteboard",
  path: "/whiteboard",
  getParentRoute: () => Route$n
});
const VerifyRoute = Route$l.update({
  id: "/verify",
  path: "/verify",
  getParentRoute: () => Route$n
});
const SupportRoute = Route$k.update({
  id: "/support",
  path: "/support",
  getParentRoute: () => Route$n
});
const SitemapDotxmlRoute = Route$j.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$n
});
const SettingsRoute = Route$i.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$n
});
const RoomRoute = Route$h.update({
  id: "/room",
  path: "/room",
  getParentRoute: () => Route$n
});
const ResetPasswordRoute = Route$g.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$n
});
const RegisterRoute = Route$f.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$n
});
const ProfileRoute = Route$e.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$n
});
const OrganizationsRoute = Route$d.update({
  id: "/organizations",
  path: "/organizations",
  getParentRoute: () => Route$n
});
const NotificationsRoute = Route$c.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => Route$n
});
const LoginRoute = Route$b.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$n
});
const LobbyRoute = Route$a.update({
  id: "/lobby",
  path: "/lobby",
  getParentRoute: () => Route$n
});
const JoinRoute = Route$9.update({
  id: "/join",
  path: "/join",
  getParentRoute: () => Route$n
});
const HistoryRoute = Route$8.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => Route$n
});
const ForgotPasswordRoute = Route$7.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$n
});
const FilesRoute = Route$6.update({
  id: "/files",
  path: "/files",
  getParentRoute: () => Route$n
});
const FeedbackRoute = Route$5.update({
  id: "/feedback",
  path: "/feedback",
  getParentRoute: () => Route$n
});
const DashboardRoute = Route$4.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$n
});
const CreateRoute = Route$3.update({
  id: "/create",
  path: "/create",
  getParentRoute: () => Route$n
});
const BillingRoute = Route$2.update({
  id: "/billing",
  path: "/billing",
  getParentRoute: () => Route$n
});
const AdminRoute = Route$1.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$n
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$n
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  BillingRoute,
  CreateRoute,
  DashboardRoute,
  FeedbackRoute,
  FilesRoute,
  ForgotPasswordRoute,
  HistoryRoute,
  JoinRoute,
  LobbyRoute,
  LoginRoute,
  NotificationsRoute,
  OrganizationsRoute,
  ProfileRoute,
  RegisterRoute,
  ResetPasswordRoute,
  RoomRoute,
  SettingsRoute,
  SitemapDotxmlRoute,
  SupportRoute,
  VerifyRoute,
  WhiteboardRoute
};
const routeTree = Route$n._addFileChildren(rootRouteChildren)._addFileTypes();
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
  Route$l as R,
  Route$g as a,
  heroMockup as h,
  router as r
};

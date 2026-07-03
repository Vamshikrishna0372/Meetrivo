import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AuthLayout } from "./AuthLayout-CpcXU53o.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { auth } from "./apiClient-Bx2sjVOE.mjs";
import { h as FiLoader, i as FiCheck, j as FiX } from "../_libs/react-icons.mjs";
import { R as Route$l } from "./router-ixNtfmcv.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function VerifyEmailPage() {
  const {
    token
  } = Route$l.useSearch();
  const [status, setStatus] = reactExports.useState("loading");
  const [message, setMessage] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your verification email link.");
      return;
    }
    auth.verifyEmail(token).then(() => {
      setStatus("success");
      setMessage("Your email has been verified successfully. You can now log in to your account.");
      toast.success("Email verified successfully!");
    }).catch((err) => {
      setStatus("error");
      setMessage(err.message || "Email verification failed. The token may be invalid or expired.");
      toast.error(err.message || "Verification failed");
    });
  }, [token]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, { title: status === "loading" ? "Verifying your email" : status === "success" ? "Email verified!" : "Verification failed", subtitle: status === "loading" ? "Please wait while we confirm your email address..." : status === "success" ? "Thank you for verifying your email address." : "We couldn't verify your email address.", footer: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Back to login" }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-6 py-4 text-center", children: [
    status === "loading" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-16 w-16 place-items-center rounded-full bg-primary/15 text-primary animate-spin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-8 w-8" }) }),
    status === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "hero", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Go to Login" }) })
    ] }),
    status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiX, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "glass", className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: "Back to Login" }) })
    ] })
  ] }) });
}
export {
  VerifyEmailPage as component
};

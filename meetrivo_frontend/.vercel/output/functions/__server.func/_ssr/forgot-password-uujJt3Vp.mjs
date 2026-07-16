import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { i as FiCheck } from "../_libs/react-icons.mjs";
import { A as AuthLayout } from "./AuthLayout-CpcXU53o.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { auth } from "./apiClient-DhOx7IPH.mjs";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function ForgotPage() {
  const [email, setEmail] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [sent, setSent] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    setLoading(true);
    auth.forgotPassword(email).then(() => {
      setSent(true);
    }).catch((err) => {
      setError(err.message || "Failed to send reset link");
    }).finally(() => {
      setLoading(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, { title: sent ? "Check your inbox" : "Reset your password", subtitle: sent ? "We've sent a recovery link to your email." : "Enter your email and we'll send you a reset link.", footer: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Back to login" }), children: sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
    opacity: 0,
    scale: 0.95
  }, animate: {
    opacity: 1,
    scale: 1
  }, className: "flex flex-col items-center gap-4 py-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, { className: "h-7 w-7" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "If ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: email }),
      " matches an account, a reset link is on its way."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", className: "w-full", onClick: () => setSent(false), children: "Resend link" })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", placeholder: "you@company.com", value: email, error, onChange: (e) => setEmail(e.target.value) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", size: "lg", type: "submit", disabled: loading, children: loading ? "Sending..." : "Send reset link" })
  ] }) });
}
export {
  ForgotPage as component
};

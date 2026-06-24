import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AuthLayout } from "./AuthLayout-CpcXU53o.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { auth } from "./apiClient-BAZ_k_AE.mjs";
import { a as Route$g } from "./router-CqhdGEZy.mjs";
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
import "../_libs/react-icons.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function ResetPasswordPage() {
  const navigate = useNavigate();
  const {
    token
  } = Route$g.useSearch();
  const [values, setValues] = reactExports.useState({
    password: "",
    confirm: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const [done, setDone] = reactExports.useState(false);
  const set = (k) => (e) => setValues((v) => ({
    ...v,
    [k]: e.target.value
  }));
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!token) errs.token = "Missing reset token. Please use the link from your email.";
    if (values.password.length < 6) errs.password = "Minimum 6 characters";
    if (values.confirm !== values.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    auth.resetPassword(token, values.password).then(() => {
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate({
        to: "/login"
      }), 2e3);
    }).catch((err) => {
      toast.error(err.message || "Failed to reset password. Token may be expired.");
    }).finally(() => {
      setLoading(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, { title: done ? "Password updated!" : "Set new password", subtitle: done ? "You'll be redirected to login shortly." : "Choose a strong password for your account.", footer: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Back to login" }), children: done ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 py-4 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success text-2xl", children: "✓" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Your password has been updated. Redirecting you to login..." })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    !token && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: "Invalid or missing reset token. Please request a new password reset link." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "New password", type: "password", placeholder: "••••••••", value: values.password, error: errors.password, onChange: set("password") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm password", type: "password", placeholder: "••••••••", value: values.confirm, error: errors.confirm, onChange: set("confirm") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", size: "lg", type: "submit", disabled: loading || !token, children: loading ? "Resetting..." : "Reset password" })
  ] }) });
}
export {
  ResetPasswordPage as component
};

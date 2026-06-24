import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AuthLayout } from "./AuthLayout-CpcXU53o.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { apiFetch } from "./apiClient-BAZ_k_AE.mjs";
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
function LoginPage() {
  const navigate = useNavigate();
  const [values, setValues] = reactExports.useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = "Enter a valid email";
    if (values.password.length < 6) errs.password = "Minimum 6 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        login: values.email,
        password: values.password
      })
    }).then((data) => {
      localStorage.setItem("meetrivo_token", data.token);
      localStorage.setItem("meetrivo_user", JSON.stringify(data.user));
      toast.success("Welcome back to Meetrivo");
      navigate({
        to: "/dashboard"
      });
    }).catch((err) => {
      toast.error(err.message || "Invalid credentials");
    }).finally(() => {
      setLoading(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, { title: "Welcome back", subtitle: "Sign in to continue to your workspace.", footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    "Don't have an account?",
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "font-medium text-primary hover:underline", children: "Register" })
  ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", placeholder: "you@company.com", value: values.email, error: errors.email, onChange: (e) => setValues((v) => ({
      ...v,
      email: e.target.value
    })) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "password", placeholder: "••••••••", value: values.password, error: errors.password, onChange: (e) => setValues((v) => ({
      ...v,
      password: e.target.value
    })) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/forgot-password", className: "text-xs text-muted-foreground hover:text-foreground", children: "Forgot password?" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", size: "lg", type: "submit", disabled: loading, children: loading ? "Signing in..." : "Sign in" })
  ] }) });
}
export {
  LoginPage as component
};

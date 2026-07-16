import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AuthLayout } from "./AuthLayout-CpcXU53o.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { auth } from "./apiClient-DhOx7IPH.mjs";
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
function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = reactExports.useState({
    name: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [errors, setErrors] = reactExports.useState({});
  const [loading, setLoading] = reactExports.useState(false);
  const set = (k) => (e) => setValues((v) => ({
    ...v,
    [k]: e.target.value
  }));
  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (values.name.trim().length < 2) errs.name = "Enter your full name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) errs.email = "Enter a valid email";
    if (values.password.length < 6) errs.password = "Minimum 6 characters";
    if (values.confirm !== values.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    const username = values.email.split("@")[0] + "_" + Math.floor(Math.random() * 1e3);
    auth.register({
      username,
      email: values.email,
      name: values.name,
      password: values.password
    }).then(() => {
      toast.success("Account created — please login!");
      navigate({
        to: "/login"
      });
    }).catch((err) => {
      toast.error(err.message || "Failed to create account");
    }).finally(() => {
      setLoading(false);
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthLayout, { title: "Create your account", subtitle: "Start collaborating in seconds.", footer: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    "Already have an account?",
    " ",
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Login" })
  ] }), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full name", placeholder: "Jordan Rivera", value: values.name, error: errors.name, onChange: set("name") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email", type: "email", placeholder: "you@company.com", value: values.email, error: errors.email, onChange: set("email") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "password", placeholder: "••••••••", value: values.password, error: errors.password, onChange: set("password") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm password", type: "password", placeholder: "••••••••", value: values.confirm, error: errors.confirm, onChange: set("confirm") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "w-full", size: "lg", type: "submit", disabled: loading, children: loading ? "Creating account..." : "Create account" })
  ] }) });
}
export {
  RegisterPage as component
};

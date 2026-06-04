import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { c as cn } from "./button-ZuR0Bnki.mjs";
function Logo({ className, showText = true }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: cn("flex items-center gap-2.5 group", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-105", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary-foreground font-display font-extrabold text-lg leading-none", children: "M" }) }),
    showText && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-extrabold tracking-tight", children: "Meetrivo" })
  ] });
}
export {
  Logo as L
};

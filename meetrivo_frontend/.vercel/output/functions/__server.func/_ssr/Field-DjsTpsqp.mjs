import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { ab as FiEyeOff, ac as FiEye } from "../_libs/react-icons.mjs";
import { c as cn } from "./button-ZuR0Bnki.mjs";
const Field = reactExports.forwardRef(
  ({ label, error, type = "text", className, ...props }, ref) => {
    const [show, setShow] = reactExports.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? show ? "text" : "password" : type;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref,
            type: inputType,
            className: cn(
              "h-11 w-full rounded-xl border bg-background/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70",
              "focus:border-primary focus:ring-2 focus:ring-primary/30",
              error ? "border-destructive" : "border-border",
              isPassword && "pr-11",
              className
            ),
            ...props
          }
        ),
        isPassword && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShow((s) => !s),
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            "aria-label": show ? "Hide password" : "Show password",
            children: show ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiEyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiEye, { className: "h-4 w-4" })
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-destructive", children: error })
    ] });
  }
);
Field.displayName = "Field";
export {
  Field as F
};

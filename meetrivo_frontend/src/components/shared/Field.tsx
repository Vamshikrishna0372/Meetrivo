import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  ({ label, error, type = "text", className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (show ? "text" : "password") : type;

    return (
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "h-11 w-full rounded-xl border bg-background/60 px-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70",
              "focus:border-primary focus:ring-2 focus:ring-primary/30",
              error ? "border-destructive" : "border-border",
              isPassword && "pr-11",
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          )}
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </label>
    );
  },
);
Field.displayName = "Field";

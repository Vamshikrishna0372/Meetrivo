import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 group", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-105">
        <span className="text-primary-foreground font-display font-extrabold text-lg leading-none">
          M
        </span>
      </span>
      {showText && (
        <span className="font-display text-lg font-extrabold tracking-tight">Meetrivo</span>
      )}
    </Link>
  );
}

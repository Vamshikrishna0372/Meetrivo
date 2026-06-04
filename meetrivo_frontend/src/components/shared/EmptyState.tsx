import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: IconType;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; icon?: ReactNode };
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center ${className ?? ""}`}
    >
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <Button variant="glass" size="sm" className="mt-2" onClick={action.onClick}>
          {action.icon}
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

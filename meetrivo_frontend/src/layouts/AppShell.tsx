import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  FiHome,
  FiClock,
  FiBell,
  FiUser,
  FiSettings,
  FiVideo,
  FiEdit3,
  FiFolder,
} from "react-icons/fi";
import { Logo } from "@/components/shared/Logo";
import { currentUser } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: FiHome },
  { label: "Whiteboard", to: "/whiteboard", icon: FiEdit3 },
  { label: "Files", to: "/files", icon: FiFolder },
  { label: "History", to: "/history", icon: FiClock },
  { label: "Alerts", to: "/notifications", icon: FiBell },
  { label: "Profile", to: "/profile", icon: FiUser },
  { label: "Settings", to: "/settings", icon: FiSettings },
];

const mobileNav = [
  { label: "Home", to: "/dashboard", icon: FiHome },
  { label: "Files", to: "/files", icon: FiFolder },
  { label: "Board", to: "/whiteboard", icon: FiEdit3 },
  { label: "Alerts", to: "/notifications", icon: FiBell },
  { label: "Profile", to: "/profile", icon: FiUser },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-5 md:flex">
        <Logo className="mb-8" />
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
                {active && (
                  <motion.span
                    layoutId="side-active"
                    className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <Button variant="hero" className="w-full" asChild>
            <Link to="/create">
              <FiVideo /> New meeting
            </Link>
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
          <Logo />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
            {currentUser.initials}
          </span>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10 md:pt-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {mobileNav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

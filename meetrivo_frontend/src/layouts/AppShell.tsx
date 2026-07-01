import { useState, useEffect, type ReactNode } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
  FiLogOut,
  FiLayers,
  FiCreditCard,
  FiHelpCircle,
  FiMessageSquare,
  FiShield,
} from "react-icons/fi";
import { Logo } from "@/components/shared/Logo";
import { auth, BACKEND_BASE_URL } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [initials, setInitials] = useState("ME");
  const [displayName, setDisplayName] = useState("User");
  const [userRole, setUserRole] = useState("MEMBER");
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    // Auth guard: redirect to login if not authenticated
    if (typeof window !== "undefined" && !auth.isAuthenticated()) {
      window.location.href = "/login";
      return;
    }
    const stored = localStorage.getItem("meetrivo_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        const name = u.fullName || u.username || u.email || "User";
        setDisplayName(name);
        setUserRole(u.role || "MEMBER");
        setProfilePic(u.profilePicture || "");
        const parts = name.split(" ");
        setInitials(parts.map((p: string) => p[0]).join("").toUpperCase().substring(0, 2));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    auth.logout();
    navigate({ to: "/login" });
  };

  const getNavItems = () => {
    if (userRole === "SUPER_ADMIN") {
      return [
        { label: "Admin Panel", to: "/admin", icon: FiShield },
        { label: "Organizations", to: "/organizations", icon: FiLayers },
        { label: "Billing", to: "/billing", icon: FiCreditCard },
        { label: "Profile", to: "/profile", icon: FiUser },
        { label: "Settings", to: "/settings", icon: FiSettings },
      ];
    }
    if (userRole === "ORGANIZATION_OWNER" || userRole === "ORGANIZATION_ADMIN") {
      return [
        { label: "Meetings", to: "/dashboard", icon: FiHome },
        { label: "Workspaces", to: "/organizations", icon: FiLayers },
        { label: "Billing", to: "/billing", icon: FiCreditCard },
        { label: "Profile", to: "/profile", icon: FiUser },
        { label: "Settings", to: "/settings", icon: FiSettings },
      ];
    }
    if (userRole === "TEAM_MANAGER") {
      return [
        { label: "Meetings", to: "/dashboard", icon: FiHome },
        { label: "Teams", to: "/organizations", icon: FiLayers },
        { label: "Profile", to: "/profile", icon: FiUser },
        { label: "Settings", to: "/settings", icon: FiSettings },
      ];
    }
    // Default MEMBER
    return [
      { label: "Meetings", to: "/dashboard", icon: FiHome },
      { label: "Whiteboard", to: "/whiteboard", icon: FiEdit3 },
      { label: "Files", to: "/files", icon: FiFolder },
      { label: "History", to: "/history", icon: FiClock },
      { label: "Alerts", to: "/notifications", icon: FiBell },
      { label: "Profile", to: "/profile", icon: FiUser },
      { label: "Settings", to: "/settings", icon: FiSettings },
    ];
  };

  const nav = getNavItems();

  const mobileNav = [
    { label: "Home", to: "/dashboard", icon: FiHome },
    { label: "Files", to: "/files", icon: FiFolder },
    { label: "Board", to: "/whiteboard", icon: FiEdit3 },
    { label: "Billing", to: "/billing", icon: FiCreditCard },
    { label: "Profile", to: "/profile", icon: FiUser },
  ];

  return (
    <div className="min-h-screen w-full bg-background md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar p-5 md:flex overflow-y-auto">
        <Logo className="mb-6" />
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-surface text-foreground"
                    : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
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
        <div className="mt-4 space-y-2 rounded-2xl border border-border bg-card p-4">
          <Button variant="hero" className="w-full" asChild>
            <Link to="/create">
              <FiVideo /> New meeting
            </Link>
          </Button>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 px-3 py-2">
            {profilePic ? (
              <img
                src={profilePic.startsWith("http") ? profilePic : `${BACKEND_BASE_URL}${profilePic}`}
                alt={displayName}
                className="h-7 w-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate text-xs font-medium">{displayName}</span>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="shrink-0 text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
            >
              <FiLogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:hidden">
          <Logo />
          {profilePic ? (
            <img
              src={profilePic.startsWith("http") ? profilePic : `${BACKEND_BASE_URL}${profilePic}`}
              alt={displayName}
              className="h-9 w-9 rounded-full object-cover shrink-0"
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">
              {initials}
            </span>
          )}
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
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

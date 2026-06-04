import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/#features" },
  { label: "Product", to: "/#mobile" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-border/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.to}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/register">Get started</Link>
            </Button>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-surface md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col gap-6 border-l border-border bg-card p-6 md:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <a
                    key={l.label}
                    href={l.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2">
                <Button variant="glass" asChild>
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    Get started
                  </Link>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

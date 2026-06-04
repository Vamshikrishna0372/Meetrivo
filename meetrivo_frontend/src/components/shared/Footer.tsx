import { Link } from "@tanstack/react-router";
import { FiTwitter, FiGithub, FiLinkedin } from "react-icons/fi";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Meet beyond meetings. A modern collaboration platform for smarter teamwork.
            </p>
          </div>
          <FooterCol
            title="Product"
            items={[
              { label: "Features", to: "/#features" },
              { label: "Dashboard", to: "/dashboard" },
              { label: "Mobile", to: "/#mobile" },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "Login", to: "/login" },
              { label: "Register", to: "/register" },
              { label: "Settings", to: "/settings" },
            ]}
          />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Follow</h4>
            <div className="flex gap-3">
              {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Meetrivo. All rights reserved.</p>
          <p>Connect. Collaborate. Create.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; to: string }[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <Link
              to={it.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

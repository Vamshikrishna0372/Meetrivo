import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { m as FiMoon, n as FiBell, o as FiMic, p as FiShield } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-BsA-hVtb.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { users } from "./apiClient-BAZ_k_AE.mjs";
import "../_libs/tanstack__react-router.mjs";
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
import "./button-ZuR0Bnki.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function Toggle({
  on,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, className: `relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-surface"}`, "aria-pressed": on, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}` }) });
}
function SettingsPage() {
  const [prefs, setPrefs] = reactExports.useState({
    dark: true,
    notifs: true,
    sound: true,
    hd: false,
    presence: true,
    readReceipts: false
  });
  reactExports.useEffect(() => {
    users.getProfile().then((res) => {
      if (res && res.preferences) {
        setPrefs({
          dark: res.preferences.theme === "dark",
          notifs: res.preferences.pushNotifications ?? true,
          sound: res.preferences.emailNotifications ?? true,
          hd: false,
          presence: true,
          readReceipts: false
        });
      }
    }).catch(() => {
    });
  }, []);
  const toggle = async (k) => {
    const nextPrefs = {
      ...prefs,
      [k]: !prefs[k]
    };
    setPrefs(nextPrefs);
    try {
      await users.updateProfile({
        preferences: {
          theme: nextPrefs.dark ? "dark" : "light",
          pushNotifications: nextPrefs.notifs,
          emailNotifications: nextPrefs.sound
        }
      });
    } catch (e) {
      console.error("Failed to update preferences", e);
    }
  };
  const sections = [{
    title: "Appearance",
    icon: FiMoon,
    rows: [{
      label: "Dark theme",
      desc: "Premium dark interface",
      key: "dark"
    }]
  }, {
    title: "Notifications",
    icon: FiBell,
    rows: [{
      label: "Push notifications",
      desc: "Meeting invites & mentions",
      key: "notifs"
    }, {
      label: "Notification sound",
      desc: "Play a sound on new alerts",
      key: "sound"
    }]
  }, {
    title: "Devices",
    icon: FiMic,
    rows: [{
      label: "Default HD video",
      desc: "Join meetings in high definition",
      key: "hd"
    }]
  }, {
    title: "Privacy",
    icon: FiShield,
    rows: [{
      label: "Show presence",
      desc: "Let teammates see you're online",
      key: "presence"
    }, {
      label: "Read receipts",
      desc: "Share when you've read messages",
      key: "readReceipts"
    }]
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Customize your Meetrivo experience." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 space-y-5", children: sections.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "flex items-center gap-2 text-sm font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-4 w-4 text-primary" }),
        " ",
        s.title
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 space-y-4", children: s.rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: r.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: r.desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { on: prefs[r.key], onClick: () => toggle(r.key) })
      ] }, r.key)) })
    ] }) }, s.title)) })
  ] });
}
export {
  SettingsPage as component
};

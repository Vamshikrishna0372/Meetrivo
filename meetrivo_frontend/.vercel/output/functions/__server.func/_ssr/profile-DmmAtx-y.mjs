import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { v as FiVideo, s as FiClock, J as FiLayers, h as FiLoader, F as FiEdit2 } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-BsA-hVtb.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { analytics, users } from "./apiClient-BAZ_k_AE.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-XbEnPBIB.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
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
import "../_libs/framer-motion.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/lucide-react.mjs";
function ProfilePage() {
  const [profile, setProfile] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editName, setEditName] = reactExports.useState("");
  const [editBio, setEditBio] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const [statsData, setStatsData] = reactExports.useState({
    meetings: 0,
    hours: 0,
    workspaces: 0
  });
  reactExports.useEffect(() => {
    loadProfile();
    analytics.getDashboard().then((data) => {
      if (data) {
        setStatsData({
          meetings: data.totalMeetings || data.meetingsThisWeek || 0,
          hours: data.totalHoursInMeetings || data.avgDurationMin || 0,
          workspaces: data.activeWorkspaces || 1
        });
      }
    }).catch(() => {
    });
  }, []);
  const loadProfile = () => {
    setLoading(true);
    users.getProfile().then((data) => {
      setProfile(data);
      setEditName(data.fullName || "");
      setEditBio(data.bio || "");
    }).catch((e) => {
      console.error("Failed to load profile", e);
    }).finally(() => {
      setLoading(false);
    });
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await users.updateProfile({
        fullName: editName,
        bio: editBio
      });
      setProfile(updated);
      localStorage.setItem("meetrivo_user", JSON.stringify(updated));
      setEditOpen(false);
    } catch (e) {
      alert(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };
  const stats = [{
    icon: FiVideo,
    label: "Meetings",
    value: statsData.meetings
  }, {
    icon: FiClock,
    label: "Hours",
    value: statsData.hours
  }, {
    icon: FiLayers,
    label: "Workspaces",
    value: statsData.workspaces
  }];
  if (loading && !profile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-8 w-8 animate-spin text-primary" }) }) });
  }
  const initials = profile?.fullName ? profile.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : (profile?.username || "U").slice(0, 2).toUpperCase();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Profile" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage your personal information." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-[80px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow", children: initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: profile?.fullName || profile?.username }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: profile?.role || "Member" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: profile?.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "glass", size: "sm", onClick: () => setEditOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiEdit2, {}),
            " Edit profile"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4 sm:grid-cols-3", children: stats.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.05, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-3xl font-extrabold", children: s.value }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: s.label })
      ] }) }, s.label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "User information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("dl", { className: "mt-4 grid gap-4 sm:grid-cols-2", children: [["Full name", profile?.fullName || "Not set"], ["Email", profile?.email], ["Username", profile?.username], ["Bio", profile?.bio || "No bio yet"]].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-xs text-muted-foreground", children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "mt-0.5 text-sm font-medium", children: v })
        ] }, k)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Profile" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full Name", value: editName, onChange: (e) => setEditName(e.target.value), placeholder: "e.g. Jordan Rivera" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium", children: "Bio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: editBio, onChange: (e) => setEditBio(e.target.value), placeholder: "Tell us about yourself", rows: 3, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setEditOpen(false), disabled: saving, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", onClick: handleSave, disabled: saving, children: [
            saving && /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "animate-spin mr-1" }),
            saving ? "Saving..." : "Save Changes"
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ProfilePage as component
};

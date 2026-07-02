import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { aa as FiActivity, y as FiUsers, v as FiVideo, k as FiHelpCircle, a2 as FiFileText, U as FiSettings, h as FiLoader, ae as FiDatabase, af as FiDollarSign, g as FiTrash2 } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-CrxzEjwx.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { admin, support } from "./apiClient-DSVPR1M2.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function AdminPage() {
  const [activeTab, setActiveTab] = reactExports.useState("overview");
  const [stats, setStats] = reactExports.useState(null);
  const [activity, setActivity] = reactExports.useState([]);
  const [users, setUsers] = reactExports.useState([]);
  const [meetings, setMeetings] = reactExports.useState([]);
  const [tickets, setTickets] = reactExports.useState([]);
  const [settings, setSettings] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [userAnalytics, setUserAnalytics] = reactExports.useState(null);
  const [meetingAnalytics, setMeetingAnalytics] = reactExports.useState(null);
  const [billingAnalytics, setBillingAnalytics] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem("meetrivo_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role !== "SUPER_ADMIN" && u.role !== "ORGANIZATION_ADMIN" && u.role !== "ORGANIZATION_OWNER") {
          toast.error("Access Denied: Admin role required");
          window.location.href = "/dashboard";
          return;
        }
      } catch (e) {
      }
    }
  }, []);
  reactExports.useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);
  const loadTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === "overview") {
        const statsData = await admin.getStats();
        setStats(statsData);
        const actData = await admin.getActivity();
        setActivity(actData || []);
      } else if (tab === "users") {
        const usersData = await admin.getUsers();
        setUsers(usersData || []);
      } else if (tab === "meetings") {
        const meetingsData = await admin.getMeetings();
        setMeetings(meetingsData || []);
      } else if (tab === "tickets") {
        const ticketsData = await support.getAllTickets();
        setTickets(ticketsData || []);
      } else if (tab === "reports") {
      } else if (tab === "analytics") {
        const userAn = await admin.getAnalyticsUsers();
        const meetAn = await admin.getAnalyticsMeetings();
        const billAn = await admin.getAnalyticsBilling();
        setUserAnalytics(userAn);
        setMeetingAnalytics(meetAn);
        setBillingAnalytics(billAn);
      } else if (tab === "settings") {
        const settingsData = await admin.getSettings();
        setSettings(settingsData || []);
      }
    } catch (e) {
      toast.error(e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };
  const handleUserAction = async (userId, action, payload) => {
    try {
      if (action === "delete") {
        await admin.deleteUser(userId);
        toast.success("User deleted successfully");
      } else if (action === "activate") {
        await admin.activateUser(userId);
        toast.success("User activated");
      } else if (action === "deactivate") {
        await admin.deactivateUser(userId);
        toast.success("User deactivated");
      } else if (action === "suspend") {
        await admin.suspendUser(userId);
        toast.success("User account suspended");
      } else if (action === "block") {
        await admin.blockUser(userId);
        toast.success("User blocked");
      } else if (action === "unblock") {
        await admin.unblockUser(userId);
        toast.success("User unblocked");
      } else if (action === "role") {
        await admin.updateUserRole(userId, payload);
        toast.success(`User role updated to ${payload}`);
      }
      loadTab("users");
    } catch (e) {
      toast.error(e.message || "Action failed");
    }
  };
  const handleMeetingAction = async (meetingId, action) => {
    try {
      if (action === "terminate") {
        await admin.terminateMeeting(meetingId);
        toast.success("Meeting session terminated");
      } else if (action === "delete") {
        await admin.deleteMeeting(meetingId);
        toast.success("Meeting metadata deleted");
      }
      loadTab("meetings");
    } catch (e) {
      toast.error(e.message || "Action failed");
    }
  };
  const handleTicketAction = async (ticketId, status) => {
    try {
      await support.updateTicketStatus(ticketId, status);
      toast.success(`Ticket status set to ${status}`);
      loadTab("tickets");
    } catch (e) {
      toast.error(e.message || "Action failed");
    }
  };
  const handleSettingAction = async (setting) => {
    try {
      await admin.updateSetting(setting);
      toast.success("Platform setting updated");
      loadTab("settings");
    } catch (e) {
      toast.error(e.message || "Failed to update setting");
    }
  };
  const generateReport = async (type) => {
    try {
      let report;
      if (type === "users") report = await admin.generateUserReport();
      else if (type === "meetings") report = await admin.generateMeetingReport();
      else report = await admin.generateSystemReport();
      if (report && report.id) {
        toast.success(`${type.toUpperCase()} report compiled! Downloading CSV...`);
        window.open(admin.exportCsvUrl(report.id), "_blank");
      }
    } catch (e) {
      toast.error(e.message || "Failed to generate report");
    }
  };
  const tabItems = [{
    id: "overview",
    label: "Overview",
    icon: FiActivity
  }, {
    id: "users",
    label: "Users",
    icon: FiUsers
  }, {
    id: "meetings",
    label: "Meetings",
    icon: FiVideo
  }, {
    id: "tickets",
    label: "Tickets",
    icon: FiHelpCircle
  }, {
    id: "reports",
    label: "Reports",
    icon: FiFileText
  }, {
    id: "analytics",
    label: "Analytics",
    icon: FiActivity
  }, {
    id: "settings",
    label: "Settings",
    icon: FiSettings
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Platform Admin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage user moderation, active conferences, reports, system parameters, and analytics." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex overflow-x-auto rounded-xl border border-border bg-card p-1", children: tabItems.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface hover:text-foreground"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(tab.icon, { className: "h-4 w-4" }),
      tab.label
    ] }, tab.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[400px]", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-8 w-8 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
      opacity: 0,
      y: 10
    }, animate: {
      opacity: 1,
      y: 0
    }, exit: {
      opacity: 0,
      y: -10
    }, transition: {
      duration: 0.2
    }, children: [
      activeTab === "overview" && stats && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FiUsers, label: "Total Users", value: stats.totalUsers, desc: `${stats.activeUsers} active accounts` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FiVideo, label: "Total Meetings", value: stats.totalMeetings, desc: `${stats.liveMeetings} sessions live` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FiDatabase, label: "Recordings Saved", value: stats.totalRecordings, desc: "Archived session tapes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: FiDollarSign, label: "System Alerts", value: stats.totalNotifications, desc: "Generated event triggers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiActivity, { className: "text-primary" }),
            " Recent Audit logs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[300px] overflow-y-auto space-y-2.5 pr-2", children: activity.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground py-6", children: "No logs available" }) : activity.map((act) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start gap-4 rounded-xl border border-border/50 bg-background/50 p-3 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: act.action }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-0.5", children: act.details }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground/75 mt-1", children: [
                "Target ID: ",
                act.targetId,
                " · Type: ",
                act.targetType
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: act.actorEmail }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground/75 mt-1", children: act.timestamp ? new Date(act.timestamp).toLocaleString() : "" })
            ] })
          ] }, act.id)) })
        ] })
      ] }),
      activeTab === "users" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Name / Username" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: users.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: u.fullName || "Unnamed User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "@",
              u.username
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-muted-foreground", children: u.email }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: u.role, onChange: (e) => handleUserAction(u.id, "role", e.target.value), className: "bg-surface text-xs font-semibold rounded px-2.5 py-1 border border-border outline-none cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "USER", children: "USER" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ADMIN", children: "ADMIN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "SUPER_ADMIN", children: "SUPER_ADMIN" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${u.accountStatus === "ACTIVE" ? "bg-success/15 text-success" : u.accountStatus === "BLOCKED" ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"}`, children: u.accountStatus }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap", children: [
            u.accountStatus === "ACTIVE" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleUserAction(u.id, "deactivate"), className: "text-xs font-semibold border border-warning/20 bg-warning/5 hover:bg-warning/15 text-warning rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer", children: "Deactivate" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleUserAction(u.id, "activate"), className: "text-xs font-semibold border border-success/20 bg-success/5 hover:bg-success/15 text-success rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer", children: "Activate" }),
            u.accountStatus === "BLOCKED" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleUserAction(u.id, "unblock"), className: "text-xs font-semibold border border-success/20 bg-success/5 hover:bg-success/15 text-success rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer", children: "Unblock" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleUserAction(u.id, "block"), className: "text-xs font-semibold border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer", children: "Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleUserAction(u.id, "delete"), className: "text-xs font-semibold bg-destructive/15 text-destructive hover:bg-destructive hover:text-white rounded-lg p-1.5 transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiTrash2, { className: "h-4 w-4" }) })
          ] })
        ] }, u.id)) })
      ] }) }) }),
      activeTab === "meetings" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Title / Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Scheduled time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: meetings.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: m.title || "Untitled Meeting" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground", children: m.meetingCode })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-muted-foreground", children: m.scheduledStartTime ? new Date(m.scheduledStartTime).toLocaleString() : "Instant" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${m.status === "ACTIVE" ? "bg-success/15 text-success animate-pulse" : m.status === "ENDED" ? "bg-surface text-muted-foreground" : "bg-primary/15 text-primary"}`, children: m.status }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap", children: [
            m.status === "ACTIVE" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMeetingAction(m.id, "terminate"), className: "text-xs font-semibold border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer", children: "Terminate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleMeetingAction(m.id, "delete"), className: "text-xs font-semibold bg-destructive/15 text-destructive hover:bg-destructive hover:text-white rounded-lg p-1.5 transition-colors cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiTrash2, { className: "h-4 w-4" }) })
          ] })
        ] }, m.id)) })
      ] }) }) }),
      activeTab === "tickets" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Subject" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-5 py-3.5 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: tickets.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface/30", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-5 py-3.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: t.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: t.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${t.priority === "HIGH" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"}`, children: t.priority || "NORMAL" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: t.status, onChange: (e) => handleTicketAction(t.id, e.target.value), className: "bg-surface text-xs font-semibold rounded px-2.5 py-1 border border-border outline-none cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OPEN", children: "OPEN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "IN_PROGRESS", children: "IN_PROGRESS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "RESOLVED", children: "RESOLVED" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CLOSED", children: "CLOSED" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-5 py-3.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleTicketAction(t.id, "RESOLVED"), className: "text-xs font-semibold border border-success/20 bg-success/5 hover:bg-success/15 text-success rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer", children: "Resolve" }) })
        ] }, t.id)) })
      ] }) }) }),
      activeTab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportCard, { title: "User Registration Report", desc: "Compiles active user growth stats, verified account list, and login history summaries.", onGenerate: () => generateReport("users") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportCard, { title: "Meeting Analytics Report", desc: "Summarizes conference durations, counts, participants, and feature engagement metrics.", onGenerate: () => generateReport("meetings") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ReportCard, { title: "System Overview Report", desc: "Monitors platform billing monentization, resource consumption, and transaction status.", onGenerate: () => generateReport("system") })
      ] }),
      activeTab === "analytics" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        userAnalytics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiUsers, { className: "text-primary" }),
            " User Metrics"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 grid-cols-2 sm:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Logins Registered", value: userAnalytics.totalLogins }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Registrations", value: userAnalytics.totalRegistrations }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Daily Active Users", value: userAnalytics.dailyActiveUsers }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Retention Rate", value: userAnalytics.retentionRate })
          ] })
        ] }),
        meetingAnalytics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, { className: "text-primary" }),
            " Meeting Metrics"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 grid-cols-2 sm:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Created Meetings", value: meetingAnalytics.createdMeetings }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Joined Meetings", value: meetingAnalytics.joinedMeetings }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Chat Messages Sent", value: meetingAnalytics.chatMessagesSent }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Average Duration", value: `${meetingAnalytics.averageMeetingDurationMinutes} min` })
          ] })
        ] }),
        billingAnalytics && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-4 text-sm font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FiDollarSign, { className: "text-primary" }),
            " Monetization & Billing Metrics"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 grid-cols-2 sm:grid-cols-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Total Revenue", value: `$${(billingAnalytics.totalRevenue || 0).toFixed(2)}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Payment Success Rate", value: billingAnalytics.paymentSuccessRate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Upgrades Completed", value: billingAnalytics.totalUpgrades }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnalItem, { label: "Cancellations logged", value: billingAnalytics.totalCancellations })
          ] })
        ] })
      ] }),
      activeTab === "settings" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold mb-2", children: "Global System Configuration" }),
        settings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "No global platform configuration variables found." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: settings.map((set) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 rounded-xl border border-border p-3.5 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono font-semibold text-foreground", children: set.key }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "Last updated by: ",
              set.updatedBy || "System"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: set.value, onBlur: (e) => handleSettingAction({
              ...set,
              value: e.target.value
            }), className: "h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary w-40" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "glass", children: "Update" })
          ] })
        ] }, set.id)) })
      ] })
    ] }, activeTab) }) })
  ] });
}
function StatCard({
  icon: Icon,
  label,
  value,
  desc
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold leading-none", children: value ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[11px] text-muted-foreground", children: desc })
  ] });
}
function ReportCard({
  title,
  desc,
  onGenerate
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col rounded-2xl border border-border bg-card p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-foreground", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 flex-1 text-xs text-muted-foreground", children: desc }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", className: "mt-4 w-full", onClick: onGenerate, children: "Generate & Export" })
  ] });
}
function AnalItem({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border/60 bg-background/40 p-3 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-foreground", children: value ?? 0 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: label })
  ] });
}
export {
  AdminPage as component
};

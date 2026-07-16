import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiVideo,
  FiDatabase,
  FiSettings,
  FiFileText,
  FiHelpCircle,
  FiActivity,
  FiLoader,
  FiCheckCircle,
  FiAlertTriangle,
  FiTrash2,
  FiSlash,
  FiCheck,
  FiShield,
  FiArrowUpRight,
  FiDollarSign,
} from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { admin as adminApi, support as supportApi } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Panel — Meetrivo" }] }),
  component: AdminPage,
});

type Tab = "overview" | "users" | "meetings" | "tickets" | "reports" | "analytics" | "settings";

function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // User tab states
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 10;
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any>(null);

  // Analytics specific states
  const [userAnalytics, setUserAnalytics] = useState<any>(null);
  const [meetingAnalytics, setMeetingAnalytics] = useState<any>(null);
  const [billingAnalytics, setBillingAnalytics] = useState<any>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<any>(null);
  const [selectedUserAnalytics, setSelectedUserAnalytics] = useState<any>(null);
  const [selectedUserLoginHistory, setSelectedUserLoginHistory] = useState<any[] | null>(null);

  // User Filtering & Pagination
  const filteredUsers = users.filter(u => {
    if (userSearch && !u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) && !u.email?.toLowerCase().includes(userSearch.toLowerCase()) && !u.username?.toLowerCase().includes(userSearch.toLowerCase())) return false;
    if (userRoleFilter && u.role !== userRoleFilter) return false;
    if (userStatusFilter && u.accountStatus !== userStatusFilter) return false;
    return true;
  });
  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const displayedUsers = filteredUsers.slice((userPage - 1) * usersPerPage, userPage * usersPerPage);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };
  const handleSelectAllUsers = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUsers(displayedUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    try {
        for (const id of selectedUsers) {
           await handleUserAction(id, action, null, true);
        }
        toast.success(`Bulk ${action} completed`);
        setSelectedUsers([]);
        loadTab("users");
    } catch(e) {
        toast.error("Bulk action encountered an error");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("meetrivo_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role !== "SUPER_ADMIN" && u.role !== "ORGANIZATION_ADMIN" && u.role !== "ORGANIZATION_OWNER") {
          toast.error("Access Denied: Admin role required");
          window.location.href = "/dashboard";
          return;
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedUserDetails) {
      // Fetch user analytics
      adminApi.getUserAnalytics(selectedUserDetails.id)
        .then((res) => setSelectedUserAnalytics(res))
        .catch(() => setSelectedUserAnalytics(null));

      // Fetch user login history
      adminApi.getUserLoginHistory(selectedUserDetails.id)
        .then((res) => setSelectedUserLoginHistory(res))
        .catch(() => setSelectedUserLoginHistory(null));
    } else {
      setSelectedUserAnalytics(null);
      setSelectedUserLoginHistory(null);
    }
  }, [selectedUserDetails]);

  const loadTab = async (tab: Tab) => {
    setLoading(true);
    try {
      if (tab === "overview") {
        const statsData = await adminApi.getStats();
        setStats(statsData);
        const actData = await adminApi.getActivity();
        setActivity(actData || []);
      } else if (tab === "users") {
        const usersData = await adminApi.getUsers();
        setUsers(usersData || []);
      } else if (tab === "meetings") {
        const meetingsData = await adminApi.getMeetings();
        setMeetings(meetingsData || []);
      } else if (tab === "tickets") {
        const ticketsData = await supportApi.getAllTickets();
        setTickets(ticketsData || []);
      } else if (tab === "reports") {
        // no immediate state needed
      } else if (tab === "analytics") {
        const userAn = await adminApi.getAnalyticsUsers();
        const meetAn = await adminApi.getAnalyticsMeetings();
        const billAn = await adminApi.getAnalyticsBilling();
        setUserAnalytics(userAn);
        setMeetingAnalytics(meetAn);
        setBillingAnalytics(billAn);
      } else if (tab === "settings") {
        const settingsData = await adminApi.getSettings();
        setSettings(settingsData || []);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string, payload?: any, skipReload?: boolean) => {
    try {
      if (action === "delete") {
        await adminApi.deleteUser(userId);
        if(!skipReload) toast.success("User deleted successfully");
      } else if (action === "activate") {
        await adminApi.activateUser(userId);
        if(!skipReload) toast.success("User activated");
      } else if (action === "deactivate") {
        await adminApi.deactivateUser(userId);
        if(!skipReload) toast.success("User deactivated");
      } else if (action === "suspend") {
        await adminApi.suspendUser(userId);
        if(!skipReload) toast.success("User account suspended");
      } else if (action === "block") {
        await adminApi.blockUser(userId);
        if(!skipReload) toast.success("User blocked");
      } else if (action === "unblock") {
        await adminApi.unblockUser(userId);
        if(!skipReload) toast.success("User unblocked");
      } else if (action === "role") {
        await adminApi.updateUserRole(userId, payload);
        if(!skipReload) toast.success(`User role updated to ${payload}`);
      }
      if(!skipReload) loadTab("users");
    } catch (e: any) {
      if(!skipReload) toast.error(e.message || "Action failed");
    }
  };

  const handleMeetingAction = async (meetingId: string, action: string) => {
    try {
      if (action === "terminate") {
        await adminApi.terminateMeeting(meetingId);
        toast.success("Meeting session terminated");
      } else if (action === "delete") {
        await adminApi.deleteMeeting(meetingId);
        toast.success("Meeting metadata deleted");
      }
      loadTab("meetings");
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  const handleTicketAction = async (ticketId: string, status: string) => {
    try {
      await supportApi.updateTicketStatus(ticketId, status);
      toast.success(`Ticket status set to ${status}`);
      loadTab("tickets");
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    }
  };

  const handleSettingAction = async (setting: any) => {
    try {
      await adminApi.updateSetting(setting);
      toast.success("Platform setting updated");
      loadTab("settings");
    } catch (e: any) {
      toast.error(e.message || "Failed to update setting");
    }
  };

  const generateReport = async (type: "users" | "meetings" | "system") => {
    try {
      let report: any;
      if (type === "users") report = await adminApi.generateUserReport();
      else if (type === "meetings") report = await adminApi.generateMeetingReport();
      else report = await adminApi.generateSystemReport();

      if (report && report.id) {
        toast.success(`${type.toUpperCase()} report compiled! Downloading CSV...`);
        window.open(adminApi.exportCsvUrl(report.id), "_blank");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate report");
    }
  };

  const tabItems = [
    { id: "overview" as const, label: "Overview", icon: FiActivity },
    { id: "users" as const, label: "Users", icon: FiUsers },
    { id: "meetings" as const, label: "Meetings", icon: FiVideo },
    { id: "tickets" as const, label: "Tickets", icon: FiHelpCircle },
    { id: "reports" as const, label: "Reports", icon: FiFileText },
    { id: "analytics" as const, label: "Analytics", icon: FiActivity },
    { id: "settings" as const, label: "Settings", icon: FiSettings },
  ];

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Platform Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage user moderation, active conferences, reports, system parameters, and analytics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-gradient-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-surface hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Panel */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <FiLoader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && stats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={FiUsers} label="Total Users" value={stats.totalUsers} desc={`${stats.activeUsers} active accounts`} />
                    <StatCard icon={FiVideo} label="Total Meetings" value={stats.totalMeetings} desc={`${stats.liveMeetings} sessions live`} />
                    <StatCard icon={FiDatabase} label="Recordings Saved" value={stats.totalRecordings} desc="Archived session tapes" />
                    <StatCard icon={FiDollarSign} label="System Alerts" value={stats.totalNotifications} desc="Generated event triggers" />
                  </div>

                  {/* Audit Logs */}
                  <div className="rounded-2xl border border-border bg-card p-5">
                    <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
                      <FiActivity className="text-primary" /> Recent Audit logs
                    </h3>
                    <div className="max-h-[300px] overflow-y-auto space-y-2.5 pr-2">
                      {activity.length === 0 ? (
                        <p className="text-center text-xs text-muted-foreground py-6">No logs available</p>
                      ) : (
                        activity.map((act) => (
                          <div key={act.id} className="flex justify-between items-start gap-4 rounded-xl border border-border/50 bg-background/50 p-3 text-xs">
                            <div>
                              <p className="font-semibold text-foreground">{act.action}</p>
                              <p className="text-muted-foreground mt-0.5">{act.details}</p>
                              <p className="text-[10px] text-muted-foreground/75 mt-1">Target ID: {act.targetId} · Type: {act.targetType}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">{act.actorEmail}</p>
                              <p className="text-[10px] text-muted-foreground/75 mt-1">
                                {act.timestamp ? new Date(act.timestamp).toLocaleString() : ""}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearch}
                            onChange={(e) => {setUserSearch(e.target.value); setUserPage(1);}}
                            className="bg-surface text-sm rounded-lg px-3 py-2 border border-border outline-none focus:border-primary/50 w-full md:w-64"
                        />
                        <select
                            value={userRoleFilter}
                            onChange={(e) => {setUserRoleFilter(e.target.value); setUserPage(1);}}
                            className="bg-surface text-sm rounded-lg px-3 py-2 border border-border outline-none focus:border-primary/50"
                        >
                            <option value="">All Roles</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                            <option value="ORGANIZATION_OWNER">Org Owner</option>
                            <option value="ORGANIZATION_ADMIN">Org Admin</option>
                            <option value="TEAM_MANAGER">Team Manager</option>
                            <option value="MEMBER">Member</option>
                            <option value="GUEST">Guest</option>
                        </select>
                        <select
                            value={userStatusFilter}
                            onChange={(e) => {setUserStatusFilter(e.target.value); setUserPage(1);}}
                            className="bg-surface text-sm rounded-lg px-3 py-2 border border-border outline-none focus:border-primary/50"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="BLOCKED">Blocked</option>
                        </select>
                    </div>
                    {selectedUsers.length > 0 && (
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-lg border border-primary/20">
                            <span className="text-sm font-semibold text-primary">{selectedUsers.length} selected</span>
                            <button onClick={() => handleBulkAction('activate')} className="text-xs bg-success text-white px-2 py-1 rounded">Activate</button>
                            <button onClick={() => handleBulkAction('deactivate')} className="text-xs bg-warning text-white px-2 py-1 rounded">Deactivate</button>
                            <button onClick={() => handleBulkAction('delete')} className="text-xs bg-destructive text-white px-2 py-1 rounded">Delete</button>
                        </div>
                    )}
                  </div>
                  
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground">
                          <tr>
                            <th className="px-5 py-3.5 w-10">
                                <input type="checkbox" onChange={handleSelectAllUsers} checked={displayedUsers.length > 0 && selectedUsers.length === displayedUsers.length} />
                            </th>
                            <th className="px-5 py-3.5">Name / Username</th>
                            <th className="px-5 py-3.5">Email</th>
                            <th className="px-5 py-3.5">Role</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {displayedUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-surface/30">
                              <td className="px-5 py-3.5">
                                <input type="checkbox" checked={selectedUsers.includes(u.id)} onChange={() => toggleUserSelection(u.id)} />
                              </td>
                              <td className="px-5 py-3.5 cursor-pointer" onClick={() => setSelectedUserDetails(u)}>
                                <p className="font-semibold text-foreground hover:text-primary transition-colors">{u.fullName || "Unnamed User"}</p>
                                <p className="text-xs text-muted-foreground">@{u.username}</p>
                              </td>
                              <td className="px-5 py-3.5 text-muted-foreground">{u.email}</td>
                              <td className="px-5 py-3.5">
                                <select
                                  value={u.role || "MEMBER"}
                                  onChange={(e) => handleUserAction(u.id, "role", e.target.value)}
                                  className="bg-surface text-xs font-semibold rounded px-2.5 py-1 border border-border outline-none cursor-pointer"
                                >
                                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                                  <option value="ORGANIZATION_OWNER">ORG_OWNER</option>
                                  <option value="ORGANIZATION_ADMIN">ORG_ADMIN</option>
                                  <option value="TEAM_MANAGER">TEAM_MANAGER</option>
                                  <option value="MEMBER">MEMBER</option>
                                  <option value="GUEST">GUEST</option>
                                </select>
                              </td>
                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                                    u.accountStatus === "ACTIVE"
                                      ? "bg-success/15 text-success"
                                      : u.accountStatus === "BLOCKED"
                                        ? "bg-destructive/15 text-destructive"
                                        : "bg-warning/15 text-warning"
                                  }`}
                                >
                                  {u.accountStatus}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                                {u.accountStatus === "ACTIVE" ? (
                                  <button
                                    onClick={() => handleUserAction(u.id, "deactivate")}
                                    className="text-xs font-semibold border border-warning/20 bg-warning/5 hover:bg-warning/15 text-warning rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction(u.id, "activate")}
                                    className="text-xs font-semibold border border-success/20 bg-success/5 hover:bg-success/15 text-success rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                  >
                                    Activate
                                  </button>
                                )}
                                {u.accountStatus === "BLOCKED" ? (
                                  <button
                                    onClick={() => handleUserAction(u.id, "unblock")}
                                    className="text-xs font-semibold border border-success/20 bg-success/5 hover:bg-success/15 text-success rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                  >
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUserAction(u.id, "block")}
                                    className="text-xs font-semibold border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                  >
                                    Block
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUserAction(u.id, "delete")}
                                  className="text-xs font-semibold bg-destructive/15 text-destructive hover:bg-destructive hover:text-white rounded-lg p-1.5 transition-colors cursor-pointer"
                                >
                                  <FiTrash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {displayedUsers.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">No users found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {totalUserPages > 1 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Page {userPage} of {totalUserPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg disabled:opacity-50">Prev</button>
                            <button onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))} disabled={userPage === totalUserPages} className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg disabled:opacity-50">Next</button>
                        </div>
                    </div>
                  )}

                  {selectedUserDetails && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 relative">
                              <button onClick={() => setSelectedUserDetails(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">✕</button>
                              <h3 className="text-xl font-bold mb-4">User Details</h3>
                              <div className="space-y-3 text-sm max-h-[70vh] overflow-y-auto pr-2">
                                  <p><span className="text-muted-foreground font-medium">Name:</span> {selectedUserDetails.fullName}</p>
                                  <p><span className="text-muted-foreground font-medium">Email:</span> {selectedUserDetails.email}</p>
                                  <p><span className="text-muted-foreground font-medium">Username:</span> @{selectedUserDetails.username}</p>
                                  <p><span className="text-muted-foreground font-medium">Role:</span> {selectedUserDetails.role}</p>
                                  <p><span className="text-muted-foreground font-medium">Status:</span> {selectedUserDetails.accountStatus}</p>
                                  <p><span className="text-muted-foreground font-medium">Joined:</span> {new Date(selectedUserDetails.createdAt).toLocaleDateString()}</p>

                                  {selectedUserAnalytics && (
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                      <h4 className="font-semibold text-foreground mb-2">Meeting Analytics</h4>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="bg-surface p-2 rounded"><span className="text-muted-foreground">Hosted:</span> {selectedUserAnalytics.hostedMeetings}</div>
                                        <div className="bg-surface p-2 rounded"><span className="text-muted-foreground">Joined:</span> {selectedUserAnalytics.joinedMeetings}</div>
                                        <div className="bg-surface p-2 rounded"><span className="text-muted-foreground">Duration:</span> {selectedUserAnalytics.meetingMinutes} min</div>
                                        <div className="bg-surface p-2 rounded"><span className="text-muted-foreground">Avg Time:</span> {selectedUserAnalytics.avgDurationMinutes} min</div>
                                      </div>
                                    </div>
                                  )}

                                  {selectedUserLoginHistory && selectedUserLoginHistory.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-border/50">
                                      <h4 className="font-semibold text-foreground mb-2">Recent Logins</h4>
                                      <div className="space-y-2">
                                        {selectedUserLoginHistory.slice(0, 5).map((log, i) => (
                                          <div key={i} className="flex justify-between text-xs bg-surface p-2 rounded">
                                            <div>
                                              <p>{new Date(log.loginTime).toLocaleString()}</p>
                                              <p className="text-[10px] text-muted-foreground">{log.ipAddress} • {log.deviceInfo}</p>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${log.status === 'SUCCESS' ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive'}`}>
                                              {log.status}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="pt-4 border-t border-border mt-4 flex justify-end gap-2">
                                    <button onClick={() => setSelectedUserDetails(null)} className="px-4 py-2 bg-surface hover:bg-surface/80 transition-colors rounded-lg font-medium">Close</button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                </div>
              )}

              {activeTab === "meetings" && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3.5">Title / Code</th>
                          <th className="px-5 py-3.5">Scheduled time</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {meetings.map((m) => (
                          <tr key={m.id} className="hover:bg-surface/30">
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-foreground">{m.title || "Untitled Meeting"}</p>
                              <p className="text-xs font-mono text-muted-foreground">{m.meetingCode}</p>
                            </td>
                            <td className="px-5 py-3.5 text-muted-foreground">
                              {m.scheduledStartTime ? new Date(m.scheduledStartTime).toLocaleString() : "Instant"}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                                  m.status === "ACTIVE"
                                    ? "bg-success/15 text-success animate-pulse"
                                    : m.status === "ENDED"
                                      ? "bg-surface text-muted-foreground"
                                      : "bg-primary/15 text-primary"
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                              {m.status === "ACTIVE" && (
                                <button
                                  onClick={() => handleMeetingAction(m.id, "terminate")}
                                  className="text-xs font-semibold border border-destructive/20 bg-destructive/5 hover:bg-destructive/15 text-destructive rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                                >
                                  Terminate
                                </button>
                              )}
                              <button
                                onClick={() => handleMeetingAction(m.id, "delete")}
                                className="text-xs font-semibold bg-destructive/15 text-destructive hover:bg-destructive hover:text-white rounded-lg p-1.5 transition-colors cursor-pointer"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "tickets" && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-border bg-surface/50 text-xs font-semibold uppercase text-muted-foreground">
                        <tr>
                          <th className="px-5 py-3.5">Subject</th>
                          <th className="px-5 py-3.5">Priority</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {tickets.map((t) => (
                          <tr key={t.id} className="hover:bg-surface/30">
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-foreground">{t.subject}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                                  t.priority === "HIGH"
                                    ? "bg-destructive/15 text-destructive"
                                    : "bg-primary/15 text-primary"
                                }`}
                              >
                                {t.priority || "NORMAL"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <select
                                value={t.status}
                                onChange={(e) => handleTicketAction(t.id, e.target.value)}
                                className="bg-surface text-xs font-semibold rounded px-2.5 py-1 border border-border outline-none cursor-pointer"
                              >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="CLOSED">CLOSED</option>
                              </select>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => handleTicketAction(t.id, "RESOLVED")}
                                className="text-xs font-semibold border border-success/20 bg-success/5 hover:bg-success/15 text-success rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
                              >
                                Resolve
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "reports" && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <ReportCard
                    title="User Registration Report"
                    desc="Compiles active user growth stats, verified account list, and login history summaries."
                    onGenerate={() => generateReport("users")}
                  />
                  <ReportCard
                    title="Meeting Analytics Report"
                    desc="Summarizes conference durations, counts, participants, and feature engagement metrics."
                    onGenerate={() => generateReport("meetings")}
                  />
                  <ReportCard
                    title="System Overview Report"
                    desc="Monitors platform billing monentization, resource consumption, and transaction status."
                    onGenerate={() => generateReport("system")}
                  />
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="space-y-6">
                  {userAnalytics && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
                        <FiUsers className="text-primary" /> User Metrics
                      </h3>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        <AnalItem label="Logins Registered" value={userAnalytics.totalLogins} />
                        <AnalItem label="Registrations" value={userAnalytics.totalRegistrations} />
                        <AnalItem label="Daily Active Users" value={userAnalytics.dailyActiveUsers} />
                        <AnalItem label="Retention Rate" value={userAnalytics.retentionRate} />
                      </div>
                    </div>
                  )}

                  {meetingAnalytics && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
                        <FiVideo className="text-primary" /> Meeting Metrics
                      </h3>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        <AnalItem label="Created Meetings" value={meetingAnalytics.createdMeetings} />
                        <AnalItem label="Joined Meetings" value={meetingAnalytics.joinedMeetings} />
                        <AnalItem label="Chat Messages Sent" value={meetingAnalytics.chatMessagesSent} />
                        <AnalItem label="Average Duration" value={`${meetingAnalytics.averageMeetingDurationMinutes} min`} />
                      </div>
                    </div>
                  )}

                  {billingAnalytics && (
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="mb-4 text-sm font-semibold flex items-center gap-2">
                        <FiDollarSign className="text-primary" /> Monetization & Billing Metrics
                      </h3>
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                        <AnalItem label="Total Revenue" value={`$${(billingAnalytics.totalRevenue || 0).toFixed(2)}`} />
                        <AnalItem label="Payment Success Rate" value={billingAnalytics.paymentSuccessRate} />
                        <AnalItem label="Upgrades Completed" value={billingAnalytics.totalUpgrades} />
                        <AnalItem label="Cancellations logged" value={billingAnalytics.totalCancellations} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                  <h3 className="text-sm font-semibold mb-2">Global System Configuration</h3>
                  {settings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No global platform configuration variables found.</p>
                  ) : (
                    <div className="space-y-4">
                      {settings.map((set) => (
                        <div key={set.id} className="flex flex-col gap-2 rounded-xl border border-border p-3.5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-mono font-semibold text-foreground">{set.key}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Last updated by: {set.updatedBy || "System"}</p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              defaultValue={set.value}
                              onBlur={(e) => handleSettingAction({ ...set, value: e.target.value })}
                              className="h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary w-40"
                            />
                            <Button size="sm" variant="glass">Update</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, desc }: { icon: any; label: string; value: string | number; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface text-primary">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold leading-none">{value ?? 0}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function ReportCard({ title, desc, onGenerate }: { title: string; desc: string; onGenerate: () => void }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="mt-1 flex-1 text-xs text-muted-foreground">{desc}</p>
      <Button variant="hero" className="mt-4 w-full" onClick={onGenerate}>
        Generate & Export
      </Button>
    </div>
  );
}

function AnalItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-3 text-center">
      <p className="text-lg font-bold text-foreground">{value ?? 0}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

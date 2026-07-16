import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLayers,
  FiUsers,
  FiFolder,
  FiPlus,
  FiLoader,
  FiTrash2,
  FiPlusCircle,
  FiCheck,
  FiUserPlus,
  FiEdit,
  FiShield,
  FiSearch,
} from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/shared/Field";
import { organizations as orgsApi, teams as teamsApi, departments as deptsApi } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/organizations")({
  head: () => ({ meta: [{ title: "Workspaces & Organizations — Meetrivo" }] }),
  component: OrganizationsPage,
});

type Tab = "overview" | "teams" | "departments" | "members";

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Filtering & Pagination
  const [teamSearch, setTeamSearch] = useState("");
  const [teamPage, setTeamPage] = useState(1);
  const [deptSearch, setDeptSearch] = useState("");
  const [deptPage, setDeptPage] = useState(1);
  const itemsPerPage = 6;

  // Modals / forms
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  // Teams management states
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDesc, setEditTeamDesc] = useState("");
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [addTeamMemberUserId, setAddTeamMemberUserId] = useState("");

  // Department management states
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [editDeptName, setEditDeptName] = useState("");
  const [editDeptDesc, setEditDeptDesc] = useState("");
  const [showManageDeptModal, setShowManageDeptModal] = useState(false);
  const [deptHeadId, setDeptHeadId] = useState("");
  const [deptMemberIds, setDeptMemberIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("meetrivo_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role === "MEMBER" || u.role === "GUEST") {
          toast.error("Access Denied: You do not have permission to manage organizations");
          window.location.href = "/dashboard";
          return;
        }
      } catch (e) {}
    }
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrg) {
      loadTabData(selectedOrg.id, activeTab);
    }
  }, [selectedOrg, activeTab]);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const list = await orgsApi.getMyOrganizations();
      setOrganizations(list || []);
      if (list && list.length > 0) {
        setSelectedOrg(list[0]);
      }
    } catch (e: any) {
      console.warn("Failed to load organizations:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (orgId: string, tab: Tab) => {
    setTabLoading(true);
    try {
      if (tab === "overview") {
        const data = await orgsApi.getAnalytics(orgId);
        setAnalytics(data);
      } else if (tab === "teams") {
        const list = await orgsApi.getTeams(orgId);
        setTeams(list || []);
      } else if (tab === "departments") {
        const list = await orgsApi.getDepartments(orgId);
        setDepartments(list || []);
      } else if (tab === "members") {
        const list = await orgsApi.getMembers(orgId);
        setMembers(list || []);
      }
    } catch (e: any) {
      console.warn("Failed to load tab data:", e.message);
    } finally {
      setTabLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !ownerEmail.trim() || !tempPassword.trim()) {
        toast.error("Please fill in all required fields.");
        return;
    }
    try {
      const payload = {
          name: orgName,
          domain: orgDomain,
          ownerName: ownerName,
          ownerEmail: ownerEmail,
          temporaryPassword: tempPassword,
          phone: phone,
          industry: industry,
          companySize: companySize,
          country: country,
          timezone: timezone
      };
      const created = await orgsApi.create(payload);
      toast.success("Organization and Owner created!");
      setOrgName(""); setOrgDomain(""); setOwnerName(""); setOwnerEmail("");
      setTempPassword(""); setPhone(""); setIndustry(""); setCompanySize("");
      setCountry(""); setTimezone("");
      setShowOrgModal(false);
      loadOrganizations();
    } catch (e: any) {
      toast.error(e.message || "Failed to create organization");
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedOrg) return;
    try {
      await teamsApi.create({
        name: teamName,
        description: teamDesc,
        organizationId: selectedOrg.id,
      });
      toast.success("Team created!");
      setTeamName("");
      setTeamDesc("");
      setShowTeamModal(false);
      loadTabData(selectedOrg.id, "teams");
    } catch (e: any) {
      toast.error(e.message || "Failed to create team");
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !selectedOrg) return;
    try {
      await deptsApi.create({
        name: deptName,
        description: deptDesc,
        organizationId: selectedOrg.id,
      });
      toast.success("Department created!");
      setDeptName("");
      setDeptDesc("");
      setShowDeptModal(false);
      loadTabData(selectedOrg.id, "departments");
    } catch (e: any) {
      toast.error(e.message || "Failed to create department");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedOrg) return;
    try {
      await orgsApi.inviteMember(selectedOrg.id, inviteEmail, inviteRole);
      toast.success("Invitation sent!");
      setInviteEmail("");
      setInviteRole("MEMBER");
      setShowInviteModal(false);
      loadTabData(selectedOrg.id, "members");
    } catch (e: any) {
      toast.error(e.message || "Failed to send invitation");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedOrg) return;
    try {
      await orgsApi.removeMember(selectedOrg.id, userId);
      toast.success("Member removed");
      loadTabData(selectedOrg.id, "members");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove member");
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!selectedOrg) return;
    try {
      await teamsApi.delete(teamId);
      toast.success("Team deleted");
      loadTabData(selectedOrg.id, "teams");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete team");
    }
  };

  const handleDeleteDept = async (deptId: string) => {
    if (!selectedOrg) return;
    try {
      await deptsApi.delete(deptId);
      toast.success("Department deleted");
      loadTabData(selectedOrg.id, "departments");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete department");
    }
  };

  // Teams Edit & Manage Handlers
  const openEditTeam = (team: any) => {
    setSelectedTeam(team);
    setEditTeamName(team.name || "");
    setEditTeamDesc(team.description || "");
    setShowEditTeamModal(true);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeamName.trim() || !selectedTeam) return;
    try {
      await teamsApi.update(selectedTeam.id, {
        name: editTeamName,
        description: editTeamDesc,
        organizationId: selectedOrg.id,
        managerId: selectedTeam.managerId,
      });
      toast.success("Team updated successfully!");
      setShowEditTeamModal(false);
      loadTabData(selectedOrg.id, "teams");
    } catch (e: any) {
      toast.error(e.message || "Failed to update team");
    }
  };

  const openManageTeam = async (team: any) => {
    setSelectedTeam(team);
    setShowManageTeamModal(true);
    loadTeamMembers(team.id);
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const list = await teamsApi.getMembers(teamId);
      setTeamMembers(list || []);
    } catch (e: any) {
      console.warn("Failed to load team members:", e.message);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTeamMemberUserId || !selectedTeam) return;
    try {
      await teamsApi.addMember(selectedTeam.id, addTeamMemberUserId);
      toast.success("Member added to team!");
      setAddTeamMemberUserId("");
      loadTeamMembers(selectedTeam.id);
    } catch (e: any) {
      toast.error(e.message || "Failed to add member to team");
    }
  };

  const handleRemoveTeamMember = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      await teamsApi.removeMember(selectedTeam.id, userId);
      toast.success("Member removed from team!");
      loadTeamMembers(selectedTeam.id);
    } catch (e: any) {
      toast.error(e.message || "Failed to remove member");
    }
  };

  const handleTransferManager = async (newManagerId: string) => {
    if (!selectedTeam) return;
    try {
      await teamsApi.transferManager(selectedTeam.id, newManagerId);
      toast.success("Manager role transferred!");
      setSelectedTeam((t: any) => ({ ...t, managerId: newManagerId }));
      loadTeamMembers(selectedTeam.id);
    } catch (e: any) {
      toast.error(e.message || "Failed to transfer manager");
    }
  };

  // Departments Edit & Manage Handlers
  const openEditDept = (dept: any) => {
    setSelectedDept(dept);
    setEditDeptName(dept.name || "");
    setEditDeptDesc(dept.description || "");
    setShowEditDeptModal(true);
  };

  const handleUpdateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeptName.trim() || !selectedDept) return;
    try {
      await deptsApi.update(selectedDept.id, {
        name: editDeptName,
        description: editDeptDesc,
        organizationId: selectedOrg.id,
        headId: selectedDept.headId,
      });
      toast.success("Department updated!");
      setShowEditDeptModal(false);
      loadTabData(selectedOrg.id, "departments");
    } catch (e: any) {
      toast.error(e.message || "Failed to update department");
    }
  };

  const openManageDept = (dept: any) => {
    setSelectedDept(dept);
    setDeptHeadId(dept.headId || "");
    setDeptMemberIds(dept.memberIds || []);
    setShowManageDeptModal(true);
  };

  const handleSaveDeptMembers = async () => {
    if (!selectedDept) return;
    try {
      if (deptHeadId !== selectedDept.headId && deptHeadId) {
        await deptsApi.assignHead(selectedDept.id, deptHeadId);
      }
      await deptsApi.assignMembers(selectedDept.id, deptMemberIds);
      toast.success("Department details updated!");
      setShowManageDeptModal(false);
      loadTabData(selectedOrg.id, "departments");
    } catch (e: any) {
      toast.error(e.message || "Failed to update department details");
    }
  };

  const filteredTeams = teams.filter((t: any) => t.name.toLowerCase().includes(teamSearch.toLowerCase()) || (t.description || "").toLowerCase().includes(teamSearch.toLowerCase()));
  const totalTeamPages = Math.ceil(filteredTeams.length / itemsPerPage) || 1;
  const displayedTeams = filteredTeams.slice((teamPage - 1) * itemsPerPage, teamPage * itemsPerPage);

  const filteredDepts = departments.filter((d: any) => d.name.toLowerCase().includes(deptSearch.toLowerCase()) || (d.description || "").toLowerCase().includes(deptSearch.toLowerCase()));
  const totalDeptPages = Math.ceil(filteredDepts.length / itemsPerPage) || 1;
  const displayedDepts = filteredDepts.slice((deptPage - 1) * itemsPerPage, deptPage * itemsPerPage);

  if (loading) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <FiLoader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage organization teams, departments, and member access.
          </p>
        </div>
        <Button variant="hero" onClick={() => setShowOrgModal(true)} className="cursor-pointer">
          <FiPlus className="mr-1" /> New Organization
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left Side: Org Switcher */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Organizations</h3>
            {organizations.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No organizations found</p>
            ) : (
              <div className="space-y-1">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors cursor-pointer ${
                      selectedOrg?.id === org.id
                        ? "bg-surface text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-surface/50 hover:text-foreground"
                    }`}
                  >
                    <FiLayers className="h-4 w-4 shrink-0 text-primary" />
                    <span className="truncate">{org.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Tab panel */}
        <div className="lg:col-span-3 space-y-6">
          {selectedOrg ? (
            <>
              {/* Header Info */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{selectedOrg.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedOrg.domain ? `Domain: ${selectedOrg.domain}` : "No domain set"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedOrg.industry && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">{selectedOrg.industry}</span>
                      )}
                      {selectedOrg.companySize && (
                        <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{selectedOrg.companySize} employees</span>
                      )}
                      {selectedOrg.country && (
                        <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">{selectedOrg.country}</span>
                      )}
                    </div>
                  </div>
                  {selectedOrg.logo && (
                    <img src={selectedOrg.logo} alt="Logo" className="h-12 w-12 rounded-xl object-cover border border-border" />
                  )}
                </div>
                <div className="mt-4 flex gap-1 rounded-xl border border-border bg-background p-1 max-w-lg">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${
                      activeTab === "overview" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("teams")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${
                      activeTab === "teams" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Teams
                  </button>
                  <button
                    onClick={() => setActiveTab("departments")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${
                      activeTab === "departments" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Departments
                  </button>
                  <button
                    onClick={() => setActiveTab("members")}
                    className={`flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${
                      activeTab === "members" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Members
                  </button>
                </div>
              </div>

              {/* Tab Data View */}
              <div className="min-h-[250px]">
                {tabLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <FiLoader className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === "overview" && analytics && (
                        <div className="space-y-6">
                          <h3 className="text-sm font-semibold">Organization Overview</h3>
                          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Total Members</p>
                              <p className="text-2xl font-bold">{analytics.totalMembers || 0}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Active Members</p>
                              <p className="text-2xl font-bold">{analytics.activeMembers || 0}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Teams</p>
                              <p className="text-2xl font-bold">{analytics.teamsCount || 0}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Departments</p>
                              <p className="text-2xl font-bold">{analytics.departmentsCount || 0}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Meetings</p>
                              <p className="text-2xl font-bold">{analytics.meetingsCount || 0}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Meeting Hours</p>
                              <p className="text-2xl font-bold">{analytics.meetingHours || 0}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Storage Used</p>
                              <p className="text-2xl font-bold">{analytics.storageUsageMb ? analytics.storageUsageMb.toFixed(2) : "0.00"} MB</p>
                            </div>
                            <div className="rounded-xl border border-border bg-surface p-4">
                              <p className="text-xs text-muted-foreground mb-1">Active Plan</p>
                              <p className="text-2xl font-bold capitalize text-primary">{analytics.planType || "Free"}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "teams" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h3 className="text-sm font-semibold">Teams list</h3>
                            <div className="flex gap-2 items-center">
                              <div className="relative">
                                <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  placeholder="Search teams..."
                                  value={teamSearch}
                                  onChange={(e) => { setTeamSearch(e.target.value); setTeamPage(1); }}
                                  className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <Button size="sm" variant="glass" onClick={() => setShowTeamModal(true)}>
                                <FiPlusCircle className="mr-1" /> Add Team
                              </Button>
                            </div>
                          </div>
                          {filteredTeams.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground">
                              No teams found matching criteria.
                            </div>
                          ) : (
                            <>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {displayedTeams.map((t) => (
                                  <div key={t.id} className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-4">
                                    <div className="cursor-pointer flex-1" onClick={() => openManageTeam(t)}>
                                      <h4 className="font-semibold text-sm hover:text-primary transition-colors">{t.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-0.5">{t.description || "No description"}</p>
                                      {t.managerId && (
                                        <span className="mt-2 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                          <FiShield className="h-3 w-3" /> Manager: {members.find(m => m.userId === t.managerId)?.fullName || t.managerId}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
                                      <Button size="sm" variant="glass" onClick={() => openEditTeam(t)}>
                                        <FiEdit className="h-3.5 w-3.5 mr-1" /> Edit
                                      </Button>
                                      <button
                                        onClick={() => handleDeleteTeam(t.id)}
                                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <FiTrash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {totalTeamPages > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Showing {(teamPage - 1) * itemsPerPage + 1} to {Math.min(teamPage * itemsPerPage, filteredTeams.length)} of {filteredTeams.length}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button variant="outline" size="sm" onClick={() => setTeamPage(p => Math.max(1, p - 1))} disabled={teamPage === 1}>Prev</Button>
                                    <Button variant="outline" size="sm" onClick={() => setTeamPage(p => Math.min(totalTeamPages, p + 1))} disabled={teamPage === totalTeamPages}>Next</Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {activeTab === "departments" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <h3 className="text-sm font-semibold">Departments list</h3>
                            <div className="flex gap-2 items-center">
                              <div className="relative">
                                <FiSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                  type="text"
                                  placeholder="Search departments..."
                                  value={deptSearch}
                                  onChange={(e) => { setDeptSearch(e.target.value); setDeptPage(1); }}
                                  className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                />
                              </div>
                              <Button size="sm" variant="glass" onClick={() => setShowDeptModal(true)}>
                                <FiPlusCircle className="mr-1" /> Add Department
                              </Button>
                            </div>
                          </div>
                          {filteredDepts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground">
                              No departments found matching criteria.
                            </div>
                          ) : (
                            <>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {displayedDepts.map((d) => (
                                  <div key={d.id} className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-4">
                                    <div className="cursor-pointer flex-1" onClick={() => openManageDept(d)}>
                                      <h4 className="font-semibold text-sm hover:text-primary transition-colors">{d.name}</h4>
                                      <p className="text-xs text-muted-foreground mt-0.5">{d.description || "No description"}</p>
                                      {d.headId && (
                                        <span className="mt-2 inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                                          Head: {members.find(m => m.userId === d.headId)?.fullName || d.headId}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex justify-end gap-2 border-t border-border/50 pt-3">
                                      <Button size="sm" variant="glass" onClick={() => openEditDept(d)}>
                                        <FiEdit className="h-3.5 w-3.5 mr-1" /> Edit
                                      </Button>
                                      <button
                                        onClick={() => handleDeleteDept(d.id)}
                                        className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <FiTrash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {totalDeptPages > 1 && (
                                <div className="flex items-center justify-between pt-2">
                                  <span className="text-xs text-muted-foreground">
                                    Showing {(deptPage - 1) * itemsPerPage + 1} to {Math.min(deptPage * itemsPerPage, filteredDepts.length)} of {filteredDepts.length}
                                  </span>
                                  <div className="flex gap-1">
                                    <Button variant="outline" size="sm" onClick={() => setDeptPage(p => Math.max(1, p - 1))} disabled={deptPage === 1}>Prev</Button>
                                    <Button variant="outline" size="sm" onClick={() => setDeptPage(p => Math.min(totalDeptPages, p + 1))} disabled={deptPage === totalDeptPages}>Next</Button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {activeTab === "members" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold">Members list</h3>
                            <Button size="sm" variant="glass" onClick={() => setShowInviteModal(true)}>
                              <FiUserPlus className="mr-1" /> Invite Teammate
                            </Button>
                          </div>
                          <div className="rounded-2xl border border-border bg-card overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs">
                                <thead className="border-b border-border bg-surface/40 font-semibold uppercase text-muted-foreground">
                                  <tr>
                                    <th className="px-4 py-2.5">User</th>
                                    <th className="px-4 py-2.5">Role</th>
                                    <th className="px-4 py-2.5 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/60">
                                  {members.map((m) => (
                                    <tr key={m.id} className="hover:bg-surface/10">
                                      <td className="px-4 py-3">
                                        <p className="font-semibold text-foreground">{m.fullName || m.username || m.userId}</p>
                                        {(m.fullName || m.username) && <p className="text-[10px] text-muted-foreground">{m.email || m.userId}</p>}
                                      </td>
                                      <td className="px-4 py-3">
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary uppercase">
                                          {m.role}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <button
                                          onClick={() => handleRemoveMember(m.userId)}
                                          className="text-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Remove
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
              Select or create an organization to begin management.
            </div>
          )}
        </div>
      </div>

      {/* Org Creation Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-glow space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">New Enterprise Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-primary border-b border-border pb-1">Organization Details</h4>
                  <Field label="Organization Name *" placeholder="e.g. Acme Corp" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
                  <Field label="Domain" placeholder="e.g. acme.com" value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)} />
                  <Field label="Industry" placeholder="e.g. Software" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                  <Field label="Company Size" placeholder="e.g. 100-500" value={companySize} onChange={(e) => setCompanySize(e.target.value)} />
                  <Field label="Phone" placeholder="e.g. +1 555 1234" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <Field label="Country" placeholder="e.g. United States" value={country} onChange={(e) => setCountry(e.target.value)} />
                  <Field label="Timezone" placeholder="e.g. America/New_York" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-primary border-b border-border pb-1">Owner Account</h4>
                  <p className="text-xs text-muted-foreground mb-2">This account will be created as the Organization Owner.</p>
                  <Field label="Owner Full Name" placeholder="e.g. Jane Doe" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
                  <Field label="Owner Email *" type="email" placeholder="e.g. jane@acme.com" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} required />
                  <Field label="Temporary Password *" type="password" placeholder="e.g. TempPass123!" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} required />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setShowOrgModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Create Organization</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Creation Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">Add Team</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <Field label="Team Name" placeholder="e.g. Engineering Standup" value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Team description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowTeamModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Edit Modal */}
      {showEditTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">Edit Team</h3>
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <Field label="Team Name" placeholder="e.g. Engineering Standup" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={editTeamDesc}
                  onChange={(e) => setEditTeamDesc(e.target.value)}
                  placeholder="Team description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowEditTeamModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Management Modal */}
      {showManageTeamModal && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Manage Team: {selectedTeam.name}</h3>
              <button onClick={() => setShowManageTeamModal(false)} className="text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase">Team Members</h4>
              <div className="max-h-40 overflow-y-auto divide-y divide-border/60 rounded-xl border border-border/80 p-2">
                {teamMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 text-center">No members in this team yet.</p>
                ) : (
                  teamMembers.map((tm) => (
                    <div key={tm.id} className="flex justify-between items-center py-2 text-xs">
                      <div>
                        <p className="font-semibold">{members.find(m => m.userId === tm.userId)?.fullName || tm.userId}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{tm.role || "Member"}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tm.userId !== selectedTeam.managerId && (
                          <Button size="sm" variant="glass" className="h-7 text-[10px]" onClick={() => handleTransferManager(tm.userId)}>
                            Make Manager
                          </Button>
                        )}
                        <button
                          onClick={() => handleRemoveTeamMember(tm.userId)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <form onSubmit={handleAddTeamMember} className="space-y-3 pt-2 border-t border-border/60">
              <label className="text-xs font-semibold text-muted-foreground">Add Organization Member</label>
              <div className="flex gap-2">
                <select
                  value={addTeamMemberUserId}
                  onChange={(e) => setAddTeamMemberUserId(e.target.value)}
                  className="flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary cursor-pointer"
                  required
                >
                  <option value="">Select a member...</option>
                  {members
                    .filter((m) => !teamMembers.some((tm) => tm.userId === m.userId))
                    .map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.fullName || m.username || m.userId}
                      </option>
                    ))}
                </select>
                <Button type="submit" size="sm" variant="hero">Add</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <Field label="Department Name" placeholder="e.g. Research & Development" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Department description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowDeptModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Edit Modal */}
      {showEditDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">Edit Department</h3>
            <form onSubmit={handleUpdateDept} className="space-y-4">
              <Field label="Department Name" placeholder="e.g. Research & Development" value={editDeptName} onChange={(e) => setEditDeptName(e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  value={editDeptDesc}
                  onChange={(e) => setEditDeptDesc(e.target.value)}
                  placeholder="Department description..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowEditDeptModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Department Management Modal */}
      {showManageDeptModal && selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Manage Department: {selectedDept.name}</h3>
              <button onClick={() => setShowManageDeptModal(false)} className="text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground">Department Head</label>
              <select
                value={deptHeadId}
                onChange={(e) => setDeptHeadId(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary cursor-pointer"
              >
                <option value="">Select a head...</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.fullName || m.username || m.userId}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-muted-foreground">Department Members</label>
              <div className="max-h-40 overflow-y-auto border border-border/85 rounded-xl p-2.5 bg-background/45 space-y-1.5">
                {members.map((m) => {
                  const isChecked = deptMemberIds.includes(m.userId);
                  return (
                    <label key={m.userId} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setDeptMemberIds(ids => ids.filter(id => id !== m.userId));
                          } else {
                            setDeptMemberIds(ids => [...ids, m.userId]);
                          }
                        }}
                      />
                      <span>{m.fullName || m.username || m.userId}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
              <Button variant="ghost" onClick={() => setShowManageDeptModal(false)}>Cancel</Button>
              <Button variant="hero" onClick={handleSaveDeptMembers}>Save Details</Button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">Invite Teammate</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <Field label="Email Address" type="email" placeholder="teammate@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Workspace Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 rounded-xl border border-border bg-background/60 px-3 text-xs outline-none focus:border-primary cursor-pointer"
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="OWNER">OWNER</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowInviteModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Invite</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

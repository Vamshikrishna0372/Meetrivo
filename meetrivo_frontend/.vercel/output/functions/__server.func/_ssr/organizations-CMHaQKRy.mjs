import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { h as FiLoader, K as FiPlus, J as FiLayers, L as FiPlusCircle, p as FiShield, M as FiEdit, g as FiTrash2, N as FiUserPlus } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-DHERenrj.mjs";
import { B as Button } from "./button-ZuR0Bnki.mjs";
import { F as Field } from "./Field-DjsTpsqp.mjs";
import { organizations, teams, departments } from "./apiClient-DYGeuPy0.mjs";
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
function OrganizationsPage() {
  const [organizations$1, setOrganizations] = reactExports.useState([]);
  const [selectedOrg, setSelectedOrg] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("teams");
  const [teams$1, setTeams] = reactExports.useState([]);
  const [departments$1, setDepartments] = reactExports.useState([]);
  const [members, setMembers] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [tabLoading, setTabLoading] = reactExports.useState(false);
  const [showOrgModal, setShowOrgModal] = reactExports.useState(false);
  const [orgName, setOrgName] = reactExports.useState("");
  const [orgDomain, setOrgDomain] = reactExports.useState("");
  const [showTeamModal, setShowTeamModal] = reactExports.useState(false);
  const [teamName, setTeamName] = reactExports.useState("");
  const [teamDesc, setTeamDesc] = reactExports.useState("");
  const [showDeptModal, setShowDeptModal] = reactExports.useState(false);
  const [deptName, setDeptName] = reactExports.useState("");
  const [deptDesc, setDeptDesc] = reactExports.useState("");
  const [showInviteModal, setShowInviteModal] = reactExports.useState(false);
  const [inviteEmail, setInviteEmail] = reactExports.useState("");
  const [inviteRole, setInviteRole] = reactExports.useState("MEMBER");
  const [selectedTeam, setSelectedTeam] = reactExports.useState(null);
  const [showEditTeamModal, setShowEditTeamModal] = reactExports.useState(false);
  const [editTeamName, setEditTeamName] = reactExports.useState("");
  const [editTeamDesc, setEditTeamDesc] = reactExports.useState("");
  const [showManageTeamModal, setShowManageTeamModal] = reactExports.useState(false);
  const [teamMembers, setTeamMembers] = reactExports.useState([]);
  const [addTeamMemberUserId, setAddTeamMemberUserId] = reactExports.useState("");
  const [selectedDept, setSelectedDept] = reactExports.useState(null);
  const [showEditDeptModal, setShowEditDeptModal] = reactExports.useState(false);
  const [editDeptName, setEditDeptName] = reactExports.useState("");
  const [editDeptDesc, setEditDeptDesc] = reactExports.useState("");
  const [showManageDeptModal, setShowManageDeptModal] = reactExports.useState(false);
  const [deptHeadId, setDeptHeadId] = reactExports.useState("");
  const [deptMemberIds, setDeptMemberIds] = reactExports.useState([]);
  reactExports.useEffect(() => {
    const stored = localStorage.getItem("meetrivo_user");
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role === "MEMBER" || u.role === "GUEST") {
          toast.error("Access Denied: You do not have permission to manage organizations");
          window.location.href = "/dashboard";
          return;
        }
      } catch (e) {
      }
    }
    loadOrganizations();
  }, []);
  reactExports.useEffect(() => {
    if (selectedOrg) {
      loadTabData(selectedOrg.id, activeTab);
    }
  }, [selectedOrg, activeTab]);
  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const list = await organizations.getMyOrganizations();
      setOrganizations(list || []);
      if (list && list.length > 0) {
        setSelectedOrg(list[0]);
      }
    } catch (e) {
      console.warn("Failed to load organizations:", e.message);
    } finally {
      setLoading(false);
    }
  };
  const loadTabData = async (orgId, tab) => {
    setTabLoading(true);
    try {
      if (tab === "teams") {
        const list = await organizations.getTeams(orgId);
        setTeams(list || []);
      } else if (tab === "departments") {
        const list = await organizations.getDepartments(orgId);
        setDepartments(list || []);
      } else if (tab === "members") {
        const list = await organizations.getMembers(orgId);
        setMembers(list || []);
      }
    } catch (e) {
      console.warn("Failed to load tab data:", e.message);
    } finally {
      setTabLoading(false);
    }
  };
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    try {
      const created = await organizations.create({
        name: orgName,
        domain: orgDomain
      });
      toast.success("Organization created!");
      setOrgName("");
      setOrgDomain("");
      setShowOrgModal(false);
      loadOrganizations();
    } catch (e2) {
      toast.error(e2.message || "Failed to create organization");
    }
  };
  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedOrg) return;
    try {
      await teams.create({
        name: teamName,
        description: teamDesc,
        organizationId: selectedOrg.id
      });
      toast.success("Team created!");
      setTeamName("");
      setTeamDesc("");
      setShowTeamModal(false);
      loadTabData(selectedOrg.id, "teams");
    } catch (e2) {
      toast.error(e2.message || "Failed to create team");
    }
  };
  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptName.trim() || !selectedOrg) return;
    try {
      await departments.create({
        name: deptName,
        description: deptDesc,
        organizationId: selectedOrg.id
      });
      toast.success("Department created!");
      setDeptName("");
      setDeptDesc("");
      setShowDeptModal(false);
      loadTabData(selectedOrg.id, "departments");
    } catch (e2) {
      toast.error(e2.message || "Failed to create department");
    }
  };
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedOrg) return;
    try {
      await organizations.inviteMember(selectedOrg.id, inviteEmail, inviteRole);
      toast.success("Invitation sent!");
      setInviteEmail("");
      setInviteRole("MEMBER");
      setShowInviteModal(false);
      loadTabData(selectedOrg.id, "members");
    } catch (e2) {
      toast.error(e2.message || "Failed to send invitation");
    }
  };
  const handleRemoveMember = async (userId) => {
    if (!selectedOrg) return;
    try {
      await organizations.removeMember(selectedOrg.id, userId);
      toast.success("Member removed");
      loadTabData(selectedOrg.id, "members");
    } catch (e) {
      toast.error(e.message || "Failed to remove member");
    }
  };
  const handleDeleteTeam = async (teamId) => {
    if (!selectedOrg) return;
    try {
      await teams.delete(teamId);
      toast.success("Team deleted");
      loadTabData(selectedOrg.id, "teams");
    } catch (e) {
      toast.error(e.message || "Failed to delete team");
    }
  };
  const handleDeleteDept = async (deptId) => {
    if (!selectedOrg) return;
    try {
      await departments.delete(deptId);
      toast.success("Department deleted");
      loadTabData(selectedOrg.id, "departments");
    } catch (e) {
      toast.error(e.message || "Failed to delete department");
    }
  };
  const openEditTeam = (team) => {
    setSelectedTeam(team);
    setEditTeamName(team.name || "");
    setEditTeamDesc(team.description || "");
    setShowEditTeamModal(true);
  };
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    if (!editTeamName.trim() || !selectedTeam) return;
    try {
      await teams.update(selectedTeam.id, {
        name: editTeamName,
        description: editTeamDesc,
        organizationId: selectedOrg.id,
        managerId: selectedTeam.managerId
      });
      toast.success("Team updated successfully!");
      setShowEditTeamModal(false);
      loadTabData(selectedOrg.id, "teams");
    } catch (e2) {
      toast.error(e2.message || "Failed to update team");
    }
  };
  const openManageTeam = async (team) => {
    setSelectedTeam(team);
    setShowManageTeamModal(true);
    loadTeamMembers(team.id);
  };
  const loadTeamMembers = async (teamId) => {
    try {
      const list = await teams.getMembers(teamId);
      setTeamMembers(list || []);
    } catch (e) {
      console.warn("Failed to load team members:", e.message);
    }
  };
  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!addTeamMemberUserId || !selectedTeam) return;
    try {
      await teams.addMember(selectedTeam.id, addTeamMemberUserId);
      toast.success("Member added to team!");
      setAddTeamMemberUserId("");
      loadTeamMembers(selectedTeam.id);
    } catch (e2) {
      toast.error(e2.message || "Failed to add member to team");
    }
  };
  const handleRemoveTeamMember = async (userId) => {
    if (!selectedTeam) return;
    try {
      await teams.removeMember(selectedTeam.id, userId);
      toast.success("Member removed from team!");
      loadTeamMembers(selectedTeam.id);
    } catch (e) {
      toast.error(e.message || "Failed to remove member");
    }
  };
  const handleTransferManager = async (newManagerId) => {
    if (!selectedTeam) return;
    try {
      await teams.transferManager(selectedTeam.id, newManagerId);
      toast.success("Manager role transferred!");
      setSelectedTeam((t) => ({
        ...t,
        managerId: newManagerId
      }));
      loadTeamMembers(selectedTeam.id);
    } catch (e) {
      toast.error(e.message || "Failed to transfer manager");
    }
  };
  const openEditDept = (dept) => {
    setSelectedDept(dept);
    setEditDeptName(dept.name || "");
    setEditDeptDesc(dept.description || "");
    setShowEditDeptModal(true);
  };
  const handleUpdateDept = async (e) => {
    e.preventDefault();
    if (!editDeptName.trim() || !selectedDept) return;
    try {
      await departments.update(selectedDept.id, {
        name: editDeptName,
        description: editDeptDesc,
        organizationId: selectedOrg.id,
        headId: selectedDept.headId
      });
      toast.success("Department updated!");
      setShowEditDeptModal(false);
      loadTabData(selectedOrg.id, "departments");
    } catch (e2) {
      toast.error(e2.message || "Failed to update department");
    }
  };
  const openManageDept = (dept) => {
    setSelectedDept(dept);
    setDeptHeadId(dept.headId || "");
    setDeptMemberIds(dept.memberIds || []);
    setShowManageDeptModal(true);
  };
  const handleSaveDeptMembers = async () => {
    if (!selectedDept) return;
    try {
      if (deptHeadId !== selectedDept.headId && deptHeadId) {
        await departments.assignHead(selectedDept.id, deptHeadId);
      }
      await departments.assignMembers(selectedDept.id, deptMemberIds);
      toast.success("Department details updated!");
      setShowManageDeptModal(false);
      loadTabData(selectedOrg.id, "departments");
    } catch (e) {
      toast.error(e.message || "Failed to update department details");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-64 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-8 w-8 animate-spin text-primary" }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Workspaces" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Manage organization teams, departments, and member access." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "hero", onClick: () => setShowOrgModal(true), className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiPlus, { className: "mr-1" }),
        " New Organization"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-semibold text-muted-foreground uppercase mb-3", children: "Organizations" }),
        organizations$1.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground py-2", children: "No organizations found" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: organizations$1.map((org) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedOrg(org), className: `w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-left transition-colors cursor-pointer ${selectedOrg?.id === org.id ? "bg-surface text-foreground font-semibold" : "text-muted-foreground hover:bg-surface/50 hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiLayers, { className: "h-4 w-4 shrink-0 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: org.name })
        ] }, org.id)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3 space-y-6", children: selectedOrg ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: selectedOrg.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Workspace domain: ",
            selectedOrg.domain || "None"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-1 rounded-xl border border-border bg-background p-1 max-w-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab("teams"), className: `flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${activeTab === "teams" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: "Teams" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab("departments"), className: `flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${activeTab === "departments" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: "Departments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab("members"), className: `flex-1 rounded-lg py-1.5 text-xs font-medium cursor-pointer ${activeTab === "members" ? "bg-surface text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: "Members" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-[250px]", children: tabLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-6 w-6 animate-spin text-primary" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
          opacity: 0,
          y: 8
        }, animate: {
          opacity: 1,
          y: 0
        }, exit: {
          opacity: 0,
          y: -8
        }, transition: {
          duration: 0.15
        }, children: [
          activeTab === "teams" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Teams list" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "glass", onClick: () => setShowTeamModal(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FiPlusCircle, { className: "mr-1" }),
                " Add Team"
              ] })
            ] }),
            teams$1.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground", children: "No teams exist under this organization." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: teams$1.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cursor-pointer flex-1", onClick: () => openManageTeam(t), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm hover:text-primary transition-colors", children: t.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: t.description || "No description" }),
                t.managerId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-2 inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FiShield, { className: "h-3 w-3" }),
                  " Manager: ",
                  members.find((m) => m.userId === t.managerId)?.fullName || t.managerId
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 border-t border-border/50 pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "glass", onClick: () => openEditTeam(t), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FiEdit, { className: "h-3.5 w-3.5 mr-1" }),
                  " Edit"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDeleteTeam(t.id), className: "text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FiTrash2, { className: "h-4 w-4 mr-1" }),
                  " Delete"
                ] })
              ] })
            ] }, t.id)) })
          ] }),
          activeTab === "departments" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Departments list" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "glass", onClick: () => setShowDeptModal(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FiPlusCircle, { className: "mr-1" }),
                " Add Department"
              ] })
            ] }),
            departments$1.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground", children: "No departments exist under this organization." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2", children: departments$1.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "cursor-pointer flex-1", onClick: () => openManageDept(d), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-sm hover:text-primary transition-colors", children: d.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: d.description || "No description" }),
                d.headId && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-2 inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success", children: [
                  "Head: ",
                  members.find((m) => m.userId === d.headId)?.fullName || d.headId
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 border-t border-border/50 pt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "glass", onClick: () => openEditDept(d), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FiEdit, { className: "h-3.5 w-3.5 mr-1" }),
                  " Edit"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDeleteDept(d.id), className: "text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive px-2 py-1 rounded-lg transition-colors cursor-pointer flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FiTrash2, { className: "h-4 w-4 mr-1" }),
                  " Delete"
                ] })
              ] })
            ] }, d.id)) })
          ] }),
          activeTab === "members" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Members list" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "glass", onClick: () => setShowInviteModal(true), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FiUserPlus, { className: "mr-1" }),
                " Invite Teammate"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "border-b border-border bg-surface/40 font-semibold uppercase text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "User" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5", children: "Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 text-right", children: "Actions" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border/60", children: members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-surface/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: m.fullName || m.username || m.userId }),
                  (m.fullName || m.username) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: m.email || m.userId })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary uppercase", children: m.role }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemoveMember(m.userId), className: "text-xs bg-destructive/10 text-destructive hover:bg-destructive hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer", children: "Remove" }) })
              ] }, m.id)) })
            ] }) }) })
          ] })
        ] }, activeTab) }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground", children: "Select or create an organization to begin management." }) })
    ] }),
    showOrgModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "New Organization" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateOrg, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name", placeholder: "e.g. Acme Corp", value: orgName, onChange: (e) => setOrgName(e.target.value), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Domain", placeholder: "e.g. acme.com", value: orgDomain, onChange: (e) => setOrgDomain(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowOrgModal(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", children: "Create" })
        ] })
      ] })
    ] }) }),
    showTeamModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Add Team" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateTeam, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Team Name", placeholder: "e.g. Engineering Standup", value: teamName, onChange: (e) => setTeamName(e.target.value), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: teamDesc, onChange: (e) => setTeamDesc(e.target.value), placeholder: "Team description...", rows: 3, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowTeamModal(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", children: "Create" })
        ] })
      ] })
    ] }) }),
    showEditTeamModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Edit Team" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpdateTeam, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Team Name", placeholder: "e.g. Engineering Standup", value: editTeamName, onChange: (e) => setEditTeamName(e.target.value), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: editTeamDesc, onChange: (e) => setEditTeamDesc(e.target.value), placeholder: "Team description...", rows: 3, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowEditTeamModal(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", children: "Save Changes" })
        ] })
      ] })
    ] }) }),
    showManageTeamModal && selectedTeam && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Manage Team: ",
          selectedTeam.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowManageTeamModal(false), className: "text-muted-foreground hover:text-foreground", children: "Close" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-xs font-semibold text-muted-foreground uppercase", children: "Team Members" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto divide-y divide-border/60 rounded-xl border border-border/80 p-2", children: teamMembers.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground p-3 text-center", children: "No members in this team yet." }) : teamMembers.map((tm) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: members.find((m) => m.userId === tm.userId)?.fullName || tm.userId }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground capitalize", children: tm.role || "Member" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            tm.userId !== selectedTeam.managerId && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "glass", className: "h-7 text-[10px]", onClick: () => handleTransferManager(tm.userId), children: "Make Manager" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemoveTeamMember(tm.userId), className: "text-destructive hover:bg-destructive/10 p-1 rounded cursor-pointer", children: "Remove" })
          ] })
        ] }, tm.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddTeamMember, className: "space-y-3 pt-2 border-t border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Add Organization Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: addTeamMemberUserId, onChange: (e) => setAddTeamMemberUserId(e.target.value), className: "flex-1 h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary cursor-pointer", required: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a member..." }),
            members.filter((m) => !teamMembers.some((tm) => tm.userId === m.userId)).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m.userId, children: m.fullName || m.username || m.userId }, m.userId))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", size: "sm", variant: "hero", children: "Add" })
        ] })
      ] })
    ] }) }),
    showDeptModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Add Department" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleCreateDept, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Department Name", placeholder: "e.g. Research & Development", value: deptName, onChange: (e) => setDeptName(e.target.value), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: deptDesc, onChange: (e) => setDeptDesc(e.target.value), placeholder: "Department description...", rows: 3, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowDeptModal(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", children: "Create" })
        ] })
      ] })
    ] }) }),
    showEditDeptModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Edit Department" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpdateDept, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Department Name", placeholder: "e.g. Research & Development", value: editDeptName, onChange: (e) => setEditDeptName(e.target.value), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: editDeptDesc, onChange: (e) => setEditDeptDesc(e.target.value), placeholder: "Department description...", rows: 3, className: "w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-xs outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowEditDeptModal(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", children: "Save Changes" })
        ] })
      ] })
    ] }) }),
    showManageDeptModal && selectedDept && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Manage Department: ",
          selectedDept.name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowManageDeptModal(false), className: "text-muted-foreground hover:text-foreground", children: "Close" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Department Head" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: deptHeadId, onChange: (e) => setDeptHeadId(e.target.value), className: "w-full h-9 rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a head..." }),
          members.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: m.userId, children: m.fullName || m.username || m.userId }, m.userId))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Department Members" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-40 overflow-y-auto border border-border/85 rounded-xl p-2.5 bg-background/45 space-y-1.5", children: members.map((m) => {
          const isChecked = deptMemberIds.includes(m.userId);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-xs cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: isChecked, onChange: () => {
              if (isChecked) {
                setDeptMemberIds((ids) => ids.filter((id) => id !== m.userId));
              } else {
                setDeptMemberIds((ids) => [...ids, m.userId]);
              }
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.fullName || m.username || m.userId })
          ] }, m.userId);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-3 border-t border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setShowManageDeptModal(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "hero", onClick: handleSaveDeptMembers, children: "Save Details" })
      ] })
    ] }) }),
    showInviteModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Invite Teammate" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleInvite, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Email Address", type: "email", placeholder: "teammate@company.com", value: inviteEmail, onChange: (e) => setInviteEmail(e.target.value), required: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground", children: "Workspace Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: inviteRole, onChange: (e) => setInviteRole(e.target.value), className: "w-full h-10 rounded-xl border border-border bg-background/60 px-3 text-xs outline-none focus:border-primary cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MEMBER", children: "MEMBER" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ADMIN", children: "ADMIN" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "OWNER", children: "OWNER" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", onClick: () => setShowInviteModal(false), children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", variant: "hero", children: "Invite" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  OrganizationsPage as component
};

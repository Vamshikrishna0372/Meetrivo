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

type Tab = "teams" | "departments" | "members";

function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("teams");
  const [teams, setTeams] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Modals / forms
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgDomain, setOrgDomain] = useState("");

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [deptCode, setDeptCode] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");

  useEffect(() => {
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
      if (tab === "teams") {
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
    if (!orgName.trim()) return;
    try {
      const created = await orgsApi.create({ name: orgName, domain: orgDomain });
      toast.success("Organization created!");
      setOrgName("");
      setOrgDomain("");
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
        code: deptCode,
        organizationId: selectedOrg.id,
      });
      toast.success("Department created!");
      setDeptName("");
      setDeptCode("");
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
                <h2 className="text-xl font-bold">{selectedOrg.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Workspace domain: {selectedOrg.domain || "None"}</p>
                <div className="mt-4 flex gap-1 rounded-xl border border-border bg-background p-1 max-w-sm">
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
                      {activeTab === "teams" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold">Teams list</h3>
                            <Button size="sm" variant="glass" onClick={() => setShowTeamModal(true)}>
                              <FiPlusCircle className="mr-1" /> Add Team
                            </Button>
                          </div>
                          {teams.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground">
                              No teams exist under this organization.
                            </div>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {teams.map((t) => (
                                <div key={t.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-start gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm">{t.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">{t.description || "No description"}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteTeam(t.id)}
                                    className="text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive p-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "departments" && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h3 className="text-sm font-semibold">Departments list</h3>
                            <Button size="sm" variant="glass" onClick={() => setShowDeptModal(true)}>
                              <FiPlusCircle className="mr-1" /> Add Department
                            </Button>
                          </div>
                          {departments.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-xs text-muted-foreground">
                              No departments exist under this organization.
                            </div>
                          ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                              {departments.map((d) => (
                                <div key={d.id} className="rounded-xl border border-border bg-card p-4 flex justify-between items-start gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm">{d.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">Code: <span className="font-semibold">{d.code || "N/A"}</span></p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteDept(d.id)}
                                    className="text-xs font-semibold bg-destructive/10 hover:bg-destructive/20 text-destructive p-1.5 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FiTrash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
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
                                        <p className="font-semibold text-foreground">{m.userId}</p>
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
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">New Organization</h3>
            <form onSubmit={handleCreateOrg} className="space-y-4">
              <Field label="Name" placeholder="e.g. Acme Corp" value={orgName} onChange={(e) => setOrgName(e.target.value)} required />
              <Field label="Domain" placeholder="e.g. acme.com" value={orgDomain} onChange={(e) => setOrgDomain(e.target.value)} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowOrgModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Create</Button>
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

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-glow space-y-4">
            <h3 className="text-sm font-semibold">Add Department</h3>
            <form onSubmit={handleCreateDept} className="space-y-4">
              <Field label="Department Name" placeholder="e.g. Research & Development" value={deptName} onChange={(e) => setDeptName(e.target.value)} required />
              <Field label="Department Code" placeholder="e.g. RD-202" value={deptCode} onChange={(e) => setDeptCode(e.target.value)} />
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowDeptModal(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Create</Button>
              </div>
            </form>
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

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { FiEdit2, FiVideo, FiClock, FiLayers, FiLoader } from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";
import { Button } from "@/components/ui/button";
import { users, analytics as analyticsApi } from "@/lib/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/shared/Field";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Meetrivo" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [statsData, setStatsData] = useState({ meetings: 0, hours: 0, workspaces: 0 });

  useEffect(() => {
    loadProfile();
    analyticsApi.getDashboard().then((data: any) => {
      if (data) {
        setStatsData({
          meetings: data.totalMeetings || data.meetingsThisWeek || 0,
          hours: data.totalHoursInMeetings || data.avgDurationMin || 0,
          workspaces: data.activeWorkspaces || 1,
        });
      }
    }).catch(() => {});
  }, []);

  const loadProfile = () => {
    setLoading(true);
    users.getProfile()
      .then((data) => {
        setProfile(data);
        setEditName(data.fullName || "");
        setEditBio(data.bio || "");
      })
      .catch((e) => {
        console.error("Failed to load profile", e);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await users.updateProfile({
        fullName: editName,
        bio: editBio,
      });
      setProfile(updated);
      localStorage.setItem("meetrivo_user", JSON.stringify(updated));
      setEditOpen(false);
    } catch (e: any) {
      alert(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { icon: FiVideo, label: "Meetings", value: statsData.meetings },
    { icon: FiClock, label: "Hours", value: statsData.hours },
    { icon: FiLayers, label: "Workspaces", value: statsData.workspaces },
  ];

  if (loading && !profile) {
    return (
      <AppShell>
        <div className="flex h-64 items-center justify-center">
          <FiLoader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : (profile?.username || "U").slice(0, 2).toUpperCase();

  return (
    <AppShell>
      <Reveal>
        <h1 className="text-2xl font-bold sm:text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your personal information.</p>
      </Reveal>

      <div className="mt-6 space-y-5">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-[80px]" />
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
                {initials}
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{profile?.fullName || profile?.username}</h2>
                <p className="text-sm text-muted-foreground">{profile?.role || "Member"}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
              <Button variant="glass" size="sm" onClick={() => setEditOpen(true)}>
                <FiEdit2 /> Edit profile
              </Button>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="rounded-2xl border border-border bg-card p-5">
                <s.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold">User information</h3>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                ["Full name", profile?.fullName || "Not set"],
                ["Email", profile?.email],
                ["Username", profile?.username],
                ["Bio", profile?.bio || "No bio yet"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field
              label="Full Name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Jordan Rivera"
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself"
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleSave} disabled={saving}>
                {saving && <FiLoader className="animate-spin mr-1" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

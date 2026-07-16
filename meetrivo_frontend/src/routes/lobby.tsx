import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiVolume2,
  FiCheckCircle,
  FiSettings,
  FiLoader,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";
import { auth, meetings as meetingsApi } from "@/lib/apiClient";

export const Route = createFileRoute("/lobby")({
  head: () => ({ meta: [{ title: "Ready to join — Meetrivo" }] }),
  component: Lobby,
});

function Lobby() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [name, setName] = useState("");
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [meetingCode, setMeetingCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || localStorage.getItem("current_meeting_code") || "";
    const nameParam = params.get("name") || "";
    setMeetingCode(code);

    const user = auth.getUser();
    if (nameParam) {
      setName(nameParam);
    } else if (user) {
      setName(user.fullName || user.username || user.email || "Guest");
    }
  }, []);

  const handleJoin = async () => {
    if (!meetingCode) {
      navigate({ to: "/join" });
      return;
    }
    setJoining(true);
    setError("");
    let mId = "";
    try {
      const result = await meetingsApi.join(meetingCode);
      mId = result?.meetingId || result?.id || "";
      if (mId) {
        localStorage.setItem("current_meeting_id", mId);
      }
      if (meetingCode) {
        localStorage.setItem("current_meeting_code", meetingCode);
      }
    } catch (e: any) {
      // Allow entry even if join API fails (e.g., already joined)
      console.warn("Join API failed:", e.message);
    } finally {
      setJoining(false);
    }
    localStorage.setItem("lobby_mic", micOn ? "true" : "false");
    localStorage.setItem("lobby_cam", camOn ? "true" : "false");
    localStorage.setItem("lobby_name", name);
    
    // Pass meetingId and code to room to make URL the source of truth
    window.location.href = `/room?meetingId=${mId}&code=${meetingCode}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs text-success">
          <FiCheckCircle className="h-3.5 w-3.5" /> Secure connection
        </span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-6">
        <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Camera preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-gradient-surface"
          >
            {camOn ? (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.32_0.06_264),transparent_70%)]" />
            ) : null}
            <div className="absolute inset-0 grid place-items-center">
              {camOn ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <span className="grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-3xl font-bold text-primary-foreground shadow-glow">
                    {name.slice(0, 2).toUpperCase() || "ME"}
                  </span>
                  <p className="mt-3 text-sm text-muted-foreground">Camera preview</p>
                </motion.div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <FiVideoOff className="mx-auto h-10 w-10" />
                  <p className="mt-2 text-sm">Your camera is off</p>
                </div>
              )}
            </div>

            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                {name || "You"}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4">
              <CircleToggle on={micOn} onClick={() => setMicOn((v) => !v)} label="microphone">
                {micOn ? <FiMic /> : <FiMicOff />}
              </CircleToggle>
              <CircleToggle on={camOn} onClick={() => setCamOn((v) => !v)} label="camera">
                {camOn ? <FiVideo /> : <FiVideoOff />}
              </CircleToggle>
            </div>
          </motion.div>

          {/* Setup panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col rounded-3xl border border-border bg-card p-5 sm:p-6"
          >
            <h1 className="text-xl font-bold">Ready to join?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Check your devices before stepping into the workspace.
            </p>

            <label className="mt-5 block space-y-1.5">
              <span className="text-sm font-medium">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                className="h-11 w-full rounded-xl border border-border bg-background/60 px-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
              />
            </label>

            <div className="mt-5 space-y-2">
              <DeviceRow icon={FiMic} label="Microphone" ok={micOn} okText="MacBook Mic" offText="Muted" />
              <DeviceRow icon={FiVideo} label="Camera" ok={camOn} okText="FaceTime HD" offText="Off" />
              <DeviceRow icon={FiVolume2} label="Speaker" ok okText="System Output" offText="" />
            </div>

            <div className="mt-auto space-y-2 pt-6">
              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleJoin}
              >
                Join now
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => navigate({ to: "/dashboard" })}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function CircleToggle({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={`Toggle ${label}`}
      aria-pressed={on}
      className={cn(
        "grid h-12 w-12 place-items-center rounded-full text-lg transition-colors",
        on ? "bg-surface/80 text-foreground backdrop-blur-sm" : "bg-destructive text-destructive-foreground",
      )}
    >
      {children}
    </motion.button>
  );
}

function DeviceRow({
  icon: Icon,
  label,
  ok,
  okText,
  offText,
}: {
  icon: typeof FiMic;
  label: string;
  ok: boolean;
  okText: string;
  offText: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3">
      <span
        className={cn(
          "grid h-8 w-8 place-items-center rounded-lg",
          ok ? "bg-success/15 text-success" : "bg-surface text-muted-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-xs text-muted-foreground">{ok ? okText : offText || "—"}</p>
      </div>
      <FiSettings className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

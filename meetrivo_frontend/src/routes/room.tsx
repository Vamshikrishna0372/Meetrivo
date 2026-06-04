import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMonitor,
  FiMessageSquare,
  FiUsers,
  FiSmile,
  FiPhoneOff,
  FiFile,
  FiInfo,
  FiX,
  FiSend,
  FiCopy,
  FiCheck,
  FiShare2,
  FiWifi,
  FiLock,
  FiClock,
} from "react-icons/fi";
import { TbHandStop } from "react-icons/tb";
import {
  participants as seedParticipants,
  chatMessages as seedChat,
  autoReplies,
  sharedFiles,
  reactionEmojis,
  type Participant,
  type ChatMessage,
} from "@/data/mock";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode } from "@/components/shared/QrCode";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/room")({
  head: () => ({ meta: [{ title: "Meeting room — Meetrivo" }] }),
  component: RoomPage,
});

type DrawerKind = "chat" | "participants" | "files" | "info" | null;

const ROOM_CODE = "MTR-481-902";
const ROOM_LINK = "https://meetrivo.com/j/MTR-481-902";

function RoomPage() {
  const [people] = useState<Participant[]>(seedParticipants);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [handUp, setHandUp] = useState(false);
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [flying, setFlying] = useState<{ id: number; emoji: string }[]>([]);
  const [shareOpen, setShareOpen] = useState(false);

  const sendReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    setFlying((f) => [...f, { id, emoji }]);
    setShowReactions(false);
    setTimeout(() => setFlying((f) => f.filter((x) => x.id !== id)), 2500);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">Product Sync — Q3 Roadmap</p>
              <span className="hidden items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
              </span>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <FiLock className="h-3 w-3 text-success" /> {ROOM_CODE}
              <span className="hidden sm:inline">· {people.length} participants</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MeetingTimer />
          <Button variant="glass" size="sm" onClick={() => setShareOpen(true)}>
            <FiShare2 /> <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
      </header>

      {/* Stage + inline drawer (desktop) */}
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <main className="relative flex-1 overflow-hidden px-3 pb-3 sm:px-6">
          <VideoGrid people={people} youCam={camOn} youMic={micOn} sharing={sharing} />
          {/* flying reactions */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <AnimatePresence>
              {flying.map((f) => (
                <motion.span
                  key={f.id}
                  initial={{ opacity: 0, y: 0, x: "50%", scale: 0.6 }}
                  animate={{ opacity: 1, y: -260, scale: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 2.4, ease: "easeOut" }}
                  className="absolute bottom-4 left-1/2 text-4xl"
                >
                  {f.emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Drawers */}
        <AnimatePresence>
          {drawer && (
            <RoomDrawer kind={drawer} people={people} onClose={() => setDrawer(null)} />
          )}
        </AnimatePresence>
      </div>

      {/* Control dock */}
      <ControlDock
        micOn={micOn}
        camOn={camOn}
        sharing={sharing}
        handUp={handUp}
        drawer={drawer}
        showReactions={showReactions}
        onMic={() => setMicOn((v) => !v)}
        onCam={() => setCamOn((v) => !v)}
        onShare={() => setSharing((v) => !v)}
        onHand={() => setHandUp((v) => !v)}
        onReactions={() => setShowReactions((v) => !v)}
        onSendReaction={sendReaction}
        onDrawer={(d) => setDrawer((cur) => (cur === d ? null : d))}
      />


      {/* Share modal */}
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}

function MeetingTimer() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium tabular-nums">
      <FiClock className="h-3.5 w-3.5 text-muted-foreground" /> {mm}:{ss}
    </span>
  );
}



function VideoGrid({
  people,
  youCam,
  youMic,
  sharing,
}: {
  people: Participant[];
  youCam: boolean;
  youMic: boolean;
  sharing: boolean;
}) {
  const count = people.length;
  const cols =
    count <= 1 ? "grid-cols-1" : count <= 4 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3";

  if (sharing) {
    return (
      <div className="flex h-full flex-col gap-3 lg:flex-row">
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface/40">
          <div className="text-center">
            <FiMonitor className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-2 text-sm font-medium">You are sharing your screen</p>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-y-auto">
          {people.map((p) => (
            <div key={p.id} className="w-32 shrink-0 lg:w-full">
              <ParticipantCard p={localized(p, youCam, youMic)} compact />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid h-full auto-rows-fr gap-3", cols)}>
      {people.map((p) => (
        <ParticipantCard key={p.id} p={localized(p, youCam, youMic)} />
      ))}
    </div>
  );
}

function localized(p: Participant, youCam: boolean, youMic: boolean): Participant {
  if (!p.isYou) return p;
  return { ...p, cameraOn: youCam, micOn: youMic };
}

function ParticipantCard({ p, compact }: { p: Participant; compact?: boolean }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: compact ? 1 : 1.01 }}
      className={cn(
        "group relative flex items-center justify-center overflow-hidden rounded-2xl border bg-gradient-surface transition-shadow",
        p.speaking ? "border-primary shadow-glow" : "border-border",
        compact ? "aspect-video" : "min-h-32",
      )}
    >
      {p.cameraOn ? (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,oklch(0.3_0.05_264),transparent)]" />
      ) : null}
      <div className="relative grid place-items-center">
        <span
          className={cn(
            "grid place-items-center rounded-full bg-gradient-primary font-semibold text-primary-foreground",
            compact ? "h-9 w-9 text-xs" : "h-16 w-16 text-xl",
            p.speaking && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          {p.initials}
        </span>
      </div>

      {/* hand raised */}
      {p.handRaised && (
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-warning text-warning-foreground">
          <TbHandStop className="h-4 w-4" />
        </span>
      )}

      {/* bottom bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
        <span className={cn("truncate font-medium", compact ? "text-[10px]" : "text-xs")}>
          {p.name}
        </span>
        <span className="flex items-center gap-1.5">
          <Conn level={p.connection} />
          <span
            className={cn(
              "grid place-items-center rounded-full p-1",
              p.micOn ? "text-foreground" : "bg-destructive/80 text-destructive-foreground",
            )}
          >
            {p.micOn ? <FiMic className="h-3 w-3" /> : <FiMicOff className="h-3 w-3" />}
          </span>
        </span>
      </div>
    </motion.div>
  );
}

function Conn({ level }: { level: Participant["connection"] }) {
  const color =
    level === "excellent" ? "text-success" : level === "good" ? "text-warning" : "text-destructive";
  return <FiWifi className={cn("h-3 w-3", color)} title={`${level} connection`} />;
}

function ControlDock({
  micOn,
  camOn,
  sharing,
  handUp,
  drawer,
  showReactions,
  onMic,
  onCam,
  onShare,
  onHand,
  onReactions,
  onSendReaction,
  onDrawer,
}: {
  micOn: boolean;
  camOn: boolean;
  sharing: boolean;
  handUp: boolean;
  drawer: DrawerKind;
  showReactions: boolean;
  onMic: () => void;
  onCam: () => void;
  onShare: () => void;
  onHand: () => void;
  onReactions: () => void;
  onSendReaction: (e: string) => void;
  onDrawer: (d: DrawerKind) => void;
}) {
  return (
    <div className="relative z-30 flex justify-center px-3 pb-4 pt-1 sm:pb-6">
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="glass absolute bottom-full mb-3 flex gap-1 rounded-2xl p-2"
          >
            {reactionEmojis.map((e) => (
              <button
                key={e}
                onClick={() => onSendReaction(e)}
                className="grid h-10 w-10 place-items-center rounded-xl text-xl transition-transform hover:scale-125 active:scale-95"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass flex items-center gap-1.5 rounded-2xl px-2.5 py-2 sm:gap-2 sm:px-3">
        <DockBtn label={micOn ? "Mute" : "Unmute"} active={micOn} danger={!micOn} onClick={onMic}>
          {micOn ? <FiMic /> : <FiMicOff />}
        </DockBtn>
        <DockBtn label={camOn ? "Stop video" : "Start video"} active={camOn} danger={!camOn} onClick={onCam}>
          {camOn ? <FiVideo /> : <FiVideoOff />}
        </DockBtn>
        <DockBtn label="Share screen" active={sharing} onClick={onShare} className="hidden sm:flex">
          <FiMonitor />
        </DockBtn>
        <DockBtn label="Raise hand" active={handUp} onClick={onHand}>
          <TbHandStop />
        </DockBtn>
        <DockBtn label="Reactions" active={showReactions} onClick={onReactions}>
          <FiSmile />
        </DockBtn>
        <span className="mx-0.5 h-7 w-px bg-border" />
        <DockBtn label="Participants" active={drawer === "participants"} onClick={() => onDrawer("participants")}>
          <FiUsers />
        </DockBtn>
        <DockBtn label="Chat" active={drawer === "chat"} onClick={() => onDrawer("chat")}>
          <FiMessageSquare />
        </DockBtn>
        <DockBtn label="Files" active={drawer === "files"} onClick={() => onDrawer("files")} className="hidden sm:flex">
          <FiFile />
        </DockBtn>
        <DockBtn label="Info" active={drawer === "info"} onClick={() => onDrawer("info")} className="hidden sm:flex">
          <FiInfo />
        </DockBtn>
        <span className="mx-0.5 h-7 w-px bg-border" />
        <Button asChild variant="destructive" size="icon" className="rounded-xl">
          <Link to="/dashboard" aria-label="End meeting">
            <FiPhoneOff />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DockBtn({
  children,
  label,
  active,
  danger,
  onClick,
  className,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl text-lg transition-colors sm:h-11 sm:w-11",
        danger
          ? "bg-destructive text-destructive-foreground"
          : active
            ? "bg-primary text-primary-foreground"
            : "bg-surface/70 text-foreground hover:bg-surface",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function RoomDrawer({
  kind,
  people,
  onClose,
}: {
  kind: Exclude<DrawerKind, null>;
  people: Participant[];
  onClose: () => void;
}) {
  const titles: Record<string, string> = {
    chat: "Chat",
    participants: `Participants (${people.length})`,
    files: "Shared files",
    info: "Meeting info",
  };
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-card md:static md:z-auto md:my-0 md:w-80 md:max-w-none md:rounded-l-2xl"
      >

        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{titles[kind]}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-surface">
            <FiX />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          {kind === "chat" && <ChatPanel />}
          {kind === "participants" && <ParticipantsPanel people={people} />}
          {kind === "files" && <FilesPanel />}
          {kind === "info" && <InfoPanel />}
        </div>
      </motion.aside>
    </>
  );
}

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(seedChat);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    setMessages((m) => [
      ...m,
      { id: `me-${Date.now()}`, author: "You", initials: "JR", text: t, time: now(), self: true },
    ]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `bot-${Date.now()}`,
          author: "Maya Chen",
          initials: "MC",
          text: autoReplies[Math.floor(Math.random() * autoReplies.length)],
          time: now(),
        },
      ]);
    }, 1600);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((m) =>
            m.system ? (
              <motion.div
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-xs text-muted-foreground"
              >
                {m.text} · {m.time}
              </motion.div>
            ) : (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-2", m.self && "flex-row-reverse")}
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[10px] font-semibold">
                  {m.initials}
                </span>
                <div className={cn("max-w-[75%]", m.self && "text-right")}>
                  <p
                    className={cn(
                      "inline-block rounded-2xl px-3 py-2 text-sm",
                      m.self
                        ? "bg-gradient-primary text-primary-foreground"
                        : "bg-surface text-foreground",
                    )}
                  >
                    {m.text}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {m.self ? "" : `${m.author} · `}
                    {m.time}
                  </p>
                </div>
              </motion.div>
            ),
          )}
        </AnimatePresence>
        {typing && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-surface text-[10px] font-semibold">MC</span>
            <span className="flex gap-1 rounded-2xl bg-surface px-3 py-2.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
        />
        <Button size="icon" className="rounded-xl" onClick={send} aria-label="Send">
          <FiSend />
        </Button>
      </div>
    </div>
  );
}

function ParticipantsPanel({ people }: { people: Participant[] }) {
  return (
    <div className="space-y-1 overflow-y-auto p-3">
      {people.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface/60">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
            {p.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {p.name} {p.role && <span className="text-xs text-muted-foreground">· {p.role}</span>}
            </p>
            <p className="text-[11px] capitalize text-muted-foreground">{p.connection} connection</p>
          </div>
          <span className="flex items-center gap-2 text-muted-foreground">
            {p.handRaised && <TbHandStop className="h-4 w-4 text-warning" />}
            {p.micOn ? <FiMic className="h-4 w-4" /> : <FiMicOff className="h-4 w-4 text-destructive" />}
            {p.cameraOn ? <FiVideo className="h-4 w-4" /> : <FiVideoOff className="h-4 w-4 text-destructive" />}
          </span>
        </div>
      ))}
    </div>
  );
}

function FilesPanel() {
  return (
    <div className="space-y-2 overflow-y-auto p-3">
      {sharedFiles.map((f) => (
        <div key={f.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-primary">
            <FiFile className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{f.name}</p>
            <p className="text-[11px] text-muted-foreground">{f.size} · {f.owner} · {f.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoPanel() {
  return (
    <div className="space-y-4 p-4 text-sm">
      <Info label="Meeting" value="Product Sync — Q3 Roadmap" />
      <Info label="Room code" value={ROOM_CODE} />
      <Info label="Host" value="Jordan Rivera" />
      <Info label="Started" value="Today, 10:30 AM" />
      <Info label="Link" value={ROOM_LINK} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words font-medium">{value}</p>
    </div>
  );
}

function ShareDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(ROOM_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-2xl bg-white p-3 shadow-soft">
            <QrCode value={ROOM_LINK} size={180} />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Scan the QR code to join instantly, or share the link below.
          </p>
          <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3">
            <span className="flex-1 truncate text-sm">{ROOM_LINK}</span>
            <Button size="sm" variant={copied ? "secondary" : "default"} onClick={copy}>
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback, useEffect } from "react";

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
  FiLoader,
  FiCpu,
  FiGrid,
} from "react-icons/fi";
import { TbHandStop } from "react-icons/tb";
import {
  reactionEmojis,
  type Participant,
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
import { useWebSocket, type WsMessage, type WsParticipant } from "@/hooks/useWebSocket";
import { meetings as meetingsApi, files as filesApi, ai as aiApi, breakoutRooms as breakoutRoomsApi, recordings as recordingsApi } from "@/lib/apiClient";
import { FiUserCheck, FiUserX, FiUserMinus } from "react-icons/fi";
import { toast } from "sonner";

export const Route = createFileRoute("/room")({
  head: () => ({ meta: [{ title: "Meeting room — Meetrivo" }] }),
  component: RoomPage,
});

type DrawerKind = "chat" | "participants" | "files" | "info" | "ai" | "breakout" | null;

function RoomPage() {
  // meetingCode: read once from URL params or localStorage — NEVER regenerated
  const [meetingCode, setMeetingCode] = useState("");
  const [urlMeetingId, setUrlMeetingId] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [handUp, setHandUp] = useState(false);
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [showReactions, setShowReactions] = useState(false);
  const [flying, setFlying] = useState<{ id: number; emoji: string }[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingId, setRecordingId] = useState<string | null>(null);

  // WebRTC Stream refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  const {
    connected,
    messages,
    participants,
    waitingParticipants,
    setWaitingParticipants,
    sendMessage,
    sendReaction: wsSendReaction,
    sendHand,
    sendSignal,
    updateState,
  } = useWebSocket(
    meeting?.meetingId || "",
    undefined,
    async (signal: any) => {
      await handleWebRTCSignal(signal);
    }
  );
  // DEBUG: log the meetingId passed to useWebSocket on every render
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    console.log(`[DEBUG][ROOM] useWebSocket called with meetingId=${meeting?.meetingId || "(empty)"}`);
  }, [meeting?.meetingId]);

  const waitingCount = waitingParticipants?.length || 0;

  // ── MOUNT: read meetingCode and meetingId from URL or localStorage exactly ONCE (client-only) ──
  // This prevents hydration mismatch: server renders empty string, client fills in after mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code") || "";
    const idFromUrl = params.get("meetingId") || "";
    const codeFromStorage = localStorage.getItem("current_meeting_code") || "";
    const idFromStorage = localStorage.getItem("current_meeting_id") || "";
    
    console.log(`[DEBUG][ROOM] MOUNT: codeFromUrl=${codeFromUrl} idFromUrl=${idFromUrl} codeFromStorage=${codeFromStorage} idFromStorage=${idFromStorage}`);
    
    if (idFromUrl) {
      setUrlMeetingId(idFromUrl);
    } else if (idFromStorage) {
      setUrlMeetingId(idFromStorage);
    }
    
    const code = codeFromUrl || codeFromStorage;
    if (code) setMeetingCode(code);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (urlMeetingId) {
      console.log(`[DEBUG][ROOM] Fetching meeting by UUID=${urlMeetingId}`);
      meetingsApi.getById(urlMeetingId)
        .then((res) => {
          if (res) {
            console.log(`[DEBUG][ROOM] getById result: meetingId=${res.meetingId} meetingCode=${res.meetingCode}`);
            setMeeting(res);
            if (res.meetingCode) setMeetingCode(res.meetingCode);
          }
        })
        .catch((err) => {
          console.error(`[DEBUG][ROOM] getById error:`, err);
          if (meetingCode) {
            fetchByCode(meetingCode);
          }
        });
    } else if (meetingCode) {
      fetchByCode(meetingCode);
    }
  }, [urlMeetingId, meetingCode]);

  const fetchByCode = (code: string) => {
    console.log(`[DEBUG][ROOM] Fetching meeting by code=${code}`);
    meetingsApi.searchByCode(code)
      .then((res) => {
        if (res && res.length > 0) {
          console.log(`[DEBUG][ROOM] searchByCode result: meetingId=${res[0].meetingId} meetingCode=${res[0].meetingCode}`);
          setMeeting(res[0]);
        } else {
          console.warn(`[DEBUG][ROOM] searchByCode returned no results for code=${code}`);
        }
      })
      .catch((err) => { console.error(`[DEBUG][ROOM] searchByCode error:`, err); });
  };

  useEffect(() => {
    // Access local media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        stream.getAudioTracks().forEach(track => { track.enabled = micOn; });
        stream.getVideoTracks().forEach(track => { track.enabled = camOn; });
      })
      .catch((err) => {
        console.warn("Failed to capture local media devices:", err);
        toast.error("Camera/microphone access denied. Check browser permissions.");
      });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peersRef.current).forEach(pc => pc.close());
    };
  }, []);

  // Update backend about state change
  useEffect(() => {
    if (connected) {
      updateState(micOn, camOn, sharing);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => { track.enabled = micOn; });
      localStreamRef.current.getVideoTracks().forEach(track => { track.enabled = camOn; });
    }
  }, [micOn, camOn, sharing, connected]);

  const getOrCreatePeerConnection = useCallback((userId: string) => {
    if (peersRef.current[userId]) {
      return peersRef.current[userId];
    }
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    peersRef.current[userId] = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ICE_CANDIDATE", userId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({
        ...prev,
        [userId]: event.streams[0]
      }));
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, [sendSignal]);

  const handleWebRTCSignal = useCallback(async (msg: any) => {
    const { type, senderId, payload } = msg;
    try {
      if (type === "OFFER") {
        const pc = getOrCreatePeerConnection(senderId);
        await pc.setRemoteDescription(new RTCSessionDescription(payload));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendSignal("ANSWER", senderId, answer);
      } else if (type === "ANSWER") {
        const pc = peersRef.current[senderId];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
        }
      } else if (type === "ICE_CANDIDATE") {
        const pc = peersRef.current[senderId];
        if (pc && payload) {
          await pc.addIceCandidate(new RTCIceCandidate(payload));
        }
      }
    } catch (e) {
      console.error("Error handling WebRTC signal:", e);
    }
  }, [getOrCreatePeerConnection, sendSignal]);

  const initiateCall = useCallback((userId: string) => {
    const pc = getOrCreatePeerConnection(userId);
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        sendSignal("OFFER", userId, pc.localDescription);
      })
      .catch(e => console.error("Error creating WebRTC offer:", e));
  }, [getOrCreatePeerConnection, sendSignal]);

  // Trigger calls to new participants and clean up departed ones
  useEffect(() => {
    // Initiate calls to new participants
    participants.forEach(p => {
      if (!p.isYou && !peersRef.current[p.id]) {
        initiateCall(p.id);
      }
    });

    // Clean up departed participants' peers
    const activeIds = new Set(participants.map(p => p.id));
    Object.keys(peersRef.current).forEach(id => {
      if (!activeIds.has(id)) {
        console.log(`[DEBUG][ROOM] Cleaning up peer connection for departed user=${id}`);
        try {
          peersRef.current[id].close();
        } catch (_) {}
        delete peersRef.current[id];
        setRemoteStreams(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    });
  }, [participants, initiateCall]);

  const toggleSharing = async () => {
    if (!sharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        // Replace video track in all peer connections
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });
        screenTrack.onended = () => {
          setSharing(false);
          updateState(micOn, camOn, false);
        };
        setSharing(true);
        updateState(micOn, camOn, true);
      } catch (e) {
        console.warn('Screen share cancelled or denied');
      }
    } else {
      // Revert to camera
      if (localStreamRef.current) {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && camTrack) sender.replaceTrack(camTrack);
        });
      }
      setSharing(false);
      updateState(micOn, camOn, false);
    }
  };

  const toggleRecording = async () => {
    if (!meeting?.meetingId && !meeting?.id) {
      toast.error('Meeting not loaded yet');
      return;
    }
    const mId = meeting.meetingId || meeting.id;
    if (!isRecording) {
      try {
        const res = await recordingsApi.start(mId);
        setRecordingId(res.id || res.recordingId);
        setIsRecording(true);
        toast.success('Recording started');
      } catch (e: any) {
        toast.error(e.message || 'Failed to start recording');
      }
    } else {
      try {
        if (recordingId) await recordingsApi.stop(recordingId);
        setRecordingId(null);
        setIsRecording(false);
        toast.success('Recording stopped and saved');
      } catch (e: any) {
        toast.error(e.message || 'Failed to stop recording');
      }
    }
  };

  const endMeetingAndLeave = async () => {
    if (meeting?.meetingId || meeting?.id) {
      const mId = meeting.meetingId || meeting.id;
      try {
        await meetingsApi.endMeeting(mId);
      } catch (_) { /* allow leave even if end fails */ }
    }
    window.location.href = '/dashboard';
  };

  const sendReaction = (emoji: string) => {
    const id = Date.now() + Math.random();
    setFlying((f) => [...f, { id, emoji }]);
    setShowReactions(false);
    wsSendReaction(emoji);
    setTimeout(() => setFlying((f) => f.filter((x) => x.id !== id)), 2500);
  };

  const toggleHand = () => {
    const nextHand = !handUp;
    setHandUp(nextHand);
    sendHand(nextHand);
  };

  // Build client people list
  const activePeople: Participant[] = participants.length > 0
    ? participants.map(p => ({
        id: p.id,
        name: p.name,
        initials: p.initials,
        role: p.role || (p.isYou ? "Host" : "Participant"),
        micOn: p.micOn,
        cameraOn: p.cameraOn,
        speaking: p.speaking,
        connection: p.connection,
        handRaised: p.handRaised,
        isYou: p.isYou
      }))
    : [
        { id: "you", name: "You", initials: "ME", role: "Host", micOn, cameraOn: camOn, speaking: false, connection: "excellent", isYou: true }
      ];

  const ROOM_LINK = typeof window !== 'undefined'
    ? `${window.location.origin}/lobby?code=${meetingCode}`
    : `https://meetrivo.com/j/${meetingCode}`;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold">{meeting?.title || "Product Sync — Q3 Roadmap"}</p>
              <span className="hidden items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success sm:flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> Live
              </span>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <FiLock className="h-3 w-3 text-success" /> {meetingCode}
              <span className="hidden sm:inline">· {activePeople.length} participants</span>
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
          <VideoGrid
            people={activePeople}
            localStream={localStreamRef.current}
            remoteStreams={remoteStreams}
            youCam={camOn}
            youMic={micOn}
            sharing={sharing}
          />
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
            <RoomDrawer
              kind={drawer}
              people={activePeople}
              waitingParticipants={waitingParticipants}
              messages={messages}
              onSendMessage={sendMessage}
              onClose={() => setDrawer(null)}
              meetingInfo={meeting}
              meetingCode={meetingCode}
              meetingLink={ROOM_LINK}
              userRole={activePeople.find(p => p.isYou)?.role || "PARTICIPANT"}
              onAdmit={async (userId: string) => {
                const mId = meeting?.meetingId || meeting?.id;
                if (!mId) return;
                try {
                  await meetingsApi.approveParticipant(mId, userId);
                  setWaitingParticipants(prev => prev.filter(p => p.id !== userId));
                  toast.success('Participant admitted');
                } catch (e: any) { toast.error(e.message || 'Failed to admit'); }
              }}
              onReject={async (userId: string) => {
                const mId = meeting?.meetingId || meeting?.id;
                if (!mId) return;
                try {
                  await meetingsApi.rejectParticipant(mId, userId);
                  setWaitingParticipants(prev => prev.filter(p => p.id !== userId));
                  toast.success('Participant rejected');
                } catch (e: any) { toast.error(e.message || 'Failed to reject'); }
              }}
              onRemove={async (userId: string) => {
                const mId = meeting?.meetingId || meeting?.id;
                if (!mId) return;
                try {
                  await meetingsApi.removeParticipant(mId, userId);
                  toast.success('Participant removed');
                } catch (e: any) { toast.error(e.message || 'Failed to remove'); }
              }}
              onBan={async (userId: string) => {
                const mId = meeting?.meetingId || meeting?.id;
                if (!mId) return;
                try {
                  await meetingsApi.banParticipant(mId, userId);
                  toast.success('Participant banned');
                } catch (e: any) { toast.error(e.message || 'Failed to ban'); }
              }}
              onAssignRole={async (userId: string, role: string) => {
                const mId = meeting?.meetingId || meeting?.id;
                if (!mId) return;
                try {
                  await meetingsApi.assignRole(mId, userId, role);
                  toast.success(`Role updated to ${role}`);
                } catch (e: any) { toast.error(e.message || 'Failed to assign role'); }
              }}
            />
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
        isRecording={isRecording}
        waitingCount={waitingParticipants.length}
        onMic={() => setMicOn((v) => !v)}
        onCam={() => setCamOn((v) => !v)}
        onShare={toggleSharing}
        onHand={toggleHand}
        onReactions={() => setShowReactions((v) => !v)}
        onSendReaction={sendReaction}
        onDrawer={(d) => setDrawer((cur) => (cur === d ? null : d))}
        onRecord={toggleRecording}
        onEnd={endMeetingAndLeave}
      />

      {/* Share modal */}
      <ShareDialog open={shareOpen} roomLink={ROOM_LINK} onClose={() => setShareOpen(false)} />
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
  localStream,
  remoteStreams,
  youCam,
  youMic,
  sharing,
}: {
  people: Participant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
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
              <ParticipantCard
                p={localized(p, youCam, youMic)}
                stream={p.isYou ? localStream : remoteStreams[p.id]}
                compact
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid h-full auto-rows-fr gap-3", cols)}>
      {people.map((p) => (
        <ParticipantCard
          key={p.id}
          p={localized(p, youCam, youMic)}
          stream={p.isYou ? localStream : remoteStreams[p.id]}
        />
      ))}
    </div>
  );
}

function localized(p: Participant, youCam: boolean, youMic: boolean): Participant {
  if (!p.isYou) return p;
  return { ...p, cameraOn: youCam, micOn: youMic };
}

function ParticipantCard({ p, stream, compact }: { p: Participant; stream?: MediaStream | null; compact?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream && p.cameraOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, p.cameraOn]);

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
      {p.cameraOn && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={p.isYou}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
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
      )}

      {/* hand raised */}
      {p.handRaised && (
        <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-warning text-warning-foreground">
          <TbHandStop className="h-4 w-4" />
        </span>
      )}

      {/* bottom bar */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
        <span className={cn("truncate font-medium text-white", compact ? "text-[10px]" : "text-xs")}>
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
            {p.micOn ? <FiMic className="h-3 w-3 text-white" /> : <FiMicOff className="h-3 w-3 text-white" />}
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
  isRecording,
  waitingCount,
  onMic,
  onCam,
  onShare,
  onHand,
  onReactions,
  onSendReaction,
  onDrawer,
  onRecord,
  onEnd,
}: {
  micOn: boolean;
  camOn: boolean;
  sharing: boolean;
  handUp: boolean;
  drawer: DrawerKind;
  showReactions: boolean;
  isRecording: boolean;
  waitingCount: number;
  onMic: () => void;
  onCam: () => void;
  onShare: () => void;
  onHand: () => void;
  onReactions: () => void;
  onSendReaction: (e: string) => void;
  onDrawer: (d: DrawerKind) => void;
  onRecord: () => void;
  onEnd: () => void;
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
        <DockBtn label={"Share screen"} active={sharing} onClick={onShare} className="hidden sm:flex">
          <FiMonitor />
        </DockBtn>
        <DockBtn label={handUp ? "Lower hand" : "Raise hand"} active={handUp} onClick={onHand}>
          <TbHandStop />
        </DockBtn>
        <DockBtn label="Reactions" active={showReactions} onClick={onReactions}>
          <FiSmile />
        </DockBtn>
        <span className="mx-0.5 h-7 w-px bg-border" />
        <DockBtn label="Participants" active={drawer === "participants"} onClick={() => onDrawer("participants")}>
          <FiUsers />
          {waitingCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-warning text-[9px] font-bold text-warning-foreground flex items-center justify-center px-0.5">
              {waitingCount}
            </span>
          )}
        </DockBtn>
        <DockBtn label="Chat" active={drawer === "chat"} onClick={() => onDrawer("chat")}>
          <FiMessageSquare />
        </DockBtn>
        <DockBtn label="Files" active={drawer === "files"} onClick={() => onDrawer("files")} className="hidden sm:flex">
          <FiFile />
        </DockBtn>
        <DockBtn label="AI Assistant" active={drawer === "ai"} onClick={() => onDrawer("ai")} className="hidden sm:flex">
          <FiCpu />
        </DockBtn>
        <DockBtn label="Breakout Rooms" active={drawer === "breakout"} onClick={() => onDrawer("breakout")} className="hidden sm:flex">
          <FiGrid />
        </DockBtn>
        <DockBtn label="Info" active={drawer === "info"} onClick={() => onDrawer("info")} className="hidden sm:flex">
          <FiInfo />
        </DockBtn>
        <span className="mx-0.5 h-7 w-px bg-border" />
        <DockBtn label={isRecording ? "Stop recording" : "Record"} active={isRecording} danger={isRecording} onClick={onRecord} className="hidden sm:flex">
          <FiLoader className={isRecording ? "animate-pulse" : ""} />
        </DockBtn>
        <Button variant="destructive" size="icon" className="rounded-xl" onClick={onEnd} aria-label="End meeting">
          <FiPhoneOff />
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
  waitingParticipants,
  messages,
  onSendMessage,
  onClose,
  meetingInfo,
  meetingCode,
  meetingLink,
  onAdmit,
  onReject,
  onRemove,
  onBan,
  onAssignRole,
  userRole,
}: {
  kind: Exclude<DrawerKind, null>;
  people: Participant[];
  waitingParticipants: WsParticipant[];
  messages: WsMessage[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
  meetingInfo: any;
  meetingCode: string;
  meetingLink: string;
  onAdmit: (userId: string) => void;
  onReject: (userId: string) => void;
  onRemove: (userId: string) => void;
  onBan: (userId: string) => void;
  onAssignRole: (userId: string, role: string) => void;
  userRole: string;
}) {
  const titles: Record<string, string> = {
    chat: "Chat",
    participants: `Participants (${people.length})${waitingParticipants.length > 0 ? ` · ${waitingParticipants.length} waiting` : ""}`,
    files: "Shared files",
    info: "Meeting info",
    ai: "AI Assistant",
    breakout: "Breakout Rooms",
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
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-surface animate-pulse">
            <FiX />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {kind === "chat" && <ChatPanel messages={messages} onSend={onSendMessage} />}
          {kind === "participants" && (
            <ParticipantsPanel
              people={people}
              waitingParticipants={waitingParticipants}
              onAdmit={onAdmit}
              onReject={onReject}
              onRemove={onRemove}
              onBan={onBan}
              onAssignRole={onAssignRole}
              userRole={userRole}
            />
          )}
          {kind === "files" && <FilesPanel />}
          {kind === "info" && <InfoPanel meeting={meetingInfo} meetingCode={meetingCode} meetingLink={meetingLink} />}
          {kind === "ai" && <AiPanel meetingId={meetingInfo?.id || meetingInfo?.meetingId || meetingCode} />}
          {kind === "breakout" && <BreakoutPanel meetingId={meetingInfo?.id || meetingInfo?.meetingId || meetingCode} people={people} />}
        </div>
      </motion.aside>
    </>
  );
}

function ChatPanel({ messages, onSend }: { messages: WsMessage[]; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
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
          ))}
        </AnimatePresence>
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

function ParticipantsPanel({
  people,
  waitingParticipants,
  onAdmit,
  onReject,
  onRemove,
  onBan,
  onAssignRole,
  userRole,
}: {
  people: Participant[];
  waitingParticipants: WsParticipant[];
  onAdmit: (userId: string) => void;
  onReject: (userId: string) => void;
  onRemove: (userId: string) => void;
  onBan: (userId: string) => void;
  onAssignRole: (userId: string, role: string) => void;
  userRole: string;
}) {
  const isHostUser = userRole.toUpperCase() === "HOST";
  const isCoHostUser = userRole.toUpperCase() === "CO_HOST";
  const isModeratorUser = userRole.toUpperCase() === "MODERATOR";
  const hasControlPrivileges = isHostUser || isCoHostUser || isModeratorUser;

  return (
    <div className="space-y-1 overflow-y-auto p-3">
      {/* Waiting Room Section */}
      {waitingParticipants.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-warning">
            Waiting Room ({waitingParticipants.length})
          </p>
          {waitingParticipants.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 px-2 py-2 mb-1">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-warning/20 text-xs font-semibold text-warning">
                {p.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-[10px] text-warning">Waiting to join</p>
              </div>
              {hasControlPrivileges && (
                <span className="flex items-center gap-1">
                  <button
                    onClick={() => onAdmit(p.id)}
                    title="Admit"
                    className="grid h-7 w-7 place-items-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    <FiUserCheck className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onReject(p.id)}
                    title="Reject"
                    className="grid h-7 w-7 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <FiUserX className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          ))}
          <hr className="my-3 border-border" />
        </div>
      )}
      {/* Active Participants */}
      {people.length > 0 && (
        <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          In Meeting ({people.length})
        </p>
      )}
      {people.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface/60 group">
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
            
            {isHostUser && !p.isYou && (
              <select
                value={(p.role || "PARTICIPANT").toUpperCase()}
                onChange={(e) => onAssignRole(p.id, e.target.value)}
                className="rounded border border-border bg-background text-[10px] text-muted-foreground outline-none px-1 py-0.5"
              >
                <option value="HOST">Host</option>
                <option value="CO_HOST">Co-Host</option>
                <option value="MODERATOR">Moderator</option>
                <option value="PARTICIPANT">Participant</option>
              </select>
            )}

            {hasControlPrivileges && !p.isYou && (
              <>
                <button
                  onClick={() => onRemove(p.id)}
                  title="Remove Participant"
                  className="hidden group-hover:grid h-6 w-6 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                >
                  <FiUserMinus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onBan(p.id)}
                  title="Ban Participant"
                  className="hidden group-hover:grid h-6 w-6 place-items-center rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                >
                  <FiUserX className="h-3 w-3" />
                </button>
              </>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

function FilesPanel() {
  const [fileItems, setFileItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    filesApi.getAll()
      .then((data: any[]) => {
        setFileItems(data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FiLoader className="h-6 w-6 animate-spin text-primary" />
        <p className="mt-2 text-xs text-muted-foreground">Loading files...</p>
      </div>
    );
  }

  const items = fileItems.length > 0 ? fileItems : [];

  return (
    <div className="space-y-2 overflow-y-auto p-3">
      {items.length === 0 ? (
        <div className="py-8 text-center">
          <FiFile className="mx-auto h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-xs text-muted-foreground">No shared files yet</p>
        </div>
      ) : (
        items.map((f: any) => (
          <a
            key={f.id}
            href={filesApi.getDownloadUrl(f.id)}
            download={f.originalName || f.filename}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 hover:bg-surface/60 transition-colors"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-surface text-primary">
              <FiFile className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{f.originalName || f.filename || "File"}</p>
              <p className="text-[11px] text-muted-foreground">
                {f.uploaderName || "You"} · {f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ""}
              </p>
            </div>
          </a>
        ))
      )}
    </div>
  );
}

function InfoPanel({ meeting, meetingCode, meetingLink }: { meeting: any; meetingCode: string; meetingLink: string }) {
  return (
    <div className="space-y-4 p-4 text-sm">
      <Info label="Meeting" value={meeting?.title || "Product Sync — Q3 Roadmap"} />
      <Info label="Room code" value={meetingCode} />
      <Info label="Host" value={meeting?.hostName || "Jordan Rivera"} />
      <Info label="Started" value={meeting?.actualStartTime ? new Date(meeting.actualStartTime).toLocaleTimeString() : "Live"} />
      <Info label="Link" value={meetingLink} />
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

function ShareDialog({ open, roomLink, onClose }: { open: boolean; roomLink: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(roomLink);
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
            <QrCode value={roomLink} size={180} />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Scan the QR code to join instantly, or share the link below.
          </p>
          <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3">
            <span className="flex-1 truncate text-sm">{roomLink}</span>
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

function AiPanel({ meetingId }: { meetingId: string }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");

  const askAi = async () => {
    if (!question.trim()) return;
    const userQ = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", text: userQ }]);
    setLoading(true);
    try {
      const res = await aiApi.ask(userQ, meetingId);
      setMessages(prev => [...prev, { role: "ai", text: res.answer || res.content || JSON.stringify(res) }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: "ai", text: `Error: ${e.message || "Failed to query AI"}` }]);
    } finally {
      setLoading(false);
    }
  };

  const getSummary = async () => {
    try {
      const res = await aiApi.getSummary(meetingId);
      setSummary(res.summary || res.content || "No summary available yet.");
      toast.success("AI Summary generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to load summary");
    }
  };

  const getTranscript = async () => {
    try {
      const res = await aiApi.getTranscript(meetingId);
      setTranscript(res.transcript || res.content || "No transcript compiled yet.");
      toast.success("Transcript retrieved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to load transcript");
    }
  };

  return (
    <div className="flex h-full flex-col p-4 text-xs space-y-4 overflow-y-auto">
      <div className="flex gap-2">
        <Button variant="glass" size="sm" onClick={getSummary} className="flex-1">Summary</Button>
        <Button variant="glass" size="sm" onClick={getTranscript} className="flex-1">Transcript</Button>
      </div>

      {summary && (
        <div className="rounded-xl border border-border bg-surface/30 p-3 space-y-1">
          <p className="font-semibold text-foreground">AI Meeting Summary</p>
          <p className="text-muted-foreground whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {transcript && (
        <div className="rounded-xl border border-border bg-surface/30 p-3 space-y-1">
          <p className="font-semibold text-foreground">Session Transcript</p>
          <p className="text-muted-foreground whitespace-pre-wrap">{transcript}</p>
        </div>
      )}

      <div className="flex-1 border-t border-border/40 pt-3 space-y-2 max-h-[160px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded-xl max-w-[85%] ${m.role === "user" ? "bg-gradient-primary text-primary-foreground ml-auto" : "bg-surface text-foreground"}`}>
            <p>{m.text}</p>
          </div>
        ))}
        {loading && <div className="text-muted-foreground animate-pulse">AI is typing...</div>}
      </div>

      <div className="flex gap-2 pt-2 border-t border-border/40">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask AI a question..."
          className="h-9 flex-1 rounded-lg border border-border bg-background px-2.5 outline-none focus:border-primary"
        />
        <Button size="sm" onClick={askAi} disabled={loading} className="cursor-pointer"><FiSend /></Button>
      </div>
    </div>
  );
}

function BreakoutPanel({ meetingId, people }: { meetingId: string; people: Participant[] }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, [meetingId]);

  const loadRooms = async () => {
    try {
      const list = await breakoutRoomsApi.getAll(meetingId);
      setRooms(list || []);
    } catch (_) {}
  };

  const createRoom = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      await breakoutRoomsApi.create(meetingId, { roomName });
      toast.success("Breakout room created!");
      setRoomName("");
      loadRooms();
    } catch (e: any) {
      toast.error(e.message || "Failed to create breakout room");
    } finally {
      setLoading(false);
    }
  };

  const endRoom = async (roomId: string) => {
    try {
      await breakoutRoomsApi.end(roomId);
      toast.success("Breakout room closed");
      loadRooms();
    } catch (e: any) {
      toast.error(e.message || "Failed to end breakout room");
    }
  };

  return (
    <div className="flex h-full flex-col p-4 text-xs space-y-4 overflow-y-auto">
      <div className="space-y-2">
        <p className="font-semibold text-foreground">Create Breakout Room</p>
        <div className="flex gap-2">
          <input
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room name (e.g. Brainstorm)"
            className="h-9 flex-1 rounded-lg border border-border bg-background px-2.5 outline-none focus:border-primary"
          />
          <Button size="sm" onClick={createRoom} disabled={loading} className="cursor-pointer">Add</Button>
        </div>
      </div>

      <div className="flex-1 space-y-3 pt-3 border-t border-border/40">
        <p className="font-semibold text-foreground">Active Breakout Rooms</p>
        {rooms.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No breakout rooms active</p>
        ) : (
          rooms.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-surface/30 p-3 flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold text-foreground">{r.roomName || r.name}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">Status: {r.status || "ACTIVE"}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => endRoom(r.id)} className="text-destructive hover:bg-destructive/10 cursor-pointer">End</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

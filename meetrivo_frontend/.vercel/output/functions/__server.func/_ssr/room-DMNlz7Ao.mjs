import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { q as FiLock, r as FiShare2, s as FiClock, t as FiMonitor, j as FiX, o as FiMic, u as FiMicOff, v as FiVideo, w as FiVideoOff, T as TbHandStop, x as FiSmile, y as FiUsers, z as FiMessageSquare, A as FiFile, C as FiCpu, D as FiGrid, E as FiInfo, h as FiLoader, G as FiPhoneOff, i as FiCheck, H as FiCopy, l as FiSend, I as FiUserCheck, J as FiUserX, K as FiUserMinus, L as FiWifi } from "../_libs/react-icons.mjs";
import { r as reactionEmojis } from "./mock-CVf8oAvI.mjs";
import { B as Button, c as cn } from "./button-ZuR0Bnki.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-XbEnPBIB.mjs";
import { Q as QrCode } from "./QrCode-BzUDxuvC.mjs";
import { u as useWebSocket } from "./useWebSocket-D1hTKb6K.mjs";
import { meetings, recordings, files, breakoutRooms, ai } from "./apiClient-Bx2sjVOE.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { A as AnimatePresence, m as motion } from "../_libs/framer-motion.mjs";
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
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
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
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
function RoomPage() {
  const [meetingCode, setMeetingCode] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get("code");
      if (codeParam) return codeParam;
      return localStorage.getItem("current_meeting_code") || "MTR-481-902";
    }
    return "MTR-481-902";
  });
  const [meeting, setMeeting] = reactExports.useState(null);
  const [micOn, setMicOn] = reactExports.useState(true);
  const [camOn, setCamOn] = reactExports.useState(true);
  const [sharing, setSharing] = reactExports.useState(false);
  const [handUp, setHandUp] = reactExports.useState(false);
  const [drawer, setDrawer] = reactExports.useState(null);
  const [showReactions, setShowReactions] = reactExports.useState(false);
  const [flying, setFlying] = reactExports.useState([]);
  const [shareOpen, setShareOpen] = reactExports.useState(false);
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [recordingId, setRecordingId] = reactExports.useState(null);
  const localStreamRef = reactExports.useRef(null);
  const peersRef = reactExports.useRef({});
  const [remoteStreams, setRemoteStreams] = reactExports.useState({});
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
    updateState
  } = useWebSocket(meeting?.meetingId || "", void 0, async (signal) => {
    await handleWebRTCSignal(signal);
  });
  waitingParticipants?.length || 0;
  reactExports.useEffect(() => {
    if (meetingCode) {
      meetings.searchByCode(meetingCode).then((res) => {
        if (res && res.length > 0) {
          setMeeting(res[0]);
        }
      }).catch(() => {
      });
    }
  }, [meetingCode]);
  reactExports.useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      localStreamRef.current = stream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = micOn;
      });
      stream.getVideoTracks().forEach((track) => {
        track.enabled = camOn;
      });
    }).catch((err) => {
      console.warn("Failed to capture local media devices:", err);
      toast.error("Camera/microphone access denied. Check browser permissions.");
    });
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, []);
  reactExports.useEffect(() => {
    if (connected) {
      updateState(micOn, camOn, sharing);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = micOn;
      });
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = camOn;
      });
    }
  }, [micOn, camOn, sharing, connected]);
  const handleWebRTCSignal = async (msg) => {
    const {
      type,
      senderId,
      payload
    } = msg;
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
  };
  const getOrCreatePeerConnection = (userId) => {
    if (peersRef.current[userId]) {
      return peersRef.current[userId];
    }
    const pc = new RTCPeerConnection({
      iceServers: [{
        urls: "stun:stun.l.google.com:19302"
      }]
    });
    peersRef.current[userId] = pc;
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal("ICE_CANDIDATE", userId, event.candidate);
      }
    };
    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [userId]: event.streams[0]
      }));
    };
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }
    return pc;
  };
  const initiateCall = (userId) => {
    const pc = getOrCreatePeerConnection(userId);
    pc.createOffer().then((offer) => pc.setLocalDescription(offer)).then(() => {
      sendSignal("OFFER", userId, pc.localDescription);
    }).catch((e) => console.error("Error creating WebRTC offer:", e));
  };
  reactExports.useEffect(() => {
    participants.forEach((p) => {
      if (!p.isYou && !peersRef.current[p.id]) {
        initiateCall(p.id);
      }
    });
  }, [participants]);
  const toggleSharing = async () => {
    if (!sharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) sender.replaceTrack(screenTrack);
        });
        screenTrack.onended = () => {
          setSharing(false);
          updateState(micOn, camOn, false);
        };
        setSharing(true);
        updateState(micOn, camOn, true);
      } catch (e) {
        console.warn("Screen share cancelled or denied");
      }
    } else {
      if (localStreamRef.current) {
        const camTrack = localStreamRef.current.getVideoTracks()[0];
        Object.values(peersRef.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender && camTrack) sender.replaceTrack(camTrack);
        });
      }
      setSharing(false);
      updateState(micOn, camOn, false);
    }
  };
  const toggleRecording = async () => {
    if (!meeting?.meetingId && !meeting?.id) {
      toast.error("Meeting not loaded yet");
      return;
    }
    const mId = meeting.meetingId || meeting.id;
    if (!isRecording) {
      try {
        const res = await recordings.start(mId);
        setRecordingId(res.id || res.recordingId);
        setIsRecording(true);
        toast.success("Recording started");
      } catch (e) {
        toast.error(e.message || "Failed to start recording");
      }
    } else {
      try {
        if (recordingId) await recordings.stop(recordingId);
        setRecordingId(null);
        setIsRecording(false);
        toast.success("Recording stopped and saved");
      } catch (e) {
        toast.error(e.message || "Failed to stop recording");
      }
    }
  };
  const endMeetingAndLeave = async () => {
    if (meeting?.meetingId || meeting?.id) {
      const mId = meeting.meetingId || meeting.id;
      try {
        await meetings.endMeeting(mId);
      } catch (_) {
      }
    }
    window.location.href = "/dashboard";
  };
  const sendReaction = (emoji) => {
    const id = Date.now() + Math.random();
    setFlying((f) => [...f, {
      id,
      emoji
    }]);
    setShowReactions(false);
    wsSendReaction(emoji);
    setTimeout(() => setFlying((f) => f.filter((x) => x.id !== id)), 2500);
  };
  const toggleHand = () => {
    const nextHand = !handUp;
    setHandUp(nextHand);
    sendHand(nextHand);
  };
  const activePeople = participants.length > 0 ? participants.map((p) => ({
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
  })) : [{
    id: "you",
    name: "You",
    initials: "ME",
    role: "Host",
    micOn,
    cameraOn: camOn,
    speaking: false,
    connection: "excellent",
    isYou: true
  }];
  const ROOM_LINK = typeof window !== "undefined" ? `${window.location.origin}/lobby?code=${meetingCode}` : `https://meetrivo.com/j/${meetingCode}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex h-screen w-full flex-col overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-w-0 items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-semibold", children: meeting?.title || "Product Sync — Q3 Roadmap" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success sm:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-1.5 animate-pulse rounded-full bg-success" }),
            " Live"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiLock, { className: "h-3 w-3 text-success" }),
          " ",
          meetingCode,
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline", children: [
            "· ",
            activePeople.length,
            " participants"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MeetingTimer, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "glass", size: "sm", onClick: () => setShareOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FiShare2, {}),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Invite" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex min-h-0 flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative flex-1 overflow-hidden px-3 pb-3 sm:px-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VideoGrid, { people: activePeople, localStream: localStreamRef.current, remoteStreams, youCam: camOn, youMic: micOn, sharing }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: flying.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { initial: {
          opacity: 0,
          y: 0,
          x: "50%",
          scale: 0.6
        }, animate: {
          opacity: 1,
          y: -260,
          scale: 1.4
        }, exit: {
          opacity: 0
        }, transition: {
          duration: 2.4,
          ease: "easeOut"
        }, className: "absolute bottom-4 left-1/2 text-4xl", children: f.emoji }, f.id)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: drawer && /* @__PURE__ */ jsxRuntimeExports.jsx(RoomDrawer, { kind: drawer, people: activePeople, waitingParticipants, messages, onSendMessage: sendMessage, onClose: () => setDrawer(null), meetingInfo: meeting, meetingCode, meetingLink: ROOM_LINK, userRole: activePeople.find((p) => p.isYou)?.role || "PARTICIPANT", onAdmit: async (userId) => {
        const mId = meeting?.meetingId || meeting?.id;
        if (!mId) return;
        try {
          await meetings.approveParticipant(mId, userId);
          setWaitingParticipants((prev) => prev.filter((p) => p.id !== userId));
          toast.success("Participant admitted");
        } catch (e) {
          toast.error(e.message || "Failed to admit");
        }
      }, onReject: async (userId) => {
        const mId = meeting?.meetingId || meeting?.id;
        if (!mId) return;
        try {
          await meetings.rejectParticipant(mId, userId);
          setWaitingParticipants((prev) => prev.filter((p) => p.id !== userId));
          toast.success("Participant rejected");
        } catch (e) {
          toast.error(e.message || "Failed to reject");
        }
      }, onRemove: async (userId) => {
        const mId = meeting?.meetingId || meeting?.id;
        if (!mId) return;
        try {
          await meetings.removeParticipant(mId, userId);
          toast.success("Participant removed");
        } catch (e) {
          toast.error(e.message || "Failed to remove");
        }
      }, onBan: async (userId) => {
        const mId = meeting?.meetingId || meeting?.id;
        if (!mId) return;
        try {
          await meetings.banParticipant(mId, userId);
          toast.success("Participant banned");
        } catch (e) {
          toast.error(e.message || "Failed to ban");
        }
      }, onAssignRole: async (userId, role) => {
        const mId = meeting?.meetingId || meeting?.id;
        if (!mId) return;
        try {
          await meetings.assignRole(mId, userId, role);
          toast.success(`Role updated to ${role}`);
        } catch (e) {
          toast.error(e.message || "Failed to assign role");
        }
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ControlDock, { micOn, camOn, sharing, handUp, drawer, showReactions, isRecording, waitingCount: waitingParticipants.length, onMic: () => setMicOn((v) => !v), onCam: () => setCamOn((v) => !v), onShare: toggleSharing, onHand: toggleHand, onReactions: () => setShowReactions((v) => !v), onSendReaction: sendReaction, onDrawer: (d) => setDrawer((cur) => cur === d ? null : d), onRecord: toggleRecording, onEnd: endMeetingAndLeave }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ShareDialog, { open: shareOpen, roomLink: ROOM_LINK, onClose: () => setShareOpen(false) })
  ] });
}
function MeetingTimer() {
  const [seconds, setSeconds] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1e3);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium tabular-nums", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FiClock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
    " ",
    mm,
    ":",
    ss
  ] });
}
function VideoGrid({
  people,
  localStream,
  remoteStreams,
  youCam,
  youMic,
  sharing
}) {
  const count = people.length;
  const cols = count <= 1 ? "grid-cols-1" : count <= 4 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3";
  if (sharing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col gap-3 lg:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiMonitor, { className: "mx-auto h-10 w-10 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm font-medium", children: "You are sharing your screen" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto lg:w-44 lg:flex-col lg:overflow-y-auto", children: people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-32 shrink-0 lg:w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantCard, { p: localized(p, youCam, youMic), stream: p.isYou ? localStream : remoteStreams[p.id], compact: true }) }, p.id)) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("grid h-full auto-rows-fr gap-3", cols), children: people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantCard, { p: localized(p, youCam, youMic), stream: p.isYou ? localStream : remoteStreams[p.id] }, p.id)) });
}
function localized(p, youCam, youMic) {
  if (!p.isYou) return p;
  return {
    ...p,
    cameraOn: youCam,
    micOn: youMic
  };
}
function ParticipantCard({
  p,
  stream,
  compact
}) {
  const videoRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (videoRef.current && stream && p.cameraOn) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, p.cameraOn]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { layout: true, whileHover: {
    scale: compact ? 1 : 1.01
  }, className: cn("group relative flex items-center justify-center overflow-hidden rounded-2xl border bg-gradient-surface transition-shadow", p.speaking ? "border-primary shadow-glow" : "border-border", compact ? "aspect-video" : "min-h-32"), children: [
    p.cameraOn && stream ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: p.isYou, className: "absolute inset-0 h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid place-items-center rounded-full bg-gradient-primary font-semibold text-primary-foreground", compact ? "h-9 w-9 text-xs" : "h-16 w-16 text-xl", p.speaking && "ring-2 ring-primary ring-offset-2 ring-offset-background"), children: p.initials }) }),
    p.handRaised && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-warning text-warning-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TbHandStop, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("truncate font-medium text-white", compact ? "text-[10px]" : "text-xs"), children: p.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Conn, { level: p.connection }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("grid place-items-center rounded-full p-1", p.micOn ? "text-foreground" : "bg-destructive/80 text-destructive-foreground"), children: p.micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, { className: "h-3 w-3 text-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, { className: "h-3 w-3 text-white" }) })
      ] })
    ] })
  ] });
}
function Conn({
  level
}) {
  const color = level === "excellent" ? "text-success" : level === "good" ? "text-warning" : "text-destructive";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(FiWifi, { className: cn("h-3 w-3", color), title: `${level} connection` });
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
  onEnd
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-30 flex justify-center px-3 pb-4 pt-1 sm:pb-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showReactions && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0,
      y: 10,
      scale: 0.9
    }, animate: {
      opacity: 1,
      y: 0,
      scale: 1
    }, exit: {
      opacity: 0,
      y: 10,
      scale: 0.9
    }, className: "glass absolute bottom-full mb-3 flex gap-1 rounded-2xl p-2", children: reactionEmojis.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onSendReaction(e), className: "grid h-10 w-10 place-items-center rounded-xl text-xl transition-transform hover:scale-125 active:scale-95", children: e }, e)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass flex items-center gap-1.5 rounded-2xl px-2.5 py-2 sm:gap-2 sm:px-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: micOn ? "Mute" : "Unmute", active: micOn, danger: !micOn, onClick: onMic, children: micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: camOn ? "Stop video" : "Start video", active: camOn, danger: !camOn, onClick: onCam, children: camOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideoOff, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Share screen", active: sharing, onClick: onShare, className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiMonitor, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: handUp ? "Lower hand" : "Raise hand", active: handUp, onClick: onHand, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TbHandStop, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Reactions", active: showReactions, onClick: onReactions, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiSmile, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-0.5 h-7 w-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DockBtn, { label: "Participants", active: drawer === "participants", onClick: () => onDrawer("participants"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiUsers, {}),
        waitingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-warning text-[9px] font-bold text-warning-foreground flex items-center justify-center px-0.5", children: waitingCount })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Chat", active: drawer === "chat", onClick: () => onDrawer("chat"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiMessageSquare, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Files", active: drawer === "files", onClick: () => onDrawer("files"), className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiFile, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "AI Assistant", active: drawer === "ai", onClick: () => onDrawer("ai"), className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiCpu, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Breakout Rooms", active: drawer === "breakout", onClick: () => onDrawer("breakout"), className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiGrid, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: "Info", active: drawer === "info", onClick: () => onDrawer("info"), className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiInfo, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-0.5 h-7 w-px bg-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DockBtn, { label: isRecording ? "Stop recording" : "Record", active: isRecording, danger: isRecording, onClick: onRecord, className: "hidden sm:flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: isRecording ? "animate-pulse" : "" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "icon", className: "rounded-xl", onClick: onEnd, "aria-label": "End meeting", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiPhoneOff, {}) })
    ] })
  ] });
}
function DockBtn({
  children,
  label,
  active,
  danger,
  onClick,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { whileTap: {
    scale: 0.88
  }, onClick, title: label, "aria-label": label, "aria-pressed": active, className: cn("grid h-10 w-10 place-items-center rounded-xl text-lg transition-colors sm:h-11 sm:w-11", danger ? "bg-destructive text-destructive-foreground" : active ? "bg-primary text-primary-foreground" : "bg-surface/70 text-foreground hover:bg-surface", className), children });
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
  userRole
}) {
  const titles = {
    chat: "Chat",
    participants: `Participants (${people.length})${waitingParticipants.length > 0 ? ` · ${waitingParticipants.length} waiting` : ""}`,
    files: "Shared files",
    info: "Meeting info",
    ai: "AI Assistant",
    breakout: "Breakout Rooms"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: {
      opacity: 0
    }, animate: {
      opacity: 1
    }, exit: {
      opacity: 0
    }, onClick: onClose, className: "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.aside, { initial: {
      x: "100%"
    }, animate: {
      x: 0
    }, exit: {
      x: "100%"
    }, transition: {
      type: "spring",
      damping: 30,
      stiffness: 300
    }, className: "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-card md:static md:z-auto md:my-0 md:w-80 md:max-w-none md:rounded-l-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold", children: titles[kind] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, "aria-label": "Close", className: "rounded-lg p-1.5 hover:bg-surface animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiX, {}) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-0 flex-1 overflow-y-auto", children: [
        kind === "chat" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChatPanel, { messages, onSend: onSendMessage }),
        kind === "participants" && /* @__PURE__ */ jsxRuntimeExports.jsx(ParticipantsPanel, { people, waitingParticipants, onAdmit, onReject, onRemove, onBan, onAssignRole, userRole }),
        kind === "files" && /* @__PURE__ */ jsxRuntimeExports.jsx(FilesPanel, {}),
        kind === "info" && /* @__PURE__ */ jsxRuntimeExports.jsx(InfoPanel, { meeting: meetingInfo, meetingCode, meetingLink }),
        kind === "ai" && /* @__PURE__ */ jsxRuntimeExports.jsx(AiPanel, { meetingId: meetingInfo?.id || meetingInfo?.meetingId || meetingCode }),
        kind === "breakout" && /* @__PURE__ */ jsxRuntimeExports.jsx(BreakoutPanel, { meetingId: meetingInfo?.id || meetingInfo?.meetingId || meetingCode, people })
      ] })
    ] })
  ] });
}
function ChatPanel({
  messages,
  onSend
}) {
  const [text, setText] = reactExports.useState("");
  const endRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);
  const send = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { initial: false, children: messages.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        y: 8
      }, animate: {
        opacity: 1,
        y: 0
      }, className: cn("flex gap-2", m.self && "flex-row-reverse"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-[10px] font-semibold", children: m.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("max-w-[75%]", m.self && "text-right"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: cn("inline-block rounded-2xl px-3 py-2 text-sm", m.self ? "bg-gradient-primary text-primary-foreground" : "bg-surface text-foreground"), children: m.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground", children: [
            m.self ? "" : `${m.author} · `,
            m.time
          ] })
        ] })
      ] }, m.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: endRef })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: text, onChange: (e) => setText(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), placeholder: "Type a message...", className: "h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", className: "rounded-xl", onClick: send, "aria-label": "Send", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiSend, {}) })
    ] })
  ] });
}
function ParticipantsPanel({
  people,
  waitingParticipants,
  onAdmit,
  onReject,
  onRemove,
  onBan,
  onAssignRole,
  userRole
}) {
  const isHostUser = userRole.toUpperCase() === "HOST";
  const isCoHostUser = userRole.toUpperCase() === "CO_HOST";
  const isModeratorUser = userRole.toUpperCase() === "MODERATOR";
  const hasControlPrivileges = isHostUser || isCoHostUser || isModeratorUser;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 overflow-y-auto p-3", children: [
    waitingParticipants.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-warning", children: [
        "Waiting Room (",
        waitingParticipants.length,
        ")"
      ] }),
      waitingParticipants.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-warning/20 bg-warning/5 px-2 py-2 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-warning/20 text-xs font-semibold text-warning", children: p.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-warning", children: "Waiting to join" })
        ] }),
        hasControlPrivileges && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onAdmit(p.id), title: "Admit", className: "grid h-7 w-7 place-items-center rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiUserCheck, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onReject(p.id), title: "Reject", className: "grid h-7 w-7 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiUserX, { className: "h-3.5 w-3.5" }) })
        ] })
      ] }, p.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("hr", { className: "my-3 border-border" })
    ] }),
    people.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: [
      "In Meeting (",
      people.length,
      ")"
    ] }),
    people.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-surface/60 group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground", children: p.initials }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "truncate text-sm font-medium", children: [
          p.name,
          " ",
          p.role && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            "· ",
            p.role
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] capitalize text-muted-foreground", children: [
          p.connection,
          " connection"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2 text-muted-foreground", children: [
        p.handRaised && /* @__PURE__ */ jsxRuntimeExports.jsx(TbHandStop, { className: "h-4 w-4 text-warning" }),
        p.micOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiMic, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiMicOff, { className: "h-4 w-4 text-destructive" }),
        p.cameraOn ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideo, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiVideoOff, { className: "h-4 w-4 text-destructive" }),
        isHostUser && !p.isYou && /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: (p.role || "PARTICIPANT").toUpperCase(), onChange: (e) => onAssignRole(p.id, e.target.value), className: "rounded border border-border bg-background text-[10px] text-muted-foreground outline-none px-1 py-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HOST", children: "Host" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "CO_HOST", children: "Co-Host" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "MODERATOR", children: "Moderator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "PARTICIPANT", children: "Participant" })
        ] }),
        hasControlPrivileges && !p.isYou && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onRemove(p.id), title: "Remove Participant", className: "hidden group-hover:grid h-6 w-6 place-items-center rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiUserMinus, { className: "h-3 w-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onBan(p.id), title: "Ban Participant", className: "hidden group-hover:grid h-6 w-6 place-items-center rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiUserX, { className: "h-3 w-3" }) })
        ] })
      ] })
    ] }, p.id))
  ] });
}
function FilesPanel() {
  const [fileItems, setFileItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    files.getAll().then((data) => {
      setFileItems(data || []);
    }).catch(() => {
    }).finally(() => setLoading(false));
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FiLoader, { className: "h-6 w-6 animate-spin text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Loading files..." })
    ] });
  }
  const items = fileItems.length > 0 ? fileItems : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 overflow-y-auto p-3", children: items.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FiFile, { className: "mx-auto h-8 w-8 text-muted-foreground/50" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "No shared files yet" })
  ] }) : items.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: files.getDownloadUrl(f.id), download: f.originalName || f.filename, className: "flex items-center gap-3 rounded-xl border border-border bg-background/50 p-3 hover:bg-surface/60 transition-colors", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-10 w-10 place-items-center rounded-lg bg-surface text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiFile, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm font-medium", children: f.originalName || f.filename || "File" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
        f.uploaderName || "You",
        " · ",
        f.createdAt ? new Date(f.createdAt).toLocaleDateString() : ""
      ] })
    ] })
  ] }, f.id)) });
}
function InfoPanel({
  meeting,
  meetingCode,
  meetingLink
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4 text-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Meeting", value: meeting?.title || "Product Sync — Q3 Roadmap" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Room code", value: meetingCode }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Host", value: meeting?.hostName || "Jordan Rivera" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Started", value: meeting?.actualStartTime ? new Date(meeting.actualStartTime).toLocaleTimeString() : "Live" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { label: "Link", value: meetingLink })
  ] });
}
function Info({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 break-words font-medium", children: value })
  ] });
}
function ShareDialog({
  open,
  roomLink,
  onClose
}) {
  const [copied, setCopied] = reactExports.useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Invite people" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-white p-3 shadow-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { value: roomLink, size: 180 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-muted-foreground", children: "Scan the QR code to join instantly, or share the link below." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full items-center gap-2 rounded-xl border border-border bg-background p-1.5 pl-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate text-sm", children: roomLink }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: copied ? "secondary" : "default", onClick: copy, children: [
          copied ? /* @__PURE__ */ jsxRuntimeExports.jsx(FiCheck, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(FiCopy, {}),
          copied ? "Copied" : "Copy"
        ] })
      ] })
    ] })
  ] }) });
}
function AiPanel({
  meetingId
}) {
  const [question, setQuestion] = reactExports.useState("");
  const [messages, setMessages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [summary, setSummary] = reactExports.useState("");
  const [transcript, setTranscript] = reactExports.useState("");
  const askAi = async () => {
    if (!question.trim()) return;
    const userQ = question;
    setQuestion("");
    setMessages((prev) => [...prev, {
      role: "user",
      text: userQ
    }]);
    setLoading(true);
    try {
      const res = await ai.ask(userQ, meetingId);
      setMessages((prev) => [...prev, {
        role: "ai",
        text: res.answer || res.content || JSON.stringify(res)
      }]);
    } catch (e) {
      setMessages((prev) => [...prev, {
        role: "ai",
        text: `Error: ${e.message || "Failed to query AI"}`
      }]);
    } finally {
      setLoading(false);
    }
  };
  const getSummary = async () => {
    try {
      const res = await ai.getSummary(meetingId);
      setSummary(res.summary || res.content || "No summary available yet.");
      toast.success("AI Summary generated!");
    } catch (e) {
      toast.error(e.message || "Failed to load summary");
    }
  };
  const getTranscript = async () => {
    try {
      const res = await ai.getTranscript(meetingId);
      setTranscript(res.transcript || res.content || "No transcript compiled yet.");
      toast.success("Transcript retrieved!");
    } catch (e) {
      toast.error(e.message || "Failed to load transcript");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col p-4 text-xs space-y-4 overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", size: "sm", onClick: getSummary, className: "flex-1", children: "Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "glass", size: "sm", onClick: getTranscript, className: "flex-1", children: "Transcript" })
    ] }),
    summary && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-surface/30 p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "AI Meeting Summary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground whitespace-pre-wrap", children: summary })
    ] }),
    transcript && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-surface/30 p-3 space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Session Transcript" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground whitespace-pre-wrap", children: transcript })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 border-t border-border/40 pt-3 space-y-2 max-h-[160px] overflow-y-auto", children: [
      messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-xl max-w-[85%] ${m.role === "user" ? "bg-gradient-primary text-primary-foreground ml-auto" : "bg-surface text-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: m.text }) }, i)),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground animate-pulse", children: "AI is typing..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2 border-t border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: question, onChange: (e) => setQuestion(e.target.value), placeholder: "Ask AI a question...", className: "h-9 flex-1 rounded-lg border border-border bg-background px-2.5 outline-none focus:border-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: askAi, disabled: loading, className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiSend, {}) })
    ] })
  ] });
}
function BreakoutPanel({
  meetingId,
  people
}) {
  const [rooms, setRooms] = reactExports.useState([]);
  const [roomName, setRoomName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    loadRooms();
  }, [meetingId]);
  const loadRooms = async () => {
    try {
      const list = await breakoutRooms.getAll(meetingId);
      setRooms(list || []);
    } catch (_) {
    }
  };
  const createRoom = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    try {
      await breakoutRooms.create(meetingId, {
        roomName
      });
      toast.success("Breakout room created!");
      setRoomName("");
      loadRooms();
    } catch (e) {
      toast.error(e.message || "Failed to create breakout room");
    } finally {
      setLoading(false);
    }
  };
  const endRoom = async (roomId) => {
    try {
      await breakoutRooms.end(roomId);
      toast.success("Breakout room closed");
      loadRooms();
    } catch (e) {
      toast.error(e.message || "Failed to end breakout room");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col p-4 text-xs space-y-4 overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Create Breakout Room" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: roomName, onChange: (e) => setRoomName(e.target.value), placeholder: "Room name (e.g. Brainstorm)", className: "h-9 flex-1 rounded-lg border border-border bg-background px-2.5 outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", onClick: createRoom, disabled: loading, className: "cursor-pointer", children: "Add" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 pt-3 border-t border-border/40", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: "Active Breakout Rooms" }),
      rooms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-center py-4", children: "No breakout rooms active" }) : rooms.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-surface/30 p-3 flex justify-between items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-foreground", children: r.roomName || r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground text-[10px] mt-0.5", children: [
            "Status: ",
            r.status || "ACTIVE"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => endRoom(r.id), className: "text-destructive hover:bg-destructive/10 cursor-pointer", children: "End" })
      ] }, r.id))
    ] })
  ] });
}
export {
  RoomPage as component
};

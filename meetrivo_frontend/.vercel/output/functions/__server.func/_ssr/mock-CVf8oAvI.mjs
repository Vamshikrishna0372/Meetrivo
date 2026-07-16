import { v as FiVideo, ap as FiCode, D as FiGrid, z as FiMessageSquare, ai as FiEdit3, aq as FiSmartphone } from "../_libs/react-icons.mjs";
const features = [
  {
    icon: FiVideo,
    title: "Video Collaboration",
    desc: "Crystal-clear HD video rooms designed for focused, distraction-free teamwork."
  },
  {
    icon: FiCode,
    title: "QR Meeting Join",
    desc: "Scan to join instantly. No links, no friction — just point and connect."
  },
  {
    icon: FiGrid,
    title: "Smart Workspace",
    desc: "Organize rooms, files, and threads in one calm, intelligent surface."
  },
  {
    icon: FiMessageSquare,
    title: "Realtime Chat",
    desc: "Persistent, threaded conversations that keep the whole team in sync."
  },
  {
    icon: FiEdit3,
    title: "Whiteboard",
    desc: "Sketch ideas together on an infinite, buttery-smooth canvas."
  },
  {
    icon: FiSmartphone,
    title: "Mobile-first Design",
    desc: "A premium experience built thumb-first for every screen size."
  }
];
const benefits = [
  { stat: "40%", label: "Faster sync-ups across distributed teams" },
  { stat: "12k+", label: "Meetings hosted every single week" },
  { stat: "99.9%", label: "Uptime with edge-optimized delivery" },
  { stat: "4.9/5", label: "Average rating from product teams" }
];
const reactionEmojis = ["👍", "❤️", "😂", "🎉", "👏", "🔥"];
const meetingTypes = [
  { id: "video", label: "Video meeting", desc: "HD video room for face-to-face collaboration." },
  { id: "audio", label: "Audio only", desc: "Lightweight voice room, easy on bandwidth." },
  { id: "webinar", label: "Webinar", desc: "One-to-many broadcast with managed stage." },
  { id: "workshop", label: "Workshop", desc: "Interactive room with whiteboard and breakouts." }
];
const privacyLevels = [
  { id: "open", label: "Open", desc: "Anyone with the link can join instantly." },
  { id: "locked", label: "Locked", desc: "Host admits each participant from a waiting list." },
  { id: "passcode", label: "Passcode", desc: "Guests must enter a passcode to enter." }
];
export {
  benefits as b,
  features as f,
  meetingTypes as m,
  privacyLevels as p,
  reactionEmojis as r
};

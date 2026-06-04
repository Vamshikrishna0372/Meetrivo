import {
  FiVideo,
  FiGrid,
  FiMessageSquare,
  FiEdit3,
  FiSmartphone,
  FiCode,
} from "react-icons/fi";

export const features = [
  {
    icon: FiVideo,
    title: "Video Collaboration",
    desc: "Crystal-clear HD video rooms designed for focused, distraction-free teamwork.",
  },
  {
    icon: FiCode,
    title: "QR Meeting Join",
    desc: "Scan to join instantly. No links, no friction — just point and connect.",
  },
  {
    icon: FiGrid,
    title: "Smart Workspace",
    desc: "Organize rooms, files, and threads in one calm, intelligent surface.",
  },
  {
    icon: FiMessageSquare,
    title: "Realtime Chat",
    desc: "Persistent, threaded conversations that keep the whole team in sync.",
  },
  {
    icon: FiEdit3,
    title: "Whiteboard",
    desc: "Sketch ideas together on an infinite, buttery-smooth canvas.",
  },
  {
    icon: FiSmartphone,
    title: "Mobile-first Design",
    desc: "A premium experience built thumb-first for every screen size.",
  },
];

export const benefits = [
  { stat: "40%", label: "Faster sync-ups across distributed teams" },
  { stat: "12k+", label: "Meetings hosted every single week" },
  { stat: "99.9%", label: "Uptime with edge-optimized delivery" },
  { stat: "4.9/5", label: "Average rating from product teams" },
];

export const upcomingMeetings = [
  {
    id: "u1",
    title: "Design Review — Mobile App",
    time: "2:30 PM",
    relative: "in 1h 20m",
    participants: 5,
    host: "Maya Chen",
  },
  {
    id: "u2",
    title: "Weekly Engineering Standup",
    time: "4:00 PM",
    relative: "in 2h 50m",
    participants: 9,
    host: "Alex Park",
  },
];

export const workspaceStatus = {
  name: "Meetrivo Team",
  plan: "Pro workspace",
  members: 24,
  online: 7,
  storageUsed: 62,
  activeRooms: 2,
};

export const recentMeetings = [
  {
    id: "m1",
    title: "Product Sync — Q3 Roadmap",
    date: "Today, 10:30 AM",
    duration: "48 min",
    participants: 6,
    status: "completed",
  },
  {
    id: "m2",
    title: "Design Critique",
    date: "Yesterday, 4:00 PM",
    duration: "32 min",
    participants: 4,
    status: "completed",
  },
  {
    id: "m3",
    title: "Onboarding — New Engineers",
    date: "Mon, 9:00 AM",
    duration: "55 min",
    participants: 9,
    status: "completed",
  },
  {
    id: "m4",
    title: "Marketing Standup",
    date: "Last Fri, 11:00 AM",
    duration: "21 min",
    participants: 5,
    status: "missed",
  },
];

export const notifications = [
  {
    id: "n1",
    title: "Alex invited you to “Q3 Roadmap”",
    time: "2 min ago",
    read: false,
    priority: "high",
  },
  {
    id: "n2",
    title: "Your meeting recording is ready",
    time: "1 hr ago",
    read: false,
    priority: "normal",
  },
  {
    id: "n3",
    title: "Maya commented on the whiteboard",
    time: "3 hrs ago",
    read: true,
    priority: "normal",
  },
  {
    id: "n4",
    title: "Weekly workspace digest",
    time: "Yesterday",
    read: true,
    priority: "low",
  },
];

export const activity = [
  { id: "a1", text: "You hosted Product Sync", time: "10:30 AM" },
  { id: "a2", text: "Maya joined your workspace", time: "9:12 AM" },
  { id: "a3", text: "Whiteboard “Flows” updated", time: "Yesterday" },
  { id: "a4", text: "Recording exported to drive", time: "Yesterday" },
];

export const currentUser = {
  name: "Jordan Rivera",
  email: "jordan@meetrivo.com",
  role: "Product Designer",
  initials: "JR",
  stats: {
    meetings: 142,
    hours: 318,
    workspaces: 6,
  },
};

export type Participant = {
  id: string;
  name: string;
  initials: string;
  role?: string;
  micOn: boolean;
  cameraOn: boolean;
  speaking: boolean;
  connection: "excellent" | "good" | "poor";
  handRaised?: boolean;
  isYou?: boolean;
};

export const participants: Participant[] = [
  { id: "p1", name: "You", initials: "JR", role: "Host", micOn: true, cameraOn: true, speaking: true, connection: "excellent", isYou: true },
  { id: "p2", name: "Maya Chen", initials: "MC", micOn: true, cameraOn: false, speaking: false, connection: "good" },
  { id: "p3", name: "Alex Park", initials: "AP", micOn: false, cameraOn: true, speaking: false, connection: "excellent", handRaised: true },
  { id: "p4", name: "Sofia Reyes", initials: "SR", micOn: true, cameraOn: true, speaking: false, connection: "poor" },
  { id: "p5", name: "Liam Novak", initials: "LN", micOn: false, cameraOn: false, speaking: false, connection: "good" },
  { id: "p6", name: "Priya Shah", initials: "PS", micOn: true, cameraOn: true, speaking: false, connection: "excellent" },
];

export type ChatMessage = {
  id: string;
  author: string;
  initials: string;
  text: string;
  time: string;
  self?: boolean;
  system?: boolean;
};

export const chatMessages: ChatMessage[] = [
  { id: "c1", author: "System", initials: "", text: "Meeting started", time: "10:30", system: true },
  { id: "c2", author: "Maya Chen", initials: "MC", text: "Morning everyone 👋", time: "10:31" },
  { id: "c3", author: "Alex Park", initials: "AP", text: "Sharing the roadmap deck now.", time: "10:32" },
  { id: "c4", author: "You", initials: "JR", text: "Perfect, thanks Alex!", time: "10:32", self: true },
  { id: "c5", author: "Sofia Reyes", initials: "SR", text: "Can everyone see my cursor?", time: "10:33" },
  { id: "c6", author: "You", initials: "JR", text: "Yep, looks great 🎯", time: "10:33", self: true },
];

export const autoReplies = [
  "Sounds good to me 👍",
  "Let me check and get back to you.",
  "Great point — noted.",
  "Can you share that file?",
  "I agree with that approach.",
];

export type SharedFile = {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc" | "sheet" | "zip";
  size: string;
  owner: string;
  time: string;
};

export const sharedFiles: SharedFile[] = [
  { id: "f1", name: "Q3-Roadmap.pdf", type: "pdf", size: "2.4 MB", owner: "Alex Park", time: "2m ago" },
  { id: "f2", name: "design-system.fig", type: "image", size: "8.1 MB", owner: "Maya Chen", time: "10m ago" },
  { id: "f3", name: "budget-2024.xlsx", type: "sheet", size: "640 KB", owner: "You", time: "1h ago" },
  { id: "f4", name: "meeting-notes.docx", type: "doc", size: "120 KB", owner: "Sofia Reyes", time: "1h ago" },
  { id: "f5", name: "assets.zip", type: "zip", size: "44 MB", owner: "Liam Novak", time: "Yesterday" },
];

export const analytics = [
  { label: "Meetings", value: 142, trend: "+12%", spark: [4, 6, 5, 8, 7, 10, 12] },
  { label: "Hours", value: 318, trend: "+8%", spark: [10, 12, 9, 14, 13, 16, 18] },
  { label: "Avg. attendance", value: 6.4, trend: "+3%", spark: [5, 5, 6, 6, 7, 6, 7] },
];

export const reactionEmojis = ["👍", "❤️", "😂", "🎉", "👏", "🔥"];

export const meetingTypes = [
  { id: "video", label: "Video meeting", desc: "HD video room for face-to-face collaboration." },
  { id: "audio", label: "Audio only", desc: "Lightweight voice room, easy on bandwidth." },
  { id: "webinar", label: "Webinar", desc: "One-to-many broadcast with managed stage." },
  { id: "workshop", label: "Workshop", desc: "Interactive room with whiteboard and breakouts." },
] as const;

export const privacyLevels = [
  { id: "open", label: "Open", desc: "Anyone with the link can join instantly." },
  { id: "locked", label: "Locked", desc: "Host admits each participant from a waiting list." },
  { id: "passcode", label: "Passcode", desc: "Guests must enter a passcode to enter." },
] as const;

/** Mock room directory used by the Join flow to "verify" a room id. */
export const knownRooms: Record<
  string,
  {
    title: string;
    host: string;
    privacy: "Open" | "Locked" | "Passcode";
    type: string;
    status: "live" | "starting" | "scheduled";
    participants: { initials: string }[];
  }
> = {
  "MTR-481-902": {
    title: "Product Sync — Q3 Roadmap",
    host: "Jordan Rivera",
    privacy: "Open",
    type: "Video meeting",
    status: "live",
    participants: [
      { initials: "JR" },
      { initials: "MC" },
      { initials: "AP" },
      { initials: "SR" },
    ],
  },
  "MTR-204-115": {
    title: "Design Review — Mobile App",
    host: "Maya Chen",
    privacy: "Locked",
    type: "Workshop",
    status: "starting",
    participants: [{ initials: "MC" }, { initials: "LN" }, { initials: "PS" }],
  },
};

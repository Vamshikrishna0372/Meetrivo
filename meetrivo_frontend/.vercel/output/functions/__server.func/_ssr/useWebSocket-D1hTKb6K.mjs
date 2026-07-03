import { r as reactExports } from "../_libs/react.mjs";
import { meetings } from "./apiClient-Bx2sjVOE.mjs";
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 1500;
function mapParticipants(list, currentUserId) {
  if (!list || !Array.isArray(list)) return [];
  return list.map((p) => {
    const pUserId = p.userId || p.id;
    return {
      id: pUserId,
      name: pUserId === currentUserId ? "You" : p.displayName || p.username || "Participant",
      initials: (p.displayName || p.username || "P").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
      role: p.role,
      micOn: !p.isMuted,
      cameraOn: p.isCameraEnabled !== false,
      speaking: false,
      connection: "excellent",
      handRaised: !!p.handRaised,
      isYou: pUserId === currentUserId
    };
  });
}
function useWebSocket(meetingId, onMessageReceived, onSignalReceived, onWhiteboardReceived) {
  const ws = reactExports.useRef(null);
  const [connected, setConnected] = reactExports.useState(false);
  const [messages, setMessages] = reactExports.useState([]);
  const [participants, setParticipants] = reactExports.useState([]);
  const [waitingParticipants, setWaitingParticipants] = reactExports.useState([]);
  const retryCount = reactExports.useRef(0);
  const retryTimer = reactExports.useRef(null);
  const destroyed = reactExports.useRef(false);
  const formatFrame = (command, headers, body) => {
    let frame = command + "\n";
    Object.entries(headers).forEach(([k, v]) => {
      frame += `${k}:${v}
`;
    });
    frame += "\n";
    if (body) frame += body;
    return frame + "\0";
  };
  const parseFrame = (raw) => {
    const nullIdx = raw.indexOf("\0");
    const data = nullIdx !== -1 ? raw.substring(0, nullIdx) : raw;
    const splitIdx = data.indexOf("\n\n");
    const head = splitIdx !== -1 ? data.substring(0, splitIdx) : data;
    const body = splitIdx !== -1 ? data.substring(splitIdx + 2) : "";
    const lines = head.split("\n");
    const command = lines[0];
    const headers = {};
    for (let i = 1; i < lines.length; i++) {
      const ci = lines[i].indexOf(":");
      if (ci !== -1) {
        headers[lines[i].substring(0, ci).trim()] = lines[i].substring(ci + 1).trim();
      }
    }
    return { command, headers, body };
  };
  const connect = reactExports.useCallback(() => {
    if (!meetingId || destroyed.current) return;
    const token = localStorage.getItem("meetrivo_token") || "";
    const userStr = localStorage.getItem("meetrivo_user") || "";
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user?.id || "";
    const BACKEND_URL = "https://meetrivo.onrender.com";
    const wsBase = BACKEND_URL.replace(/^https/, "wss").replace(/^http/, "ws");
    const serverId = String(Math.floor(Math.random() * 1e3)).padStart(3, "0");
    const sessionId = Math.random().toString(36).substring(2, 10);
    const wsUrl = `${wsBase}/ws/${serverId}/${sessionId}/websocket`;
    let socket;
    try {
      socket = new WebSocket(wsUrl);
    } catch (e) {
      console.warn("WebSocket connection failed:", e);
      scheduleReconnect();
      return;
    }
    ws.current = socket;
    socket.onopen = () => {
      const connectHeaders = {
        "accept-version": "1.1,1.2",
        "heart-beat": "10000,10000"
      };
      if (token) connectHeaders["Authorization"] = `Bearer ${token}`;
      socket.send(formatFrame("CONNECT", connectHeaders));
    };
    socket.onmessage = (event) => {
      let rawData = event.data;
      if (!rawData || rawData === "o" || rawData === "h") return;
      if (rawData.startsWith("a[")) {
        try {
          const arr = JSON.parse(rawData.substring(1));
          rawData = arr[0];
        } catch {
          return;
        }
      }
      if (rawData.startsWith("c[")) return;
      const frame = parseFrame(rawData);
      if (frame.command === "CONNECTED") {
        setConnected(true);
        retryCount.current = 0;
        socket.send(formatFrame("SUBSCRIBE", { id: "sub-chat", destination: `/topic/chat/${meetingId}` }));
        socket.send(formatFrame("SUBSCRIBE", { id: "sub-sig", destination: `/topic/signaling/${meetingId}` }));
        socket.send(formatFrame("SUBSCRIBE", { id: "sub-parts", destination: `/topic/participants/${meetingId}` }));
        socket.send(formatFrame("SUBSCRIBE", { id: "sub-meeting", destination: `/topic/meeting/${meetingId}` }));
        socket.send(formatFrame("SUBSCRIBE", { id: "sub-wb", destination: `/topic/whiteboard/${meetingId}` }));
        socket.send(formatFrame("SUBSCRIBE", { id: "sub-breakout", destination: `/topic/breakout/${meetingId}` }));
        socket.send(formatFrame("SEND", { destination: `/app/meeting/${meetingId}/join` }, ""));
        socket.send(formatFrame("SEND", {
          destination: `/app/meeting/${meetingId}/media/join`,
          "content-type": "application/json"
        }, "{}"));
        meetings.getParticipants(meetingId).then((data) => {
          setParticipants(mapParticipants(data, userId));
        }).catch(() => {
        });
        meetings.getWaitingRoom(meetingId).then((data) => {
          setWaitingParticipants(mapParticipants(data, userId));
        }).catch(() => {
        });
      } else if (frame.command === "MESSAGE") {
        const dest = frame.headers["destination"] || "";
        try {
          const body = JSON.parse(frame.body);
          if (dest.includes("/topic/chat/")) {
            if (body.eventType && !body.message && !body.id) return;
            const isSelf = body.senderId === userId;
            const messageText = body.message || body.content || "";
            if (!messageText) return;
            const newMsg = {
              id: body.id || String(Math.random()),
              author: body.senderName || (isSelf ? "You" : "Participant"),
              initials: (body.senderName || "P").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase(),
              text: messageText,
              time: new Date(body.timestamp || body.createdAt || Date.now()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              }),
              self: isSelf
            };
            setMessages((prev) => [...prev, newMsg]);
            if (onMessageReceived) ;
          } else if (dest.includes("/topic/signaling/")) {
            if (onSignalReceived) onSignalReceived(body);
          } else if (dest.includes("/topic/participants/")) {
            const eventType = body.eventType;
            const currentParts = body.payload?.currentParticipants;
            if (currentParts && Array.isArray(currentParts)) {
              setParticipants(mapParticipants(currentParts, userId));
            }
            if (eventType === "WAITING_ROOM_JOIN" && body.payload?.participant) {
              const p = body.payload.participant;
              const mappedPart = mapParticipants([p], userId)[0];
              if (mappedPart) {
                setWaitingParticipants((prev) => {
                  if (prev.some((x) => x.id === mappedPart.id)) return prev;
                  return [...prev, mappedPart];
                });
              }
            }
            if (eventType === "WAITING_ROOM_LEAVE" || eventType === "USER_JOINED" || eventType === "HOST_JOINED") {
              const evUserId = body.userId;
              if (evUserId) {
                setWaitingParticipants((prev) => prev.filter((x) => x.id !== evUserId));
              }
            }
          } else if (dest.includes("/topic/meeting/")) {
            const { eventType, userId: evUserId, payload } = body;
            if (eventType && evUserId) {
              setParticipants(
                (prev) => prev.map((p) => {
                  if (p.id !== evUserId) return p;
                  switch (eventType) {
                    case "VIDEO_ON":
                      return { ...p, cameraOn: true };
                    case "VIDEO_OFF":
                      return { ...p, cameraOn: false };
                    case "MIC_ON":
                      return { ...p, micOn: true };
                    case "MIC_OFF":
                      return { ...p, micOn: false };
                    case "HAND_RAISED":
                      return { ...p, handRaised: true };
                    case "HAND_LOWERED":
                      return { ...p, handRaised: false };
                    case "USER_LEFT": {
                      setParticipants((prev2) => prev2.filter((pt) => pt.id !== evUserId));
                      return p;
                    }
                    case "CONNECTION_STATE_CHANGED": {
                      const level = (payload?.connectionState || "").toLowerCase();
                      const conn = level === "connected" ? "excellent" : level === "reconnecting" ? "poor" : "good";
                      return { ...p, connection: conn };
                    }
                    default:
                      return p;
                  }
                })
              );
            }
          } else if (dest.includes("/topic/whiteboard/")) {
            if (onWhiteboardReceived) onWhiteboardReceived(body);
          }
        } catch (e) {
          console.error("Failed to parse WS message:", e);
        }
      } else if (frame.command === "ERROR") {
        console.error("STOMP broker error:", frame.body);
      }
    };
    socket.onclose = () => {
      setConnected(false);
      if (!destroyed.current) {
        scheduleReconnect();
      }
    };
    socket.onerror = () => {
      console.warn("WebSocket error — backend may not be running");
    };
  }, [meetingId, onMessageReceived, onSignalReceived]);
  const scheduleReconnect = reactExports.useCallback(() => {
    if (destroyed.current || retryCount.current >= MAX_RETRIES) return;
    retryCount.current += 1;
    const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount.current - 1);
    console.log(`WebSocket reconnecting in ${delay}ms (attempt ${retryCount.current}/${MAX_RETRIES})`);
    retryTimer.current = setTimeout(() => {
      if (!destroyed.current) connect();
    }, delay);
  }, [connect]);
  reactExports.useEffect(() => {
    if (!meetingId) return;
    destroyed.current = false;
    connect();
    return () => {
      destroyed.current = true;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      const socket = ws.current;
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        try {
          socket.send(formatFrame(
            "SEND",
            { destination: `/app/meeting/${meetingId}/media/leave`, "content-type": "application/json" },
            "{}"
          ));
          socket.send(formatFrame("SEND", { destination: `/app/meeting/${meetingId}/leave` }, ""));
        } catch (_) {
        }
        socket.close();
      }
    };
  }, [meetingId, connect]);
  const sendRaw = (destination, payload) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(
      `SEND
destination:${destination}
content-type:application/json

` + JSON.stringify(payload) + "\0"
    );
  };
  const sendMessage = (content) => sendRaw(`/app/chat/${meetingId}/message`, { message: content, receiverId: null });
  const sendReaction = (emoji) => {
    const emojiToType = {
      "👍": "THUMBS_UP",
      "❤️": "HEART",
      "😂": "LAUGH",
      "🎉": "CELEBRATE",
      "👏": "CLAP",
      "🔥": "FIRE"
    };
    sendRaw(`/app/chat/${meetingId}/reaction`, { type: emojiToType[emoji] || "CLAP" });
  };
  const sendHand = (raised) => sendRaw(`/app/meeting/${meetingId}/media/hand`, { enabled: raised });
  const sendSignal = (signalType, receiverId, payload) => sendRaw(`/app/meeting/${meetingId}/signaling`, {
    type: signalType,
    meetingId,
    receiverId,
    payload
  });
  const updateState = (micOn, camOn, screenShare) => {
    sendRaw(`/app/meeting/${meetingId}/state`, {
      isMuted: !micOn,
      isCameraEnabled: camOn,
      isScreenSharing: screenShare
    });
    sendRaw(`/app/meeting/${meetingId}/media/audio`, { enabled: micOn });
    sendRaw(`/app/meeting/${meetingId}/media/video`, { enabled: camOn });
    sendRaw(`/app/meeting/${meetingId}/media/screenshare`, { enabled: screenShare });
  };
  const sendWhiteboardEvent = (eventType, data) => sendRaw(`/app/whiteboard/${meetingId}/event`, { eventType, ...data });
  return {
    connected,
    messages,
    participants,
    waitingParticipants,
    setWaitingParticipants,
    sendMessage,
    sendReaction,
    sendHand,
    sendSignal,
    updateState,
    sendWhiteboardEvent
  };
}
export {
  useWebSocket as u
};

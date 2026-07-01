import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FiEdit2,
  FiSquare,
  FiCircle,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiMinus,
  FiSave,
} from "react-icons/fi";
import { BsEraser } from "react-icons/bs";
import { AppShell } from "@/layouts/AppShell";
import { cn } from "@/lib/utils";
import { whiteboard as whiteboardApi, auth } from "@/lib/apiClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

export const Route = createFileRoute("/whiteboard")({
  head: () => ({ meta: [{ title: "Whiteboard — Meetrivo" }] }),
  component: WhiteboardPage,
});

type Tool = "pen" | "eraser" | "rect" | "circle" | "line";
type Stroke = {
  tool: Tool;
  color: string;
  size: number;
  points: { x: number; y: number }[];
};

const COLORS = ["#8b8bff", "#ffffff", "#5cd6c0", "#ffd166", "#ff6b6b", "#c084fc"];

function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const drawing = useRef(false);
  const current = useRef<Stroke | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meetingId = typeof window !== "undefined"
    ? (localStorage.getItem("current_meeting_code") || "personal")
    : "personal";

  const { connected, sendWhiteboardEvent } = useWebSocket(
    meetingId,
    undefined,
    undefined,
    (event: any) => {
      const user = auth.getUser();
      if (event.senderId && user && event.senderId === user.id) return;
      if (event.eventType === "DRAW" && event.stroke) {
        setStrokes((prev) => [...prev, event.stroke]);
      } else if (event.eventType === "CLEAR") {
        setStrokes([]);
        setRedoStack([]);
      } else if (event.eventType === "UNDO") {
        setStrokes((s) => s.slice(0, -1));
      }
    }
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const all = current.current ? [...strokes, current.current] : strokes;
    for (const s of all) drawStroke(ctx, s);
  }, [strokes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx?.scale(dpr, dpr);
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [redraw]);

  useEffect(() => { redraw(); }, [redraw]);

  // Load saved whiteboard data
  useEffect(() => {
    if (!auth.isAuthenticated()) return;
    whiteboardApi.get(meetingId)
      .then((data: any) => {
        if (data?.strokes && Array.isArray(data.strokes)) {
          setStrokes(data.strokes);
        }
      })
      .catch(() => {});
  }, [meetingId]);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = {
      tool,
      color: tool === "eraser" ? "#1f1f2e" : color,
      size: tool === "eraser" ? size * 4 : size,
      points: [pos(e)],
    };
    setRedoStack([]);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !current.current) return;
    const p = pos(e);
    if (tool === "pen" || tool === "eraser") {
      current.current.points.push(p);
    } else {
      current.current.points = [current.current.points[0], p];
    }
    redraw();
  };

  const end = () => {
    if (current.current) {
      const newStrokes = [...strokes, current.current];
      setStrokes(newStrokes);

      if (connected) {
        sendWhiteboardEvent("DRAW", { stroke: current.current });
      }

      current.current = null;

      // Debounced auto-save
      if (auth.isAuthenticated()) {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          whiteboardApi.save(meetingId, { strokes: newStrokes })
            .catch(() => {});
        }, 1500);
      }
    }
    drawing.current = false;
  };

  const undo = () => {
    setStrokes((s) => {
      if (!s.length) return s;
      const last = s[s.length - 1];
      setRedoStack((r) => [...r, last]);
      return s.slice(0, -1);
    });
    if (connected) {
      sendWhiteboardEvent("UNDO", {});
    }
  };
  const redo = () => {
    setRedoStack((r) => {
      if (!r.length) return r;
      const last = r[r.length - 1];
      setStrokes((s) => [...s, last]);
      return r.slice(0, -1);
    });
  };
  const clear = () => {
    setStrokes([]);
    setRedoStack([]);
    if (connected) {
      sendWhiteboardEvent("CLEAR", {});
    }
    if (auth.isAuthenticated()) {
      whiteboardApi.save(meetingId, { strokes: [] }).catch(() => {});
    }
  };

  const saveNow = async () => {
    if (!auth.isAuthenticated()) {
      toast.error("Please log in to save");
      return;
    }
    try {
      await whiteboardApi.save(meetingId, { strokes });
      toast.success("Whiteboard saved!");
    } catch {
      toast.error("Failed to save whiteboard");
    }
  };

  const tools: { id: Tool; icon: typeof FiEdit2; label: string }[] = [
    { id: "pen", icon: FiEdit2, label: "Pen" },
    { id: "eraser", icon: BsEraser, label: "Eraser" },
    { id: "line", icon: FiMinus, label: "Line" },
    { id: "rect", icon: FiSquare, label: "Rectangle" },
    { id: "circle", icon: FiCircle, label: "Circle" },
  ];

  const actions: { icon: typeof FiEdit2; label: string; onClick: () => void; danger?: boolean }[] = [
    { icon: FiRotateCcw, label: "Undo", onClick: undo },
    { icon: FiRotateCw, label: "Redo", onClick: redo },
    { icon: FiSave, label: "Save", onClick: saveNow },
    { icon: FiTrash2, label: "Clear", onClick: clear, danger: true },
  ];

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-2xl font-bold sm:text-3xl">Whiteboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sketch ideas together on an infinite canvas.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#1f1f2e]">
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-[60vh] w-full touch-none"
          style={{
            backgroundImage:
              "radial-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />

        {/* Floating toolbar */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass absolute bottom-4 left-1/2 flex max-w-[95%] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-2xl p-2"
        >
          {tools.map((t) => (
            <ToolBtn key={t.id} active={tool === t.id} label={t.label} onClick={() => setTool(t.id)}>
              <t.icon />
            </ToolBtn>
          ))}
          <span className="mx-1 h-7 w-px bg-border" />
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
              className={cn(
                "h-6 w-6 rounded-full transition-transform hover:scale-110",
                color === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
          <span className="mx-1 h-7 w-px bg-border" />
          <input
            type="range"
            min={2}
            max={20}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-20 accent-primary"
            aria-label="Brush size"
          />
          <span className="mx-1 h-7 w-px bg-border" />
          {actions.map((a) => (
            <ToolBtn key={a.label} label={a.label} onClick={a.onClick} danger={a.danger}>
              <a.icon />
            </ToolBtn>
          ))}
        </motion.div>
      </div>
    </AppShell>
  );
}

function ToolBtn({
  children,
  label,
  active,
  danger,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg text-base transition-colors",
        danger
          ? "text-destructive hover:bg-destructive/15"
          : active
            ? "bg-primary text-primary-foreground"
            : "text-foreground hover:bg-surface",
      )}
    >
      {children}
    </motion.button>
  );
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const pts = s.points;
  if (!pts.length) return;

  if (s.tool === "pen" || s.tool === "eraser") {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    return;
  }
  if (pts.length < 2) return;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  if (s.tool === "line") {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  } else if (s.tool === "rect") {
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  } else if (s.tool === "circle") {
    const r = Math.hypot(b.x - a.x, b.y - a.y);
    ctx.beginPath();
    ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

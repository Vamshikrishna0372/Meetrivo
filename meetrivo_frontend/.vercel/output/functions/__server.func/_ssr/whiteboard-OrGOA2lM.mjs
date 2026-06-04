import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { F as FiEdit2, B as BsEraser, a as FiMinus, b as FiSquare, c as FiCircle, d as FiRotateCcw, e as FiRotateCw, f as FiTrash2 } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-aeN32L8H.mjs";
import { c as cn } from "./button-ZuR0Bnki.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./Logo-zcoi619J.mjs";
import "./mock-DMa3Iuce.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const COLORS = ["#8b8bff", "#ffffff", "#5cd6c0", "#ffd166", "#ff6b6b", "#c084fc"];
function WhiteboardPage() {
  const canvasRef = reactExports.useRef(null);
  const [tool, setTool] = reactExports.useState("pen");
  const [color, setColor] = reactExports.useState(COLORS[0]);
  const [size, setSize] = reactExports.useState(4);
  const [strokes, setStrokes] = reactExports.useState([]);
  const [redoStack, setRedoStack] = reactExports.useState([]);
  const drawing = reactExports.useRef(false);
  const current = reactExports.useRef(null);
  const redraw = reactExports.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const all = current.current ? [...strokes, current.current] : strokes;
    for (const s of all) drawStroke(ctx, s);
  }, [strokes]);
  reactExports.useEffect(() => {
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
  reactExports.useEffect(() => {
    redraw();
  }, [redraw]);
  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  const start = (e) => {
    e.target.setPointerCapture(e.pointerId);
    drawing.current = true;
    current.current = {
      tool,
      color: tool === "eraser" ? "#1f1f2e" : color,
      size: tool === "eraser" ? size * 4 : size,
      points: [pos(e)]
    };
    setRedoStack([]);
  };
  const move = (e) => {
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
      setStrokes((s) => [...s, current.current]);
      current.current = null;
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
  };
  const tools = [{
    id: "pen",
    icon: FiEdit2,
    label: "Pen"
  }, {
    id: "eraser",
    icon: BsEraser,
    label: "Eraser"
  }, {
    id: "line",
    icon: FiMinus,
    label: "Line"
  }, {
    id: "rect",
    icon: FiSquare,
    label: "Rectangle"
  }, {
    id: "circle",
    icon: FiCircle,
    label: "Circle"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Whiteboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Sketch ideas together on an infinite canvas." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-border bg-[#1f1f2e]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, onPointerDown: start, onPointerMove: move, onPointerUp: end, onPointerLeave: end, className: "h-[60vh] w-full touch-none", style: {
        backgroundImage: "radial-gradient(oklch(1 0 0 / 0.06) 1px, transparent 1px)",
        backgroundSize: "22px 22px"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        y: 16,
        opacity: 0
      }, animate: {
        y: 0,
        opacity: 1
      }, className: "glass absolute bottom-4 left-1/2 flex max-w-[95%] -translate-x-1/2 flex-wrap items-center justify-center gap-1.5 rounded-2xl p-2", children: [
        tools.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { active: tool === t.id, label: t.label, onClick: () => setTool(t.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(t.icon, {}) }, t.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-7 w-px bg-border" }),
        COLORS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setColor(c), "aria-label": `Color ${c}`, className: cn("h-6 w-6 rounded-full transition-transform hover:scale-110", color === c && "ring-2 ring-foreground ring-offset-2 ring-offset-background"), style: {
          backgroundColor: c
        } }, c)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-7 w-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: 2, max: 20, value: size, onChange: (e) => setSize(Number(e.target.value)), className: "w-20 accent-primary", "aria-label": "Brush size" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-1 h-7 w-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { label: "Undo", onClick: undo, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiRotateCcw, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { label: "Redo", onClick: redo, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiRotateCw, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBtn, { label: "Clear", onClick: clear, danger: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiTrash2, {}) })
      ] })
    ] })
  ] });
}
function ToolBtn({
  children,
  label,
  active,
  danger,
  onClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { whileTap: {
    scale: 0.88
  }, onClick, title: label, "aria-label": label, className: cn("grid h-9 w-9 place-items-center rounded-lg text-base transition-colors", danger ? "text-destructive hover:bg-destructive/15" : active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-surface"), children });
}
function drawStroke(ctx, s) {
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
export {
  WhiteboardPage as component
};

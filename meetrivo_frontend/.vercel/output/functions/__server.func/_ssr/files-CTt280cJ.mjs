import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { Q as FiUploadCloud, v as FiFile, R as FiArchive, S as FiGrid, U as FiFileText, V as FiImage, W as FiDownload } from "../_libs/react-icons.mjs";
import { A as AppShell } from "./AppShell-aeN32L8H.mjs";
import { R as Reveal } from "./Reveal-BMHqWXWG.mjs";
import { c as cn, B as Button } from "./button-ZuR0Bnki.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-XbEnPBIB.mjs";
import { s as sharedFiles } from "./mock-DMa3Iuce.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
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
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      className: `flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-14 text-center ${className ?? ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-14 w-14 place-items-center rounded-2xl bg-surface text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: title }),
        description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-xs text-sm text-muted-foreground", children: description }),
        action && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "glass", size: "sm", className: "mt-2", onClick: action.onClick, children: [
          action.icon,
          action.label
        ] })
      ]
    }
  );
}
const iconFor = {
  pdf: FiFileText,
  image: FiImage,
  doc: FiFileText,
  sheet: FiGrid,
  zip: FiArchive
};
function FilesPage() {
  const [files, setFiles] = reactExports.useState(sharedFiles);
  const [uploads, setUploads] = reactExports.useState([]);
  const [dragging, setDragging] = reactExports.useState(false);
  const [preview, setPreview] = reactExports.useState(null);
  const simulateUpload = reactExports.useCallback((name) => {
    const id = `up-${Date.now()}-${Math.random()}`;
    setUploads((u) => [...u, {
      id,
      name,
      progress: 0
    }]);
    const interval = setInterval(() => {
      setUploads((u) => u.map((x) => x.id === id ? {
        ...x,
        progress: Math.min(100, x.progress + 12)
      } : x));
    }, 220);
    setTimeout(() => {
      clearInterval(interval);
      setUploads((u) => u.filter((x) => x.id !== id));
      setFiles((f) => [{
        id,
        name,
        type: guessType(name),
        size: `${(Math.random() * 5 + 0.2).toFixed(1)} MB`,
        owner: "You",
        time: "Just now"
      }, ...f]);
    }, 2200);
  }, []);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) dropped.forEach((f) => simulateUpload(f.name));
    else simulateUpload(`upload-${Date.now()}.pdf`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Reveal, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold sm:text-3xl", children: "Files" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Share and manage your workspace files." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { onDragOver: (e) => {
        e.preventDefault();
        setDragging(true);
      }, onDragLeave: () => setDragging(false), onDrop, className: cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors", dragging ? "border-primary bg-primary/5" : "border-border bg-card/40 hover:bg-card/70"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(motion.span, { animate: {
          y: dragging ? -4 : 0
        }, className: "grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FiUploadCloud, { className: "h-6 w-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Drop files here or click to upload" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "PDF, images, docs up to 50 MB" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", multiple: true, className: "hidden", onChange: (e) => {
          Array.from(e.target.files ?? []).forEach((f) => simulateUpload(f.name));
          e.target.value = "";
        } })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: uploads.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: {
        opacity: 0,
        height: 0
      }, animate: {
        opacity: 1,
        height: "auto"
      }, exit: {
        opacity: 0,
        height: 0
      }, className: "rounded-xl border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: u.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            u.progress,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-1.5 overflow-hidden rounded-full bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "h-full rounded-full bg-gradient-primary", animate: {
          width: `${u.progress}%`
        } }) })
      ] }, u.id)) }),
      files.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: FiFile, title: "No files yet", description: "Upload a file to start collaborating with your team." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: files.map((f, i) => {
        const Icon = iconFor[f.type];
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Reveal, { delay: i * 0.04, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.button, { whileHover: {
          y: -3
        }, onClick: () => setPreview(f), className: "flex w-full flex-col rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-soft", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 truncate text-sm font-semibold", children: f.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 text-xs text-muted-foreground", children: [
            f.size,
            " · ",
            f.owner
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-[11px] text-muted-foreground", children: f.time })
        ] }) }, f.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!preview, onOpenChange: (o) => !o && setPreview(null), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { className: "max-w-md", children: preview && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "truncate", children: preview.name }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex aspect-video items-center justify-center rounded-xl bg-surface/50", children: (() => {
        const Icon = iconFor[preview.type];
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-16 w-16 text-primary" });
      })() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { label: "Type", value: preview.type.toUpperCase() }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { label: "Size", value: preview.size }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { label: "Owner", value: preview.owner }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { label: "Added", value: preview.time })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FiDownload, {}),
        " Download"
      ] })
    ] }) }) })
  ] });
}
function Meta({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-surface/40 p-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 font-medium", children: value })
  ] });
}
function guessType(name) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "fig", "svg", "webp"].includes(ext)) return "image";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (["doc", "docx", "txt"].includes(ext)) return "doc";
  return "pdf";
}
export {
  FilesPage as component
};

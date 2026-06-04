import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiUploadCloud,
  FiFile,
  FiFileText,
  FiImage,
  FiGrid,
  FiArchive,
  FiDownload,
  FiX,
} from "react-icons/fi";
import { AppShell } from "@/layouts/AppShell";
import { Reveal } from "@/components/shared/Reveal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sharedFiles, type SharedFile } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/files")({
  head: () => ({ meta: [{ title: "Files — Meetrivo" }] }),
  component: FilesPage,
});

const iconFor: Record<SharedFile["type"], typeof FiFile> = {
  pdf: FiFileText,
  image: FiImage,
  doc: FiFileText,
  sheet: FiGrid,
  zip: FiArchive,
};

type Uploading = { id: string; name: string; progress: number };

function FilesPage() {
  const [files, setFiles] = useState<SharedFile[]>(sharedFiles);
  const [uploads, setUploads] = useState<Uploading[]>([]);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<SharedFile | null>(null);

  const simulateUpload = useCallback((name: string) => {
    const id = `up-${Date.now()}-${Math.random()}`;
    setUploads((u) => [...u, { id, name, progress: 0 }]);
    const interval = setInterval(() => {
      setUploads((u) =>
        u.map((x) => (x.id === id ? { ...x, progress: Math.min(100, x.progress + 12) } : x)),
      );
    }, 220);
    setTimeout(() => {
      clearInterval(interval);
      setUploads((u) => u.filter((x) => x.id !== id));
      setFiles((f) => [
        {
          id,
          name,
          type: guessType(name),
          size: `${(Math.random() * 5 + 0.2).toFixed(1)} MB`,
          owner: "You",
          time: "Just now",
        },
        ...f,
      ]);
    }, 2200);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) dropped.forEach((f) => simulateUpload(f.name));
    else simulateUpload(`upload-${Date.now()}.pdf`);
  };

  return (
    <AppShell>
      <Reveal>
        <h1 className="text-2xl font-bold sm:text-3xl">Files</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share and manage your workspace files.
        </p>
      </Reveal>

      <div className="mt-6 space-y-6">
        {/* Drop zone */}
        <Reveal>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border bg-card/40 hover:bg-card/70",
            )}
          >
            <motion.span
              animate={{ y: dragging ? -4 : 0 }}
              className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground"
            >
              <FiUploadCloud className="h-6 w-6" />
            </motion.span>
            <p className="font-semibold">Drop files here or click to upload</p>
            <p className="text-sm text-muted-foreground">PDF, images, docs up to 50 MB</p>
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                Array.from(e.target.files ?? []).forEach((f) => simulateUpload(f.name));
                e.target.value = "";
              }}
            />
          </label>
        </Reveal>

        {/* Active uploads */}
        <AnimatePresence>
          {uploads.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="truncate">{u.name}</span>
                <span className="text-muted-foreground">{u.progress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                <motion.div
                  className="h-full rounded-full bg-gradient-primary"
                  animate={{ width: `${u.progress}%` }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Grid */}
        {files.length === 0 ? (
          <EmptyState
            icon={FiFile}
            title="No files yet"
            description="Upload a file to start collaborating with your team."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {files.map((f, i) => {
              const Icon = iconFor[f.type];
              return (
                <Reveal key={f.id} delay={i * 0.04}>
                  <motion.button
                    whileHover={{ y: -3 }}
                    onClick={() => setPreview(f)}
                    className="flex w-full flex-col rounded-2xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-soft"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="mt-3 truncate text-sm font-semibold">{f.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {f.size} · {f.owner}
                    </p>
                    <p className="mt-3 text-[11px] text-muted-foreground">{f.time}</p>
                  </motion.button>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-md">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="truncate">{preview.name}</DialogTitle>
              </DialogHeader>
              <div className="flex aspect-video items-center justify-center rounded-xl bg-surface/50">
                {(() => {
                  const Icon = iconFor[preview.type];
                  return <Icon className="h-16 w-16 text-primary" />;
                })()}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Meta label="Type" value={preview.type.toUpperCase()} />
                <Meta label="Size" value={preview.size} />
                <Meta label="Owner" value={preview.owner} />
                <Meta label="Added" value={preview.time} />
              </div>
              <Button className="w-full">
                <FiDownload /> Download
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface/40 p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-medium">{value}</p>
    </div>
  );
}

function guessType(name: string): SharedFile["type"] {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "fig", "svg", "webp"].includes(ext)) return "image";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (["doc", "docx", "txt"].includes(ext)) return "doc";
  return "pdf";
}

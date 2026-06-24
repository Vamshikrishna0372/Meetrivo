import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiUploadCloud,
  FiFile,
  FiFileText,
  FiImage,
  FiGrid,
  FiArchive,
  FiDownload,
  FiLoader,
  FiTrash2,
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
import { cn } from "@/lib/utils";
import { files as filesApi, auth } from "@/lib/apiClient";
import { toast } from "sonner";

export const Route = createFileRoute("/files")({
  head: () => ({ meta: [{ title: "Files — Meetrivo" }] }),
  component: FilesPage,
});

type FileType = "pdf" | "image" | "doc" | "sheet" | "zip";

const iconFor: Record<FileType, typeof FiFile> = {
  pdf: FiFileText,
  image: FiImage,
  doc: FiFileText,
  sheet: FiGrid,
  zip: FiArchive,
};

type FileItem = {
  id: string;
  name: string;
  type: FileType;
  size: string;
  owner: string;
  time: string;
  downloadUrl?: string;
};

type Uploading = { id: string; name: string; progress: number };

function guessType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "fig", "svg", "webp"].includes(ext)) return "image";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["zip", "rar", "7z"].includes(ext)) return "zip";
  if (["doc", "docx", "txt"].includes(ext)) return "doc";
  return "pdf";
}

function formatSize(bytes?: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilesPage() {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [uploads, setUploads] = useState<Uploading[]>([]);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = auth.isAuthenticated();

  const fetchFiles = useCallback(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    filesApi.getAll()
      .then((data: any[]) => {
        const mapped: FileItem[] = (data || []).map((f: any) => ({
          id: f.id,
          name: f.originalName || f.filename || "Unknown file",
          type: guessType(f.originalName || f.filename || ""),
          size: formatSize(f.fileSize || f.size),
          owner: f.uploaderName || f.uploader || "You",
          time: f.createdAt ? new Date(f.createdAt).toLocaleString() : "Just now",
          downloadUrl: filesApi.getDownloadUrl(f.id),
        }));
        setFileItems(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const uploadFile = useCallback(async (file: File) => {
    const id = `up-${Date.now()}-${Math.random()}`;
    setUploads((u) => [...u, { id, name: file.name, progress: 0 }]);

    let prog = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + 15, 85);
      setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: prog } : x)));
    }, 200);

    try {
      await filesApi.upload(file);
      clearInterval(interval);
      setUploads((u) => u.map((x) => (x.id === id ? { ...x, progress: 100 } : x)));
      setTimeout(() => {
        setUploads((u) => u.filter((x) => x.id !== id));
        fetchFiles();
      }, 800);
      toast.success(`${file.name} uploaded successfully`);
    } catch (err: any) {
      clearInterval(interval);
      setUploads((u) => u.filter((x) => x.id !== id));
      toast.error(err.message || "Upload failed");
    }
  }, [fetchFiles]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const deleteFile = async (fileId: string) => {
    try {
      await filesApi.delete(fileId);
      setFileItems((f) => f.filter((x) => x.id !== fileId));
      setPreview(null);
      toast.success("File deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file");
    }
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
        <Reveal>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
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
                Array.from(e.target.files ?? []).forEach(uploadFile);
                e.target.value = "";
              }}
            />
          </label>
        </Reveal>

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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FiLoader className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading files...</p>
          </div>
        ) : fileItems.length === 0 ? (
          <EmptyState
            icon={FiFile}
            title="No files yet"
            description="Upload a file to start collaborating with your team."
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fileItems.map((f, i) => {
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
              <div className="flex gap-2">
                {preview.downloadUrl ? (
                  <a
                    href={preview.downloadUrl}
                    download={preview.name}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
                  >
                    <FiDownload className="h-4 w-4" /> Download
                  </a>
                ) : (
                  <Button className="flex-1" disabled>
                    <FiDownload /> Download
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => preview && deleteFile(preview.id)}
                >
                  <FiTrash2 />
                </Button>
              </div>
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

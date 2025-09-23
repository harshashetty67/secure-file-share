import { useCallback, useRef, useState } from "react";
import "../styles/UploadPanel.css";

type QueueItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  status: "queued" | "uploading" | "done" | "error";
  progress: number; // 0–100
  error?: string;
};

type Props = {
  onUploaded?: () => void; // called after ALL uploads finish (success or fail)
  uploadFn: (file: File, onProgress: (pct: number) => void) => Promise<void>;
};

export default function UploadPanel({ uploadFn, onUploaded }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isDragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files || !files.length) return;
    const items: QueueItem[] = Array.from(files).map((f) => ({
      id: `${f.name}-${f.size}-${crypto.randomUUID()}`,
      file: f,
      name: f.name,
      size: f.size,
      status: "queued",
      progress: 0,
    }));
    setQueue((prev) => [...prev, ...items]);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  function removeFromQueue(id: string) {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  function clearQueue() {
    if (busy) return;
    setQueue([]);
  }

  async function startUpload() {
    if (!queue.length || busy) return;
    setBusy(true);
    try {
      for (const item of queue) {
        setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "uploading", progress: 0 } : q)));
        const onProgress = (pct: number) => {
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, progress: pct } : q)));
        };
        try {
          await uploadFn(item.file, onProgress);
          setQueue((prev) => prev.map((q) => (q.id === item.id ? { ...q, status: "done", progress: 100 } : q)));
        } catch (e: any) {
          setQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, status: "error", error: e?.message || "Upload failed" } : q))
          );
        }
      }
    } finally {
      setBusy(false);
      onUploaded?.();
    }
  }

  const queuedCount = queue.filter((q) => q.status === "queued").length;
  const hasAnything = queue.length > 0;

  return (
    <div className="up">
      <div
        className={`up__drop ${isDragging ? "up__drop--drag" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="up__icon">⬆️</div>
        <div className="up__text">
          <strong>Drag & drop</strong> files here, or click to browse
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={(e) => addFiles(e.target.files)}
          className="up__input"
        />
      </div>

      {hasAnything && (
        <>
          <div className="up__list">
            {queue.map((it) => (
              <div className={`up__row up__row--${it.status}`} key={it.id}>
                <div className="up__meta">
                  <div className="up__name">{it.name}</div>
                  <div className="up__size small">{formatBytes(it.size)}</div>
                </div>

                <div className="up__status small">
                  {it.status === "queued" && "Queued"}
                  {it.status === "uploading" && `${Math.round(it.progress)}%`}
                  {it.status === "done" && "Done"}
                  {it.status === "error" && <span className="up__err">{it.error}</span>}
                </div>

                <div className="up__bar">
                  <div className="up__barFill" style={{ width: `${it.progress}%` }} />
                </div>

                {it.status === "queued" && (
                  <button className="up__remove" onClick={() => removeFromQueue(it.id)} aria-label="Remove">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="up__actions">
            <button className="btn btn--ghost" onClick={clearQueue} disabled={busy}>Clear</button>
            <div className="up__spacer" />
            <button className="btn" onClick={startUpload} disabled={busy || queuedCount === 0}>
              {busy ? "Uploading…" : `Upload ${queuedCount} file${queuedCount > 1 ? "s" : ""}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}
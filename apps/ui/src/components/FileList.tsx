import { useState } from "react";
import { toast } from "sonner";
import { FileText, Image as ImageIcon, FileArchive, File as FileIcon } from "lucide-react";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/FileList.css";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  shared?: boolean;
};

type Props = {
  files: FileItem[];
  onShare: (file: FileItem) => void;
  onRefresh?: () => void;
  onDelete: (objectKey: string) => Promise<{ ok: boolean; revokedShares: number }>;
};

export default function FileList({ files, onShare, onRefresh, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FileItem | null>(null);

  async function confirmDelete() {
    if (!pendingDelete) return;
    const file = pendingDelete;
    try {
      setDeleting(file.id);
      const result = await onDelete(file.id);
      setPendingDelete(null);
      const extra = result?.revokedShares
        ? ` · revoked ${result.revokedShares} share${result.revokedShares === 1 ? "" : "s"}`
        : "";
      toast.success(`Deleted "${file.name}"${extra}`);
      onRefresh?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete file");
    } finally {
      setDeleting(null);
    }
  }

  if (!files.length) {
    return (
      <div className="fl__empty">
        <p className="small">No files yet — upload something to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="fl__header">
        <span className="fl__label">Recent files</span>
        <span className="fl__count">{files.length} file{files.length === 1 ? "" : "s"}</span>
      </div>
      <div className="fl">
        {files.map((f, idx) => {
          const sage = idx % 2 === 1;
          return (
            <div className="fl__row" key={f.id}>
              <div className={`fl__icon ${sage ? "fl__icon--sage" : ""}`}>
                {iconFor(f.name)}
              </div>
              <div className="fl__info">
                <div className="fl__name">{f.name}</div>
                <div className="fl__meta">
                  {formatBytes(f.size)} · {formatWhen(f.uploadedAt)}
                </div>
              </div>
              <div className="fl__actions">
                {f.shared && <span className="pill-badge">Shared</span>}
                <button className="btn btn--sm" onClick={() => onShare(f)}>Share</button>
                <button
                  className="btn btn--danger btn--sm"
                  onClick={() => setPendingDelete(f)}
                  disabled={deleting === f.id}
                >
                  {deleting === f.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {onRefresh && (
        <div className="fl__refresh">
          <button className="btn btn--ghost btn--sm" onClick={onRefresh}>Refresh</button>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this file?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed and any active shares for it revoked.`
            : ""
        }
        confirmLabel="Delete"
        cancelLabel="Keep"
        tone="danger"
        busy={!!deleting}
        onConfirm={confirmDelete}
        onCancel={() => (!deleting) && setPendingDelete(null)}
      />
    </div>
  );
}

function iconFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const size = 18;
  const sw = 2.75;
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return <ImageIcon size={size} strokeWidth={sw} />;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return <FileArchive size={size} strokeWidth={sw} />;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return <FileText size={size} strokeWidth={sw} />;
  return <FileIcon size={size} strokeWidth={sw} />;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

function formatWhen(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

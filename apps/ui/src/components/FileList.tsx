import { useState } from "react";
import "../styles/FileList.css";

export type FileItem = {
  id: string;
  name: string;
  size: number;
  uploadedAt: string; // ISO
};

type Props = {
  files: FileItem[];
  onShare: (file: FileItem) => void;
  onRefresh?: () => void;
  onDelete: (objectKey: string) => Promise<void>;
};

export default function FileList({ files, onShare, onRefresh, onDelete }: Props) {
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!files.length) {
    return (
      <div className="fl__empty">
        <p className="small">No files yet — upload something to get started.</p>
      </div>
    );
  }

  async function handleDelete(file: FileItem) {
    if (!confirm(`Delete "${file.name}"? This will also revoke any active shares for this file.`)) {
      return;
    }

    try {
      setDeleting(file.id);
      await onDelete(file.id);
      onRefresh?.();
    } catch (e: any) {
      alert(e?.message || "Failed to delete file");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="fl">
      {files.map((f) => (
        <div className="fl__row" key={f.id}>
          <div className="fl__info">
            <div className="fl__name">{f.name}</div>
            <div className="fl__meta small">
              {formatBytes(f.size)} • {new Date(f.uploadedAt).toLocaleString()}
            </div>
          </div>
          <div className="fl__actions">
            <button className="btn btn--ghost" onClick={() => onShare(f)}>Create share</button>
            <button 
              className="btn fl__delete" 
              onClick={() => handleDelete(f)}
              disabled={deleting === f.id}
            >
              {deleting === f.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
      {onRefresh && (
        <div className="fl__refresh">
          <button className="btn btn--ghost" onClick={onRefresh}>Refresh</button>
        </div>
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

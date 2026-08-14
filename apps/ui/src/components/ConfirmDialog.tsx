import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import "../styles/ConfirmDialog.css";

type Props = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open, title, message,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  tone = "default", busy = false,
  onConfirm, onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter" && !busy) onConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onConfirm, onCancel]);

  if (!open) return null;

  return (
    <div className="cd__overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="cd__sheet" onClick={(e) => e.stopPropagation()}>
        <div className={`cd__ic cd__ic--${tone}`}>
          <AlertTriangle size={20} strokeWidth={2.75} />
        </div>
        <h3 className="cd__title">{title}</h3>
        <p className="cd__msg">{message}</p>
        <div className="cd__actions">
          <button className="btn btn--ghost btn--sm" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            className={`btn btn--sm ${tone === "danger" ? "cd__confirm--danger" : ""}`}
            onClick={onConfirm}
            disabled={busy}
            autoFocus
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

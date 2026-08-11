import { useState } from "react";
import { toast } from "sonner";
import { Share2 } from "lucide-react";
import "../styles/ShareList.css";

export type ShareItem = {
  id: string;
  fileName: string;
  url: string;
  expiresAt: string;
  remainingDownloads?: number;
  status: string;
};

type PublicLinkData = {
  shareId: string;
  fileName: string;
  downloadUrl: string;
  expiresInSeconds: number;
  generatedAt: number;
};

type Props = {
  shares: ShareItem[];
  onCopy: (url: string) => void;
  onRevoke: (id: string) => void;
  onRefresh?: () => void;
  onGetDownloadUrl: (shareId: string) => Promise<{ downloadUrl: string; fileName: string; expiresInSeconds: number }>;
};

export default function ShareList({ shares, onCopy, onRevoke, onRefresh, onGetDownloadUrl }: Props) {
  const [loadingDownload, setLoadingDownload] = useState<string | null>(null);
  const [loadingLink, setLoadingLink] = useState<string | null>(null);
  const [publicLink, setPublicLink] = useState<PublicLinkData | null>(null);

  const activeShares = shares.filter((s) => s.status === "active");

  if (!activeShares.length) {
    return (
      <div className="sl__empty">
        <p className="small">No active shares yet.</p>
        {shares.length > 0 && (
          <p className="small">Some shares may have expired or been revoked.</p>
        )}
      </div>
    );
  }

  async function handleGetDownloadUrl(shareId: string) {
    try {
      setLoadingDownload(shareId);
      const result = await onGetDownloadUrl(shareId);
      window.open(result.downloadUrl, "_blank");
    } catch (e: any) {
      toast.error(e?.message || "Failed to get download URL");
    } finally {
      setLoadingDownload(null);
    }
  }

  async function handleGenerateLink(shareId: string) {
    try {
      setLoadingLink(shareId);
      const result = await onGetDownloadUrl(shareId);
      setPublicLink({
        shareId,
        fileName: result.fileName,
        downloadUrl: result.downloadUrl,
        expiresInSeconds: result.expiresInSeconds,
        generatedAt: Date.now(),
      });
    } catch (e: any) {
      toast.error(e?.message || "Failed to generate download link");
    } finally {
      setLoadingLink(null);
    }
  }

  return (
    <>
      <div className="sl">
        {activeShares.map((s) => (
          <div className="sl__row" key={s.id}>
            <div className="fl__icon fl__icon--sage" aria-hidden>
              <Share2 size={18} strokeWidth={2.75} />
            </div>
            <div className="sl__info">
              <div className="sl__name">{s.fileName}</div>
              <div className="sl__meta">
                Expires {new Date(s.expiresAt).toLocaleString()}
                {typeof s.remainingDownloads === "number" && s.remainingDownloads > 0
                  ? ` · ${s.remainingDownloads} downloads left`
                  : ""}
              </div>
            </div>
            <div className="sl__actions">
              <button className="btn btn--ghost btn--sm" onClick={() => onCopy(s.url)}>Copy link</button>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => handleGenerateLink(s.id)}
                disabled={loadingLink === s.id}
              >
                {loadingLink === s.id ? "Generating…" : "Preview"}
              </button>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => handleGetDownloadUrl(s.id)}
                disabled={loadingDownload === s.id}
              >
                {loadingDownload === s.id ? "Opening…" : "Test"}
              </button>
              <button className="btn btn--danger btn--sm" onClick={() => onRevoke(s.id)}>Revoke</button>
            </div>
          </div>
        ))}
        {onRefresh && (
          <div className="fl__refresh">
            <button className="btn btn--ghost btn--sm" onClick={onRefresh}>Refresh</button>
          </div>
        )}
      </div>

      {publicLink && (
        <div className="sl__modal-overlay" onClick={() => setPublicLink(null)}>
          <div className="sl__modal" onClick={(e) => e.stopPropagation()}>
            <header className="sl__modal-header">
              <h3>Public download link</h3>
              <button className="sl__modal-close" onClick={() => setPublicLink(null)}>✕</button>
            </header>
            <div className="sl__modal-body">
              <div className="sl__modal-file"><strong>{publicLink.fileName}</strong></div>
              <p className="sl__modal-warning">
                This link expires in {Math.ceil(publicLink.expiresInSeconds / 60)} minutes.
              </p>
              <div className="sl__modal-link">
                <input
                  className="input sl__modal-url"
                  readOnly
                  value={publicLink.downloadUrl}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  className="btn btn--sm"
                  onClick={() => navigator.clipboard.writeText(publicLink.downloadUrl)}
                >
                  Copy
                </button>
              </div>
            </div>
            <footer className="sl__modal-footer">
              <button className="btn btn--ghost btn--sm" onClick={() => setPublicLink(null)}>Close</button>
              <button className="btn btn--sm" onClick={() => window.open(publicLink.downloadUrl, "_blank")}>
                Open link
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

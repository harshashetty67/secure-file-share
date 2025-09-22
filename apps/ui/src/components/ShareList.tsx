import { useState } from "react";
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

    // Filter out expired/revoked shares automatically
    const activeShares = shares.filter(s => s.status === 'active');

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

            // Open download URL in new tab
            window.open(result.downloadUrl, '_blank');
        } catch (e: any) {
            alert(e?.message || "Failed to get download URL");
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
                generatedAt: Date.now()
            });
        } catch (e: any) {
            alert(e?.message || "Failed to generate download link");
        } finally {
            setLoadingLink(null);
        }
    }

    function closePublicLinkModal() {
        setPublicLink(null);
    }

    function copyPublicLink() {
        if (publicLink) {
            navigator.clipboard.writeText(publicLink.downloadUrl);
            // Optional: show a brief success message
        }
    }

    return (
        <>
            <div className="sl">
                {activeShares.map((s) => (
                    <div className="sl__row" key={s.id}>
                        <div className="sl__info">
                            <div className="sl__name">{s.fileName}</div>
                            <div className="sl__meta small">
                                Expires: {new Date(s.expiresAt).toLocaleString()}
                                {typeof s.remainingDownloads === "number" && s.remainingDownloads > 0 ? ` • ${s.remainingDownloads} downloads left` : ""}
                            </div>
                        </div>
                        <div className="sl__actions">
                            <button className="btn btn--ghost" onClick={() => onCopy(s.url)}>Copy Share Link</button>
                            <button
                                className="btn btn--ghost"
                                onClick={() => handleGenerateLink(s.id)}
                                disabled={loadingLink === s.id}
                            >
                                {loadingLink === s.id ? "Generating..." : "Generate Link"}
                            </button>
                            <button
                                className="btn btn--ghost"
                                onClick={() => handleGetDownloadUrl(s.id)}
                                disabled={loadingDownload === s.id}
                            >
                                {loadingDownload === s.id ? "Getting..." : "Test Download"}
                            </button>
                            <button className="btn" onClick={() => onRevoke(s.id)}>Revoke</button>
                        </div>
                    </div>
                ))}
                {onRefresh && (
                    <div className="sl__refresh">
                        <button className="btn btn--ghost" onClick={onRefresh}>Refresh</button>
                    </div>
                )}
            </div>

            {/* Public Link Modal */}
            {publicLink && (
                <div className="sl__modal-overlay" onClick={closePublicLinkModal}>
                    <div className="sl__modal" onClick={(e) => e.stopPropagation()}>
                        <header className="sl__modal-header">
                            <h3>Public Download Link</h3>
                            <button className="sl__modal-close" onClick={closePublicLinkModal}>✕</button>
                        </header>
                        <div className="sl__modal-body">
                            <div className="sl__modal-file">
                                <strong>{publicLink.fileName}</strong>
                            </div>
                            <p className="small sl__modal-warning">
                                ⚠️ This link expires in {Math.ceil(publicLink.expiresInSeconds / 60)} minutes for security.
                            </p>
                            <div className="sl__modal-link">
                                <input
                                    className="input sl__modal-url"
                                    readOnly
                                    value={publicLink.downloadUrl}
                                    onFocus={(e) => e.currentTarget.select()}
                                />
                                <button className="btn" onClick={copyPublicLink}>Copy</button>
                            </div>
                        </div>
                        <footer className="sl__modal-footer">
                            <button className="btn btn--ghost" onClick={closePublicLinkModal}>Close</button>
                            <button className="btn" onClick={() => window.open(publicLink.downloadUrl, '_blank')}>
                                Open Link
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
}

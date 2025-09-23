import { useEffect, useState } from "react";
import "../styles/ShareCreate.css";

type Props = {
    open: boolean;
    onClose: () => void;
    fileId: string | null;
    fileName?: string;
    createShare: (input: {
        fileId: string;
        ttlSeconds: number;
        maxDownloads?: number;
    }) => Promise<{ url: string; id: string }>;
};

export default function ShareCreate({ open, onClose, fileId, fileName, createShare }: Props) {
    const [ttl, setTtl] = useState<number>(3600); // 1h
    const [maxDownloads, setMaxDownloads] = useState<number | undefined>(undefined);
    const [status, setStatus] = useState<"idle" | "creating" | "done" | "error">("idle");
    const [url, setUrl] = useState<string>("");

    useEffect(() => {
        if (!open) {
            setStatus("idle");
            setUrl("");
            setTtl(3600);
            setMaxDownloads(undefined);
        }
    }, [open]);

    if (!open || !fileId) return null;

    async function submit() {
        try {
            setStatus("creating");
            const res = await createShare({
                fileId: fileId ?? "",
                ttlSeconds: ttl,
                maxDownloads,
            });
            setUrl(res.url);
            setStatus("done");
        } catch {
            setStatus("error");
        }
    }

    return (
        <div className="sc__overlay" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="sc__sheet" onClick={(e) => e.stopPropagation()}>
                <header className="sc__header">
                    <h3>Create share</h3>
                    <button className="sc__close" onClick={onClose} aria-label="Close">✕</button>
                </header>

                <div className="sc__body">
                    <div className="small">File</div>
                    <div className="sc__file">{fileName}</div>

                    <label className="sc__label">Expires in</label>
                    <div className="sc__row">
                        <select className="input" value={ttl} onChange={(e) => setTtl(Number(e.target.value))}>
                            <option value={900}>15 minutes</option>
                            <option value={3600}>1 hour</option>
                            <option value={86400}>24 hours</option>
                            <option value={604800}>7 days</option>
                        </select>
                    </div>

                    <label className="sc__label">Max downloads (optional)</label>
                    <input className="input" type="number" min={1} placeholder="Unlimited"
                        value={maxDownloads ?? ""} onChange={(e) => setMaxDownloads(e.target.value ? Number(e.target.value) : undefined)} />

                    {status === "done" && (
                        <div className="sc__result">
                            <input className="input sc__url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
                            <button className="btn" onClick={() => navigator.clipboard.writeText(url)}>Copy link</button>
                        </div>
                    )}

                    {status === "error" && <div className="sc__err">Failed to create share. Try again.</div>}
                </div>

                <footer className="sc__footer">
                    <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
                    <button className="btn" onClick={submit} disabled={status === "creating"}>
                        {status === "creating" ? "Creating…" : "Create link"}
                    </button>
                </footer>
            </div>
        </div>
    );
}
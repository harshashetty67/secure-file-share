import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  FileText, Folder, Share2, Database, LogOut, User, UploadCloud,
} from "lucide-react";
import {
  createShare, listFilesAll, listShares, me, revokeShare,
  uploadFile, getPublicDownloadUrl, deleteFile,
} from "../lib/api";
import UploadPanel from "../components/UploadPanel";
import FileList, { type FileItem } from "../components/FileList";
import ShareCreate from "../components/ShareCreate";
import ShareList, { type ShareItem } from "../components/ShareList";
import "../styles/Dashboard.css";

type Tab = "files" | "shares";
const STORAGE_QUOTA_MB = 100;

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tab, setTab] = useState<Tab>("files");

  const [files, setFiles] = useState<FileItem[]>([]);
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [filesErr, setFilesErr] = useState<string | null>(null);
  const [sharesErr, setSharesErr] = useState<string | null>(null);

  const [creatingFor, setCreatingFor] = useState<{ id: string; name: string } | null>(null);
  const hiddenUploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const meRes = await me(); if (mounted) setUser(meRes); }
      catch { if (mounted) setUser(null); }
    })();
    return () => { mounted = false; };
  }, []);

  async function refreshFiles() {
    try {
      setFilesErr(null);
      const list = await listFilesAll(20);
      setFiles(list);
    } catch (e: any) {
      setFilesErr(e?.message || "Failed to load files.");
      setFiles([]);
    }
  }

  async function refreshShares() {
    try {
      setSharesErr(null);
      const list = await listShares();
      setShares(list);
    } catch (e: any) {
      setSharesErr(e?.message || "Failed to load shares.");
      setShares([]);
    }
  }

  useEffect(() => { refreshFiles(); }, []);
  useEffect(() => { if (tab === "shares") refreshShares(); }, [tab]);

  function signOut() {
    sessionStorage.clear();
    window.location.href = "/";
  }

  const stats = useMemo(() => {
    const totalBytes = files.reduce((s, f) => s + (f.size || 0), 0);
    const totalMB = totalBytes / (1024 * 1024);
    const activeShares = shares.filter((s) => s.status === "active").length;
    const pct = Math.min(100, (totalMB / STORAGE_QUOTA_MB) * 100);
    return { fileCount: files.length, totalMB, activeShares, pct };
  }, [files, shares]);

  async function handleHiddenUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const t = toast.loading(`Uploading ${file.name}…`);
    try {
      await uploadFile(file, () => { /* header upload doesn't show progress */ });
      toast.success(`Uploaded ${file.name}`, { id: t });
      refreshFiles();
    } catch (err: any) {
      toast.error(err?.message || "Upload failed", { id: t });
    }
  }

  return (
    <div className="dash">
      {/* ---- Sidebar ---- */}
      <aside className="dash__side">
        <div className="dash__side-brand">
          <span className="dash__side-brand-ic"><FileText size={16} strokeWidth={2.75} /></span>
          <span className="dash__side-brand-name">FileShare</span>
        </div>
        <nav className="dash__nav">
          <button
            className={`dash__nav-item ${tab === "files" ? "is-active" : ""}`}
            onClick={() => setTab("files")}
          >
            <span className="dash__nav-icon"><Folder size={15} strokeWidth={2.75} /></span>
            <span className="dash__nav-label">Files</span>
            <span className="dash__nav-badge">{files.length}</span>
          </button>
          <button
            className={`dash__nav-item ${tab === "shares" ? "is-active" : ""}`}
            onClick={() => setTab("shares")}
          >
            <span className="dash__nav-icon"><Share2 size={15} strokeWidth={2.75} /></span>
            <span className="dash__nav-label">Shares</span>
            <span className="dash__nav-badge">{stats.activeShares}</span>
          </button>
        </nav>
        <div className="dash__storage">
          <div className="dash__storage-row">
            <span className="dash__storage-label">Storage</span>
            <span className="dash__storage-val">{stats.totalMB.toFixed(1)} / {STORAGE_QUOTA_MB} MB</span>
          </div>
          <div className="dash__storage-bar">
            <div className="dash__storage-fill" style={{ width: `${stats.pct}%` }} />
          </div>
        </div>
        <div className="dash__user">
          <span className="dash__user-av"><User size={14} strokeWidth={2.75} /></span>
          <span className="dash__user-email">{user?.email || "—"}</span>
          <button className="dash__user-signout" onClick={signOut} aria-label="Sign out">
            <LogOut size={12} strokeWidth={2.75} />
          </button>
        </div>
      </aside>

      {/* ---- Main ---- */}
      <main className="dash__main">
        <header className="dash__header">
          <h2 className="dash__title">
            {tab === "files" ? "Your files" : "Active shares"}
          </h2>
          <div className="dash__header-actions">
            {tab === "files" && (
              <>
                <input
                  ref={hiddenUploadRef}
                  type="file"
                  hidden
                  onChange={handleHiddenUpload}
                />
                <button
                  className="btn dash__upload-btn"
                  onClick={() => hiddenUploadRef.current?.click()}
                >
                  <UploadCloud size={14} strokeWidth={2.75} />
                  Upload file
                </button>
              </>
            )}
          </div>
        </header>

        <div className="dash__body">
          {tab === "files" && (
            <>
              {filesErr && <div className="dash__error">{filesErr}</div>}

              <div className="dash__stats">
                <div className="dash__stat">
                  <span className="dash__stat-ic"><Folder size={17} strokeWidth={2.75} /></span>
                  <div>
                    <div className="dash__stat-label">Files</div>
                    <div className="dash__stat-num">{stats.fileCount}</div>
                  </div>
                </div>
                <div className="dash__stat">
                  <span className="dash__stat-ic dash__stat-ic--sage"><Share2 size={17} strokeWidth={2.75} /></span>
                  <div>
                    <div className="dash__stat-label">Active link{stats.activeShares === 1 ? "" : "s"}</div>
                    <div className="dash__stat-num dash__stat-num--sage">{stats.activeShares}</div>
                  </div>
                </div>
                <div className="dash__stat dash__stat--wide">
                  <span className="dash__stat-ic"><Database size={17} strokeWidth={2.75} /></span>
                  <div className="dash__stat-storage">
                    <div className="dash__stat-label">Storage used</div>
                    <div className="dash__stat-storage-row">
                      <span className="dash__stat-storage-num">{stats.totalMB.toFixed(1)} MB</span>
                      <span className="dash__stat-storage-total">/ {STORAGE_QUOTA_MB} MB</span>
                    </div>
                    <div className="dash__stat-bar">
                      <div className="dash__stat-fill" style={{ width: `${stats.pct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <UploadPanel
                uploadFn={(file, onProgress) => uploadFile(file, onProgress)}
                onUploaded={refreshFiles}
              />

              <FileList
                files={files}
                onShare={(f) => setCreatingFor({ id: f.id, name: f.name })}
                onRefresh={refreshFiles}
                onDelete={async (objectKey) => deleteFile(objectKey)}
              />
            </>
          )}

          {tab === "shares" && (
            <>
              {sharesErr && <div className="dash__error">{sharesErr}</div>}
              <ShareList
                shares={shares}
                onCopy={(url) => navigator.clipboard.writeText(url)}
                onRevoke={async (id) => { await revokeShare(id); refreshShares(); }}
                onRefresh={refreshShares}
                onGetDownloadUrl={getPublicDownloadUrl}
              />
            </>
          )}
        </div>

        <ShareCreate
          open={!!creatingFor}
          onClose={() => setCreatingFor(null)}
          fileId={creatingFor?.id ?? null}
          fileName={creatingFor?.name}
          createShare={({ fileId, ttlSeconds, maxDownloads }) =>
            createShare({ fileId, ttlSeconds, maxDownloads })
          }
        />
      </main>
    </div>
  );
}

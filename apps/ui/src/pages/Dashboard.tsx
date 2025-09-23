import { useEffect, useState } from "react";
import { createShare, listFilesAll, listShares, me, revokeShare, uploadFile, getPublicDownloadUrl, deleteFile } from "../lib/api";
import Footer from "../components/Footer";
import UploadPanel from "../components/UploadPanel";
import FileList, { type FileItem } from "../components/FileList";
import ShareCreate from "../components/ShareCreate";
import ShareList, { type ShareItem } from "../components/ShareList";
import "../styles/Dashboard.css";

type Tab = "files" | "shares";

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tab, setTab] = useState<Tab>("files");

  const [files, setFiles] = useState<FileItem[]>([]);
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [filesErr, setFilesErr] = useState<string | null>(null);
  const [sharesErr, setSharesErr] = useState<string | null>(null);

  const [creatingFor, setCreatingFor] = useState<{ id: string; name: string } | null>(null);

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

  return (
    <div className="dash">
      {/* row 1 (content) */}
      <div className="container dash__main">
        <header className="dash__header">
          <h2>Your files</h2>
          <div className="dash__spacer" />
          <div className="dash__user">{user ? user.email : "—"}</div>
          <button className="btn" onClick={signOut}>Sign out</button>
        </header>

        {/* Tabs */}
        <div className="dash__tabs">
          <button className={`dash__tab ${tab === "files" ? "is-active" : ""}`} onClick={() => setTab("files")}>Files</button>
          <button className={`dash__tab ${tab === "shares" ? "is-active" : ""}`} onClick={() => setTab("shares")}>Shares</button>
        </div>

        {tab === "files" && (
          <div className="dash__section">
            {filesErr && <div className="dash__error">⚠️ {filesErr}</div>}

            <UploadPanel
              uploadFn={(file, onProgress) => uploadFile(file, onProgress)}
              onUploaded={refreshFiles}
            />

            <div className="dash__sp" />

            <FileList
              files={files}
              onShare={(f) => setCreatingFor({ id: f.id, name: f.name })}
              onRefresh={refreshFiles}
              onDelete={async (objectKey) => {
                const result = await deleteFile(objectKey);
                return result;
              }}
            />
          </div>
        )}

        {tab === "shares" && (
          <div className="dash__section">
            {sharesErr && <div className="dash__error">⚠️ {sharesErr}</div>}
            <ShareList
              shares={shares}
              onCopy={(url) => navigator.clipboard.writeText(url)}
              onRevoke={async (id) => { await revokeShare(id); refreshShares(); }}
              onRefresh={refreshShares}
              onGetDownloadUrl={getPublicDownloadUrl}
            />
          </div>
        )}

        <ShareCreate
          open={!!creatingFor}
          onClose={() => setCreatingFor(null)}
          fileId={creatingFor?.id ?? null}
          fileName={creatingFor?.name}
          createShare={({ fileId, ttlSeconds, maxDownloads }) =>
            createShare({ fileId, ttlSeconds, maxDownloads })
          }
        />
      </div>

      {/* row 2 (footer pinned bottom) */}
      <Footer />
    </div>
  );
}


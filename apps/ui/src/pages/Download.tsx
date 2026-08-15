import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download as DownloadIcon, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { getPublicDownloadUrl } from "../lib/api";
import Footer from "../components/Footer";
import "../styles/Download.css";

type State = "idle" | "loading" | "done" | "error";
type ErrorKind = "not_found" | "gone" | "generic";

function errorMessage(kind: ErrorKind): { heading: string; body: string } {
  if (kind === "not_found") return { heading: "Link not found", body: "This share link doesn't exist. Check the URL and try again." };
  if (kind === "gone") return { heading: "Link no longer available", body: "This share link has expired, been revoked, or reached its download limit." };
  return { heading: "Something went wrong", body: "We couldn't retrieve the file. Try again in a moment." };
}

export default function Download() {
  const { shareId } = useParams<{ shareId: string }>();
  const [state, setState] = useState<State>("idle");
  const [errorKind, setErrorKind] = useState<ErrorKind>("generic");

  async function handleDownload() {
    if (!shareId || state === "loading") return;
    setState("loading");
    try {
      const { downloadUrl } = await getPublicDownloadUrl(shareId);
      setState("done");
      window.location.href = downloadUrl;
    } catch (e: any) {
      const status = e?.status ?? (e?.message?.includes("404") ? 404 : e?.message?.includes("410") ? 410 : 0);
      if (status === 404 || e?.message?.toLowerCase().includes("not found")) setErrorKind("not_found");
      else if (status === 410 || /expired|revoked|limit/i.test(e?.message ?? "")) setErrorKind("gone");
      else setErrorKind("generic");
      setState("error");
    }
  }

  const err = state === "error" ? errorMessage(errorKind) : null;

  return (
    <div className="dl">
      <div className="container dl__wrap">
        <div className="dl__brand">
          <FileText size={16} strokeWidth={2.75} />
          <span>FileShare</span>
        </div>

        <div className="dl__card">
          {state !== "error" && (
            <>
              <div className="dl__icon" aria-hidden>
                {state === "done"
                  ? <CheckCircle size={40} strokeWidth={2} />
                  : <DownloadIcon size={40} strokeWidth={2} />}
              </div>
              <h2 className="dl__heading">
                {state === "done" ? "Download started" : "Secure file download"}
              </h2>
              <p className="dl__sub">
                {state === "done"
                  ? "Your file is downloading. You can close this tab."
                  : "Click the button below to download the shared file. The link is single-use and time-limited."}
              </p>
              {state !== "done" && (
                <button
                  className="btn btn--lg dl__btn"
                  onClick={handleDownload}
                  disabled={state === "loading"}
                >
                  {state === "loading" ? "Preparing…" : "Download file"}
                </button>
              )}
            </>
          )}

          {state === "error" && (
            <>
              <div className="dl__icon dl__icon--err" aria-hidden>
                <AlertCircle size={40} strokeWidth={2} />
              </div>
              <h2 className="dl__heading">{err!.heading}</h2>
              <p className="dl__sub">{err!.body}</p>
              <Link to="/" className="btn btn--ghost dl__btn">Go to homepage</Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

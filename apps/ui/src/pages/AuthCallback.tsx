import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/AuthCallback.css";

export default function AuthCallback() {
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState<string>("Verifying your link…");
  const [seconds, setSeconds] = useState(3);
  const navigate = useNavigate();
  const [params] = useSearchParams();


  const { accessToken, refreshToken, expiresIn, errorDesc } = useMemo(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const qs = new URLSearchParams(window.location.search);
    const accessToken = qs.get("token") || hash.get("access_token") || ""; // support both styles
    const refreshToken = hash.get("refresh_token") || "";
    const expiresIn = Number(hash.get("expires_in") || "3600");
    const errorDesc = qs.get("error_description") || hash.get("error_description") || "";
    return { accessToken, refreshToken, expiresIn, errorDesc };
  }, [params]);


  // Minimal decoder to pull email from JWT (for header display only)
  function extractEmailFromJWT(jwt: string): string | null {
    try {
      const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload.email || null;
    } catch { return null; }
  }


  useEffect(() => {
    (async () => {
      try {
        if (!accessToken) throw new Error(errorDesc || "Missing token");
        // Persist session locally to call your backend with Authorization: Bearer
        localStorage.setItem("sfs_access_token", accessToken);
        if (refreshToken) localStorage.setItem("sfs_refresh_token", refreshToken);
        if (Number.isFinite(expiresIn)) localStorage.setItem("sfs_expires_at", String(Date.now() + expiresIn * 1000));
        const email = extractEmailFromJWT(accessToken);
        if (email) localStorage.setItem("sfs_user", JSON.stringify({ email }));
        setStatus("success");
        setMessage("Signed in successfully! Redirecting…");
      } catch (e: any) {
        setStatus("failed");
        setMessage(e?.message || "Verification failed. The link may be expired.");
      }
    })();
  }, [accessToken, refreshToken, expiresIn, errorDesc]);


  useEffect(() => {
    if (status === "success") {
      const id = window.setInterval(() => setSeconds((s) => s - 1), 1000);
      const to = window.setTimeout(() => navigate("/app", { replace: true }), 3000);
      return () => { window.clearInterval(id); window.clearTimeout(to); };
    }
  }, [status, navigate]);


  return (
    <div className="authcb">
      <div className="container authcb__wrap">
        <div className={`authcb__card authcb__card--${status}`}>
          <div className="authcb__spinner" aria-hidden />
          <h2>{message}</h2>
          {status === "success" && <p className="small">Taking you to your files in {seconds}s…</p>}
          {status === "failed" && (
            <p className="small">You can request a new link on the <a href="/signin">sign‑in</a> page.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

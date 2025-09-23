import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/AuthCallback.css";
import { me } from "../lib/api";

export default function AuthCallback() {
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("Verifying your link…");
  const [seconds, setSeconds] = useState(3);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { accessToken, refreshToken, expiresIn, errorDesc } = useMemo(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const qs = new URLSearchParams(window.location.search);
    const accessToken = qs.get("token") || hash.get("access_token") || "";
    const refreshToken = hash.get("refresh_token") || "";
    const expiresIn = Number(hash.get("expires_in") || "3600");
    const errorDesc = qs.get("error_description") || hash.get("error_description") || "";
    return { accessToken, refreshToken, expiresIn, errorDesc };
  }, [params]);

  function stripTokensFromURL() {
    const url = new URL(window.location.href);
    url.hash = "";
    url.searchParams.delete("token");
    url.searchParams.delete("error_description");
    window.history.replaceState({}, "", url.pathname + url.search);
  }

  function clearAuth() {
    sessionStorage.removeItem("sfs_access_token");
    sessionStorage.removeItem("sfs_refresh_token");
    sessionStorage.removeItem("sfs_expires_at");
    sessionStorage.removeItem("sfs_user");
  }

  useEffect(() => {
    (async () => {
      try {
        if (!accessToken) throw new Error(errorDesc || "Missing token");

        // Persist token(s) for this tab only
        sessionStorage.setItem("sfs_access_token", accessToken);
        if (refreshToken) sessionStorage.setItem("sfs_refresh_token", refreshToken);
        if (Number.isFinite(expiresIn)) {
          sessionStorage.setItem("sfs_expires_at", String(Date.now() + expiresIn * 1000));
        }

        // Validate with server (auth middleware verifies JWT)
        const meRes = await me();
        if (!meRes) throw new Error("Invalid or expired link. Please request a new one.");
        sessionStorage.setItem("sfs_user", JSON.stringify(me));

        stripTokensFromURL();
        setStatus("success");
        setMessage("Signed in successfully! Redirecting…");
      } catch (e: any) {
        clearAuth();
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
            <p className="small">
              You can request a new link on the <a href="/signin">sign-in</a> page.
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

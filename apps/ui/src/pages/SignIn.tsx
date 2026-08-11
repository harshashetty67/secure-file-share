import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, FileText, Mail } from "lucide-react";
import { isValidEmail } from "../lib/validators";
import { useCooldown } from "../hooks/useCooldown";
import { sendMagicLink } from "../lib/api";
import "../styles/Signin.css";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const cooldown = useCooldown(60);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidEmail(email)) { setError("Please enter a valid email"); return; }
    if (cooldown.active) return;
    try {
      setStatus("sending");
      await sendMagicLink(email);
      setStatus("sent");
      cooldown.start();
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong");
    }
  }

  const btnText =
    status === "sending" ? "Sending…" :
    status === "sent" && cooldown.active ? `Resend in ${cooldown.remaining}s` :
    status === "error" ? "Try again" :
    "Send magic link";

  return (
    <div className="signin">
      <div className="signin__top">
        <div className="container signin__top-inner">
          <Link to="/" className="signin__back" aria-label="Back">
            <ArrowLeft size={14} strokeWidth={2.75} />
          </Link>
          <span className="signin__brand">
            <span className="signin__brand-logo"><FileText size={14} strokeWidth={2.75} /></span>
            <span className="signin__brand-name">FileShare</span>
          </span>
        </div>
      </div>

      <div className="signin__body">
        <div className="signin__grid">
          <div className="signin__left">
            <h2>Your files,<br />instantly secured.</h2>
            <p className="signin__left-lede">
              No passwords, no accounts — just your email and a link that expires.
            </p>
            <div className="signin__checks">
              {[
                "No account creation required",
                "Magic link expires automatically",
                "Files encrypted at rest",
                "Revoke access anytime",
              ].map((t) => (
                <div className="signin__check" key={t}>
                  <span className="signin__check-ic"><Check size={12} strokeWidth={3.5} /></span>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="signin__card">
            <div className="signin__card-ic"><Mail size={20} strokeWidth={2.75} /></div>
            <h3>Sign in</h3>
            <p className="signin__card-lede">We'll email you a secure, single-use link.</p>

            <form onSubmit={onSubmit} className="signin__form">
              <div>
                <label className="signin__label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  className="input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
              {error && <div className="signin__error" role="alert">{error}</div>}
              <button
                className="btn btn--block btn--lg"
                disabled={status === "sending" || cooldown.active}
              >
                {btnText}
                {status !== "sending" && <ArrowRight size={14} strokeWidth={2.75} />}
              </button>
            </form>

            {status === "sent" && (
              <div className="signin__sent">
                Check your inbox — the link works once and expires shortly.
              </div>
            )}
            <p className="signin__note">Expires in 10 min · One-time use</p>
          </div>
        </div>
      </div>
    </div>
  );
}

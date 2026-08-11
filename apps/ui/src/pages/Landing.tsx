import { Link } from "react-router-dom";
import {
  FileText, Shield, ArrowRight, Image as ImageIcon,
  Link as LinkIcon, Copy, Lock, Clock, Mail, UploadCloud, Send,
} from "lucide-react";
import "../styles/Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      {/* NAV */}
      <nav className="lnav">
        <div className="container lnav__inner">
          <Link to="/" className="lnav__brand">
            <span className="lnav__logo"><FileText size={17} strokeWidth={2.75} /></span>
            <span className="lnav__name">FileShare</span>
          </Link>
          <div className="lnav__links">
            <span className="lnav__link">How it works</span>
            <span className="lnav__link">Security</span>
          </div>
          <Link to="/signin" className="btn">
            Sign in <ArrowRight size={13} strokeWidth={2.75} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="container lhero">
        <div className="lhero__col">
          <div className="lhero__badge">
            <Shield size={12} strokeWidth={2.75} />
            End-to-end encrypted
          </div>
          <h1 className="lhero__title">Share files.<br />Not passwords.</h1>
          <p className="lhero__lede">
            Send files via signed, expiring magic links. Zero-trust access means every
            download is verified — no account creation needed.
          </p>
          <div className="lhero__cta">
            <Link to="/signin" className="btn btn--lg">Get started free</Link>
          </div>
          <p className="lhero__foot">No credit card · No account · Just your email</p>
        </div>

        <div className="lart">
          <div className="lart__blob lart__blob--a" />
          <div className="lart__blob lart__blob--b" />

          <div className="lcard lcard--top">
            <div className="lcard__row" style={{ marginBottom: 10 }}>
              <span className="lcard__ic lcard__ic--sage"><ImageIcon size={14} strokeWidth={2.75} /></span>
              <div>
                <div className="lcard__name">brand-assets.zip</div>
                <div className="lcard__meta">8.2 MB · ZIP</div>
              </div>
            </div>
            <div className="lcard__shared">✓ Shared 2h ago</div>
          </div>

          <div className="lcard lcard--main">
            <div className="lcard__row">
              <span className="lcard__ic"><FileText size={18} strokeWidth={2.75} /></span>
              <div>
                <div className="lcard__name">proposal-final.pdf</div>
                <div className="lcard__meta">1.4 MB · PDF</div>
              </div>
            </div>
            <div className="lcard__progress"><div style={{ width: "100%" }} /></div>
            <div className="lcard__link">
              <div>
                <div className="lcard__linkLabel">Share link</div>
                <div className="lcard__linkUrl">fs.io/a8k2m…</div>
              </div>
              <button className="lcard__linkBtn" aria-label="Copy"><Copy size={12} strokeWidth={2.75} /></button>
            </div>
          </div>

          <div className="lcard lcard--pill">
            <span className="lcard__dot" />
            <span style={{ fontSize: 12, fontWeight: 500 }}>3 files active</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container lhow">
        <div className="lhow__head">
          <div>
            <div className="lhow__eyebrow">How it works</div>
            <h2 className="lhow__title">Three steps. No account required.</h2>
          </div>
        </div>
        <div className="lhow__grid">
          <div className="lhow__step">
            <span className="lhow__step-ic"><Mail size={16} strokeWidth={2.75} /></span>
            <div className="lhow__num">01</div>
            <h3 className="lhow__step-title">Sign in with a link</h3>
            <p className="lhow__step-body">
              Enter your email. We send a one-time magic link — no password to
              remember, nothing to leak.
            </p>
          </div>
          <div className="lhow__step">
            <span className="lhow__step-ic"><UploadCloud size={16} strokeWidth={2.75} /></span>
            <div className="lhow__num">02</div>
            <h3 className="lhow__step-title">Upload &amp; share</h3>
            <p className="lhow__step-body">
              Drop any file up to 100 MB. Generate a signed URL with an expiry
              and optional download cap.
            </p>
          </div>
          <div className="lhow__step">
            <span className="lhow__step-ic"><Send size={16} strokeWidth={2.75} /></span>
            <div className="lhow__num">03</div>
            <h3 className="lhow__step-title">Recipient just clicks</h3>
            <p className="lhow__step-body">
              They don't need an account. Every download is verified against
              your rules and logged for you.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <section className="lfeat">
        <div className="container lfeat__inner">
          <div className="lfeat__item">
            <span className="lfeat__ic"><LinkIcon size={14} strokeWidth={2.75} /></span>
            <div>
              <div className="lfeat__title">Magic Links</div>
              <div className="lfeat__sub">Signed &amp; expiring</div>
            </div>
          </div>
          <span className="lfeat__sep" />
          <div className="lfeat__item">
            <span className="lfeat__ic lfeat__ic--sage"><Shield size={14} strokeWidth={2.75} /></span>
            <div>
              <div className="lfeat__title">Zero-Trust</div>
              <div className="lfeat__sub">Every download verified</div>
            </div>
          </div>
          <span className="lfeat__sep" />
          <div className="lfeat__item">
            <span className="lfeat__ic"><Lock size={14} strokeWidth={2.75} /></span>
            <div>
              <div className="lfeat__title">Encrypted at Rest</div>
              <div className="lfeat__sub">Server-side rules</div>
            </div>
          </div>
          <span className="lfeat__sep" />
          <div className="lfeat__item">
            <span className="lfeat__ic lfeat__ic--sage"><Clock size={14} strokeWidth={2.75} /></span>
            <div>
              <div className="lfeat__title">Auto-Expiry</div>
              <div className="lfeat__sub">Links self-destruct</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

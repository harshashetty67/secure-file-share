import { type FormEvent, useState } from "react";
import { isValidEmail } from "../lib/validators";
import { useCooldown } from "../hooks/useCooldown";
import Footer from "../components/Footer";
import "../styles/SignIn.css";
import { Link } from "react-router-dom";
import { sendMagicLink } from "../lib/api";

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
            status === "sent" && cooldown.active ? `Sent! Resend in ${cooldown.remaining}s` :
                status === "error" ? "Try again" : "Send magic link";


    return (
        <div className="signin">
            {/* Top bar row: back action */}
            <div className="signin__topbar container">
                <Link to="/" className="btn btn--ghost" aria-label="Back to landing">← Back</Link>
            </div>


            {/* Centered form row */}
            <div className="signin__main container">
                <div className="signin__card">
                    <h2>Sign in</h2>
                    <p className="signin_tip">We’ll email you a secure, single‑use link.</p>
                    <form onSubmit={onSubmit} className="signin__form">
                        <label htmlFor="email">Email</label>
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
                        {error && <div className="signin__error" role="alert">{error}</div>}
                        <button className="btn" disabled={status === "sending" || cooldown.active}>{btnText}</button>
                    </form>
                    {status === "sent" && (
                        <p className="small center">Check your inbox. The link expires shortly for your security.</p>
                    )}
                </div>
            </div>


            {/* Footer row pinned to bottom via grid layout */}
            <Footer />
        </div>
    );
}
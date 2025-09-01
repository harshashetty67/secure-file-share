import { useState, useEffect } from 'react';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { z } from "zod";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const EmailSchema = z.string().email();
const RESEND_COOLDOWN_SEC = 60;

const MagicLinkForm = () => {

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const [cooldown, setCooldown] = useState(0);

  // Mask email for privacy (show first char + domain)
  const masked = email ? `${email[0]}***@${email.split('@')[1] || '***'}` : '';

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setPhase("sending");
    
    try {
      var response = await fetch(`${API_BASE}/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError('Failed to send magic link. Please try again.'); 
        setPhase("idle");
       return;
      } 

      setPhase("sent");
      setCooldown(30); // 30 second cooldown
    } 
    catch (err) {
      setError('Failed to send magic link. Please try again.');
      setPhase("idle");
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setPhase("sending");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase("sent");
      setCooldown(30);
    } catch (err) {
      setError('Failed to resend. Please try again.');
      setPhase("idle");
    }
  };

  // Success state - email sent
  if (phase === "sent") {
    return (
      <div className="space-y-6" aria-live="polite">
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-emerald-50">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 mr-3" />
            <div className="font-semibold text-lg">Check your email</div>
          </div>
          <div className="text-sm text-emerald-100">
            We sent a sign-in link to <span className="font-mono bg-emerald-400/20 px-2 py-1 rounded">{masked}</span>.
          </div>
        </div>

        <div className="text-sm text-white/80 space-y-3">
          <p>
            Didn't get it? Check spam/promotions, or{" "}
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0}
              className="underline underline-offset-4 disabled:opacity-50 hover:text-white transition-colors"
            >
              {cooldown > 0 ? `resend in ${cooldown}s` : "resend"}
            </button>
          </p>

          <p>
            Quick links:{" "}
            <a className="underline hover:text-white transition-colors" href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
              Gmail
            </a>{" "}
            •{" "}
            <a className="underline hover:text-white transition-colors" href="https://outlook.live.com" target="_blank" rel="noopener noreferrer">
              Outlook
            </a>
          </p>

          <button
            type="button"
            onClick={() => { 
              setPhase("idle"); 
              setError(null); 
              setEmail("");
            }}
            className="text-sm text-white/80 underline hover:text-white transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // Initial form state
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-3">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            className="w-full pl-12 pr-5 py-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={phase === "sending"}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-lg p-3" aria-live="polite">
          {error}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={phase === "sending" || !email}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white font-bold text-lg rounded-xl shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
      >
        {phase === "sending" ? (
          <>
            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
            Sending magic link...
          </>
        ) : (
          "Send magic link"
        )}
      </button>
    </div>
  );
};

export default MagicLinkForm;
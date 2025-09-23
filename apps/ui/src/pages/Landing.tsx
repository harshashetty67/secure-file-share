import { Link } from "react-router-dom";
import InfoCard from "../components/InfoCard";
import Footer from "../components/Footer";
import "../styles/Landing.css";

export default function Landing() {
    const appName = import.meta.env.VITE_APP_NAME || "File Share";
    return (
        <div className="landing">
            <header className="landing__header container">
                <h1>{appName}</h1>
            </header>


            <main className="landing__main container">
                <section className="landing__grid">
                    <InfoCard title="End‑to‑End Links" desc="Share files via signed, expiring magic links. No passwords to leak." />
                    <InfoCard delay={100} title="Zero‑Trust Access" desc="Links are scoped and revocable. Every download is verified." />
                    <InfoCard delay={200} title="Encrypted at Rest" desc="Supabase storage with server‑side rules. Keep control of your data." />
                </section>
                <div className="landing__cta">
                    <Link className="btn" to="/signin">Get started</Link>
                    <p className="small">No account creation—just your email.</p>
                </div>
            </main>


            <Footer />
        </div>
    );
}
import FeatureCard from "../components/shared/FeatureCard";
import Footer from "../components/shared/Footer";

// --- ICONS ---
const SecurityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="feature-icon">
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
  </svg>
);

const SpeedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="feature-icon">
    <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V17.625c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V6.375c0-1.036-.84-1.875-1.875-1.875H3.375zM9 17.25a.75.75 0 000-1.5H6.75a.75.75 0 000 1.5H9zm-.75-4.5a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM15 17.25a.75.75 0 000-1.5h-2.25a.75.75 0 000 1.5H15z" />
  </svg>
);

const EaseOfUseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="feature-icon">
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 19.5a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const LandingPage = () => {
  return (
    <>
      <main className="main-content">
        <section className="hero-section">
          <h1 className="main-title">File Share</h1>
          <p className="subtitle">Securely share your files with anyone, anywhere.</p>
          <a href="#" className="cta-button">Get Started</a>
        </section>

        <section className="features-section">
          <FeatureCard icon={<SecurityIcon />} title="Secure & Private">
            End-to-end encryption ensures your files are only seen by the intended recipients. Your privacy is our priority.
          </FeatureCard>
          <FeatureCard icon={<SpeedIcon />} title="Lightning Fast">
            Experience blazing-fast upload and download speeds, powered by a global content delivery network.
          </FeatureCard>
          <FeatureCard icon={<EaseOfUseIcon />} title="Easy to Use">
            An intuitive drag-and-drop interface makes file sharing simpler than ever before. No account needed to receive files.
          </FeatureCard>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default LandingPage;
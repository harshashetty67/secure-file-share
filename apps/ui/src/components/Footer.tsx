import "../styles/Footer.css";

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="footer">
            <div className="container footer-inner">
                <span>© {year} {import.meta.env.VITE_APP_NAME || "File Share"}</span>
                <a className="footer-link" href="https://github.com/harshashetty67" target="_blank" rel="noreferrer">GitHub</a>
            </div>
        </footer>
    );
}
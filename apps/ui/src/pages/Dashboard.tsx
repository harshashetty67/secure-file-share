import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);


  useEffect(() => {
    const userStr = localStorage.getItem("sfs_user");
    if (userStr) {
      try { setEmail(JSON.parse(userStr).email); } catch { }
    }
  }, []);


  function signOut() {
    localStorage.removeItem("sfs_access_token");
    localStorage.removeItem("sfs_user");
    window.location.href = "/";
  }


  return (
    <div className="dash">
      <div className="container">
        <header className="dash__header">
          <h2>Your files</h2>
          <div className="dash__spacer" />
          <div className="dash__user">{email}</div>
          <button className="btn" onClick={signOut}>Sign out</button>
        </header>
        <div className="dash__empty">
          <p className="small">This is a placeholder. Hook your file list here.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
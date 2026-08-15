import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Download from "./pages/Download";
import React from "react";


export function isSessionValid(): boolean {
    const token = localStorage.getItem("sfs_access_token");
    if (!token) return false;
    const expiresAt = Number(localStorage.getItem("sfs_expires_at") ?? 0);
    if (expiresAt && Date.now() > expiresAt) {
        localStorage.removeItem("sfs_access_token");
        localStorage.removeItem("sfs_refresh_token");
        localStorage.removeItem("sfs_expires_at");
        localStorage.removeItem("sfs_user");
        return false;
    }
    return true;
}

function Protected({ children }: { children: React.ReactNode }) {
    if (!isSessionValid()) return <Landing />;
    return <>{children}</>;
}


export const AppRoutes = {
    Landing,
    SignIn,
    AuthCallback,
    Dashboard,
    Download,
    Protected,
};
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import React from "react";


function Protected({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem("sfs_access_token");
    if (!token) {
        return <Landing />; // graceful fallback per your design
    }
    return <>{children}</>;
}


export const AppRoutes = {
    Landing,
    SignIn,
    AuthCallback,
    Dashboard,
    Protected,
};
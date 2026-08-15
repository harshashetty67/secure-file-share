import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes, isSessionValid } from "./routes";

function PublicOnly({ children }: { children: React.ReactNode }) {
  if (isSessionValid()) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

export default function App() {
return (
<Routes>
<Route path="/" element={<PublicOnly><AppRoutes.Landing /></PublicOnly>} />
<Route path="/signin" element={<PublicOnly><AppRoutes.SignIn /></PublicOnly>} />
<Route path="/auth/callback" element={<AppRoutes.AuthCallback />} />
<Route path="/app" element={<AppRoutes.Protected><AppRoutes.Dashboard /></AppRoutes.Protected>} />
<Route path="/d/:shareId" element={<AppRoutes.Download />} />
{/* Fallback to Landing for unknown routes */}
<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
);
}
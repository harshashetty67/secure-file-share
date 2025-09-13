import { Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from "./routes";


export default function App() {
return (
<Routes>
<Route path="/" element={<AppRoutes.Landing />} />
<Route path="/signin" element={<AppRoutes.SignIn />} />
<Route path="/auth/callback" element={<AppRoutes.AuthCallback />} />
<Route path="/app" element={<AppRoutes.Protected><AppRoutes.Dashboard /></AppRoutes.Protected>} />
{/* Fallback to Landing for unknown routes */}
<Route path="*" element={<Navigate to="/" replace />} />
</Routes>
);
}
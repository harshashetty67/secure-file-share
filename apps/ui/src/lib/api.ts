export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export type VerifyResponse = {
    accessToken: string;
    user: { id: string; email: string };
};

export async function sendMagicLink(email: string): Promise<{ ok: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/magic-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: `${window.location.origin}/auth/callback` })
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to send magic link");
    }
    return res.json();
}


export async function me(): Promise<{ email: string } | null> {
    try {
        const token = localStorage.getItem("sfs_access_token");
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/me`, { headers, credentials: "include" });
        if (!res.ok) return null;
        return res.json();
    } catch { return null; }
}
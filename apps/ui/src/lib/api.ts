export const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return `Request failed (${res.status})`;
  try {
    const j = JSON.parse(text);
    return j?.error?.message || j?.message || text;
  } catch {
    return text.length > 200 ? `Request failed (${res.status})` : text;
  }
}

export type VerifyResponse = {
  accessToken: string;
  user: { id: string; email: string };
};

export type fileItem = {
  items: Array<{ objectKey: string; fileName: string; size: number | null; lastModified: string | null }>;
  nextOffset: number | null;
}

export async function sendMagicLink(email: string): Promise<{ ok: boolean; message: string }> {
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  const res = await fetch(`${API_BASE}/auth/magic-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      email, 
      redirectTo: redirectUrl
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}


export async function me(): Promise<{ id: string; email: string } | null> {
  try {
    const token = sessionStorage.getItem("sfs_access_token");
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/me`, { headers });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function authHeader(): Record<string, string> {
  const token = sessionStorage.getItem("sfs_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export async function listFilesAll(limit = 20): Promise<Array<{ id: string; name: string; size: number; uploadedAt: string }>> {
    let offset: number | null = 0;
    const out: Array<{ id: string; name: string; size: number; uploadedAt: string }> = [];

    while (offset !== null) {
      const res = await fetch(`${API_BASE}/files?limit=${limit}&offset=${offset}`, { headers: { ...authHeader() } });
      if (!res.ok) throw new Error(await readError(res));
      const data: {
        items: Array<{ objectKey: string; fileName: string; size: number | null; lastModified: string | null }>;
        nextOffset: number | null;
      } = await res.json();

      for (let idx = 0; idx < (data.items?.length || 0); idx++) {
        const i = data.items[idx];
        out.push({
          id: i.objectKey || `${offset}-${idx}`,
          name: i.fileName || i.objectKey?.split("/").pop() || `file-${offset}-${idx}`,
          size: typeof i.size === "number" ? i.size : 0,
          uploadedAt: i.lastModified ? new Date(i.lastModified).toISOString() : new Date(0).toISOString(),
        });
      }

      offset = data.nextOffset;
    }

    out.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
    return out;
  }

export async function uploadFile(file: File, onProgress: (pct: number) => void): Promise<void> {
  // Use XHR for progress (fetch has no native progress)
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/uploadFiles`);
    const headers = authHeader();
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, String(v)));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let msg = `Upload failed (${xhr.status})`;
      try {
        const j = JSON.parse(xhr.responseText);
        msg = j?.error?.message || j?.message || msg;
      } catch { /* keep default */ }
      reject(new Error(msg));
    };
    xhr.onerror = () => reject(new Error("Network error"));
    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

export async function createShare(input: { fileId: string; ttlSeconds: number; password?: string; maxDownloads?: number })
  : Promise<{ url: string; id: string }> {
  const res = await fetch(`${API_BASE}/shares`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({
      objectKey: input.fileId,
      ttlMinutes: Math.ceil(input.ttlSeconds / 60),
      maxDownloads: input.maxDownloads,
    }),
  });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  return { 
    url: data.publicUrl, 
    id: data.shareId 
  };
}

export async function listShares(): Promise<Array<{ id: string; fileName: string; url: string; expiresAt: string; remainingDownloads?: number; status: string }>> {
  const res = await fetch(`${API_BASE}/shares`, { headers: { ...authHeader() } });
  if (!res.ok) throw new Error(await readError(res));
  const data = await res.json();
  
  return data.items.map((item: any) => ({
    id: item.id,
    fileName: item.fileName,
    url: item.publicUrl,
    expiresAt: item.expiresAt,
    remainingDownloads: item.maxDownloads ? item.maxDownloads - item.downloadCount : undefined,
    status: item.status
  }));
}

export async function getPublicDownloadUrl(shareId: string): Promise<{ downloadUrl: string; fileName: string; expiresInSeconds: number }> {
  const res = await fetch(`${API_BASE}/publicUrl/shares/${shareId}`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function revokeShare(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/shares/${id}/revoke`, {
    method: "POST",
    headers: { ...authHeader() },
  });
  if (!res.ok) throw new Error(await readError(res));
}

export async function deleteFile(objectKey: string): Promise<{ ok: boolean; revokedShares: number }> {
  const res = await fetch(`${API_BASE}/files`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ objectKey }),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

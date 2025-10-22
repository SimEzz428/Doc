// frontend/src/lib/api.ts
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8090";

export async function apiUpload(file: File): Promise<{ ok: boolean; filename: string; chunks: string[] }> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${API}/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`upload failed: ${r.status}`);
  return r.json();
}

export async function apiIndex(payload: { filename: string; chunks: string[]; vectors: number[][] }) {
  const r = await fetch(`${API}/index`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`index failed: ${r.status}`);
  return r.json();
}

export async function apiSearchVec(qvec: number[], top_k = 5) {
  const r = await fetch(`${API}/search_vec`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ qvec, top_k }),
  });
  if (!r.ok) throw new Error(`search_vec failed: ${r.status}`);
  return r.json();
}

export async function apiAskVec(q: string, qvec: number[]) {
  const r = await fetch(`${API}/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q, qvec }),
  });
  if (!r.ok) throw new Error(`ask failed: ${r.status}`);
  return r.json();
}
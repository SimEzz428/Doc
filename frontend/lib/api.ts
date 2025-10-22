const BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8090";

export async function apiUpload(file: File) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiAsk(q: string) {
  const r = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function apiSearch(q: string) {
  const r = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
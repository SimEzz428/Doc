const BASE = import.meta.env.VITE_API_URL!;  // you set this in Render

export async function apiUpload(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch(`${BASE}/upload`, { method: "POST", body: fd });
  if (!r.ok) throw new Error(`upload failed: ${r.status}`);
  return r.json(); // {status, chunks}
}

export async function apiSearch(q: string) {
  const r = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q }),
  });
  return r.json(); // {ok, hits}
}

export async function apiAsk(q: string) {
  const r = await fetch(`${BASE}/ask`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ q }),
  });
  return r.json(); // {ok, answer, sources}
}

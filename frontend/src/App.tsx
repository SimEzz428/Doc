// frontend/src/App.tsx
import { useState } from "react";
import { apiAsk, apiSearch, apiUpload } from "../lib/api";

type Hit = { doc_id: number; idx: number; text: string; score: number };

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-5">
      <div className="text-slate-300 text-sm">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [docCount, setDocCount] = useState(0);

  const [askQ, setAskQ] = useState("");
  const [answer, setAnswer] = useState<string>("");
  const [sources, setSources] = useState<Hit[]>([]);

  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<Hit[]>([]);

  async function handleUpload() {
    if (!file) return;
    try {
      setUploading(true);
      const res = await apiUpload(file); // {status, chunks}
      if (res?.status === "ok") setDocCount((n) => n + 1);
    } catch (e: any) {
      alert(`Upload/Index failed: ${e.message ?? e}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk() {
    if (!askQ.trim()) return;
    setAnswer("");
    setSources([]);
    try {
      const { ok, answer, sources } = await apiAsk(askQ.trim());
      if (ok) {
        setAnswer(answer);
        setSources(sources || []);
      }
    } catch (e: any) {
      alert(`Ask failed: ${e.message ?? e}`);
    }
  }

  async function handleSearch() {
    if (!searchQ.trim()) return;
    try {
      const { ok, hits } = await apiSearch(searchQ.trim());
      if (ok) setSearchHits(hits || []);
    } catch (e: any) {
      alert(`Search failed: ${e.message ?? e}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Document Library</h1>
          <p className="text-slate-400 text-sm">Your intelligent document analysis worktool.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Documents Analyzed" value={docCount} />
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="w-full">
              <div className="text-sm text-slate-300 font-medium mb-2">Upload Document</div>
              <p className="text-slate-400 text-sm mb-3">
                Upload PDF, DOCX, or TXT. Parsing on server; embeddings in your browser (free).
              </p>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0 file:text-sm file:font-medium
                           file:bg-violet-600 file:text-white hover:file:bg-violet-500
                           cursor-pointer"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload & Index"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6">
            <div className="text-sm text-slate-300 font-medium mb-3">Ask questions</div>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="What are the main risks? What changed? Who owns what?"
                value={askQ}
                onChange={(e) => setAskQ(e.target.value)}
              />
              <button onClick={handleAsk} className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium">
                Ask
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Answer</div>
              <div className="rounded-lg border border-slate-800 bg-slate-800/50 p-4 text-sm min-h-[80px]">
                {answer || "No answer yet."}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Sources</div>
              <div className="space-y-2">
                {sources?.length ? (
                  sources.map((h, i) => (
                    <div key={i} className="rounded-lg border border-slate-800 bg-slate-800/50 p-3 text-sm">
                      <div className="text-[11px] text-slate-400 mb-1">score {h.score.toFixed(3)}</div>
                      <div className="text-slate-200">{h.text}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400">No sources yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-6">
            <div className="text-sm text-slate-300 font-medium mb-3">Semantic search</div>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-1 rounded-lg bg-slate-800/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-600"
                placeholder="Find key ideas, dates, risks…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <button onClick={handleSearch} className="rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium">
                Search
              </button>
            </div>

            <div className="space-y-2">
              {searchHits?.length ? (
                searchHits.map((h, i) => (
                  <div key={i} className="rounded-lg border border-slate-800 bg-slate-800/50 p-3 text-sm">
                    <div className="text-[11px] text-slate-400 mb-1">score {h.score.toFixed(3)}</div>
                    <div className="text-slate-200">{h.text}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-400">No results yet.</div>
              )}
            </div>

            <div className="mt-6 text-[11px] text-slate-500">
              Local-first embeddings in your browser. FastAPI + React + Tailwind.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

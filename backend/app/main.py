from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from .parser import extract_text
from .embeddings import embed_texts
from .store import VectorStore
from .llm import answer

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

store = VectorStore()

@app.get("/")
def root():
    return FileResponse("frontend/index.html")

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    data = await file.read()
    text, chunks = extract_text(file.filename, data)
    if not chunks:
        chunks = [text] if text else [""]
    vecs = embed_texts(chunks)
    store.add_document(file.filename, chunks, vecs)
    return {"status": "ok", "chunks": len(chunks)}

@app.post("/search")
async def search(payload: dict):
    q = payload.get("q","").strip()
    if not q:
        return {"ok": True, "hits": []}
    qv = embed_texts([q])[0]
    hits = store.search(qv, top_k=5)
    return {"ok": True, "hits": hits}

@app.post("/ask")
async def ask(payload: dict):
    q = payload.get("q","").strip()
    if not q:
        return {"ok": True, "answer": "", "sources": []}
    qv = embed_texts([q])[0]
    hits = store.search(qv, top_k=4)
    context = "\n\n".join(h["text"] for h in hits)
    ans = answer(q, context)
    return {"ok": True, "answer": ans, "sources": hits}
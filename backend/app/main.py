from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .parser import extract_text
from .embeddings import embed_texts, embed_query
from .store import VectorStore
from .llm import answer

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

store = VectorStore()  # keeps vectorizer+matrix per doc

# Healthy root (don’t try to serve a file on Render)
@app.get("/")
def root():
    return {"ok": True, "service": "doc-analyzer-api"}

@app.get("/health")
def health():
    return {"ok": True}

# Server-side parsing + server-side embeddings (works on Render)
@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    data = await file.read()
    text, chunks = extract_text(file.filename, data)
    if not chunks:
        chunks = [text] if text else [""]
    # fit/update TF-IDF on these chunks for this document
    store.index_document(file.filename, chunks)
    return {"status": "ok", "chunks": len(chunks)}

# Semantic search by text query (uses fitted TF-IDF)
@app.post("/search")
async def search(payload: dict):
    q = (payload.get("q") or "").strip()
    if not q:
        return {"ok": True, "hits": []}
    hits = store.search(q, top_k=5)
    return {"ok": True, "hits": hits}

# Ask (retrieve top chunks, then simple answer)
@app.post("/ask")
async def ask(payload: dict):
    q = (payload.get("q") or "").strip()
    if not q:
        return {"ok": True, "answer": "", "sources": []}
    hits = store.search(q, top_k=4)
    context = "\n\n".join(h["text"] for h in hits)
    ans = answer(q, context)
    return {"ok": True, "answer": ans, "sources": hits}

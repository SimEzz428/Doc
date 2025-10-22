import json, os, math
from typing import List, Dict, Any
from .embeddings import embed_texts

def cosine(a: list[float], b: list[float]) -> float:
    if not a or not b: return 0.0
    dot = sum(x*y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x*x for x in a))
    mag_b = math.sqrt(sum(y*y for y in b))
    return dot / (mag_a * mag_b + 1e-9)

class DocumentDB:
    def __init__(self, path: str):
        self.path = path
        self.data = {"docs": []}
        if os.path.exists(path):
            try:
                self.data = json.load(open(path))
            except Exception:
                self.data = {"docs": []}

    def save(self):
        json.dump(self.data, open(self.path, "w"), indent=2)

    def add_document(self, name: str, chunks: List[str], embeddings: List[List[float]]):
        doc_id = len(self.data["docs"]) + 1
        entries = []
        for i, (ch, emb) in enumerate(zip(chunks, embeddings)):
            entries.append({"doc_id": doc_id, "idx": i, "text": ch, "embedding": emb})
        self.data["docs"].extend(entries)
        self.save()

    def query(self, query: str, top_k: int = 5) -> Dict[str, Any]:
        qvec = embed_texts([query])[0]
        scored = []
        for e in self.data["docs"]:
            s = cosine(e["embedding"], qvec)
            scored.append((s, e))
        scored.sort(reverse=True, key=lambda x: x[0])
        top = scored[:top_k]
        sources = [
            {"doc_id": e["doc_id"], "idx": e["idx"], "text": e["text"], "score": round(s, 3)}
            for s, e in top
        ]
        answer = "\n".join(s["text"] for s in sources[:2])
        return {"answer": answer, "sources": sources}

    def stats(self) -> Dict[str, int]:
        return {
            "docs": len(set(e["doc_id"] for e in self.data["docs"])),
            "risks": len(self.data["docs"]) // 10,
            "actions": len(self.data["docs"]) // 20,
        }
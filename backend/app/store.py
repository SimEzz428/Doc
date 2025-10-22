from typing import List, Dict, Tuple
import math

class VectorStore:
    def __init__(self):
        self.docs: Dict[int, Dict] = {}
        self.chunks: List[Tuple[int,int,str,List[float]]] = []
        self.next_doc_id = 1

    def add_document(self, filename: str, chunks: List[str], vectors: List[List[float]]) -> int:
        doc_id = self.next_doc_id
        self.next_doc_id += 1
        self.docs[doc_id] = {"filename": filename, "n": len(chunks)}
        for i, (txt, vec) in enumerate(zip(chunks, vectors)):
            self.chunks.append((doc_id, i, txt, vec))
        return doc_id

    @staticmethod
    def _cos(a: List[float], b: List[float]) -> float:
        if not a or not b or len(a) != len(b):
            return -1.0
        sa = math.sqrt(sum(x*x for x in a))
        sb = math.sqrt(sum(x*x for x in b))
        if sa == 0 or sb == 0:
            return -1.0
        return sum(x*y for x,y in zip(a,b)) / (sa*sb)

    def search(self, qvec: List[float], top_k: int = 5):
        scored = []
        for doc_id, idx, txt, vec in self.chunks:
            scored.append((self._cos(qvec, vec), doc_id, idx, txt))
        scored.sort(key=lambda x: x[0], reverse=True)
        hits = []
        for s, doc_id, idx, txt in scored[:top_k]:
            hits.append({"doc_id": doc_id, "idx": idx, "text": txt, "score": s})
        return hits
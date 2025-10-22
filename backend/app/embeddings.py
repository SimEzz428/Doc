# TF-IDF embeddings (no Ollama needed)
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

class TfidfIndex:
    def __init__(self):
        self.vectorizer = None
        self.matrix = None
        self.chunks = []

    def fit(self, chunks):
        self.chunks = list(chunks)
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
        self.matrix = self.vectorizer.fit_transform(self.chunks)

    def add(self, chunks):
        # re-fit with previous + new (simple demo approach)
        all_chunks = self.chunks + list(chunks)
        self.fit(all_chunks)

    def query(self, q_vec, top_k=5):
        # cosine similarity
        sims = (self.matrix @ q_vec.T).toarray().ravel()
        idxs = np.argsort(-sims)[:top_k]
        out = []
        for i in idxs:
            out.append({
                "doc_id": 1,
                "idx": int(i),
                "text": self.chunks[i],
                "score": float(sims[i]),
            })
        return out

def embed_query(vectorizer, q: str):
    return vectorizer.transform([q])

# adapter used by store
def build_index(chunks):
    idx = TfidfIndex()
    idx.fit(chunks)
    return idx

from .embeddings import build_index, embed_query

class VectorStore:
    def __init__(self):
        self.index = None  # single combined index for demo

    def index_document(self, doc_name, chunks):
        if self.index is None:
            self.index = build_index(chunks)
        else:
            self.index.add(chunks)

    def search(self, query, top_k=5):
        if not self.index or not self.index.vectorizer:
            return []
        qv = embed_query(self.index.vectorizer, query)
        return self.index.query(qv, top_k=top_k)

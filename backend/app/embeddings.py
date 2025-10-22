from typing import List
import requests

OLLAMA_URL = "http://127.0.0.1:11434"
EMBED_MODEL = "nomic-embed-text:latest"

def embed_texts(texts: List[str]) -> List[List[float]]:
    out = []
    for t in texts:
        r = requests.post(f"{OLLAMA_URL}/api/embeddings", json={"model": EMBED_MODEL, "prompt": t})
        r.raise_for_status()
        out.append(r.json().get("embedding", []))
    return out
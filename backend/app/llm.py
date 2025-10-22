import requests
OLLAMA_URL = "http://127.0.0.1:11434"
GEN_MODEL = "llama3.1:8b"

def answer(question: str, context: str) -> str:
    prompt = f"Answer the question using the context.\nContext:\n{context}\n\nQuestion: {question}\nAnswer:"
    r = requests.post(f"{OLLAMA_URL}/api/generate", json={"model": GEN_MODEL, "prompt": prompt, "stream": False})
    r.raise_for_status()
    return r.json().get("response","").strip()
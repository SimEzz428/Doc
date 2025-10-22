from typing import List, Tuple
import io, os
from pypdf import PdfReader
from docx import Document
import chardet

def _read_txt(data: bytes) -> str:
    det = chardet.detect(data) or {}
    enc = det.get("encoding") or "utf-8"
    return data.decode(enc, errors="ignore")

def _read_pdf(data: bytes) -> str:
    reader = PdfReader(io.BytesIO(data))
    out = []
    for page in reader.pages:
        out.append(page.extract_text() or "")
    return "\n".join(out)

def _read_docx(data: bytes) -> str:
    bio = io.BytesIO(data)
    doc = Document(bio)
    return "\n".join(p.text for p in doc.paragraphs)

def _chunk(text: str, max_chars: int = 1200) -> List[str]:
    text = " ".join(text.split())
    if not text:
        return []
    chunks, buf = [], []
    total = 0
    for w in text.split(" "):
        if total + len(w) + 1 > max_chars:
            chunks.append(" ".join(buf))
            buf, total = [w], len(w)
        else:
            buf.append(w)
            total += len(w) + 1
    if buf:
        chunks.append(" ".join(buf))
    return chunks

def extract_text(filename: str, data: bytes) -> Tuple[str, List[str]]:
    name = filename.lower()
    if name.endswith(".pdf"):
        txt = _read_pdf(data)
    elif name.endswith(".docx"):
        txt = _read_docx(data)
    else:
        txt = _read_txt(data)
    chunks = _chunk(txt)
    return txt, chunks
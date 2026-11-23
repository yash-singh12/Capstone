"""Local Sentence-BERT embeddings and cosine similarity."""

import threading
from pathlib import Path

import numpy as np


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_model = None
_model_lock = threading.Lock()
_embedding_cache: dict[str, np.ndarray] = {}
_model_load_failed = False


def get_model():
    global _model, _model_load_failed
    if _model is None and not _model_load_failed:
        with _model_lock:
            if _model is None and not _model_load_failed:
                try:
                    from sentence_transformers import SentenceTransformer

                    cache_dir = Path(__file__).resolve().parents[1] / ".model-cache"
                    cache_dir.mkdir(parents=True, exist_ok=True)
                    _model = SentenceTransformer(
                        MODEL_NAME,
                        cache_folder=str(cache_dir),
                        local_files_only=True,
                    )
                except Exception:
                    _model_load_failed = True
    return _model


def deterministic_fallback_embedding(text: str) -> np.ndarray:
    """Provide an offline local fallback when the HuggingFace model is unavailable."""
    vector = np.zeros(384, dtype=np.float32)
    normalized = text.lower()
    tokens = normalized.replace("/", " ").replace(".", " ").split()
    for token in tokens:
        for index in range(max(1, len(token))):
            gram = token[max(0, index - 2):index + 3]
            bucket = (sum((position + 1) * ord(char) for position, char in enumerate(gram)) * 31 + len(gram)) % 384
            vector[bucket] += 1.0
    norm = np.linalg.norm(vector)
    return vector / norm if norm else vector


def encode(text: str) -> np.ndarray:
    normalized = text.strip()
    if not normalized:
        return np.zeros(384, dtype=np.float32)

    cached = _embedding_cache.get(normalized)
    if cached is not None:
        return cached

    model = get_model()
    if model is None:
        result = deterministic_fallback_embedding(normalized)
        _embedding_cache[normalized] = result
        return result

    embedding = model.encode(normalized, normalize_embeddings=True)
    result = np.asarray(embedding, dtype=np.float32)
    _embedding_cache[normalized] = result
    return result


def cosine_similarity(vector_a: np.ndarray, vector_b: np.ndarray) -> float:
    denominator = np.linalg.norm(vector_a) * np.linalg.norm(vector_b)
    if denominator == 0:
        return 0.0
    return float(np.dot(vector_a, vector_b) / denominator)


def match_candidate_to_jobs(candidate_summary: str, job_summaries: list[str]) -> list[float]:
    candidate_vector = encode(candidate_summary)
    scores = [
        cosine_similarity(candidate_vector, encode(job_summary))
        for job_summary in job_summaries
    ]
    return scores

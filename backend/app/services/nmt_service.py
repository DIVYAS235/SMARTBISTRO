from threading import RLock
from typing import Any

from app.services.model_errors import ModelInitializationError

MODEL_NAME = "Helsinki-NLP/opus-mt-fr-en"
_tokenizer: Any | None = None
_model: Any | None = None
_torch: Any | None = None
_model_lock = RLock()


def _get_model() -> tuple[Any, Any, Any]:
    global _model, _tokenizer, _torch
    if _model is None:
        with _model_lock:
            if _model is None:
                try:
                    import torch
                    from transformers import MarianMTModel, MarianTokenizer

                    tokenizer = MarianTokenizer.from_pretrained(MODEL_NAME)
                    model = MarianMTModel.from_pretrained(MODEL_NAME)
                    model.to("cpu")
                    model.eval()
                except Exception as exc:
                    raise ModelInitializationError(
                        "MarianMT could not initialize. Check Transformers, PyTorch, "
                        "SentencePiece, and access to the model weights."
                    ) from exc

                _torch = torch
                _tokenizer = tokenizer
                _model = model
    return _tokenizer, _model, _torch


def translate_french_to_english(french_texts: list[str]) -> list[str]:
    """Translates a batch of French dish strings into context-aware English."""
    if not french_texts:
        return []

    with _model_lock:
        tokenizer, model, torch = _get_model()
        encoded = tokenizer(french_texts, return_tensors="pt", padding=True, truncation=True)
        with torch.inference_mode():
            translated_tokens = model.generate(**encoded)

        return [
            tokenizer.decode(tokens, skip_special_tokens=True)
            for tokens in translated_tokens
        ]
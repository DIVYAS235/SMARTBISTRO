import cv2
import numpy as np
from threading import Lock
from typing import Any, Dict, List

from app.services.model_errors import ModelInitializationError

reader: Any | None = None
_reader_lock = Lock()


def _get_reader() -> Any:
    global reader
    if reader is None:
        with _reader_lock:
            if reader is None:
                try:
                    import easyocr

                    reader = easyocr.Reader(["fr", "en"], gpu=False, download_enabled=True)
                except Exception as exc:
                    raise ModelInitializationError(
                        "EasyOCR could not initialize. Check its dependencies and access to the model weights."
                    ) from exc
    return reader

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Safe preprocessing to retain text visibility for EasyOCR."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode image file.")

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Resize slightly if too large to speed up OCR and improve detection
    height, width = gray.shape
    if width > 1600:
        scale = 1600 / width
        gray = cv2.resize(gray, (1600, int(height * scale)), interpolation=cv2.INTER_AREA)

    return gray

def extract_text_from_image(image_bytes: bytes) -> List[Dict[str, Any]]:
    """Runs OCR extraction on the uploaded image."""
    processed_img = preprocess_image(image_bytes)
    
    # Run EasyOCR with lowered confidence threshold to catch menu items
    results = _get_reader().readtext(processed_img)
    
    extracted_dishes = []
    for idx, (box, text, confidence) in enumerate(results):
        if confidence > 0.15: # Catch text lines from menu cards
            pts = np.array(box, dtype=np.int32)
            x, y, w, h = cv2.boundingRect(pts)
            
            extracted_dishes.append({
                "id": idx + 1,
                "original_text": text.strip(),
                "confidence": float(confidence),
                "bounding_box": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)}
            })
            
    return extracted_dishes
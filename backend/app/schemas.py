from pydantic import BaseModel
from typing import List, Optional

class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int

class DishItem(BaseModel):
    id: int
    original_text: str
    english_translation: str
    description: Optional[str] = None
    allergens: List[str]
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    ingredients: List[str]
    bounding_box: Optional[BoundingBox] = None

class PerformanceMetrics(BaseModel):
    ocr_accuracy: float
    bleu_score: float
    database_confidence: float

class MenuScanResponse(BaseModel):
    message: str
    total_dishes_found: int
    dishes: List[DishItem]
    metrics: PerformanceMetrics

class AnalysisRequest(BaseModel):
    selected_dish_ids: List[int]

class AnalysisResponse(BaseModel):
    selected_dishes: List[DishItem]
    metrics: PerformanceMetrics
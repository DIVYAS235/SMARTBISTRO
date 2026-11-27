Smart Bistro — AI-Powered French Menu Intelligence

Smart Bistro is an end-to-end, stateless applied AI/ML web application designed to translate French restaurant menus into English and synthesize structured culinary, ingredient, allergen, and macronutrient insights in real time.

Built on a decoupled full-stack architecture, Smart Bistro pairs a reactive Next.js frontend with a local FastAPI deep learning inference backend—eliminating external paid cloud API dependencies and relational database bottlenecks.

Key Features & Innovations

Decoupled Stateless Inference Architecture: Separates the interactive browser client from the Python/PyTorch inference microservice, processing menu images dynamically in memory via REST endpoints.

Deep Learning Computer Vision (EasyOCR): Utilizes CRAFT (Character Region Awareness for Text Detection) and CRNN (Convolutional Recurrent Neural Networks) powered by PyTorch and OpenCV to localize and recognize accented French orthography directly from raw menu photos.

Neural Machine Translation (MarianMT): Integrates Hugging Face's pre-trained Helsinki-NLP opus-mt-fr-en sequence-to-sequence Transformer model with SentencePiece subword tokenization for accurate culinary translation.

Hybrid Knowledge Synthesis & Resolution Engine:

Tier 1 (Curated Dictionary): Matches canonical French dishes against FOOD_PROFILES to retrieve verified descriptions, ingredients, allergens, and macronutrient estimates.

Tier 2 (Dynamic Heuristic Fallback): Analyzes bilingual lexical roots for unseen or regional dishes to dynamically generate descriptions, ingredient tags, and dietary breakdowns without failing.

System Architecture

[Client UI Layer: Next.js / React / TypeScript]
       │  Multipart FormData (POST /scan-menu)
       ▼
[API Gateway & Validation Layer: FastAPI + Pydantic]
       │  Decoded RGB Image Tensor (OpenCV)
       ▼
[Computer Vision Engine: EasyOCR (CRAFT + CRNN + PyTorch)]
       │  Raw Bounding Polygons + French Text Strings
       ▼
[Neural Translation Engine: MarianMT (opus-mt-fr-en) + SentencePiece]
       │  Translated English Dish Titles
       ▼
[Hybrid Resolution Engine: FOOD_PROFILES + Dynamic Fallback]
       │  Structured JSON Dish Objects (Macros, Ingredients, Allergens)
       ▼
[Interactive Frontend Checklist & Macronutrient Drawer]


Technology Stack

Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS

Backend API: Python 3.10+, FastAPI, Uvicorn, Pydantic

Computer Vision: EasyOCR, PyTorch, OpenCV (opencv-python-headless)

Natural Language Processing: Hugging Face transformers, sentencepiece, Helsinki-NLP (opus-mt-fr-en)

Datasets & Pre-Trained Weights

Because Smart Bistro is a production-style inference pipeline rather than a model-training script, it leverages pre-trained model weights trained on large-scale public corpora alongside structured domain knowledge:

SynthText & ICDAR Benchmarks: Pre-trained EasyOCR weights for scene-text localization and character recognition.

OPUS & Tatoeba-Challenge Corpora: Pre-trained MarianMT Transformer weights trained on millions of parallel French–English sentence pairs.

Curated Culinary Profiles (FOOD_PROFILES): Structured internal Python dictionary mapping classic French gastronomy to nutritional and allergen metadata.

Local Setup & Installation

Prerequisites

Node.js (v18 or higher)

Python (v3.10 or higher)

Git

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/smart-bistro.git
cd smart-bistro


2. Start the Backend Server (FastAPI)

Open a terminal, navigate to the backend directory, and set up your virtual environment:

cd backend
python -m venv .venv

# Activate virtual environment (Windows PowerShell)
.\.venv\Scripts\Activate.ps1

# Activate virtual environment (macOS/Linux)
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload --port 8000


Note: On the first startup, PyTorch and Hugging Face will automatically download and cache the EasyOCR and opus-mt-fr-en model weights.

3. Start the Frontend Client (Next.js)

Open a second terminal, navigate to the frontend directory, and run the development server:

cd frontend
npm install
npm run dev


4. Access the Application

Web Application: Open http://localhost:3000 in your browser.

Interactive API Docs (Swagger UI): Open http://localhost:8000/docs to test the POST /scan-menu endpoint directly.

API Reference

POST /scan-menu

Accepts an uploaded menu image via multipart/form-data and returns structured dish objects.

Request Body: file (Image file: .jpg, .jpeg, .png, .webp)

Response (200 OK):

{
  "dishes": [
    {
      "original": "Soupe à l'oignon",
      "english": "French Onion Soup",
      "description": "Rich caramelized onion broth topped with toasted bread and melted Gruyère cheese.",
      "ingredients": ["Onions", "Beef Broth", "Gruyère Cheese", "Baguette", "Butter"],
      "allergens": ["Dairy", "Gluten"],
      "macros": {
        "calories": 380,
        "protein": 16,
        "carbs": 38,
        "fats": 18
      }
    }
  ]
}

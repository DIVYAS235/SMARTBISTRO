const API_BASE_URL = 'http://localhost:8000/api/v1';

/**
 * Uploads a menu image to the backend for OCR and translation.
 * Returns the scanned dishes and performance metrics.
 */
export async function scanMenuImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/scan-menu`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to scan menu image from backend.');
  }

  return await response.json();
}

/**
 * Sends the user's selected dish IDs to get detailed macro and allergen analysis.
 */
export async function analyzeDishes(selectedDishIds) {
  const response = await fetch(`${API_BASE_URL}/analyze-selected`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ selected_dish_ids: selectedDishIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch detailed analysis for selected dishes.');
  }

  return await response.json();
}
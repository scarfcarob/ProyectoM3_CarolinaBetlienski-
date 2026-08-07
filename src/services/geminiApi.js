
const FUNCTIONS_ENDPOINT = '/api/functions';

export async function fetchGeminiAPI(payload) {
  let response;

  try {
    response = await fetch(FUNCTIONS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    const err = new Error('Network error');
    err.status = 0;
    err.originalError = networkErr;
    throw err;
  }

  if (!response.ok) {
    let errorBody = null;
    try {
      errorBody = await response.json();
    } catch {
      
    }
          
    const err = new Error(errorBody?.error ?? `HTTP ${response.status}`);
    err.status = response.status;

    if (response.status === 429) err.retryAfterSeconds = 5;  
    throw err;
  }

  return response.json();
}
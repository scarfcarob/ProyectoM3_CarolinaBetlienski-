
const BASE_URL = '/api/messages'; 

export async function fetchMensajes() {
  const res = await fetch(BASE_URL);

  if (!res.ok) {
    
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}









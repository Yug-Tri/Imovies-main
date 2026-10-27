let rawBase = import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
rawBase = rawBase.trim();
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://') && !rawBase.startsWith('/')) {
  rawBase = `https://${rawBase}`;
}
const API_BASE = rawBase;

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    credentials: 'include', // send cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    console.error(`[apiFetch] Expected JSON but received ${contentType || 'non-JSON'} from ${url}:`, text.slice(0, 300));
    const err = new Error(
      `API error (${response.status}): Requested ${url} but received HTML instead of JSON. Check that VITE_API_BASE points to your backend URL with /api (e.g. https://your-backend.vercel.app/api).`
    );
    err.status = response.status;
    err.data = { text };
    throw err;
  }

  if (!response.ok) {
    const message = data.error || data.message || 'API error';
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

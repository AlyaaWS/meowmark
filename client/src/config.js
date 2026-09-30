let API_BASE_URL = process.env.REACT_APP_API_URL;

if (process.env.NODE_ENV === 'production') {
  // Force production to use the correct URL, even if Vercel env is misconfigured
  if (!API_BASE_URL || API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    API_BASE_URL = 'https://meowmark-api.de.deplexo.com';
  }
} else {
  // Local development fallback
  if (!API_BASE_URL) {
    API_BASE_URL = 'http://localhost:8080';
  }
}

// Ensure protocol exists
if (API_BASE_URL && !API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
  API_BASE_URL = 'https://' + API_BASE_URL;
}

// Remove trailing slash
if (API_BASE_URL && API_BASE_URL.endsWith('/')) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export { API_BASE_URL };

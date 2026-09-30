let API_BASE_URL;

if (process.env.NODE_ENV === "production") {
  // In production, strictly use the provided environment variable or default to the production URL.
  // We avoid hardcoding any localhost string here so it doesn't get bundled.
  API_BASE_URL = process.env.REACT_APP_API_URL || "https://meowmark-api.de.deplexo.com";
} else {
  // In development, fallback to localhost if not specified
  API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
}

// Pastikan protokol lengkap (default https:// jika tidak diawali http:// atau https://)
if (API_BASE_URL && !API_BASE_URL.startsWith("http://") && !API_BASE_URL.startsWith("https://")) {
  API_BASE_URL = `https://${API_BASE_URL}`;
}

// Hapus trailing slash jika ada
if (API_BASE_URL && API_BASE_URL.endsWith("/")) {
  API_BASE_URL = API_BASE_URL.slice(0, -1);
}

export { API_BASE_URL };

let API_BASE_URL;

if (process.env.NODE_ENV === "production") {
  // In production, strictly use the provided environment variable.
  // HOWEVER, if the environment variable was mistakenly set to localhost on Vercel, force the production URL.
  const envUrl = process.env.REACT_APP_API_URL;
  if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
    API_BASE_URL = "https://meowmark-api.de.deplexo.com";
  } else {
    API_BASE_URL = envUrl;
  }
} else {
  // In development, fallback to localhost if not specified
  API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
}

// Runtime fallback for Vercel just in case
if (typeof window !== "undefined" && window.location.hostname === "meowmark.vercel.app") {
  API_BASE_URL = "https://meowmark-api.de.deplexo.com";
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

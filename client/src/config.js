const PROD_API_URL = "https://meowmark-api.de.deplexo.com";
const DEV_API_URL = "http://localhost:8080";

const isProduction = process.env.NODE_ENV === "production";
const isBrowser = typeof window !== "undefined";

// Runtime check: Jika dibuka di browser dengan domain non-localhost (seperti Vercel),
// maka pastikan selalu menggunakan URL production
const isNonLocalDomain =
  isBrowser &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1" &&
  window.location.hostname !== "";

let API_BASE_URL;

if (isProduction || isNonLocalDomain) {
  const envUrl = process.env.REACT_APP_API_URL;
  // Di production, JANGAN PERNAH fallback ke localhost
  if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
    API_BASE_URL = PROD_API_URL;
  } else {
    API_BASE_URL = envUrl;
  }
} else {
  // Di development, gunakan env var atau fallback ke localhost:8080
  API_BASE_URL = process.env.REACT_APP_API_URL || DEV_API_URL;
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

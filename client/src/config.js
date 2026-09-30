let apiUrl = process.env.REACT_APP_API_URL;

if (!apiUrl) {
  apiUrl = process.env.NODE_ENV === 'production' 
    ? "https://meowmark-api.de.deplexo.com" 
    : "http://localhost:8080";
}

if (apiUrl && !apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
  apiUrl = "https://" + apiUrl;
}

if (apiUrl && apiUrl.endsWith("/")) {
  apiUrl = apiUrl.slice(0, -1);
}

export const API_BASE_URL = apiUrl;

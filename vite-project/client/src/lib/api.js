const runtimeApiUrl =
  typeof window !== "undefined"
    ? window.STAYNEST_API_URL || window.__STAYNEST_CONFIG__?.API_URL || ""
    : "";

const rawApiUrl = runtimeApiUrl || import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const trimmedApiUrl = rawApiUrl.replace(/\/+$/, "");

export const API_URL = trimmedApiUrl.endsWith("/api")
  ? trimmedApiUrl
  : `${trimmedApiUrl}/api`;

export const AUTH_API_URL = `${API_URL}/auth`;

if (import.meta.env.PROD && API_URL.includes("localhost")) {
  console.error(
    "StayNest API is still configured for localhost. Set VITE_API_URL on the frontend deployment or set window.STAYNEST_API_URL in public/config.js."
  );
}

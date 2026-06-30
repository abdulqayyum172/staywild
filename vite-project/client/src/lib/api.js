const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const trimmedApiUrl = rawApiUrl.replace(/\/+$/, "");

export const API_URL = trimmedApiUrl.endsWith("/api")
  ? trimmedApiUrl
  : `${trimmedApiUrl}/api`;

export const AUTH_API_URL = `${API_URL}/auth`;

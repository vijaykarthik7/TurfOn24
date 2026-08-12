/*
 * Central backend API configuration.
 *
 * Resolution order:
 *   1. VITE_API_URL (build-time env, set in .env or the Vercel dashboard).
 *   2. Local development (localhost / 127.0.0.1) -> http://localhost:5000
 *   3. Any other host (Vercel production/preview) -> the production backend.
 *
 * Keeping this in one module prevents the admin dashboard and booking forms
 * from accidentally falling back to "http://localhost:5000" when deployed.
 */

const PRODUCTION_API_URL = "https://turf-on24-backend.vercel.app";
const LOCAL_API_URL = "http://localhost:5000";

function resolveApiUrl(): string {
  const configured = import.meta.env["VITE_API_URL"];

  if (configured && configured.trim() !== "") {
    return configured.trim().replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;

    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API_URL;
    }
  }

  return PRODUCTION_API_URL;
}

export const API_URL = resolveApiUrl();

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

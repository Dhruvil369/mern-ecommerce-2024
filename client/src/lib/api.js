// src/lib/api.js

const BASE_URL =
    import.meta.env.VITE_BASE_URL;

export function apiUrl(path) {
    // Ensure no double slashes
    return `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
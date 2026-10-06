export const API_ROOT = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, '');

/** Image/file URL from the API — already absolute (Storage::url) or a /storage/... path. */
export function assetUrl(path) {
  if (!path) return null;
  return /^https?:\/\//i.test(path) ? path : `${API_ROOT}${path.startsWith('/') ? '' : '/'}${path}`;
}

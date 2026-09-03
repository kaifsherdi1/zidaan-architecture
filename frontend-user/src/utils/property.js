import { propertyFallback } from '../data/images';

const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
).replace(/\/api\/?$/, '');

/** Resolve a usable image URL for a property, with a deterministic local fallback. */
export function propertyImage(property, index = 0) {
  const imgs = property?.images || [];
  const raw =
    imgs[index]?.url ||
    imgs[index]?.image_url ||
    imgs[0]?.url ||
    property?.main_image ||
    null;

  if (!raw) return propertyFallback(property?.id || index);
  if (/^https?:\/\//.test(raw)) return raw;
  return `${API_ORIGIN}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

export function allPropertyImages(property) {
  const imgs = (property?.images || [])
    .map((im) => im.url || im.image_url)
    .filter(Boolean)
    .map((u) => (/^https?:\/\//.test(u) ? u : `${API_ORIGIN}${u.startsWith('/') ? '' : '/'}${u}`));
  return imgs.length ? imgs : [propertyFallback(property?.id || 0)];
}

/** Compact Indian-rupee amount: ₹4.5 Cr, ₹3.25 L, ₹85,000. */
export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  const trim = (x) => x.toFixed(2).replace(/\.?0+$/, '');
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

/** Full rupee amount with Indian digit grouping: ₹4,50,00,000. */
export function formatPriceFull(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '—';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/** Price with a "/mo" suffix for rentals. */
export function priceLabel(property) {
  if (!property) return '—';
  const base = formatPrice(property.price);
  return property.type === 'rent' ? `${base}/mo` : base;
}

export function propertyLocation(property) {
  const l = property?.location || {};
  return [l.city, l.state].filter(Boolean).join(', ') || l.address || '—';
}

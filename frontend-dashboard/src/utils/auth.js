/** The signed-in user's role slug ('admin' | 'manager' | 'agent'), or '' while loading. */
export function roleOf(user) {
  if (!user) return '';
  return typeof user.role === 'object' ? user.role?.slug || '' : user.role || '';
}

/** Admins and managers run the office; agents only see their own listings and deals. */
export function isOfficeStaff(user) {
  return ['admin', 'manager'].includes(roleOf(user));
}

/**
 * A human-readable message from a failed API call: the first validation
 * error, else the server's message, else the fallback.
 */
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (!err?.response) return 'Could not reach the server. Check your connection and try again.';
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return data?.message || fallback;
}

/** Map a Laravel 422 `errors` bag onto react-hook-form fields. Returns true if any were set. */
export function applyServerErrors(err, setError) {
  const errors = err?.response?.status === 422 ? err.response.data?.errors : null;
  if (!errors) return false;
  Object.entries(errors).forEach(([field, messages]) => {
    setError(field.split('.')[0], { type: 'server', message: messages[0] });
  });
  return true;
}

export const formatINR = (value) =>
  '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });

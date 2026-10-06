/**
 * A message to show the visitor for a failed API call: the first validation
 * error, else the server's own message, else the fallback.
 */
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  if (!err?.response) return 'We could not reach the server. Check your connection and try again.';
  const data = err.response.data;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (Array.isArray(first) && first[0]) return first[0];
  }
  return data?.message || fallback;
}

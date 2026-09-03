import React from 'react';

const GoogleMark = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const AppleMark = () => (
  <svg width="16" height="16" viewBox="0 0 384 512" aria-hidden="true" fill="currentColor">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C69.8 141 24 174.4 24 246.2c0 21.3 3.9 43.3 11.7 66 10.4 30 47.9 103.4 87 102.2 20.4-.5 34.8-14.5 61.4-14.5 25.8 0 39.2 14.5 61.7 14.5 39.5-.6 73.4-67.3 83.3-97.4-52.9-24.9-50.4-73-50.4-74.3zM258.5 76.7c22.9-27.2 20.8-52 20.1-60.7-20.3 1.2-43.8 13.9-57.2 29.5-14.7 16.8-23.3 37.6-21.4 60.3 21.9 1.7 42-9.5 58.5-29.1z" />
  </svg>
);

/**
 * Social sign-in row. OAuth is not wired to a provider yet, so `onProvider`
 * is called with the provider name and the parent surfaces a message.
 */
export default function SocialAuth({ onProvider, className = '' }) {
  const btn =
    'flex items-center justify-center gap-2.5 w-full border border-black/15 py-3 text-[11px] font-bold uppercase tracking-[0.18em] hover:bg-black hover:text-white hover:border-black transition-colors';

  return (
    <div className={className}>
      <div className="flex items-center gap-4 mb-6">
        <span className="h-px flex-1 bg-black/10" />
        <span className="text-[9px] uppercase tracking-[0.3em] text-black/35">or continue with</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onProvider('Google')} className={btn}>
          <GoogleMark /> Google
        </button>
        <button type="button" onClick={() => onProvider('Apple')} className={btn}>
          <AppleMark /> Apple
        </button>
      </div>
    </div>
  );
}

import React from 'react';

/**
 * Hidden field that real visitors never see or fill in. Spam bots that
 * auto-complete every input do, and the API silently drops those submissions.
 */
export default function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={onChange} />
      </label>
    </div>
  );
}

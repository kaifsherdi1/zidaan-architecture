import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { PASSWORD_MAX } from '../../utils/validation';

/**
 * Editorial password field with a show / hide toggle.
 * Matches the underlined input style used across the auth screens.
 */
export default function PasswordInput({
  label = 'Password',
  value,
  onChange,
  placeholder = '',
  autoComplete = 'current-password',
  name = 'password',
  required = true,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="border-b border-black/10 py-2">
      <span className="text-[10px] uppercase tracking-widest text-black/40 block mb-1">{label}</span>
      <div className="flex items-center gap-3">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          required={required}
          value={value}
          onChange={onChange}
          maxLength={PASSWORD_MAX}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm font-medium tracking-widest"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="shrink-0 text-black/40 hover:text-black transition-colors"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

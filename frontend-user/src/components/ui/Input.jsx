import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="course-label block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-3 rounded-lg border focus:ring-1 outline-none transition-colors bg-white ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-primary focus:ring-primary'
          } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

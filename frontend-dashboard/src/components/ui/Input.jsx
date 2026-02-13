import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  label,
  error,
  className = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={`
            w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-colors duration-200 outline-none
            placeholder:text-slate-400
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-red-900'
              : 'border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 hover:border-slate-400'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
};

export default Input;

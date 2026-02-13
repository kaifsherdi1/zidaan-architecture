import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  to = null,
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary shadow-sm hover:shadow",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-200 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    link: "bg-transparent text-primary hover:text-primary-dark underline-offset-4 hover:underline p-0",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  const disabledClasses = "opacity-50 cursor-not-allowed pointer-events-none";

  const classes = `
    ${baseClasses} 
    ${variants[variant]} 
    ${sizes[size]} 
    ${disabled ? disabledClasses : ''} 
    ${className}
  `;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  className: PropTypes.string,
  to: PropTypes.string,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};
